
# CarDrop - Complete MVP Specification Document

## Executive Summary

CarDrop is a real-world automotive social application centered on real cars, real owners, and real physical presence. This document provides complete technical specifications to recreate the application exactly.

---

## Table of Contents

1. [Core Philosophy & Requirements](#core-philosophy--requirements)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema](#database-schema)
4. [Authentication System](#authentication-system)
5. [Feature Specifications](#feature-specifications)
6. [API Endpoints](#api-endpoints)
7. [UI/UX Specifications](#uiux-specifications)
8. [Navigation Structure](#navigation-structure)
9. [Bluetooth & Location Services](#bluetooth--location-services)
10. [Subscription & Payments](#subscription--payments)
11. [Security & Privacy](#security--privacy)
12. [Platform-Specific Implementation](#platform-specific-implementation)
13. [Build & Deployment](#build--deployment)

---

## 1. Core Philosophy & Requirements

### Identity-First Principles
- **Every account represents a real person** - No anonymous posting
- **Every vehicle belongs to a real user** - Verified ownership
- **Every club has real members** - Explicit membership relationships
- **All relationships are explicit and structured** - No fake data

### Authentication Requirements
- **No unauthenticated browsing** - Users must log in to view any content
- **Logged-out users** see only authentication screens
- **No demo mode** - All actions must persist to database

### Visual Identity
- **Automotive-focused** design language
- **Clean, modern, performance-inspired** aesthetics
- **Dark-first appearance** with light mode support
- **Information-dense without clutter**
- **No playful or childish styling**

### Global Behavioral Rules
- No fake data or placeholder logic
- No demo-only shortcuts
- All actions must persist to database
- All data must be reload-safe
- Navigation must always reflect real state
- Designed for real devices and real-world use

---

## 2. Architecture Overview

### Technology Stack

**Frontend:**
- React Native 0.81.4
- Expo SDK 54
- TypeScript 5.9.3
- Expo Router 6.0.0 (file-based routing)

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Edge Functions (Deno runtime)
- Row Level Security (RLS) policies

**Key Libraries:**
- `@supabase/supabase-js` - Database client
- `expo-location` - Location services
- `react-native-ble-manager` - Bluetooth Low Energy
- `@react-native-async-storage/async-storage` - Local storage
- `expo-crypto` - Cryptographic functions
- `react-native-maps` - Map display (iOS/Android only)
- `expo-image-picker` - Image selection
- `expo-haptics` - Haptic feedback

### Project Structure

```
cardrop/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication flow
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                   # Main app tabs
│   │   ├── (home)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   └── index.ios.tsx
│   │   ├── _layout.tsx
│   │   ├── _layout.ios.tsx
│   │   ├── discover.tsx
│   │   ├── nearby.tsx
│   │   ├── garage.tsx
│   │   ├── clubs.tsx
│   │   ├── messages.tsx
│   │   ├── profile.tsx
│   │   ├── profile.ios.tsx
│   │   └── settings.tsx
│   ├── clubs/
│   │   ├── _layout.tsx
│   │   └── [clubId].tsx
│   ├── messages/
│   │   ├── _layout.tsx
│   │   └── [conversationId].tsx
│   ├── vehicles/
│   │   ├── _layout.tsx
│   │   ├── [vehicleId].tsx
│   │   ├── [vehicleId]/timeline.tsx
│   │   ├── add.tsx
│   │   ├── edit/[vehicleId].tsx
│   │   ├── beacon-assign/[vehicleId].tsx
│   │   └── modifications/
│   │       ├── _layout.tsx
│   │       └── add.tsx
│   ├── subscription/
│   │   ├── _layout.tsx
│   │   └── premium.tsx
│   ├── dev/
│   │   ├── _layout.tsx
│   │   └── beacon-registration.tsx
│   ├── _layout.tsx
│   ├── index.tsx
│   └── subscription-management.tsx
├── components/                   # Reusable components
│   ├── BeaconPairingModal.tsx
│   ├── BeaconSelector.tsx
│   ├── BodyScrollView.tsx
│   ├── ClubCalendar.tsx
│   ├── ClubChat.tsx
│   ├── DebugPanel.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorState.tsx
│   ├── EventGallery.tsx
│   ├── FloatingDebugButton.tsx
│   ├── FloatingTabBar.tsx
│   ├── HeaderButtons.tsx
│   ├── IconCircle.tsx
│   ├── IconSymbol.tsx
│   ├── IconSymbol.ios.tsx
│   ├── ListItem.tsx
│   ├── LiveMeetView.tsx
│   ├── LoadingButton.tsx
│   ├── Logo.tsx
│   ├── PaywallScreen.tsx
│   ├── ProtectedRoute.tsx
│   ├── SkeletonLoader.tsx
│   ├── VehicleBeaconManager.tsx
│   └── button.tsx
├── contexts/                     # React contexts
│   ├── AuthContext.tsx
│   ├── StripeContext.tsx
│   └── WidgetContext.tsx
├── hooks/                        # Custom React hooks
│   ├── useBLEScanning.ts
│   ├── useBackgroundBLEScanning.ts
│   ├── useBeaconDetections.ts
│   ├── useBeaconPairing.ts
│   ├── useClubEvents.ts
│   ├── useClubPermissions.ts
│   ├── useClubPricing.ts
│   ├── useClubs.ts
│   ├── useDetectionHighlights.ts
│   ├── useDiscover.ts
│   ├── useEventAttendance.ts
│   ├── useEventGallery.ts
│   ├── useEventMeetVehicles.ts
│   ├── useEvents.ts
│   ├── useMessaging.ts
│   ├── useStripeClubPayment.ts
│   ├── useStripeSubscription.ts
│   ├── useSubscription.ts
│   └── useVehicles.ts
├── services/                     # Service layer
│   └── BLEService.ts
├── utils/                        # Utility functions
│   ├── api.ts
│   ├── autoDebugger.ts
│   ├── cacheUtils.ts
│   ├── errorLogger.ts
│   ├── navigationDebugger.ts
│   ├── networkUtils.ts
│   ├── security.ts
│   ├── stripeSecure.ts
│   └── validation.ts
├── types/                        # TypeScript types
│   ├── ble.ts
│   ├── club.ts
│   ├── messaging.ts
│   └── vehicle.ts
├── styles/                       # Styling
│   └── commonStyles.ts
├── constants/                    # Constants
│   └── Colors.ts
└── supabase/                     # Supabase configuration
    └── config.toml
```

---

## 3. Database Schema

### Complete PostgreSQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- VEHICLES
-- ============================================

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Info
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  trim TEXT,
  color TEXT,
  vin TEXT UNIQUE,
  
  -- Display
  nickname TEXT,
  description TEXT,
  primary_photo_url TEXT,
  
  -- Visibility
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'club_only')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT year_valid CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2)
);

-- Indexes
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_vehicles_visibility ON vehicles(visibility);

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public vehicles viewable by authenticated users"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    visibility = 'public' OR
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM club_members cm
      JOIN clubs c ON c.id = cm.club_id
      WHERE cm.user_id = auth.uid()
      AND visibility = 'club_only'
    )
  );

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================
-- VEHICLE PHOTOS
-- ============================================

CREATE TABLE vehicle_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicle_photos_vehicle ON vehicle_photos(vehicle_id);

ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicle photos viewable with vehicle"
  ON vehicle_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id
      AND (
        v.visibility = 'public' OR
        v.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Vehicle owners can manage photos"
  ON vehicle_photos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id
      AND v.owner_id = auth.uid()
    )
  );

-- ============================================
-- VEHICLE MODIFICATIONS
-- ============================================

CREATE TABLE vehicle_modifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  
  category TEXT NOT NULL CHECK (category IN (
    'engine', 'suspension', 'exhaust', 'wheels', 'brakes',
    'interior', 'exterior', 'electronics', 'other'
  )),
  
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  part_number TEXT,
  cost DECIMAL(10, 2),
  install_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_modifications_vehicle ON vehicle_modifications(vehicle_id);

ALTER TABLE vehicle_modifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modifications viewable with vehicle"
  ON vehicle_modifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id
      AND (v.visibility = 'public' OR v.owner_id = auth.uid())
    )
  );

CREATE POLICY "Vehicle owners can manage modifications"
  ON vehicle_modifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id
      AND v.owner_id = auth.uid()
    )
  );

-- ============================================
-- BLUETOOTH BEACONS
-- ============================================

CREATE TABLE beacons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Beacon identifiers
  uuid TEXT NOT NULL,
  major INTEGER,
  minor INTEGER,
  mac_address TEXT,
  
  -- Assignment
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  
  -- Metadata
  name TEXT,
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  last_seen TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT beacon_identifier_unique UNIQUE (uuid, major, minor)
);

