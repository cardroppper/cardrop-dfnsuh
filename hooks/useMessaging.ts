
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { MessageRequest, Conversation, PrivateMessage, ConversationWithDetails } from '@/types/messaging';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useMessaging() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [messageRequests, setMessageRequests] = useState<MessageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Fetch conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Fetch last messages and other user details for each conversation
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

          // Fetch other user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          // Fetch last message
          const { data: lastMessageData } = await supabase
            .from('private_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('private_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            ...conv,
            other_user: profileData || undefined,
            last_message: lastMessageData || undefined,
            unread_count: unreadCount || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessageRequests = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('message_requests')
        .select('*')
        .eq('to_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessageRequests(data || []);
    } catch (err) {
      console.error('Error fetching message requests:', err);
    }
  }, []);

  const sendMessageRequest = async (toUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('message_requests')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          status: 'pending',
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message request:', err);
      throw err;
    }
  };

  const respondToMessageRequest = async (requestId: string, accept: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update request status
      const { data: request, error: updateError } = await supabase
        .from('message_requests')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      // If accepted, create conversation
      if (accept && request) {
        const user1 = request.from_user_id < request.to_user_id ? request.from_user_id : request.to_user_id;
        const user2 = request.from_user_id < request.to_user_id ? request.to_user_id : request.from_user_id;

        const { error: convError } = await supabase
          .from('conversations')
          .insert({
            user1_id: user1,
            user2_id: user2,
          });

        if (convError) throw convError;
      }

      await fetchMessageRequests();
      await fetchConversations();
    } catch (err) {
      console.error('Error responding to message request:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchMessageRequests();
  }, [fetchConversations, fetchMessageRequests]);

  return {
    conversations,
    messageRequests,
    loading,
    error,
    sendMessageRequest,
    respondToMessageRequest,
    refetch: fetchConversations,
  };
}

export function useConversationMessages(conversationId: string) {
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('private_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const sendMessage = async (messageText?: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('private_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message_text: messageText || null,
          media_url: mediaUrl || null,
          media_type: mediaType || null,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('private_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .is('read_at', null);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up realtime subscription
    const setupRealtimeSubscription = async () => {
      if (channelRef.current?.state === 'subscribed') return;

      const channel = supabase.channel(`conversation:${conversationId}:messages`, {
        config: { private: true },
      });

      channelRef.current = channel;

      // Set auth before subscribing
      await supabase.realtime.setAuth();

      channel
        .on('broadcast', { event: 'INSERT' }, (payload) => {
          console.log('New message received:', payload);
          setMessages((prev) => [...prev, payload.new as PrivateMessage]);
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
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
}
