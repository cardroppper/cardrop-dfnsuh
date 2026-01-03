
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { EventGalleryItem } from '@/types/messaging';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useEventGallery(eventId: string) {
  const [galleryItems, setGalleryItems] = useState<EventGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchGalleryItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('event_gallery')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setGalleryItems(data || []);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch gallery');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const uploadToGallery = async (mediaUrl: string, mediaType: 'image' | 'video', caption?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // TODO: Backend Integration - Upload media file to storage and get URL
      const { error } = await supabase
        .from('event_gallery')
        .insert({
          event_id: eventId,
          uploaded_by_user_id: user.id,
          media_url: mediaUrl,
          media_type: mediaType,
          caption: caption || null,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error uploading to gallery:', err);
      throw err;
    }
  };

  const deleteGalleryItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('event_gallery')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchGalleryItems();
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchGalleryItems();

    // Set up realtime subscription
    const setupRealtimeSubscription = async () => {
      if (channelRef.current?.state === 'subscribed') return;

      const channel = supabase.channel(`event:${eventId}:gallery`, {
        config: { private: true },
      });

      channelRef.current = channel;

      // Set auth before subscribing
      await supabase.realtime.setAuth();

      channel
        .on('broadcast', { event: 'INSERT' }, (payload) => {
          console.log('New gallery item:', payload);
          setGalleryItems((prev) => [payload.new as EventGalleryItem, ...prev]);
        })
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [eventId, fetchGalleryItems]);

  return {
    galleryItems,
    loading,
    error,
    uploadToGallery,
    deleteGalleryItem,
    refetch: fetchGalleryItems,
  };
}
