
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Event, EventWithDetails, EventRSVP, EventCheckin } from '@/types/club';

export function useEvents(clubId?: string) {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      let query = supabase
        .from('events')
        .select('*, clubs(*)');

      if (clubId) {
        query = query.eq('club_id', clubId);
      }

      const { data: eventsData, error: eventsError } = await query
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      const eventIds = eventsData?.map(e => e.id) || [];

      const { data: rsvpsData } = await supabase
        .from('event_rsvps')
        .select('*')
        .in('event_id', eventIds);

      const { data: checkinsData } = await supabase
        .from('event_checkins')
        .select('*')
        .in('event_id', eventIds);

      const rsvpsByEvent = (rsvpsData || []).reduce((acc, rsvp) => {
        if (!acc[rsvp.event_id]) acc[rsvp.event_id] = [];
        acc[rsvp.event_id].push(rsvp);
        return acc;
      }, {} as Record<string, EventRSVP[]>);

      const checkinsByEvent = (checkinsData || []).reduce((acc, checkin) => {
        if (!acc[checkin.event_id]) acc[checkin.event_id] = [];
        acc[checkin.event_id].push(checkin);
        return acc;
      }, {} as Record<string, EventCheckin[]>);

      const eventsWithDetails: EventWithDetails[] = (eventsData || []).map(event => {
        const eventRsvps = rsvpsByEvent[event.id] || [];
        const eventCheckins = checkinsByEvent[event.id] || [];
        const userRsvp = eventRsvps.find(r => r.user_id === user.id) || null;
        const userCheckin = eventCheckins.find(c => c.user_id === user.id) || null;

        return {
          ...event,
          club: event.clubs,
          rsvp_count: eventRsvps.filter(r => r.status === 'going').length,
          checkin_count: eventCheckins.length,
          user_rsvp: userRsvp,
          user_checkin: userCheckin,
        };
      });

      setEvents(eventsWithDetails);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  const createEvent = async (eventData: {
    club_id: string;
    name: string;
    description?: string;
    location: string;
    event_date: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: event, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchEvents();
      return event;
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  const rsvpToEvent = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        });

      if (error) throw error;

      await fetchEvents();
    } catch (err) {
      console.error('Error RSVPing to event:', err);
      throw err;
    }
  };

  const checkInToEvent = async (eventId: string, vehicleId?: string) => {
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

      await fetchEvents();
    } catch (err) {
      console.error('Error checking in to event:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    rsvpToEvent,
    checkInToEvent,
    refetch: fetchEvents,
  };
}
