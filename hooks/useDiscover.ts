
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

export interface DiscoverVehicle {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  primary_image_url: string | null;
  power_output: string | null;
  induction_type: string | null;
  is_featured: boolean;
  updated_at: string;
  user_id: string;
  owner?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  modification_count?: number;
  distance?: number;
}

export function useDiscover() {
  const [vehicles, setVehicles] = useState<DiscoverVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscoverFeed = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(`
          *,
          profiles!vehicles_user_id_fkey (
            username,
            display_name,
            avatar_url,
            is_private
          )
        `)
        .eq('is_public', true)
        .order('is_featured', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(50);

      if (vehiclesError) throw vehiclesError;

      const vehicleIds = vehiclesData?.map(v => v.id) || [];

      const { data: modsData } = await supabase
        .from('vehicle_modifications')
        .select('vehicle_id')
        .in('vehicle_id', vehicleIds);

      const modCounts = (modsData || []).reduce((acc, mod) => {
        acc[mod.vehicle_id] = (acc[mod.vehicle_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const filteredVehicles = (vehiclesData || [])
        .filter(v => {
          const profile = v.profiles;
          if (!profile) return false;
          if (profile.is_private && v.user_id !== user.id) return false;
          return true;
        })
        .map(vehicle => ({
          id: vehicle.id,
          manufacturer: vehicle.manufacturer,
          model: vehicle.model,
          year: vehicle.year,
          primary_image_url: vehicle.primary_image_url,
          power_output: vehicle.power_output,
          induction_type: vehicle.induction_type,
          is_featured: vehicle.is_featured || false,
          updated_at: vehicle.updated_at,
          user_id: vehicle.user_id,
          owner: vehicle.profiles ? {
            username: vehicle.profiles.username,
            display_name: vehicle.profiles.display_name,
            avatar_url: vehicle.profiles.avatar_url,
          } : undefined,
          modification_count: modCounts[vehicle.id] || 0,
        }));

      setVehicles(filteredVehicles);
    } catch (err) {
      console.error('Error fetching discover feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch discover feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = () => {
    fetchDiscoverFeed(true);
  };

  useEffect(() => {
    fetchDiscoverFeed();
  }, []);

  return {
    vehicles,
    loading,
    refreshing,
    error,
    refresh,
  };
}
