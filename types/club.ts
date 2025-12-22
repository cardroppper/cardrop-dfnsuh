
export interface Club {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  is_public: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface Event {
  id: string;
  club_id: string;
  name: string;
  description: string | null;
  location: string;
  event_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  rsvp_at: string;
}

export interface EventCheckin {
  id: string;
  event_id: string;
  user_id: string;
  vehicle_id: string | null;
  checked_in_at: string;
}

export interface ClubWithDetails extends Club {
  member_count?: number;
  is_member?: boolean;
  user_role?: 'owner' | 'admin' | 'member' | null;
}

export interface EventWithDetails extends Event {
  club?: Club;
  rsvp_count?: number;
  checkin_count?: number;
  user_rsvp?: EventRSVP | null;
  user_checkin?: EventCheckin | null;
}
