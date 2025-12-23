
import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import BLEService from '@/services/BLEService';
import { BeaconData } from '@/types/ble';
import { supabase } from '@/app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAIRING_COOLDOWN_KEY = 'beacon_pairing_cooldown';
const COOLDOWN_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useBeaconPairing() {
  const [pairingBeacon, setPairingBeacon] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const mountedRef = useRef(true);
  const checkedBeacons = useRef<Set<string>>(new Set());

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const checkBeaconCooldown = async (beaconId: string): Promise<boolean> => {
    try {
      const cooldownData = await AsyncStorage.getItem(PAIRING_COOLDOWN_KEY);
      if (!cooldownData) return true;

      const cooldowns = JSON.parse(cooldownData);
      const lastShown = cooldowns[beaconId];
      
      if (!lastShown) return true;

      const timeSinceLastShown = Date.now() - lastShown;
      return timeSinceLastShown > COOLDOWN_DURATION;
    } catch (error) {
      console.error('Error checking beacon cooldown:', error);
      return true;
    }
  };

  const setBeaconCooldown = async (beaconId: string) => {
    try {
      const cooldownData = await AsyncStorage.getItem(PAIRING_COOLDOWN_KEY);
      const cooldowns = cooldownData ? JSON.parse(cooldownData) : {};
      
      cooldowns[beaconId] = Date.now();
      
      await AsyncStorage.setItem(PAIRING_COOLDOWN_KEY, JSON.stringify(cooldowns));
    } catch (error) {
      console.error('Error setting beacon cooldown:', error);
    }
  };

  const checkBeaconForPairing = useCallback(async (beacons: BeaconData[]) => {
    if (!mountedRef.current) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check each beacon
      for (const beacon of beacons) {
        // Skip if already checked in this session
        if (checkedBeacons.current.has(beacon.deviceId)) continue;

        // Check if beacon is registered and unassigned
        const { data: registeredBeacon, error } = await supabase
          .from('registered_beacons')
          .select('*')
          .eq('beacon_uuid', beacon.deviceId)
          .eq('is_configured', true)
          .eq('is_assigned', false)
          .maybeSingle();

        if (error) {
          console.error('Error checking beacon:', error);
          continue;
        }

        // If beacon is registered and unassigned, check if it's close enough
        if (registeredBeacon && beacon.rssi >= -60) {
          // Check cooldown
          const canShow = await checkBeaconCooldown(beacon.deviceId);
          if (!canShow) {
            checkedBeacons.current.add(beacon.deviceId);
            continue;
          }

          // Check if user already has a vehicle with this beacon
          const { data: existingBeacon } = await supabase
            .from('vehicle_beacons')
            .select('id')
            .eq('beacon_uuid', beacon.deviceId)
            .maybeSingle();

          if (!existingBeacon) {
            // Show pairing modal
            if (mountedRef.current) {
              setPairingBeacon(beacon.deviceId);
              await setBeaconCooldown(beacon.deviceId);
            }
            break;
          }
        }

        checkedBeacons.current.add(beacon.deviceId);
      }
    } catch (error) {
      console.error('Error checking beacons for pairing:', error);
    }
  }, []);

  const startMonitoring = useCallback(async () => {
    if (!BLEService.isBluetoothSupported() || Platform.OS === 'web') {
      console.log('Beacon pairing monitoring not supported on this platform');
      return;
    }

    try {
      const hasPermissions = await BLEService.requestPermissions();
      if (!hasPermissions) {
        console.log('Bluetooth permissions not granted');
        return;
      }

      const state = await BLEService.checkBluetoothState();
      if (state !== 'PoweredOn') {
        console.log('Bluetooth not powered on');
        return;
      }

      setIsMonitoring(true);

      await BLEService.startScanning(
        (beacons) => {
          checkBeaconForPairing(beacons);
        },
        (error) => {
          console.error('Beacon monitoring error:', error);
          setIsMonitoring(false);
        }
      );
    } catch (error) {
      console.error('Error starting beacon monitoring:', error);
      setIsMonitoring(false);
    }
  }, [checkBeaconForPairing]);

  const stopMonitoring = useCallback(() => {
    BLEService.stopScanning();
    setIsMonitoring(false);
    checkedBeacons.current.clear();
  }, []);

  const dismissPairing = useCallback(() => {
    setPairingBeacon(null);
  }, []);

  return {
    pairingBeacon,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    dismissPairing,
  };
}
