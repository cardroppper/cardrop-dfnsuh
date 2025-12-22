
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BeaconDetection } from '@/app/integrations/supabase/types';

export interface DetectionWithDetails extends BeaconDetection {
  vehicle?: {
    id: string;
    manufacturer: string;
    model: string;
    year: number;
    primary_image_url: string | null;
  };
  detected_user?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export function useBeaconDetections() {
  const { user } = useAuth();
  const [detections, setDetections] = useState<DetectionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetections = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('beacon_detections')
        .select(`
          *,
          vehicles!detected_vehicle_id (
            id,
            manufacturer,
            model,
            year,
            primary_image_url
          ),
          profiles!detected_user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('detector_user_id', user.id)
        .order('detected_at', { ascending: false })
        .limit(100);

      if (fetchError) {
        console.error('Error fetching detections:', fetchError);
        setError(fetchError.message);
        return;
      }

      const formattedDetections = data.map((d: any) => ({
        ...d,
        vehicle: d.vehicles,
        detected_user: d.profiles,
      }));

      setDetections(formattedDetections);
    } catch (err) {
      console.error('Error in fetchDetections:', err);
      setError('Failed to load detection history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDetections();
  }, [fetchDetections]);

  const recordDetection = async (
    vehicleId: string,
    detectedUserId: string,
    rssi: number,
    location?: string
  ) => {
    if (!user) return false;

    try {
      const { error: insertError } = await supabase
        .from('beacon_detections')
        .insert({
          detector_user_id: user.id,
          detected_vehicle_id: vehicleId,
          detected_user_id: detectedUserId,
          rssi,
          location: location || null,
        });

      if (insertError) {
        console.error('Error recording detection:', insertError);
        return false;
      }

      await fetchDetections();
      return true;
    } catch (err) {
      console.error('Error in recordDetection:', err);
      return false;
    }
  };

  return {
    detections,
    loading,
    error,
    recordDetection,
    refetch: fetchDetections,
  };
}