CREATE INDEX idx_beacons_vehicle ON beacons(vehicle_id);
CREATE INDEX idx_beacons_uuid ON beacons(uuid);

ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beacons viewable by authenticated users"
  ON beacons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vehicle owners can manage beacons"
  ON beacons FOR ALL
  TO authenticated
  USING (
    vehicle_id IS NULL OR
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id
      AND v.owner_id = auth.uid()
    )
  );

-- ============================================
-- BEACON DETECTIONS
-- ============================================

CREATE TABLE beacon_detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  beacon_id UUID NOT NULL REFERENCES beacons(id) ON DELETE CASCADE,
  detected_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  -- Detection data
  rssi INTEGER,
  distance DECIMAL(10, 2),
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate detections within short time
  CONSTRAINT unique_detection UNIQUE (beacon_id, detected_by, detected_at)
);

CREATE INDEX idx_detections_beacon ON beacon_detections(beacon_id);
CREATE INDEX idx_detections_user ON beacon_detections(detected_by);
CREATE INDEX idx_detections_vehicle ON beacon_detections(vehicle_id);
CREATE INDEX idx_detections_time ON beacon_detections(detected_at DESC);

ALTER TABLE beacon_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own detections"
  ON beacon_detections FOR SELECT
  TO authenticated
  USING (detected_by = auth.uid());

