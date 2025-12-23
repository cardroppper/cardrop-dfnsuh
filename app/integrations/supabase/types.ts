
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_photo_url: string | null
          created_at: string
          display_name: string
          id: string
          instagram_handle: string | null
          is_private: boolean | null
          x_handle: string | null
          tiktok_handle: string | null
          updated_at: string
          username: string
          youtube_handle: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string
          display_name: string
          id: string
          instagram_handle?: string | null
          is_private?: boolean | null
          x_handle?: string | null
          tiktok_handle?: string | null
          updated_at?: string
          username: string
          youtube_handle?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          instagram_handle?: string | null
          is_private?: boolean | null
          x_handle?: string | null
          tiktok_handle?: string | null
          updated_at?: string
          username?: string
          youtube_handle?: string | null
        }
        Relationships: []
      }
      vehicle_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_modifications: {
        Row: {
          brand_name: string | null
          category: string
          cost: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          install_date: string | null
          part_name: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          brand_name?: string | null
          category: string
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          install_date?: string | null
          part_name?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          brand_name?: string | null
          category?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          install_date?: string | null
          part_name?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_modifications_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_beacons: {
        Row: {
          id: string
          vehicle_id: string
          beacon_uuid: string
          beacon_major: number | null
          beacon_minor: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          beacon_uuid: string
          beacon_major?: number | null
          beacon_minor?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          beacon_uuid?: string
          beacon_major?: number | null
          beacon_minor?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_beacons_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_style: string | null
          created_at: string
          drivetrain: string | null
          engine_configuration: string | null
          fuel_type: string | null
          id: string
          induction_type: string | null
          is_public: boolean
          is_featured: boolean
          latitude: number | null
          longitude: number | null
          location_updated_at: string | null
          manufacturer: string
          model: string
          power_output: string | null
          primary_image_url: string | null
          torque_output: string | null
          transmission_type: string | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          body_style?: string | null
          created_at?: string
          drivetrain?: string | null
          engine_configuration?: string | null
          fuel_type?: string | null
          id?: string
          induction_type?: string | null
          is_public?: boolean
          is_featured?: boolean
          latitude?: number | null
          longitude?: number | null
          location_updated_at?: string | null
          manufacturer: string
          model: string
          power_output?: string | null
          primary_image_url?: string | null
          torque_output?: string | null
          transmission_type?: string | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          body_style?: string | null
          created_at?: string
          drivetrain?: string | null
          engine_configuration?: string | null
          fuel_type?: string | null
          id?: string
          induction_type?: string | null
          is_public?: boolean
          is_featured?: boolean
          latitude?: number | null
          longitude?: number | null
          location_updated_at?: string | null
          manufacturer?: string
          model?: string
          power_output?: string | null
          primary_image_url?: string | null
          torque_output?: string | null
          transmission_type?: string | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      clubs: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string | null
          is_public: boolean
          owner_id: string
          logo_url: string | null
          banner_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location?: string | null
          is_public?: boolean
          owner_id: string
          logo_url?: string | null
          banner_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string | null
          is_public?: boolean
          owner_id?: string
          logo_url?: string | null
          banner_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      club_members: {
        Row: {
          id: string
          club_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          club_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          id: string
          club_id: string
          name: string
          description: string | null
          location: string
          event_date: string
          beacon_uuid: string | null
          auto_checkin_enabled: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          name: string
          description?: string | null
          location: string
          event_date: string
          beacon_uuid?: string | null
          auto_checkin_enabled?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          name?: string
          description?: string | null
          location?: string
          event_date?: string
          beacon_uuid?: string | null
          auto_checkin_enabled?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: string
          rsvp_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: string
          rsvp_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: string
          rsvp_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_checkins: {
        Row: {
          id: string
          event_id: string
          user_id: string
          vehicle_id: string | null
          checked_in_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          vehicle_id?: string | null
          checked_in_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          vehicle_id?: string | null
          checked_in_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_checkins_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription_status: string
          subscription_start_date: string | null
          subscription_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_status?: string
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_status?: string
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      beacon_detections: {
        Row: {
          id: string
          detector_user_id: string
          detected_vehicle_id: string
          detected_user_id: string
          rssi: number
          location: string | null
          detected_at: string
        }
        Insert: {
          id?: string
          detector_user_id: string
          detected_vehicle_id: string
          detected_user_id: string
          rssi: number
          location?: string | null
          detected_at?: string
        }
        Update: {
          id?: string
          detector_user_id?: string
          detected_vehicle_id?: string
          detected_user_id?: string
          rssi?: number
          location?: string | null
          detected_at?: string
        }
        Relationships: []
      }
      vehicle_timeline: {
        Row: {
          id: string
          vehicle_id: string
          title: string
          description: string | null
          entry_date: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          title: string
          description?: string | null
          entry_date: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          title?: string
          description?: string | null
          entry_date?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_performance: {
        Row: {
          id: string
          vehicle_id: string
          zero_to_sixty: number | null
          quarter_mile_time: number | null
          quarter_mile_speed: number | null
          horsepower: number | null
          torque: number | null
          weight_lbs: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          zero_to_sixty?: number | null
          quarter_mile_time?: number | null
          quarter_mile_speed?: number | null
          horsepower?: number | null
          torque?: number | null
          weight_lbs?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          zero_to_sixty?: number | null
          quarter_mile_time?: number | null
          quarter_mile_speed?: number | null
          horsepower?: number | null
          torque?: number | null
          weight_lbs?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      club_messages: {
        Row: {
          id: string
          club_id: string
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          club_id: string
          user_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          user_id?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      club_posts: {
        Row: {
          id: string
          club_id: string
          user_id: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          user_id: string
          content: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      club_hubs: {
        Row: {
          id: string
          club_id: string
          name: string
          location: string
          latitude: number | null
          longitude: number | null
          is_active: boolean
          sync_interval_minutes: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          name: string
          location: string
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          sync_interval_minutes?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          name?: string
          location?: string
          latitude?: number | null
          longitude?: number | null
          is_active?: boolean
          sync_interval_minutes?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      hub_detections: {
        Row: {
          id: string
          hub_id: string
          vehicle_id: string
          user_id: string
          rssi: number
          detected_at: string
        }
        Insert: {
          id?: string
          hub_id: string
          vehicle_id: string
          user_id: string
          rssi: number
          detected_at?: string
        }
        Update: {
          id?: string
          hub_id?: string
          vehicle_id?: string
          user_id?: string
          rssi?: number
          detected_at?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Profile = Tables<'profiles'>
export type Vehicle = Tables<'vehicles'>
export type VehicleImage = Tables<'vehicle_images'>
export type VehicleModification = Tables<'vehicle_modifications'>
export type VehicleBeacon = Tables<'vehicle_beacons'>
export type VehicleTimeline = Tables<'vehicle_timeline'>
export type VehiclePerformance = Tables<'vehicle_performance'>
export type Club = Tables<'clubs'>
export type ClubMember = Tables<'club_members'>
export type ClubMessage = Tables<'club_messages'>
export type ClubPost = Tables<'club_posts'>
export type ClubHub = Tables<'club_hubs'>
export type Event = Tables<'events'>
export type EventRSVP = Tables<'event_rsvps'>
export type EventCheckin = Tables<'event_checkins'>
export type UserSubscription = Tables<'user_subscriptions'>
export type BeaconDetection = Tables<'beacon_detections'>
export type HubDetection = Tables<'hub_detections'>
export type UserFollow = Tables<'user_follows'>
