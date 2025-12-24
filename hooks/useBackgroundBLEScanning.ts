
import { useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import BLEService from '@/services/BLEService';
import { supabase } from '@/app/integrations/supabase/client';
import { BeaconData, calculateDistance } from '@/types/ble';
import * as Haptics from 'expo-haptics';

/**
 * Hook to manage background BLE scanning for premium users with "always searching" enabled.
 * This hook will automatically start/stop scanning based on:
 * - Premium subscription status
 * - Always searching preference
 * - App state (foreground/background)
 * - BLE permissions
 */
export function useBackgroundBLEScanning() {
  const { profile } = useAuth();
  const { subscription } = useSubscription();
  const appState = useRef(AppState.currentState);
  const scanningRef = useRef(false);
  const detectedVehiclesRef = useRef<Set<string>>(new Set());

  const stopBackgroundScanning = useCallback(() => {
    if (!scanningRef.current) {
      return;
    }

    console.log('[BackgroundBLE] Stopping background scanning');
    BLEService.stopScanning();
    scanningRef.current = false;
    detectedVehiclesRef.current.clear();
  }, []);

  const storeDetection = useCallback(async (vehicleData: any, beacons: BeaconData[]) => {
    if (!profile) return;

    try {
      const vehicle = vehicleData.vehicles;
      const beacon = beacons.find(b => b.deviceId === vehicleData.beacon_uuid);

      // Store in beacon_detections table
      const { error: detectionError } = await supabase
        .from('beacon_detections')
        .insert({
          detector_user_id: profile.id,
          detected_vehicle_id: vehicle.id,
          detected_user_id: vehicle.user_id,
          rssi: beacon?.rssi || -100,
          detected_at: new Date().toISOString(),
        });

      if (detectionError) {
        console.error('[BackgroundBLE] Error storing detection:', detectionError);
      }

      // Store in detection_highlights table (24-hour highlight)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error: highlightError } = await supabase
        .from('detection_highlights')
        .insert({
          user_id: profile.id,
          vehicle_id: vehicle.id,
          detected_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        });

      if (highlightError) {
        console.error('[BackgroundBLE] Error storing highlight:', highlightError);
      }

      console.log('[BackgroundBLE] Detection stored successfully');
    } catch (error) {
      console.error('[BackgroundBLE] Error storing detection:', error);
    }
  }, [profile]);

  const triggerDetectionNotification = useCallback(async (vehicle: any) => {
    if (!profile?.notification_preferences) {
      return;
    }

    const prefs = profile.notification_preferences;
    const vehicleName = `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model}`;

    console.log('[BackgroundBLE] Triggering notification:', prefs.detection_type, vehicleName);

    // Handle vibration
    if (prefs.detection_type === 'vibration' || prefs.vibration) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('[BackgroundBLE] Vibration triggered');
      } catch (error) {
        console.error('[BackgroundBLE] Error triggering vibration:', error);
      }
    }

    // Handle sound
    if (prefs.detection_type === 'sound') {
      // Note: Playing sounds in background requires additional setup
      // For now, we'll just log it
      console.log('[BackgroundBLE] Sound notification:', prefs.sound);
      // TODO: Implement sound playback
      // This would require expo-av or similar and proper background audio permissions
    }

    // Silent notifications are handled by the database entries
    // The user will see them in the Nearby tab with gold highlights
  }, [profile]);

  const handleBeaconsDetected = useCallback(async (beacons: BeaconData[]) => {
    if (beacons.length === 0) {
      return;
    }

    console.log('[BackgroundBLE] Beacons detected:', beacons.length);

    try {
      const deviceIds = beacons.map(b => b.deviceId);

      // Fetch vehicle data for detected beacons
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
            user_id
          )
        `)
        .in('beacon_uuid', deviceIds);

      if (beaconError) {
        console.error('[BackgroundBLE] Error fetching beacon data:', beaconError);
        return;
      }

      if (!beaconData || beaconData.length === 0) {
        return;
      }

      // Fetch profile data to check ghost mode
      const userIds = beaconData
        .map((b: any) => b.vehicles?.user_id)
        .filter(Boolean);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, ghost_mode')
        .in('id', userIds);

      if (profileError) {
        console.error('[BackgroundBLE] Error fetching profile data:', profileError);
        return;
      }

      // Filter out vehicles from users with ghost mode enabled
      const validVehicles = beaconData.filter((b: any) => {
        const vehicle = b.vehicles;
        if (!vehicle) return false;

        const ownerProfile = profileData?.find((p: any) => p.id === vehicle.user_id);
        if (!ownerProfile || ownerProfile.ghost_mode) return false;

        return true;
      });

      // Process new detections
      for (const vehicleData of validVehicles) {
        const vehicle = vehicleData.vehicles;
        const vehicleKey = `${vehicle.id}`;

        // Skip if already detected in this session
        if (detectedVehiclesRef.current.has(vehicleKey)) {
          continue;
        }

        console.log('[BackgroundBLE] New vehicle detected:', vehicle.manufacturer, vehicle.model);
        detectedVehiclesRef.current.add(vehicleKey);

        // Store detection in database
        await storeDetection(vehicleData, beacons);

        // Trigger notification based on user preferences
        await triggerDetectionNotification(vehicle);
      }
    } catch (error) {
      console.error('[BackgroundBLE] Error handling beacon detection:', error);
    }
  }, [storeDetection, triggerDetectionNotification]);

  const startBackgroundScanning = useCallback(async () => {
    if (scanningRef.current) {
      console.log('[BackgroundBLE] Already scanning');
      return;
    }

    try {
      const hasPermissions = await BLEService.requestPermissions();
      if (!hasPermissions) {
        console.log('[BackgroundBLE] BLE permissions not granted');
        return;
      }

      const state = await BLEService.checkBluetoothState();
      if (state !== 'PoweredOn') {
        console.log('[BackgroundBLE] Bluetooth not powered on:', state);
        return;
      }

      scanningRef.current = true;
      console.log('[BackgroundBLE] Starting BLE scan');

      const success = await BLEService.startScanning(
        handleBeaconsDetected,
        (error) => {
          console.error('[BackgroundBLE] Scanning error:', error);
          scanningRef.current = false;
        }
      );

      if (!success) {
        scanningRef.current = false;
        console.log('[BackgroundBLE] Failed to start scanning');
      }
    } catch (error) {
      console.error('[BackgroundBLE] Error starting background scan:', error);
      scanningRef.current = false;
    }
  }, [handleBeaconsDetected]);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    console.log('[BackgroundBLE] App state changed:', appState.current, '->', nextAppState);
    
    const shouldScan = subscription.isPremium && profile?.always_searching_enabled;
    
    if (!shouldScan) {
      return;
    }

    // Start scanning when app becomes active
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('[BackgroundBLE] App became active, starting scanning');
      startBackgroundScanning();
    }
    // Keep scanning in background if always searching is enabled
    // Note: On iOS, background BLE scanning has limitations
    else if (nextAppState.match(/inactive|background/)) {
      console.log('[BackgroundBLE] App went to background, continuing scanning');
      // Scanning continues in background
    }

    appState.current = nextAppState;
  }, [subscription.isPremium, profile?.always_searching_enabled, startBackgroundScanning]);

  useEffect(() => {
    // Only run on native platforms
    if (Platform.OS === 'web') {
      console.log('[BackgroundBLE] Web platform detected, skipping background scanning');
      return;
    }

    // Check if user has premium and always searching enabled
    const shouldScan = subscription.isPremium && profile?.always_searching_enabled;

    if (!shouldScan) {
      console.log('[BackgroundBLE] Background scanning disabled:', {
        isPremium: subscription.isPremium,
        alwaysSearching: profile?.always_searching_enabled,
      });
      
      // Stop scanning if it was running
      if (scanningRef.current) {
        stopBackgroundScanning();
      }
      return;
    }

    console.log('[BackgroundBLE] Background scanning enabled, starting...');
    startBackgroundScanning();

    // Listen to app state changes
    const subscription_listener = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      console.log('[BackgroundBLE] Cleaning up background scanning');
      subscription_listener.remove();
      stopBackgroundScanning();
    };
  }, [subscription.isPremium, profile?.always_searching_enabled, startBackgroundScanning, handleAppStateChange, stopBackgroundScanning]);

  return {
    isScanning: scanningRef.current,
  };
}