CREATE POLICY "Users can insert own detections"
  ON beacon_detections FOR INSERT
  TO authenticated
  WITH CHECK (detected_by = auth.uid());

-- ============================================
-- CLUBS
-- ============================================

CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  
  -- Location
  city TEXT,
  state TEXT,
  country TEXT,
  
  -- Settings
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'invite_only')),
  join_approval_required BOOLEAN DEFAULT false,
  
  -- Pricing
  membership_fee DECIMAL(10, 2) DEFAULT 0,
  event_fee DECIMAL(10, 2) DEFAULT 0,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clubs_visibility ON clubs(visibility);
CREATE INDEX idx_clubs_location ON clubs(city, state);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public clubs viewable by authenticated users"
  ON clubs FOR SELECT
  TO authenticated
  USING (
    visibility = 'public' OR
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Club creators can create clubs"
  ON clubs FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Club admins can update clubs"
  ON clubs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'owner')
    )
  );

-- ============================================
-- CLUB MEMBERS
-- ============================================

CREATE TABLE club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned')),
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_club_member UNIQUE (club_id, user_id)
);

CREATE INDEX idx_club_members_club ON club_members(club_id);
CREATE INDEX idx_club_members_user ON club_members(user_id);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club members viewable by club members"
  ON club_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = club_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join clubs"
  ON club_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Club admins can manage members"
  ON club_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM club_members cm
      WHERE cm.club_id = club_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'owner')
    )
  );

-- ============================================
-- EVENTS
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('meet', 'cruise', 'show', 'track_day', 'social', 'other')),
  
  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  
  -- Location
  location_name TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Settings
  max_attendees INTEGER,
  requires_rsvp BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  
  -- Pricing
  entry_fee DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_time_range CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE INDEX idx_events_club ON events(club_id);
CREATE INDEX idx_events_time ON events(start_time);
CREATE INDEX idx_events_location ON events(latitude, longitude);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public events viewable by authenticated users"
  ON events FOR SELECT
  TO authenticated
  USING (
    is_private = false OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM event_attendees ea
      WHERE ea.event_id = id
      AND ea.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Event creators can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- ============================================
-- EVENT ATTENDEES
-- ============================================

CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going', 'pending')),
  
  rsvp_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  
  CONSTRAINT unique_event_attendee UNIQUE (event_id, user_id)
);

CREATE INDEX idx_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_attendees_user ON event_attendees(user_id);

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event attendees viewable by event viewers"
  ON event_attendees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
      AND (
        e.is_private = false OR
        e.created_by = auth.uid() OR
        user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can RSVP to events"
  ON event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own RSVP"
  ON event_attendees FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- EVENT GALLERY
-- ============================================

CREATE TABLE event_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  
  photo_url TEXT NOT NULL,
  caption TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_photos_event ON event_photos(event_id);

ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event photos viewable by event viewers"
  ON event_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
      AND (e.is_private = false OR uploaded_by = auth.uid())
    )
  );

CREATE POLICY "Event attendees can upload photos"
  ON event_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM event_attendees ea
      WHERE ea.event_id = event_id
      AND ea.user_id = auth.uid()
    )
  );

-- ============================================
-- MESSAGING
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  type TEXT NOT NULL CHECK (type IN ('direct', 'group', 'club')),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  
  name TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_club ON conversations(club_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = id
      AND cp.user_id = auth.uid()
    )
  );

-- ============================================
-- CONVERSATION PARTICIPANTS
-- ============================================

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  
  CONSTRAINT unique_participant UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view participants"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- ============================================
-- MESSAGES
-- ============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),
  
  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Timing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. Authentication System

### Authentication Flow

**Supabase Auth** is used for all authentication:

1. **Email/Password Authentication**
   - Sign up with email and password
   - Email verification required
   - Password reset via email

2. **OAuth Providers**
   - Google Sign-In
   - Apple Sign-In
   - Automatic profile creation on first login

