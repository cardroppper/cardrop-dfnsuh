
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DetectionHighlight {
  id: string;
  vehicle_id: string;
  detected_at: string;
  expires_at: string;
}

export function useDetectionHighlights() {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<DetectionHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHighlights = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('detection_highlights')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      setHighlights(data || []);
    } catch (err) {
      console.error('Error fetching highlights:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  const addHighlight = async (vehicleId: string) => {
    if (!user) return false;

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error } = await supabase
        .from('detection_highlights')
        .upsert({
          user_id: user.id,
          vehicle_id: vehicleId,
          detected_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        }, {
          onConflict: 'user_id,vehicle_id',
        });

      if (error) throw error;

      await fetchHighlights();
      return true;
    } catch (err) {
      console.error('Error adding highlight:', err);
      return false;
    }
  };

  const isHighlighted = (vehicleId: string): boolean => {
    return highlights.some(h => h.vehicle_id === vehicleId);
  };

  return {
    highlights,
    loading,
    addHighlight,
    isHighlighted,
    refetch: fetchHighlights,
  };
}
