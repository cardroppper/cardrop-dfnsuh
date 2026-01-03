
export interface MessageRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
}

export interface PrivateMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | null;
  created_at: string;
  read_at: string | null;
}

export interface EventGalleryItem {
  id: string;
  event_id: string;
  uploaded_by_user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string | null;
  created_at: string;
}

export interface ClubPermissions {
  id: string;
  club_id: string;
  can_all_members_message: boolean;
  can_all_members_create_events: boolean;
  can_all_members_upload_gallery: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithDetails extends Conversation {
  other_user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  last_message?: PrivateMessage;
  unread_count?: number;
}