3. **Session Management**
   - JWT tokens stored in secure storage
   - Automatic token refresh
   - Session persistence across app restarts

### Implementation Details

**AuthContext.tsx:**
```typescript
// Provides authentication state to entire app
// Methods: signIn, signUp, signOut, resetPassword
// State: user, session, loading, error
```

**Protected Routes:**
```typescript
// All routes except (auth) require authentication
// Automatic redirect to login if not authenticated
// ProtectedRoute component wraps authenticated screens
```

**Security:**
- Passwords hashed with bcrypt
- JWT tokens with 1-hour expiration
- Refresh tokens for session renewal
- Secure storage for tokens (expo-secure-store)

---

## 5. Feature Specifications

### 5.1 Discover Feed

**Purpose:** Browse vehicles, events, and activity from the community

**Features:**
- Infinite scroll feed
- Filter by vehicle type, location, date
- Like and comment on posts
- Share vehicles and events
- Pull-to-refresh

**Data Sources:**
- Recent vehicle additions
- Upcoming events
- Recent beacon detections
- Club activity

**UI Components:**
- Vehicle cards with primary photo
- Event cards with date/location
- Detection highlights
- Empty state for no content

### 5.2 Nearby View

**Purpose:** See vehicles and events near your current location

**Features:**
- Map view with vehicle markers
- List view toggle
- Real-time beacon detection
- Distance calculation
- Filter by distance radius

**Bluetooth Integration:**
- Background BLE scanning
- Beacon detection logging
- RSSI-based distance estimation
- Vehicle identification via beacon

**Location Services:**
- Continuous location tracking
- Geofencing for events
- Privacy controls

### 5.3 Garage

**Purpose:** Manage your vehicle collection

**Features:**
- Add/edit/delete vehicles
- Upload photos (up to 10 per vehicle)
- Track modifications
- Assign Bluetooth beacons
- Set visibility (public/private/club_only)
- Vehicle timeline

**Vehicle Details:**
- Make, model, year, trim
- Color, VIN
- Nickname, description
- Modification history
- Detection history

**Beacon Management:**
- Pair beacon to vehicle
- View beacon battery level
- Beacon detection history
- Unpair beacon

### 5.4 Clubs

**Purpose:** Join and manage car clubs

**Features:**
- Browse public clubs
- Join clubs (with approval if required)
- Create new clubs
- Club chat
- Event calendar
- Member directory
- Club settings (for admins)

**Club Types:**
- Public (anyone can join)
- Private (invite only)
- Approval required

**Club Roles:**
- Owner (full control)
- Admin (manage members, events)
- Moderator (moderate chat)
- Member (basic access)

**Club Pricing:**
- Optional membership fees
- Optional event fees
- Stripe integration for payments

### 5.5 Events

**Purpose:** Organize and attend car meets and events

**Features:**
- Create events
- RSVP with vehicle selection
- Event check-in
- Live meet view (see who's there)
- Event gallery (photo sharing)
- Event chat
- Location on map

**Event Types:**
- Meet (casual gathering)
- Cruise (group drive)
- Show (car show)
- Track day
- Social
- Other

**Event Settings:**
- Public/private
- Max attendees
- RSVP required
- Entry fee
- Start/end time
- Location

### 5.6 Messaging

**Purpose:** Direct and group messaging

**Features:**
- Direct messages (1-on-1)
- Group chats
- Club chats
- Real-time messaging
- Read receipts
- Typing indicators
- Message notifications

**Message Types:**
- Text messages
- Image sharing (future)
- Location sharing (future)

### 5.7 Profile

**Purpose:** User profile and settings

**Features:**
- Profile photo
- Display name, username, bio
- Location
- Vehicle collection
- Club memberships
- Event attendance history
- Edit profile
- Account settings

### 5.8 Settings

**Purpose:** App configuration and preferences

**Features:**
- Account settings
- Privacy settings
- Notification preferences
- Location permissions
- Bluetooth permissions
- Subscription management
- About/legal
- Sign out

---

## 6. API Endpoints

### Supabase Client Configuration

```typescript
// app/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Authentication Endpoints

```typescript
// Sign up
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      username: 'username',
      display_name: 'Display Name',
    },
  },
});

// Sign in
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Sign out
await supabase.auth.signOut();

// Get session
const { data: { session } } = await supabase.auth.getSession();

// OAuth (Google)
await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// OAuth (Apple)
await supabase.auth.signInWithOAuth({
  provider: 'apple',
});
```

### Vehicle Endpoints

```typescript
// Get user's vehicles
const { data, error } = await supabase
  .from('vehicles')
  .select('*')
  .eq('owner_id', userId);

