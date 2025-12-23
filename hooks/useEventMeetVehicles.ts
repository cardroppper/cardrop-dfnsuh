
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

interface MeetVehicle {
  vehicle_id: string;
  event_id: string;
  event_name: string;
  club_name: string;
}

export function useEventMeetVehicles() {
  const [meetVehicles, setMeetVehicles] = useState<Map<string, MeetVehicle>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchMeetVehicles = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all clubs the user is a member of
      const { data: memberships } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user.id);

      if (!memberships || memberships.length === 0) {
        setMeetVehicles(new Map());
        setLoading(false);
        return;
      }

      const clubIds = memberships.map(m => m.club_id);

      // Get all active events for these clubs
      const { data: events } = await supabase
        .from('events')
        .select('id, name, club_id, clubs(name)')
        .in('club_id', clubIds)
        .gte('event_date', new Date().toISOString());

      if (!events || events.length === 0) {
        setMeetVehicles(new Map());
        setLoading(false);
        return;
      }

      const eventIds = events.map(e => e.id);

      // Get all vehicle detections for these events
      const { data: detections } = await supabase
        .from('event_meet_detections')
        .select('vehicle_id, event_id')
        .in('event_id', eventIds)
        .gt('expires_at', new Date().toISOString());

      if (!detections || detections.length === 0) {
        setMeetVehicles(new Map());
        setLoading(false);
        return;
      }

      // Create a map of vehicle_id to meet info
      const vehicleMap = new Map<string, MeetVehicle>();
      detections.forEach(detection => {
        const event = events.find(e => e.id === detection.event_id);
        if (event && !vehicleMap.has(detection.vehicle_id)) {
          vehicleMap.set(detection.vehicle_id, {
            vehicle_id: detection.vehicle_id,
            event_id: event.id,
            event_name: event.name,
            club_name: (event.clubs as any)?.name || 'Unknown Club',
          });
        }
      });

      setMeetVehicles(vehicleMap);
    } catch (error) {
      console.error('[useEventMeetVehicles] Error fetching meet vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const isVehicleAtMeet = useCallback((vehicleId: string): boolean => {
    return meetVehicles.has(vehicleId);
  }, [meetVehicles]);

  const getMeetInfo = useCallback((vehicleId: string): MeetVehicle | null => {
    return meetVehicles.get(vehicleId) || null;
  }, [meetVehicles]);

  useEffect(() => {
    fetchMeetVehicles();

    // Refresh every 30 seconds
    const interval = setInterval(fetchMeetVehicles, 30000);

    return () => clearInterval(interval);
  }, [fetchMeetVehicles]);

  return {
    isVehicleAtMeet,
    getMeetInfo,
    loading,
    refetch: fetchMeetVehicles,
  };
}
