
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/app/integrations/supabase/types';

export interface EventWithClub extends Event {
  club?: {
    id: string;
    name: string;
    location: string | null;
  };
}

export function useClubEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get all clubs the user is a member of
      const { data: memberClubs, error: memberError } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberClubs || memberClubs.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const clubIds = memberClubs.map(m => m.club_id);

      // Fetch events for those clubs
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          clubs!inner (
            id,
            name,
            location
          )
        `)
        .in('club_id', clubIds)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      const formattedEvents = eventsData.map((e: any) => ({
        ...e,
        club: e.clubs,
      }));

      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData: {
    club_id: string;
    name: string;
    description?: string;
    location: string;
    event_date: string;
  }) => {
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchEvents();
      return data;
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    refetch: fetchEvents,
  };
}
