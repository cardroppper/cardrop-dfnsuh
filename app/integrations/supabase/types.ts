
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string
          bio: string | null
          location: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          display_name: string
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          display_name?: string
          bio?: string | null
          location?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          owner_id: string
          make: string
          model: string
          year: number
          color: string | null
          vin: string | null
          license_plate: string | null
          description: string | null
          image_url: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          make: string
          model: string
          year: number
          color?: string | null
          vin?: string | null
          license_plate?: string | null
          description?: string | null
          image_url?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          make?: string
          model?: string
          year?: number
          color?: string | null
          vin?: string | null
          license_plate?: string | null
          description?: string | null
          image_url?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
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
      }
      stripe_customers: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      stripe_subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          price_id: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          price_id: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          status?: string
          price_id?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stripe_club_subscriptions: {
        Row: {
          id: string
          club_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          price_id: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          price_id: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          status?: string
          price_id?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stripe_payment_intents: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          currency: string
          status: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          currency?: string
          status: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_intent_id?: string
          amount?: number
          currency?: string
          status?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      registered_beacons: {
        Row: {
          id: string
          beacon_id: string
          name: string | null
          manufacturer_data: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          beacon_id: string
          name?: string | null
          manufacturer_data?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          beacon_id?: string
          name?: string | null
          manufacturer_data?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type Club = Database['public']['Tables']['clubs']['Row']
export type ClubMember = Database['public']['Tables']['club_members']['Row']
export type StripeCustomer = Database['public']['Tables']['stripe_customers']['Row']
export type StripeSubscription = Database['public']['Tables']['stripe_subscriptions']['Row']
export type StripeClubSubscription = Database['public']['Tables']['stripe_club_subscriptions']['Row']
export type StripePaymentIntent = Database['public']['Tables']['stripe_payment_intents']['Row']
export type RegisteredBeacon = Database['public']['Tables']['registered_beacons']['Row']
