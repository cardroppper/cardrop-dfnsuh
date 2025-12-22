
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Club, ClubWithDetails, ClubMember } from '@/types/club';

export function useClubs() {
  const [clubs, setClubs] = useState<ClubWithDetails[]>([]);
  const [myClubs, setMyClubs] = useState<ClubWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (clubsError) throw clubsError;

      const { data: membershipsData, error: membershipsError } = await supabase
        .from('club_members')
        .select('club_id, role')
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      const membershipMap = new Map(
        membershipsData?.map(m => [m.club_id, m.role]) || []
      );

      const { data: memberCountsData, error: memberCountsError } = await supabase
        .from('club_members')
        .select('club_id');

      if (memberCountsError) throw memberCountsError;

      const memberCounts = memberCountsData?.reduce((acc, m) => {
        acc[m.club_id] = (acc[m.club_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const clubsWithDetails: ClubWithDetails[] = (clubsData || []).map(club => ({
        ...club,
        member_count: memberCounts[club.id] || 0,
        is_member: membershipMap.has(club.id),
        user_role: membershipMap.get(club.id) || null,
      }));

      setClubs(clubsWithDetails);
      setMyClubs(clubsWithDetails.filter(c => c.is_member));
    } catch (err) {
      console.error('Error fetching clubs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch clubs');
    } finally {
      setLoading(false);
    }
  };

  const createClub = async (clubData: {
    name: string;
    description?: string;
    location?: string;
    is_public: boolean;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .insert({
          ...clubData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (clubError) throw clubError;

      const { error: memberError } = await supabase
        .from('club_members')
        .insert({
          club_id: club.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      await fetchClubs();
      return club;
    } catch (err) {
      console.error('Error creating club:', err);
      throw err;
    }
  };

  const joinClub = async (clubId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      await fetchClubs();
    } catch (err) {
      console.error('Error joining club:', err);
      throw err;
    }
  };

  const leaveClub = async (clubId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchClubs();
    } catch (err) {
      console.error('Error leaving club:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  return {
    clubs,
    myClubs,
    loading,
    error,
    createClub,
    joinClub,
    leaveClub,
    refetch: fetchClubs,
  };
}