// Get single vehicle with photos
const { data, error } = await supabase
  .from('vehicles')
  .select(`
    *,
    vehicle_photos (*),
    vehicle_modifications (*),
    beacons (*)
  `)
  .eq('id', vehicleId)
  .single();

// Create vehicle
const { data, error } = await supabase
  .from('vehicles')
  .insert({
    owner_id: userId,
    make: 'Toyota',
    model: 'Supra',
    year: 1998,
    visibility: 'public',
  })
  .select()
  .single();

// Update vehicle
const { data, error } = await supabase
  .from('vehicles')
  .update({ nickname: 'My Supra' })
  .eq('id', vehicleId);

// Delete vehicle
const { error } = await supabase
  .from('vehicles')
  .delete()
  .eq('id', vehicleId);
```

### Club Endpoints

```typescript
// Get all clubs
const { data, error } = await supabase
  .from('clubs')
  .select(`
    *,
    club_members (count)
  `)
  .eq('visibility', 'public');

// Get club details
const { data, error } = await supabase
  .from('clubs')
  .select(`
    *,
    club_members (
      *,
      profiles (*)
    ),
    events (*)
  `)
  .eq('id', clubId)
  .single();

// Join club
const { data, error } = await supabase
  .from('club_members')
  .insert({
    club_id: clubId,
    user_id: userId,
    status: 'active',
  });

// Leave club
const { error } = await supabase
  .from('club_members')
  .delete()
  .eq('club_id', clubId)
  .eq('user_id', userId);
```

### Event Endpoints

```typescript
// Get upcoming events
const { data, error } = await supabase
  .from('events')
  .select(`
    *,
    clubs (*),
    event_attendees (count)
  `)
  .gte('start_time', new Date().toISOString())
  .order('start_time', { ascending: true });

// RSVP to event
const { data, error } = await supabase
  .from('event_attendees')
  .insert({
    event_id: eventId,
    user_id: userId,
    vehicle_id: vehicleId,
    status: 'going',
  });

// Get event attendees
const { data, error } = await supabase
  .from('event_attendees')
  .select(`
    *,
    profiles (*),
    vehicles (*)
  `)
  .eq('event_id', eventId)
  .eq('status', 'going');
```

### Beacon Endpoints

```typescript
// Register beacon detection
const { data, error } = await supabase
  .from('beacon_detections')
  .insert({
    beacon_id: beaconId,
    detected_by: userId,
    vehicle_id: vehicleId,
    rssi: -65,
    distance: 2.5,
    latitude: 37.7749,
    longitude: -122.4194,
  });

// Get recent detections
const { data, error } = await supabase
  .from('beacon_detections')
  .select(`
    *,
    beacons (*),
    vehicles (*)
  `)
  .eq('detected_by', userId)
  .order('detected_at', { ascending: false })
  .limit(50);
```

### Messaging Endpoints

```typescript
// Get user's conversations
const { data, error } = await supabase
  .from('conversations')
  .select(`
    *,
    conversation_participants!inner (
      user_id,
      last_read_at
    ),
    messages (
      content,
      created_at
    )
  `)
  .eq('conversation_participants.user_id', userId)
  .order('updated_at', { ascending: false });

// Send message
const { data, error } = await supabase
  .from('messages')
  .insert({
    conversation_id: conversationId,
    sender_id: userId,
    content: 'Hello!',
  });

// Get messages
const { data, error } = await supabase
  .from('messages')
  .select(`
    *,
    profiles (*)
  `)
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true });

// Real-time subscription
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

---

## 7. UI/UX Specifications

### Design System

**Color Palette:**
```typescript
// styles/commonStyles.ts
export const colors = {
  // Dark theme (primary)
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceElevated: '#2A2A2A',
  
  // Accent colors
  primary: '#FF4444',      // Racing red
  secondary: '#00D4FF',    // Electric blue
  accent: '#FFD700',       // Gold
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',
  
  // Status
  success: '#00FF88',
  warning: '#FFB800',
  error: '#FF4444',
  
  // Borders
  border: '#333333',
  borderLight: '#444444',
  
  // Light theme
  lightBackground: '#FFFFFF',
  lightSurface: '#F5F5F5',
  lightText: '#000000',
};
```

**Typography:**
```typescript
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
};
```

**Spacing:**
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

**Border Radius:**
```typescript
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
```

### Component Specifications

**FloatingTabBar:**
- Position: Fixed at bottom
- Height: 80px
- Background: Semi-transparent blur effect
- Border radius: 24px top corners
- Icons: 24x24px
- Active state: Primary color
- Inactive state: Text secondary color

