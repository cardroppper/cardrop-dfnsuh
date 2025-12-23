
export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  instagram_handle: string | null;
  x_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  is_private: boolean;
  ghost_mode: boolean;
  created_at: string;
  updated_at: string;
  cover_photo_url: string | null;
}

export interface Vehicle {
  id: string;
  user_id: string;
  manufacturer: string;
  model: string;
  year: number;
  body_style: string | null;
  fuel_type: string | null;
  drivetrain: string | null;
  engine_configuration: string | null;
  induction_type: string | null;
  transmission_type: string | null;
  power_output: string | null;
  torque_output: string | null;
  primary_image_url: string | null;
  is_public: boolean;
  is_featured: boolean;
  latitude: number | null;
  longitude: number | null;
  location_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleBeacon {
  id: string;
  vehicle_id: string;
  beacon_uuid: string;
  beacon_major: number | null;
  beacon_minor: number | null;
  created_at: string;
  updated_at: string;
}

export interface BeaconDetection {
  id: string;
  detector_user_id: string;
  detected_vehicle_id: string;
  detected_user_id: string;
  rssi: number;
  location: string | null;
  detected_at: string;
}

export interface Club {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  is_public: boolean;
  owner_id: string;
  logo_url: string | null;
  banner_url: string | null;
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
  beacon_uuid: string | null;
  auto_checkin_enabled: boolean;
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

export interface VehicleModification {
  id: string;
  vehicle_id: string;
  category: 'Engine' | 'Intake' | 'Exhaust' | 'Suspension' | 'Wheels & Tyres' | 'Brakes' | 'Aero' | 'Electronics' | 'Interior';
  brand_name: string | null;
  part_name: string | null;
  description: string | null;
  install_date: string | null;
  cost: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface VehicleTimeline {
  id: string;
  vehicle_id: string;
  title: string;
  description: string | null;
  entry_date: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehiclePerformance {
  id: string;
  vehicle_id: string;
  zero_to_sixty: number | null;
  quarter_mile_time: number | null;
  quarter_mile_speed: number | null;
  horsepower: number | null;
  torque: number | null;
  weight_lbs: number | null;
  created_at: string;
  updated_at: string;
}

export interface ClubHub {
  id: string;
  club_id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  sync_interval_minutes: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HubDetection {
  id: string;
  hub_id: string;
  vehicle_id: string;
  user_id: string;
  rssi: number;
  detected_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_status: 'free' | 'premium';
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}
