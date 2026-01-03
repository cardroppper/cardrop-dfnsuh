
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { ClubPermissions } from '@/types/messaging';

export function useClubPermissions(clubId: string) {
  const [permissions, setPermissions] = useState<ClubPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('club_permissions')
        .select('*')
        .eq('club_id', clubId)
        .single();

      if (fetchError) throw fetchError;
      setPermissions(data);
    } catch (err) {
      console.error('Error fetching club permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  const updatePermissions = async (updates: Partial<ClubPermissions>) => {
    try {
      const { error } = await supabase
        .from('club_permissions')
        .update(updates)
        .eq('club_id', clubId);

      if (error) throw error;
      await fetchPermissions();
    } catch (err) {
      console.error('Error updating permissions:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    updatePermissions,
    refetch: fetchPermissions,
  };
}
