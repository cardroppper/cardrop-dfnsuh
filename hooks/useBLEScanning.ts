
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import BLEService from '@/services/BLEService';
import { BeaconData, NearbyVehicle, calculateDistance } from '@/types/ble';
import { supabase } from '@/app/integrations/supabase/client';

export function useBLEScanning() {
  const [isScanning, setIsScanning] = useState(false);
  const [nearbyVehicles, setNearbyVehicles] = useState<NearbyVehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    // Check if BLE is supported on this platform
    const supported = BLEService.isBluetoothSupported();
    setIsSupported(supported);
    
    if (!supported) {
      console.log('BLE not supported on this platform');
      if (Platform.OS === 'web') {
        setError('Bluetooth scanning is not available on web. Please use the mobile app.');
      }
    }
    
    return () => {
      mountedRef.current = false;
      if (isScanning) {
        BLEService.stopScanning();
      }
    };
  }, [isScanning]);

  const requestPermissions = useCallback(async () => {
    if (!isSupported) {
      console.log('BLE not supported, cannot request permissions');
      return false;
    }

    try {
      const granted = await BLEService.requestPermissions();
      if (mountedRef.current) {
        setPermissionGranted(granted);
        if (!granted) {
          setError('Bluetooth permissions are required to scan for nearby vehicles');
        }
      }
      return granted;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      if (mountedRef.current) {
        setError('Failed to request Bluetooth permissions');
        setPermissionGranted(false);
      }
      return false;
    }
  }, [isSupported]);

  const fetchVehicleData = useCallback(async (beacons: BeaconData[]) => {
    try {
      if (beacons.length === 0) {
        if (mountedRef.current) {
          setNearbyVehicles([]);
        }
        return;
      }

      const deviceIds = beacons.map(b => b.deviceId);

      const { data: beaconData, error: beaconError } = await supabase
        .from('vehicle_beacons')
        .select(`
          vehicle_id,
          beacon_uuid,
          vehicles!inner (
            id,
            manufacturer,
            model,
            year,
            primary_image_url,
            is_public,
            user_id
          )
        `)
        .in('beacon_uuid', deviceIds);

      if (beaconError) {
        console.error('Error fetching beacon data:', beaconError);
        return;
      }

      if (!beaconData || beaconData.length === 0) {
        if (mountedRef.current) {
          setNearbyVehicles([]);
        }
        return;
      }

      const userIds = beaconData
        .map((b: any) => b.vehicles?.user_id)
        .filter(Boolean);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name, is_private, ghost_mode')
        .in('id', userIds);

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        return;
      }

      // Check if user is checked in to any active events
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: checkins } = await supabase
          .from('event_checkins')
          .select('event_id')
          .eq('user_id', user.id);

        // Log detections for all checked-in events
        if (checkins && checkins.length > 0) {
          for (const checkin of checkins) {
            for (const beaconItem of beaconData) {
              const beacon = beacons.find(b => b.deviceId === beaconItem.beacon_uuid);
              if (beacon) {
                // Log detection (will be deduplicated by unique constraint)
                await supabase
                  .from('event_meet_detections')
                  .insert({
                    event_id: checkin.event_id,
                    vehicle_id: beaconItem.vehicle_id,
                    detected_by_user_id: user.id,
                    rssi: beacon.rssi,
                  })
                  .then(({ error }) => {
                    if (error && !error.message.includes('duplicate')) {
                      console.error('[BLE] Error logging event detection:', error);
                    }
                  });
              }
            }
          }
        }
      }

      const vehicles: NearbyVehicle[] = beaconData
        .filter((b: any) => {
          const vehicle = b.vehicles;
          if (!vehicle || !vehicle.is_public) return false;

          const profile = profileData?.find((p: any) => p.id === vehicle.user_id);
          // Filter out vehicles from private profiles or users with ghost mode enabled
          if (!profile || profile.is_private || profile.ghost_mode) return false;

          return true;
        })
        .map((b: any) => {
          const vehicle = b.vehicles;
          const profile = profileData?.find((p: any) => p.id === vehicle.user_id);
          const beacon = beacons.find(beacon => beacon.deviceId === b.beacon_uuid);

          return {
            vehicleId: vehicle.id,
            vehicleName: `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model}`,
            ownerUsername: profile?.username || 'Unknown',
            ownerDisplayName: profile?.display_name || 'Unknown',
            rssi: beacon?.rssi || -100,
            distance: calculateDistance(beacon?.rssi || -100),
            lastSeen: Date.now(),
            primaryImageUrl: vehicle.primary_image_url,
          };
        })
        .sort((a, b) => b.rssi - a.rssi);

      if (mountedRef.current) {
        setNearbyVehicles(vehicles);
      }
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
    }
  }, []);

  const startScanning = useCallback(async () => {
    if (!isSupported) {
      Alert.alert(
        'Not Supported',
        Platform.OS === 'web' 
          ? 'Bluetooth scanning is not available on web. Please use the iOS or Android app to discover nearby vehicles.'
          : 'Bluetooth is not supported on this device.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setError(null);

      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Bluetooth Permission Required',
          'CarDrop needs Bluetooth access to discover nearby vehicles. This allows you to see cars that are physically near you at meets and events.',
          [{ text: 'OK' }]
        );
        return;
      }

      const state = await BLEService.checkBluetoothState();
      if (state !== 'PoweredOn') {
        Alert.alert(
          'Bluetooth Disabled',
          'Please enable Bluetooth to scan for nearby vehicles.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsScanning(true);

      const success = await BLEService.startScanning(
        (beacons) => {
          console.log('Beacons found:', beacons.length);
          fetchVehicleData(beacons);
        },
        (err) => {
          console.error('BLE scanning error:', err);
          if (mountedRef.current) {
            setError(err.message);
            setIsScanning(false);
          }
        }
      );

      if (!success && mountedRef.current) {
        setIsScanning(false);
        setError('Failed to start scanning');
      }
    } catch (err) {
      console.error('Error starting scan:', err);
      if (mountedRef.current) {
        setError('Failed to start scanning');
        setIsScanning(false);
      }
    }
  }, [isSupported, requestPermissions, fetchVehicleData]);

  const stopScanning = useCallback(() => {
    BLEService.stopScanning();
    if (mountedRef.current) {
      setIsScanning(false);
      setNearbyVehicles([]);
    }
  }, []);

  return {
    isScanning,
    nearbyVehicles,
    error,
    permissionGranted,
    isSupported,
    startScanning,
    stopScanning,
    requestPermissions,
  };
}
