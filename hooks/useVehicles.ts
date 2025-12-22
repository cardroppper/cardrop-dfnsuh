
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Vehicle, VehicleModification, VehicleImage } from '@/app/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export interface VehicleWithDetails extends Vehicle {
  modifications?: VehicleModification[];
  images?: VehicleImage[];
}

export function useVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = async () => {
    if (!user) {
      console.log('[useVehicles] No user, skipping load');
      setVehicles([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log('[useVehicles] Loading vehicles for user:', user.id);
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('[useVehicles] Error loading vehicles:', fetchError);
        throw fetchError;
      }

      console.log('[useVehicles] Loaded vehicles:', data?.length || 0);
      setVehicles(data || []);
    } catch (err) {
      console.error('[useVehicles] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [user?.id]);

  return {
    vehicles,
    isLoading,
    error,
    refetch: loadVehicles,
  };
}

export function useVehicleDetails(vehicleId: string | null) {
  const [vehicle, setVehicle] = useState<VehicleWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehicleDetails = async () => {
    if (!vehicleId) {
      console.log('[useVehicleDetails] No vehicle ID provided');
      setVehicle(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('[useVehicleDetails] Loading vehicle:', vehicleId);
      setIsLoading(true);
      setError(null);

      const [vehicleResult, modsResult, imagesResult] = await Promise.all([
        supabase.from('vehicles').select('*').eq('id', vehicleId).single(),
        supabase.from('vehicle_modifications').select('*').eq('vehicle_id', vehicleId).order('category'),
        supabase.from('vehicle_images').select('*').eq('vehicle_id', vehicleId).order('display_order'),
      ]);

      if (vehicleResult.error) {
        console.error('[useVehicleDetails] Error loading vehicle:', vehicleResult.error);
        throw vehicleResult.error;
      }

      const vehicleData: VehicleWithDetails = {
        ...vehicleResult.data,
        modifications: modsResult.data || [],
        images: imagesResult.data || [],
      };

      console.log('[useVehicleDetails] Loaded vehicle with', vehicleData.modifications?.length, 'mods and', vehicleData.images?.length, 'images');
      setVehicle(vehicleData);
    } catch (err) {
      console.error('[useVehicleDetails] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vehicle details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicleDetails();
  }, [vehicleId]);

  return {
    vehicle,
    isLoading,
    error,
    refetch: loadVehicleDetails,
  };
}
