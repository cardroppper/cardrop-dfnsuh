
import { Platform, PermissionsAndroid } from 'react-native';
import { CARDROP_BEACON_UUID, BeaconData, calculateDistance } from '@/types/ble';

// Only import BLE on native platforms
let BleManager: any = null;
let Device: any = null;
let State: any = null;
let bleModuleLoaded = false;

if (Platform.OS !== 'web') {
  import('react-native-ble-plx').then((BleModule) => {
    BleManager = BleModule.BleManager;
    Device = BleModule.Device;
    State = BleModule.State;
    bleModuleLoaded = true;
    console.log('[BLEService] BLE module loaded successfully');
  }).catch((error) => {
    console.warn('[BLEService] react-native-ble-plx not available:', error);
    bleModuleLoaded = false;
  });
} else {
  console.log('[BLEService] Web platform detected, BLE not available');
}

class BLEService {
  private manager: any = null;
  private scanning: boolean = false;
  private discoveredDevices: Map<string, BeaconData> = new Map();
  private scanTimeout: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isSupported: boolean = false;

  constructor() {
    // Delay initialization to ensure BLE module is loaded
    setTimeout(() => {
      // Only initialize BleManager on native platforms
      if (Platform.OS !== 'web' && bleModuleLoaded && BleManager) {
        try {
          this.manager = new BleManager();
          this.isSupported = true;
          console.log('[BLEService] BLEService initialized successfully');
        } catch (error) {
          console.error('[BLEService] Failed to initialize BleManager:', error);
          this.isSupported = false;
        }
      } else {
        console.log('[BLEService] BLE not supported on this platform or module not loaded');
        this.isSupported = false;
      }
    }, 100);
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
        if (!this.manager) {
          return false;
        }
        const state = await this.manager.state();
        return state === 'PoweredOn';
      }
      return false;
    } catch (error) {
      console.error('Error requesting BLE permissions:', error);
      return false;
    }
  }

  async checkBluetoothState(): Promise<string> {
    if (!this.isSupported || !this.manager) {
      return 'Unsupported';
    }

    try {
      return await this.manager.state();
    } catch (error) {
      console.error('Error checking Bluetooth state:', error);
      return 'Unknown';
    }
  }

  async startScanning(
    onDeviceFound: (beacons: BeaconData[]) => void,
    onError?: (error: Error) => void
  ): Promise<boolean> {
    if (!this.isSupported || !this.manager) {
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

      console.log('Starting BLE scan for CarDrop beacons...');

      this.manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error: any, device: any) => {
          if (error) {
            console.error('BLE scan error:', error);
            if (onError) {
              onError(error);
            }
            this.stopScanning();
            return;
          }

          if (device && this.isCarDropBeacon(device)) {
            console.log('CarDrop beacon found:', device.id, 'RSSI:', device.rssi);
            
            const beaconData: BeaconData = {
              uuid: CARDROP_BEACON_UUID,
              rssi: device.rssi || -100,
              deviceId: device.id,
            };

            this.discoveredDevices.set(device.id, beaconData);
            onDeviceFound(Array.from(this.discoveredDevices.values()));
          }
        }
      );

      this.startCleanupInterval(onDeviceFound);

      return true;
    } catch (error) {
      console.error('Error starting BLE scan:', error);
      if (onError) {
        onError(error as Error);
      }
      return false;
    }
  }

  private isCarDropBeacon(device: any): boolean {
    if (!device.name) {
      return false;
    }

    const name = device.name.toUpperCase();
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

  stopScanning() {
    if (!this.isSupported || !this.manager) {
      return;
    }

    if (this.scanning) {
      console.log('Stopping BLE scan');
      try {
        this.manager.stopDeviceScan();
      } catch (error) {
        console.error('Error stopping scan:', error);
      }
      this.scanning = false;
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
    if (!this.isSupported || !this.manager) {
      return;
    }

    this.stopScanning();
    try {
      this.manager.destroy();
    } catch (error) {
      console.error('Error destroying BLE manager:', error);
    }
  }
}

export default new BLEService();
