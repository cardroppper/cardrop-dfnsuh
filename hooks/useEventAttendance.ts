
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface EventLocation {
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
}

interface AttendeeVehicle {
  vehicle_id: string;
  vehicle_name: string;
  owner_username: string;
  owner_display_name: string;
  primary_image_url: string | null;
  detected_at: string;
  rssi: number;
}

export function useEventAttendance(eventId: string) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendanceMode, setAttendanceMode] = useState<'manual' | 'automatic'>('manual');
  const [eventLocation, setEventLocation] = useState<EventLocation | null>(null);
  const [isAtLocation, setIsAtLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [liveVehicles, setLiveVehicles] = useState<AttendeeVehicle[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  // Fetch user's attendance mode preference
  const fetchAttendanceMode = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('attendance_mode')
        .eq('id', user.id)
        .single();

      if (profile?.attendance_mode) {
        setAttendanceMode(profile.attendance_mode);
      }
    } catch (error) {
      console.error('[useEventAttendance] Error fetching attendance mode:', error);
    }
  }, []);

  // Check if user is premium
  const checkPremiumStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('free_premium')
        .eq('id', user.id)
        .single();

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('subscription_status')
        .eq('user_id', user.id)
        .single();

      const premium = profile?.free_premium || subscription?.subscription_status === 'premium';
      setIsPremium(premium);
    } catch (error) {
      console.error('[useEventAttendance] Error checking premium status:', error);
    }
  }, []);

  // Fetch event location data
  const fetchEventLocation = useCallback(async () => {
    try {
      const { data: event } = await supabase
        .from('events')
        .select('latitude, longitude, geofence_radius_meters')
        .eq('id', eventId)
        .single();

      if (event?.latitude && event?.longitude) {
        setEventLocation({
          latitude: event.latitude,
          longitude: event.longitude,
          geofence_radius_meters: event.geofence_radius_meters || 100,
        });
      }
    } catch (error) {
      console.error('[useEventAttendance] Error fetching event location:', error);
    }
  }, [eventId]);

  // Check if user is checked in
  const checkCheckinStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: checkin } = await supabase
        .from('event_checkins')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsCheckedIn(!!checkin);
    } catch (error) {
      console.error('[useEventAttendance] Error checking checkin status:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Manual check-in
  const checkInToEvent = useCallback(async (vehicleId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('event_checkins')
        .insert({
          event_id: eventId,
          user_id: user.id,
          vehicle_id: vehicleId || null,
        });

      if (error) throw error;

      setIsCheckedIn(true);
      Alert.alert('Success', 'You are now checked in to this event!');
    } catch (error) {
      console.error('[useEventAttendance] Error checking in:', error);
      Alert.alert('Error', 'Failed to check in to event');
      throw error;
    }
  }, [eventId]);

  // Check if user is at event location
  const checkUserLocation = useCallback(async () => {
    if (!eventLocation || attendanceMode !== 'automatic') return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('[useEventAttendance] Location permission not granted');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        eventLocation.latitude,
        eventLocation.longitude
      );

      const atLocation = distance <= eventLocation.geofence_radius_meters;
      setIsAtLocation(atLocation);

      // Auto check-in if at location and not already checked in
      if (atLocation && !isCheckedIn) {
        await checkInToEvent();
      }
    } catch (error) {
      console.error('[useEventAttendance] Error checking user location:', error);
    }
  }, [eventLocation, attendanceMode, isCheckedIn, checkInToEvent]);

  // Log a vehicle detection at the meet
  const logVehicleDetection = useCallback(async (
    vehicleId: string,
    rssi: number
  ) => {
    if (!isCheckedIn) {
      console.log('[useEventAttendance] Not checked in, cannot log detection');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('event_meet_detections')
        .insert({
          event_id: eventId,
          vehicle_id: vehicleId,
          detected_by_user_id: user.id,
          rssi,
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('[useEventAttendance] Error logging detection:', error);
      }
    } catch (error) {
      console.error('[useEventAttendance] Error logging vehicle detection:', error);
    }
  }, [eventId, isCheckedIn]);

  // Fetch live vehicles at the meet (for premium users)
  const fetchLiveVehicles = useCallback(async () => {
    if (!isPremium) return;

    try {
      const { data: detections, error } = await supabase
        .from('event_meet_detections')
        .select(`
          vehicle_id,
          rssi,
          detected_at,
          vehicles!inner (
            id,
            manufacturer,
            model,
            year,
            primary_image_url,
            user_id
          )
        `)
        .eq('event_id', eventId)
        .gt('expires_at', new Date().toISOString())
        .order('detected_at', { ascending: false });

      if (error) throw error;

      if (!detections || detections.length === 0) {
        setLiveVehicles([]);
        return;
      }

      // Get unique vehicles (latest detection for each)
      const uniqueVehicles = new Map<string, any>();
      detections.forEach((detection: any) => {
        const vehicleId = detection.vehicle_id;
        if (!uniqueVehicles.has(vehicleId)) {
          uniqueVehicles.set(vehicleId, detection);
        }
      });

      // Fetch owner profiles
      const userIds = Array.from(uniqueVehicles.values())
        .map((d: any) => d.vehicles.user_id)
        .filter(Boolean);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', userIds);

      const vehicles: AttendeeVehicle[] = Array.from(uniqueVehicles.values())
        .map((detection: any) => {
          const vehicle = detection.vehicles;
          const profile = profiles?.find((p: any) => p.id === vehicle.user_id);

          return {
            vehicle_id: vehicle.id,
            vehicle_name: `${vehicle.year} ${vehicle.manufacturer} ${vehicle.model}`,
            owner_username: profile?.username || 'Unknown',
            owner_display_name: profile?.display_name || 'Unknown',
            primary_image_url: vehicle.primary_image_url,
            detected_at: detection.detected_at,
            rssi: detection.rssi,
          };
        });

      setLiveVehicles(vehicles);
    } catch (error) {
      console.error('[useEventAttendance] Error fetching live vehicles:', error);
    }
  }, [eventId, isPremium]);

  // Subscribe to real-time updates for live vehicles
  useEffect(() => {
    if (!isPremium) return;

    const channel = supabase
      .channel(`event_meet_detections:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_meet_detections',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          console.log('[useEventAttendance] Real-time update received');
          fetchLiveVehicles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, isPremium, fetchLiveVehicles]);

  // Initial data fetch
  useEffect(() => {
    fetchAttendanceMode();
    fetchEventLocation();
    checkCheckinStatus();
    checkPremiumStatus();
  }, [eventId, fetchAttendanceMode, fetchEventLocation, checkCheckinStatus, checkPremiumStatus]);

  // Check location periodically if automatic mode
  useEffect(() => {
    if (attendanceMode === 'automatic' && eventLocation) {
      checkUserLocation();
      const interval = setInterval(checkUserLocation, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [attendanceMode, eventLocation, checkUserLocation]);

  // Fetch live vehicles periodically
  useEffect(() => {
    if (isPremium) {
      fetchLiveVehicles();
      const interval = setInterval(fetchLiveVehicles, 15000); // Refresh every 15 seconds
      return () => clearInterval(interval);
    }
  }, [isPremium, fetchLiveVehicles]);

  return {
    isCheckedIn,
    attendanceMode,
    isAtLocation,
    loading,
    liveVehicles,
    isPremium,
    checkInToEvent,
    logVehicleDetection,
    refetch: () => {
      checkCheckinStatus();
      fetchLiveVehicles();
    },
  };
}
