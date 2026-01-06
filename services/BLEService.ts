
import { Platform, PermissionsAndroid, NativeEventEmitter, NativeModules } from 'react-native';
import { CARDROP_BEACON_UUID, BeaconData, calculateDistance } from '@/types/ble';

// Only import BLE on native platforms
// Note: Using react-native-ble-manager (installed) instead of react-native-ble-plx
let BleManager: any = null;
let bleManagerEmitter: any = null;
let bleModuleLoaded = false;

if (Platform.OS !== 'web') {
  import('react-native-ble-manager').then((BleModule) => {
    BleManager = BleModule.default;
    
    // Set up event emitter for BLE events
    if (NativeModules.BleManager) {
      bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
    }
    
    bleModuleLoaded = true;
    console.log('[BLEService] BLE module loaded successfully');
  }).catch((error) => {
    console.warn('[BLEService] react-native-ble-manager not available:', error);
    bleModuleLoaded = false;
  });
} else {
  console.log('[BLEService] Web platform detected, BLE not available');
}

class BLEService {
  private scanning: boolean = false;
  private discoveredDevices: Map<string, BeaconData> = new Map();
  private scanTimeout: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isSupported: boolean = false;
  private isInitialized: boolean = false;
  private discoverListener: any = null;

  constructor() {
    // Delay initialization to ensure BLE module is loaded
    setTimeout(() => {
      this.initialize();
    }, 100);
  }

  private async initialize() {
    // Only initialize BleManager on native platforms
    if (Platform.OS !== 'web' && bleModuleLoaded && BleManager) {
      try {
        await BleManager.start({ showAlert: false });
        this.isSupported = true;
        this.isInitialized = true;
        console.log('[BLEService] BLEService initialized successfully');
      } catch (error) {
        console.error('[BLEService] Failed to initialize BleManager:', error);
        this.isSupported = false;
        this.isInitialized = false;
      }
    } else {
      console.log('[BLEService] BLE not supported on this platform or module not loaded');
      this.isSupported = false;
      this.isInitialized = false;
    }
  }

  isBluetoothSupported(): boolean {
    return this.isSupported;
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('BLE not supported, skipping permissions');
      return false;
    }

    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 31) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

          return (
            granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
          ]);

          return (
            granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.BLUETOOTH'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.BLUETOOTH_ADMIN'] === PermissionsAndroid.RESULTS.GRANTED
          );
        }
      } else if (Platform.OS === 'ios') {
        // iOS permissions are handled automatically by the system
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting BLE permissions:', error);
      return false;
    }
  }

  async checkBluetoothState(): Promise<string> {
    if (!this.isSupported || !BleManager || !this.isInitialized) {
      return 'Unsupported';
    }

    try {
      const isEnabled = await BleManager.checkState();
      return isEnabled ? 'PoweredOn' : 'PoweredOff';
    } catch (error) {
      console.error('Error checking Bluetooth state:', error);
      return 'Unknown';
    }
  }

  async startScanning(
    onDeviceFound: (beacons: BeaconData[]) => void,
    onError?: (error: Error) => void
  ): Promise<boolean> {
    if (!this.isSupported || !BleManager || !this.isInitialized) {
      const error = new Error('Bluetooth is not supported on this platform');
      console.error(error.message);
      if (onError) {
        onError(error);
      }
      return false;
    }

    try {
      if (this.scanning) {
        console.log('Already scanning');
        return true;
      }

      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted');
      }

      const state = await this.checkBluetoothState();
      if (state !== 'PoweredOn') {
        throw new Error('Bluetooth is not powered on');
      }

      this.scanning = true;
      this.discoveredDevices.clear();

      console.log('[BLEService] Starting BLE scan for CarDrop beacons...');

      // Set up listener for discovered peripherals
      if (bleManagerEmitter && !this.discoverListener) {
        this.discoverListener = bleManagerEmitter.addListener(
          'BleManagerDiscoverPeripheral',
          (peripheral: any) => {
            if (peripheral && this.isCarDropBeacon(peripheral)) {
              console.log('[BLEService] CarDrop beacon found:', peripheral.id, 'RSSI:', peripheral.rssi);
              
              const beaconData: BeaconData = {
                uuid: CARDROP_BEACON_UUID,
                rssi: peripheral.rssi || -100,
                deviceId: peripheral.id,
              };

              this.discoveredDevices.set(peripheral.id, beaconData);
              onDeviceFound(Array.from(this.discoveredDevices.values()));
            }
          }
        );
      }

      // Start scanning
      await BleManager.scan([], 30, false); // Scan for 30 seconds, don't allow duplicates

      this.startCleanupInterval(onDeviceFound);

      return true;
    } catch (error) {
      console.error('[BLEService] Error starting BLE scan:', error);
      if (onError) {
        onError(error as Error);
      }
      this.scanning = false;
      return false;
    }
  }

  private isCarDropBeacon(peripheral: any): boolean {
    if (!peripheral.name) {
      return false;
    }

    const name = peripheral.name.toUpperCase();
    // Check for CarDrop beacons or Feasycom FSC-BP108B beacons
    return name.includes('CARDROP') || 
           name.startsWith('CD-') || 
           name.includes('FSC-BP') ||
           name.includes('FEASYCOM');
  }

  private startCleanupInterval(onDeviceFound: (beacons: BeaconData[]) => void) {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let removed = false;

      this.discoveredDevices.forEach((beacon, deviceId) => {
        if (now - (beacon as any).lastSeen > 10000) {
          this.discoveredDevices.delete(deviceId);
          removed = true;
        }
      });

      if (removed) {
        onDeviceFound(Array.from(this.discoveredDevices.values()));
      }
    }, 5000);
  }

  async stopScanning() {
    if (!this.isSupported || !BleManager || !this.isInitialized) {
      return;
    }

    if (this.scanning) {
      console.log('[BLEService] Stopping BLE scan');
      try {
        await BleManager.stopScan();
      } catch (error) {
        console.error('[BLEService] Error stopping scan:', error);
      }
      this.scanning = false;
    }

    // Remove listener
    if (this.discoverListener) {
      this.discoverListener.remove();
      this.discoverListener = null;
    }

    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.discoveredDevices.clear();
  }

  isScanning(): boolean {
    return this.scanning;
  }

  destroy() {
    if (!this.isSupported || !BleManager) {
      return;
    }

    this.stopScanning();
    
    // Remove all listeners
    if (this.discoverListener) {
      this.discoverListener.remove();
      this.discoverListener = null;
    }
  }
}

export default new BLEService();