**Vehicle Card:**
- Aspect ratio: 16:9 for image
- Border radius: 12px
- Shadow: Subtle elevation
- Content: Make/model, year, owner
- Actions: Like, comment, share

**Event Card:**
- Border radius: 12px
- Header: Event type badge
- Content: Title, date, location, attendee count
- Footer: RSVP button

**Button Styles:**
- Primary: Solid background, white text
- Secondary: Outline, transparent background
- Ghost: No border, transparent background
- Sizes: Small (32px), Medium (44px), Large (56px)

**Input Fields:**
- Height: 48px
- Border radius: 8px
- Border: 1px solid border color
- Focus: Primary color border
- Error: Error color border

---

## 8. Navigation Structure

### Expo Router File Structure

```
app/
├── (auth)/              # Authentication stack
│   ├── _layout.tsx      # Auth layout (no tabs)
│   ├── index.tsx        # Welcome screen
│   ├── login.tsx        # Login screen
│   └── signup.tsx       # Signup screen
│
├── (tabs)/              # Main app tabs
│   ├── (home)/          # Home stack
│   │   ├── _layout.tsx
│   │   ├── index.tsx    # Discover feed
│   │   └── index.ios.tsx # iOS-specific home
│   ├── _layout.tsx      # Tab layout with FloatingTabBar
│   ├── _layout.ios.tsx  # iOS tab layout (native tabs)
│   ├── discover.tsx     # Discover feed
│   ├── nearby.tsx       # Nearby vehicles/events
│   ├── garage.tsx       # User's vehicles
│   ├── clubs.tsx        # Clubs list
│   ├── messages.tsx     # Conversations list
│   ├── profile.tsx      # User profile
│   ├── profile.ios.tsx  # iOS-specific profile
│   └── settings.tsx     # App settings
│
├── clubs/               # Club detail stack
│   ├── _layout.tsx
│   └── [clubId].tsx     # Club detail screen
│
├── messages/            # Messaging stack
│   ├── _layout.tsx
│   └── [conversationId].tsx # Chat screen
│
├── vehicles/            # Vehicle stack
│   ├── _layout.tsx
│   ├── [vehicleId].tsx  # Vehicle detail
│   ├── [vehicleId]/timeline.tsx # Vehicle timeline
│   ├── add.tsx          # Add vehicle
│   ├── edit/[vehicleId].tsx # Edit vehicle
│   ├── beacon-assign/[vehicleId].tsx # Assign beacon
│   └── modifications/
│       ├── _layout.tsx
│       └── add.tsx      # Add modification
│
├── subscription/        # Subscription stack
│   ├── _layout.tsx
│   └── premium.tsx      # Premium features
│
├── dev/                 # Developer tools
│   ├── _layout.tsx
│   └── beacon-registration.tsx # Register beacons
│
├── _layout.tsx          # Root layout
└── index.tsx            # App entry point
```

### Navigation Patterns

**Stack Navigation:**
- Used for hierarchical navigation
- Back button in header
- Slide transition animation

**Tab Navigation:**
- FloatingTabBar at bottom (Android/Web)
- Native tabs (iOS)
- 5 main tabs: Discover, Nearby, Garage, Clubs, Profile

**Modal Navigation:**
- Used for temporary screens
- Slide up animation
- Close button or swipe down to dismiss

---

## 9. Bluetooth & Location Services

### Bluetooth Low Energy (BLE)

**Purpose:** Detect nearby vehicles via Bluetooth beacons

**Implementation:**
- Library: `react-native-ble-manager`
- Background scanning enabled
- Beacon format: iBeacon (UUID, Major, Minor)

**BLE Service (services/BLEService.ts):**
```typescript
class BLEService {
  // Initialize BLE manager
  async initialize(): Promise<void>
  
  // Start scanning for beacons
  async startScanning(): Promise<void>
  
  // Stop scanning
  async stopScanning(): Promise<void>
  
  // Get discovered beacons
  getDiscoveredBeacons(): Beacon[]
  
  // Calculate distance from RSSI
  calculateDistance(rssi: number, txPower: number): number
}
```

**Beacon Detection Flow:**
1. App requests Bluetooth permission
2. Background scanning starts
3. Beacons detected and logged
4. Distance calculated from RSSI
5. Detection saved to database
6. User notified of nearby vehicles

**Distance Estimation:**
```typescript
// RSSI to distance formula
distance = 10 ^ ((txPower - rssi) / (10 * n))
// where n = path loss exponent (typically 2-4)
```

### Location Services

**Purpose:** Track user location for nearby features

**Implementation:**
- Library: `expo-location`
- Continuous background tracking
- Geofencing for events

**Location Permissions:**
- Request on app launch
- Explain why location is needed
- Graceful degradation if denied

