
import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import { CARDROP_BEACON_UUID, BeaconData, calculateDistance } from '@/types/ble';

class BLEService {
  private manager: BleManager;
  private scanning: boolean = false;
  private discoveredDevices: Map<string, BeaconData> = new Map();
  private scanTimeout: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
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
        const state = await this.manager.state();
        return state === State.PoweredOn;
      }
      return false;
    } catch (error) {
      console.error('Error requesting BLE permissions:', error);
      return false;
    }
  }

  async checkBluetoothState(): Promise<State> {
    return await this.manager.state();
  }

  async startScanning(
    onDeviceFound: (beacons: BeaconData[]) => void,
    onError?: (error: Error) => void
  ): Promise<boolean> {
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
      if (state !== State.PoweredOn) {
        throw new Error('Bluetooth is not powered on');
      }

      this.scanning = true;
      this.discoveredDevices.clear();

      console.log('Starting BLE scan for CarDrop beacons...');

      this.manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error, device) => {
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

  private isCarDropBeacon(device: Device): boolean {
    if (!device.name) {
      return false;
    }

    const name = device.name.toUpperCase();
    return name.includes('CARDROP') || name.startsWith('CD-');
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
    if (this.scanning) {
      console.log('Stopping BLE scan');
      this.manager.stopDeviceScan();
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
    this.stopScanning();
    this.manager.destroy();
  }
}

export default new BLEService();