**Location Tracking:**
```typescript
// Request permission
const { status } = await Location.requestForegroundPermissionsAsync();

// Get current location
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High,
});

// Watch location changes
const subscription = await Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.High,
    timeInterval: 10000, // 10 seconds
    distanceInterval: 50, // 50 meters
  },
  (location) => {
    // Handle location update
  }
);
```

---

## 10. Subscription & Payments

### Subscription Tiers

**Free Tier:**
- Basic vehicle management
- View public content
- Join public clubs
- Attend free events

**Premium Tier ($9.99/month):**
- Unlimited vehicles
- Private vehicle visibility
- Create clubs
- Priority support
- Ad-free experience

**Pro Tier ($19.99/month):**
- All Premium features
- Advanced analytics
- Custom club branding
- Event management tools
- API access

### Stripe Integration

**Setup:**
- Stripe publishable key in environment
- Stripe customer created on signup
- Subscription managed via Stripe

**Payment Flow:**
1. User selects subscription tier
2. Stripe checkout session created
3. User completes payment
4. Webhook confirms payment
5. Subscription activated in database
6. User gains access to features

**Stripe Context (contexts/StripeContext.tsx):**
```typescript
interface StripeContextType {
  // Create checkout session
  createCheckoutSession(tier: string): Promise<string>
  
  // Get subscription status
  getSubscriptionStatus(): Promise<Subscription>
  
  // Cancel subscription
  cancelSubscription(): Promise<void>
  
  // Update payment method
  updatePaymentMethod(): Promise<void>
}
```

---

## 11. Security & Privacy

### Data Security

**Authentication:**
- JWT tokens with 1-hour expiration
- Refresh tokens for session renewal
- Secure token storage (expo-secure-store)
- Password hashing with bcrypt

**API Security:**
- Row Level Security (RLS) on all tables
- User can only access own data
- Club members can only access club data
- Event attendees can only access event data

**Data Encryption:**
- HTTPS for all API calls
- Encrypted storage for sensitive data
- No plain text passwords

### Privacy Controls

**User Privacy:**
- Profile visibility settings
- Vehicle visibility (public/private/club_only)
- Location sharing opt-in
- Bluetooth scanning opt-in

**Data Collection:**
- Location data (with permission)
- Bluetooth beacon detections
- Usage analytics (anonymized)
- Crash reports

**User Rights:**
- View all collected data
- Export data
- Delete account
- Opt out of analytics

---

## 12. Platform-Specific Implementation

### iOS-Specific Features

**Native Tabs:**
- Uses `expo-router/unstable-native-tabs`
- Native iOS tab bar appearance
- Haptic feedback on tab switch

**SF Symbols:**
- iOS icons use SF Symbols
- Example: `phone.fill`, `house`, `person.circle`

**Platform Files:**
- `index.ios.tsx` for iOS-specific screens
- `_layout.ios.tsx` for iOS-specific layouts
- `profile.ios.tsx` for iOS-specific profile

### Android-Specific Features

**Material Icons:**
- Android icons use Material Icons
- Example: `phone`, `home`, `person`
- Must use valid Material icon names

**FloatingTabBar:**
- Custom floating tab bar at bottom
- Blur effect background
- Elevation shadow

**Platform Padding:**
- Top padding for notch/status bar
- `paddingTop: 48` on Android

### Web-Specific Features

**Responsive Design:**
- Desktop layout for large screens
- Mobile layout for small screens
- Touch and mouse support

**Navigation:**
- Browser back button support
- URL-based routing
- Deep linking

---

## 13. Build & Deployment

### Development Setup

**Prerequisites:**
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only)
- Android Studio (for Android emulator)

**Installation:**
```bash
# Clone repository
git clone https://github.com/your-org/cardrop.git
cd cardrop

# Install dependencies
npm install

# Start development server
npm run dev
```

**Environment Variables:**
```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Build Configuration

**app.json:**
```json
{
  "expo": {
    "name": "CarDrop",
    "slug": "cardrop",
    "version": "1.0.0",
    "scheme": "cardrop",
    "platforms": ["ios", "android", "web"],
    "ios": {
      "bundleIdentifier": "com.cardrop.app",
      "buildNumber": "1",
      "supportsTabletMultitasking": true,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "CarDrop needs your location to show nearby vehicles and events.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "CarDrop needs your location to detect nearby vehicles via Bluetooth.",
        "NSBluetoothAlwaysUsageDescription": "CarDrop uses Bluetooth to detect nearby vehicles.",
        "NSCameraUsageDescription": "CarDrop needs camera access to take photos of your vehicles.",
        "NSPhotoLibraryUsageDescription": "CarDrop needs photo library access to select vehicle photos."
      }
    },
    "android": {
      "package": "com.cardrop.app",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_SCAN",
        "BLUETOOTH_CONNECT",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### Production Build

**iOS:**
```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**Android:**
```bash
# Build APK
eas build --platform android --profile production

# Build AAB for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

**Web:**
```bash
# Build for web
npm run build:web

# Deploy to hosting
# (Vercel, Netlify, etc.)
```

### Testing

**Unit Tests:**
- Jest for unit testing
- React Native Testing Library

**E2E Tests:**
- Detox for end-to-end testing
- Test authentication flow
- Test vehicle creation
- Test club joining

**Manual Testing:**
- Test on real devices
- Test Bluetooth detection
- Test location tracking
- Test payment flow

---

## 14. Key Implementation Files

### Core Files to Implement

**1. AuthContext.tsx** (contexts/AuthContext.tsx)
- Manages authentication state
- Sign in, sign up, sign out methods
- Session persistence
- User profile loading

**2. Supabase Client** (app/integrations/supabase/client.ts)
- Supabase client configuration
- AsyncStorage for session
- Auto token refresh

**3. BLEService** (services/BLEService.ts)
- Bluetooth beacon scanning
- Distance calculation
- Detection logging
- Background scanning

**4. FloatingTabBar** (components/FloatingTabBar.tsx)
- Custom tab bar component
- Blur effect background
- Active/inactive states
- Haptic feedback

**5. Vehicle Hooks** (hooks/useVehicles.ts)
- Fetch user vehicles
- Create/update/delete vehicles
- Upload photos
- Manage modifications

**6. Club Hooks** (hooks/useClubs.ts)
- Fetch clubs
- Join/leave clubs
- Create clubs
- Manage members

**7. Event Hooks** (hooks/useEvents.ts)
- Fetch events
- RSVP to events
- Create events
- Check-in to events

**8. Messaging Hooks** (hooks/useMessaging.ts)
- Fetch conversations
- Send messages
- Real-time message subscription
- Read receipts

---

## 15. Critical Implementation Notes

### Must-Have Features for MVP

1. **Authentication** - Email/password + OAuth
2. **Vehicle Management** - Add, edit, view vehicles
3. **Bluetooth Detection** - Beacon scanning and logging
4. **Clubs** - Join, view, basic chat
5. **Events** - Create, RSVP, view attendees
6. **Messaging** - Direct messages
7. **Profile** - View and edit profile
8. **Nearby** - Map view with nearby vehicles

### Can Be Added Post-MVP

1. Advanced analytics
2. Custom club branding
3. Event photo galleries
4. Vehicle modification tracking
5. Advanced search/filters
6. Push notifications
7. In-app purchases
8. Social sharing

### Performance Considerations

**Optimization:**
- Lazy load images
- Paginate lists (20 items per page)
- Cache API responses
- Debounce search inputs
- Optimize Bluetooth scanning

**Monitoring:**
- Track app crashes
- Monitor API response times
- Log Bluetooth detection success rate
- Track user engagement

---

## 16. Deployment Checklist

### Pre-Launch

- [ ] All authentication flows tested
- [ ] Bluetooth detection working on real devices
- [ ] Location tracking accurate
- [ ] Database RLS policies verified
- [ ] Payment flow tested (Stripe test mode)
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] App Store screenshots prepared
- [ ] App Store description written
- [ ] App icons created (all sizes)
- [ ] Splash screen created

### Launch

- [ ] Submit to App Store
- [ ] Submit to Play Store
- [ ] Deploy web version
- [ ] Set up error monitoring
- [ ] Set up analytics
- [ ] Enable push notifications
- [ ] Switch Stripe to live mode
- [ ] Announce launch

### Post-Launch

- [ ] Monitor crash reports
- [ ] Respond to user feedback
- [ ] Fix critical bugs
- [ ] Plan feature updates
- [ ] Optimize performance
- [ ] Grow user base

---

## 17. Support & Maintenance

### User Support

**In-App Support:**
- Help center with FAQs
- Contact form
- Bug report form

**External Support:**
- Email support
- Social media
- Community forum

### Maintenance

**Regular Updates:**
- Bug fixes
- Performance improvements
- New features
- Security patches

**Monitoring:**
- Error tracking (Sentry)
- Analytics (Mixpanel/Amplitude)
- Performance monitoring
- User feedback

---

## Conclusion

This document provides complete specifications to recreate CarDrop. Follow the database schema, implement the features as specified, use the provided code patterns, and adhere to the design system. The result will be a production-ready automotive social application that matches the original CarDrop in every aspect.

For questions or clarifications, refer to the individual implementation files in the codebase or consult the Expo and Supabase documentation.

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Production Ready
