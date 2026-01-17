
# CarDrop - Complete MVP Specification

**Version:** 2.0  
**Last Updated:** January 2025  
**Status:** Production Ready

---

## 📋 Executive Summary

CarDrop is a **real-world automotive social application** centered on real cars, real owners, and real physical presence. The app is grounded in physical car culture: meets, builds, owners, clubs, and proximity. It is **identity-first**, meaning every account represents a real person, every vehicle belongs to a real user, and all relationships are explicit and structured.

**Core Philosophy:**
- No anonymous posting or abstract content
- No fake data, placeholder logic, or demo shortcuts
- All actions must persist and be reload-safe
- Navigation must always reflect real state
- Designed for real devices and real-world use (not simulator-only)

---

## 🎯 Core Features & Functionality

### 1. **Authentication System**

**Technology Stack:**
- Better Auth with Expo integration
- Supabase for user data storage
- Email/password authentication
- OAuth providers: Google, Apple

**User Flow:**
1. User opens app → sees login/signup screen
2. Can sign up with email/password or OAuth
3. After authentication, redirected to main app
4. Session persists across app restarts
5. Logout clears session and returns to auth screen

**Database Schema:**
```sql
-- Users table (managed by Better Auth)
users:
  - id (uuid, primary key)
  - email (text, unique, required)
  - name (text)
  - created_at (timestamp)
  - updated_at (timestamp)

-- Sessions table (managed by Better Auth)
sessions:
  - id (uuid, primary key)
  - user_id (uuid, foreign key to users)
  - token (text, unique)
  - expires_at (timestamp)
  - created_at (timestamp)
```

**Files:**
- `app/(auth)/_layout.tsx` - Auth stack navigator
- `app/(auth)/index.tsx` - Auth landing page
- `app/(auth)/login.tsx` - Login screen
- `app/(auth)/signup.tsx` - Signup screen with validation
- `contexts/AuthContext.tsx` - Auth state management
- `lib/auth.ts` - Better Auth configuration

---

### 2. **Main Navigation Structure**

**Five Primary Areas (Always Available for Logged-In Users):**

#### 2.1 Discover Tab (`app/(tabs)/discover.tsx`)
- **Purpose:** Browse and discover vehicles, events, and clubs
- **Features:**
  - Feed of recent vehicle posts
  - Upcoming events
  - Featured clubs
  - Search functionality
  - Filter by vehicle type, location, etc.

#### 2.2 Nearby Tab (`app/(tabs)/nearby.tsx`)
- **Purpose:** Real-time proximity detection using Bluetooth Low Energy (BLE)
- **Features:**
  - Scan for nearby vehicles with registered beacons
  - Display detected vehicles with signal strength (RSSI)
  - Show distance estimation (Immediate, Near, Far)
  - Tap vehicle to view full profile
  - Real-time updates as vehicles come in/out of range
  - Permission handling for Bluetooth
  - Background scanning support

**Technical Implementation:**
- Uses `expo-location` for location permissions
- Custom BLE scanning service (`services/BLEService.ts`)
- Beacon registration system for vehicle-beacon pairing
- RSSI-based distance calculation
- Haptic feedback on detection

**Database Schema:**
```sql
registered_beacons:
  - id (uuid, primary key)
  - beacon_id (text, unique, required)
  - name (text)
  - manufacturer_data (text)
  - vehicle_id (uuid, foreign key to vehicles, nullable)
  - registered_at (timestamp)
  - last_seen (timestamp)

beacon_detections:
  - id (uuid, primary key)
  - beacon_id (text, required)
  - vehicle_id (uuid, foreign key to vehicles)
  - detected_by_user_id (uuid, foreign key to users)
  - rssi (integer)
  - detected_at (timestamp)
  - location_lat (decimal, nullable)
  - location_lng (decimal, nullable)
```

#### 2.3 Garage Tab (`app/(tabs)/garage.tsx`)
- **Purpose:** Manage user's vehicle collection
- **Features:**
  - List of user's vehicles
  - Add new vehicle button
  - Edit/delete vehicles
  - View vehicle details
  - Vehicle timeline (modifications, events)
  - Assign Bluetooth beacon to vehicle

**Vehicle Management:**
- Add vehicle: Make, model, year, color, VIN, images
- Edit vehicle: Update any field
- Delete vehicle: Confirmation dialog
- Vehicle visibility: Public/private toggle
- Primary image selection

**Database Schema:**
```sql
vehicles:
  - id (uuid, primary key)
  - owner_id (uuid, foreign key to users, required)
  - make (text, required)
  - model (text, required)
  - year (integer, required)
  - color (text)
  - vin (text, unique)
  - primary_image_url (text)
  - is_public (boolean, default true)
  - beacon_id (text, foreign key to registered_beacons, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)

vehicle_images:
  - id (uuid, primary key)
  - vehicle_id (uuid, foreign key to vehicles, required)
  - image_url (text, required)
  - is_primary (boolean, default false)
  - uploaded_at (timestamp)

vehicle_timeline:
  - id (uuid, primary key)
  - vehicle_id (uuid, foreign key to vehicles, required)
  - title (text, required)
  - description (text)
  - entry_date (date, required)
  - media_type (enum: 'image', 'video')
  - image_url (text)
  - video_url (text)
  - created_at (timestamp)
```

#### 2.4 Clubs Tab (`app/(tabs)/clubs.tsx`)
- **Purpose:** Create, join, and manage car clubs
- **Features:**
  - List of user's clubs
  - Discover new clubs
  - Create club (with Stripe payment)
  - Join club (free or paid)
  - Leave club
  - Club details: members, events, gallery
  - Club calendar with events
  - Club pricing tiers

**Club Management:**
- Create club: Name, description, privacy, pricing
- Stripe integration for paid clubs
- Member management (owner, admin, member roles)
- Event creation and management
- Club gallery (shared photos)

**Database Schema:**
```sql
clubs:
  - id (uuid, primary key)
  - name (text, required, unique)
  - description (text)
  - owner_id (uuid, foreign key to users, required)
  - is_private (boolean, default false)
  - member_count (integer, default 0)
  - pricing_tier (enum: 'free', 'basic', 'premium')
  - stripe_price_id (text, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)

club_members:
  - id (uuid, primary key)
  - club_id (uuid, foreign key to clubs, required)
  - user_id (uuid, foreign key to users, required)
  - role (enum: 'owner', 'admin', 'member', default 'member')
  - joined_at (timestamp)
  - UNIQUE(club_id, user_id)

club_events:
  - id (uuid, primary key)
  - club_id (uuid, foreign key to clubs, required)
  - title (text, required)
  - description (text)
  - event_date (timestamp, required)
  - location_name (text)
  - location_lat (decimal)
  - location_lng (decimal)
  - geofence_radius_meters (integer, default 100)
  - created_by_user_id (uuid, foreign key to users, required)
  - created_at (timestamp)

event_attendance:
  - id (uuid, primary key)
  - event_id (uuid, foreign key to club_events, required)
  - user_id (uuid, foreign key to users, required)
  - vehicle_id (uuid, foreign key to vehicles, nullable)
  - checked_in_at (timestamp)
  - UNIQUE(event_id, user_id)

event_gallery:
  - id (uuid, primary key)
  - event_id (uuid, foreign key to club_events, required)
  - uploaded_by_user_id (uuid, foreign key to users, required)
  - image_url (text, required)
  - caption (text)
  - uploaded_at (timestamp)
```

#### 2.5 Settings Tab (`app/(tabs)/settings.tsx`)
- **Purpose:** User profile and app settings
- **Features:**
  - Profile information (name, email, avatar)
  - Notification preferences
  - Privacy settings
  - Subscription management (Stripe)
  - Developer tools (beacon registration)
  - Logout

**Subscription Tiers:**
- Free: Basic features
- Premium: Advanced features, unlimited vehicles, priority support

---

### 3. **Vehicle Management System**

**Vehicle Screens:**
- `app/vehicles/add.tsx` - Add new vehicle
- `app/vehicles/[vehicleId].tsx` - Vehicle detail view
- `app/vehicles/edit/[vehicleId].tsx` - Edit vehicle
- `app/vehicles/[vehicleId]/timeline.tsx` - Vehicle timeline
- `app/vehicles/beacon-assign/[vehicleId].tsx` - Assign beacon

**Vehicle Timeline:**
- Add modifications, repairs, events
- Upload photos/videos
- Date-based entries
- Edit/delete entries
- Chronological display

**Beacon Assignment:**
- Scan for available beacons
- Pair beacon with vehicle
- Unpair beacon
- View beacon signal strength
- Test beacon detection

---

### 4. **Club System**

**Club Screens:**
- `app/clubs/[clubId].tsx` - Club detail view with tabs:
  - Overview: Club info, members
  - Events: Upcoming and past events
  - Gallery: Shared photos
  - Live Meet: Real-time event attendance

**Club Features:**
- **Live Meet View:** Real-time display of attendees at events
  - Shows vehicles detected via BLE at event location
  - Geofencing to verify physical presence
  - Automatic check-in when within radius
  - Live attendee count
  - Vehicle showcase during event

**Club Pricing:**
- Free clubs: No payment required
- Paid clubs: Stripe integration
  - Basic: $5/month per member
  - Premium: $10/month per member
- Payment handled via Stripe React Native SDK

**Database Schema (Additional):**
```sql
club_pricing:
  - id (uuid, primary key)
  - club_id (uuid, foreign key to clubs, required)
  - tier (enum: 'basic', 'premium')
  - price_per_member_cents (integer, required)
  - stripe_price_id (text, required)
  - created_at (timestamp)

club_subscriptions:
  - id (uuid, primary key)
  - club_id (uuid, foreign key to clubs, required)
  - user_id (uuid, foreign key to users, required)
  - stripe_subscription_id (text, required)
  - status (enum: 'active', 'canceled', 'past_due')
  - current_period_end (timestamp)
  - created_at (timestamp)
  - updated_at (timestamp)
```

---

### 5. **Messaging System**

**Messaging Screens:**
- `app/(tabs)/messages.tsx` - Conversation list
- `app/messages/[conversationId].tsx` - Chat screen (Stack navigation, NO tabs)

**Features:**
- Direct messages between users
- Real-time updates via Supabase subscriptions
- Image sharing
- Read receipts
- Unread message count
- Message notifications

**Database Schema:**
```sql
conversations:
  - id (uuid, primary key)
  - created_at (timestamp)

conversation_participants:
  - id (uuid, primary key)
  - conversation_id (uuid, foreign key to conversations, required)
  - user_id (uuid, foreign key to users, required)
  - joined_at (timestamp)
  - UNIQUE(conversation_id, user_id)

messages:
  - id (uuid, primary key)
  - conversation_id (uuid, foreign key to conversations, required)
  - sender_id (uuid, foreign key to users, required)
  - content (text, required)
  - image_url (text, nullable)
  - read_by (uuid[], array of user IDs)
  - sent_at (timestamp)
```

---

### 6. **Bluetooth Beacon System**

**Purpose:** Enable proximity detection between vehicles

**Components:**
- `services/BLEService.ts` - Core BLE scanning service
- `hooks/useBLEScanning.ts` - React hook for BLE scanning
- `hooks/useBeaconDetections.ts` - Hook for detection history
- `app/dev/beacon-registration.tsx` - Developer tool for beacon management

**Beacon Registration Flow:**
1. Admin/developer opens beacon registration screen
2. Starts BLE scan
3. Detects nearby beacons
4. Registers beacon with unique ID
5. Beacon can now be assigned to vehicles

**Beacon Assignment Flow:**
1. User opens vehicle detail
2. Taps "Assign Beacon"
3. Scans for available beacons
4. Selects beacon from list
5. Beacon is paired with vehicle
6. Vehicle now detectable by other users

**Detection Flow:**
1. User opens Nearby tab
2. App starts BLE scanning
3. Detects beacons in range
4. Looks up vehicle associated with beacon
5. Displays vehicle with distance estimate
6. User can tap to view vehicle profile

**Technical Details:**
- Uses iBeacon protocol (iOS) and Eddystone (Android)
- RSSI-based distance calculation
- Background scanning support (iOS)
- Beacon battery monitoring
- Detection history logging

---

### 7. **Event System**

**Event Features:**
- Create events (club owners/admins)
- RSVP to events
- Event location with map
- Geofencing for automatic check-in
- Live attendee tracking
- Event gallery (photos from attendees)
- Event timeline

**Event Check-In:**
- Automatic: When user enters geofence radius
- Manual: User taps "Check In" button
- Requires location permission
- Records check-in time and location
- Associates vehicle with attendance

**Live Meet View:**
- Real-time display of attendees
- Shows vehicles detected via BLE
- Updates as people arrive/leave
- Vehicle showcase with photos
- Attendee count
- Distance from event center

---

### 8. **Subscription & Payment System**

**Stripe Integration:**
- Native SDK: `@stripe/stripe-react-native`
- Web fallback: Stripe.js
- Payment methods: Credit card, Apple Pay, Google Pay

**Subscription Tiers:**

**User Subscriptions:**
- Free: 3 vehicles max, basic features
- Premium ($9.99/month):
  - Unlimited vehicles
  - Advanced timeline features
  - Priority support
  - Early access to new features

**Club Subscriptions:**
- Free clubs: No payment
- Basic clubs ($5/member/month):
  - Up to 50 members
  - Basic event features
  - Standard support
- Premium clubs ($10/member/month):
  - Unlimited members
  - Advanced event features
  - Live meet tracking
  - Priority support

**Payment Screens:**
- `app/subscription/premium.tsx` - User subscription management
- `app/subscription-management.tsx` - Subscription details

**Database Schema:**
```sql
user_subscriptions:
  - id (uuid, primary key)
  - user_id (uuid, foreign key to users, required)
  - stripe_customer_id (text, required)
  - stripe_subscription_id (text, required)
  - tier (enum: 'free', 'premium')
  - status (enum: 'active', 'canceled', 'past_due')
  - current_period_end (timestamp)
  - created_at (timestamp)
  - updated_at (timestamp)
```

---

## 🎨 Design System

### Color Palette (Dark-First)

**Primary Colors:**
```typescript
colors = {
  // Background
  background: '#000000',      // Pure black
  surface: '#1C1C1E',         // Dark gray
  surfaceVariant: '#2C2C2E',  // Lighter gray
  
  // Text
  text: '#FFFFFF',            // White
  textSecondary: '#8E8E93',   // Gray
  textTertiary: '#636366',    // Darker gray
  
  // Accent
  primary: '#FF3B30',         // Red (automotive)
  primaryVariant: '#FF453A',  // Lighter red
  secondary: '#FFD60A',       // Yellow (caution)
  
  // Status
  success: '#30D158',         // Green
  warning: '#FFD60A',         // Yellow
  error: '#FF3B30',           // Red
  info: '#0A84FF',            // Blue
  
  // UI Elements
  border: '#38383A',          // Border gray
  divider: '#48484A',         // Divider gray
  overlay: 'rgba(0,0,0,0.5)', // Modal overlay
  
  // Glass Effect
  glass: 'rgba(28,28,30,0.8)', // Frosted glass
  glassLight: 'rgba(44,44,46,0.8)',
}
```

**Typography:**
```typescript
typography = {
  // Headings
  h1: { fontSize: 34, fontWeight: '700', lineHeight: 41 },
  h2: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h3: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 25 },
  
  // Body
  body: { fontSize: 17, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 15, fontWeight: '400', lineHeight: 20 },
  
  // UI
  button: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  label: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
}
```

**Spacing:**
```typescript
spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
```

**Border Radius:**
```typescript
borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
}
```

### UI Components

**Common Components:**
- Glass effect cards (iOS native blur, Android fallback)
- Floating tab bar with blur effect
- Bottom sheets for settings/actions
- Haptic feedback on interactions
- Loading states with skeletons
- Empty states with illustrations
- Error states with retry buttons

**Navigation:**
- Tab bar: Floating, translucent, blur effect
- Stack navigation: Standard header with back button
- Modal presentation: Form sheet, full screen, transparent

---

## 📱 Platform-Specific Features

### iOS
- Native tab bar with SF Symbols
- Haptic feedback (impact, selection, notification)
- Apple Pay integration
- Apple Sign In
- Background BLE scanning
- Native blur effects (UIVisualEffectView)

### Android
- Material Design icons
- Material ripple effects
- Google Pay integration
- Google Sign In
- Foreground service for BLE scanning
- Backdrop blur (fallback to solid color)

### Web
- Responsive layout
- Desktop-optimized navigation
- Keyboard shortcuts
- Web-based payment flow
- No BLE support (inform user)
- No camera access (inform user)

---

## 🔒 Security & Privacy

### Authentication
- Secure token storage (expo-secure-store)
- Token refresh on expiry
- Logout clears all local data
- Session timeout after 30 days

### Data Privacy
- User data encrypted at rest
- HTTPS for all API calls
- No tracking or analytics without consent
- GDPR compliant
- User can delete account and all data

### Permissions
- Location: Required for nearby detection and event check-in
- Bluetooth: Required for beacon detection
- Camera: Required for photo uploads
- Photo library: Required for image selection
- Notifications: Optional, for messages and events

---

## 🚀 Performance Optimization

### App Performance
- Lazy loading for screens
- Image optimization and caching
- Virtualized lists (FlatList) for long lists
- Debounced search inputs
- Optimistic UI updates
- Background task management

### Database Performance
- Indexed columns for fast queries
- Pagination for large datasets
- Real-time subscriptions only where needed
- Efficient query patterns
- Connection pooling

### Network Performance
- Request caching
- Retry logic for failed requests
- Offline support with local storage
- Image compression before upload
- Progressive image loading

---

## 🧪 Testing Strategy

### Unit Tests
- Utility functions
- Custom hooks
- Business logic
- Data transformations

### Integration Tests
- API calls
- Database queries
- Authentication flow
- Payment processing

### E2E Tests
- User registration
- Vehicle creation
- Club joining
- Event check-in
- Message sending

### Manual Testing
- Real device testing (iOS, Android)
- Bluetooth beacon detection
- Location-based features
- Payment flows
- Offline scenarios

---

## 📦 Deployment

### Build Process
1. Set `NODE_ENV=production`
2. Run `npm run prebuild:android` or `expo prebuild -p ios`
3. Build release APK/IPA
4. Test on real devices
5. Submit to app stores

### Environment Variables
```
NODE_ENV=production
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_BETTER_AUTH_URL=https://your-api.com
```

### App Store Requirements
- Privacy policy
- Terms of service
- EULA
- App screenshots
- App description
- Keywords
- Support URL
- Age rating: 12+ (social networking)

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **react-native-maps not supported in Natively** - Maps display text message instead
2. **BLE background scanning limited on Android** - Requires foreground service
3. **Web platform has no BLE support** - Nearby tab shows message
4. **Camera not available on web** - Shows message to use mobile app

### Future Enhancements
1. Push notifications for messages and events
2. Advanced search and filtering
3. Vehicle comparison tool
4. Club leaderboards and achievements
5. Integration with car data APIs (VIN lookup)
6. AR features for vehicle showcase
7. Video support in timeline
8. Live streaming for events

---

## 📚 File Structure

```
cardrop/
├── app/
│   ├── (auth)/                    # Authentication screens
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                    # Main app tabs
│   │   ├── (home)/
│   │   │   ├── _layout.tsx
│   │   │   └── index.tsx
│   │   ├── _layout.tsx            # Tab navigator
│   │   ├── clubs.tsx              # Clubs tab
│   │   ├── discover.tsx           # Discover tab
│   │   ├── garage.tsx             # Garage tab
│   │   ├── messages.tsx           # Messages list
│   │   ├── nearby.tsx             # Nearby tab (BLE)
│   │   ├── profile.tsx            # Profile tab
│   │   └── settings.tsx           # Settings tab
│   ├── clubs/
│   │   ├── [clubId].tsx           # Club detail
│   │   └── _layout.tsx
│   ├── dev/
│   │   ├── beacon-registration.tsx # Beacon management
│   │   └── _layout.tsx
│   ├── messages/
│   │   ├── [conversationId].tsx   # Chat screen (Stack nav)
│   │   └── _layout.tsx
│   ├── subscription/
│   │   ├── premium.tsx            # Subscription management
│   │   └── _layout.tsx
│   ├── vehicles/
│   │   ├── [vehicleId].tsx        # Vehicle detail
│   │   ├── [vehicleId]/
│   │   │   └── timeline.tsx       # Vehicle timeline
│   │   ├── add.tsx                # Add vehicle
│   │   ├── beacon-assign/
│   │   │   └── [vehicleId].tsx    # Assign beacon
│   │   ├── edit/
│   │   │   └── [vehicleId].tsx    # Edit vehicle
│   │   └── _layout.tsx
│   ├── _layout.tsx                # Root layout
│   └── index.tsx                  # App entry
├── components/                    # Reusable components
│   ├── BeaconSelector.tsx
│   ├── ClubCalendar.tsx
│   ├── DemoCard.tsx
│   ├── ErrorBoundary.tsx
│   ├── IconSymbol.tsx
│   └── LiveMeetView.tsx
├── contexts/                      # React contexts
│   └── AuthContext.tsx
├── hooks/                         # Custom hooks
│   ├── useBLEScanning.ts
│   ├── useBeaconDetections.ts
│   ├── useClubEvents.ts
│   ├── useClubPricing.ts
│   ├── useClubs.ts
│   ├── useDiscover.ts
│   ├── useEventAttendance.ts
│   ├── useEventGallery.ts
│   ├── useMessaging.ts
│   ├── useStripeClubPayment.ts
│   ├── useStripeSubscription.ts
│   ├── useSubscription.ts
│   └── useVehicles.ts
├── services/                      # Services
│   └── BLEService.ts
├── styles/                        # Styles
│   └── commonStyles.ts
├── types/                         # TypeScript types
│   ├── ble.ts
│   ├── club.ts
│   ├── messaging.ts
│   └── vehicle.ts
├── utils/                         # Utilities
│   ├── errorLogger.ts
│   ├── networkUtils.ts
│   ├── security.ts
│   └── validation.ts
├── app.json                       # Expo config
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── index.ts                       # Entry point
```

---

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Expo CLI
- iOS: Xcode 14+ (macOS only)
- Android: Android Studio

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/cardrop.git
cd cardrop

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

### Environment Setup
1. Create `.env` file with required variables
2. Set up Supabase project
3. Configure Stripe account
4. Set up Better Auth
5. Configure OAuth providers

---

## 📖 API Documentation

### Supabase Tables

All tables use Row Level Security (RLS) policies to ensure data privacy.

**Example RLS Policy:**
```sql
-- Users can only view their own vehicles
CREATE POLICY "Users can view own vehicles"
ON vehicles FOR SELECT
USING (owner_id = auth.uid());

-- Users can only update their own vehicles
CREATE POLICY "Users can update own vehicles"
ON vehicles FOR UPDATE
USING (owner_id = auth.uid());
```

### API Endpoints (via Supabase)

**Authentication:**
- POST `/auth/signup` - Register new user
- POST `/auth/login` - Login user
- POST `/auth/logout` - Logout user
- GET `/auth/me` - Get current user

**Vehicles:**
- GET `/vehicles` - List user's vehicles
- POST `/vehicles` - Create vehicle
- GET `/vehicles/:id` - Get vehicle details
- PUT `/vehicles/:id` - Update vehicle
- DELETE `/vehicles/:id` - Delete vehicle

**Clubs:**
- GET `/clubs` - List clubs
- POST `/clubs` - Create club
- GET `/clubs/:id` - Get club details
- POST `/clubs/:id/join` - Join club
- POST `/clubs/:id/leave` - Leave club

**Events:**
- GET `/events` - List events
- POST `/events` - Create event
- GET `/events/:id` - Get event details
- POST `/events/:id/checkin` - Check in to event

**Messages:**
- GET `/conversations` - List conversations
- POST `/conversations` - Create conversation
- GET `/messages/:conversationId` - Get messages
- POST `/messages` - Send message

---

## 🎓 Developer Guide

### Adding a New Feature

1. **Plan the feature:**
   - Define user flow
   - Design database schema
   - Sketch UI mockups

2. **Create database tables:**
   - Write SQL migration
   - Apply migration to Supabase
   - Set up RLS policies

3. **Create API hooks:**
   - Add custom hook in `hooks/`
   - Implement CRUD operations
   - Add error handling

4. **Build UI components:**
   - Create screen in `app/`
   - Add to navigation
   - Implement UI with common styles

5. **Test thoroughly:**
   - Unit tests for hooks
   - Integration tests for API
   - Manual testing on devices

6. **Document:**
   - Update this MVP spec
   - Add code comments
   - Update README if needed

### Code Style Guidelines

- Use TypeScript for all new code
- Follow ESLint rules
- Use functional components with hooks
- Keep components under 500 lines
- Extract reusable logic to hooks
- Use common styles from `commonStyles.ts`
- Add console.log for debugging user actions
- Handle loading, error, and empty states

### Git Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -m "Add new feature"`
3. Push to remote: `git push origin feature/new-feature`
4. Create pull request
5. Code review and merge

---

## 📞 Support & Contact

**Developer Support:**
- Email: dev@cardrop.app
- Discord: https://discord.gg/cardrop
- GitHub Issues: https://github.com/your-org/cardrop/issues

**User Support:**
- Email: support@cardrop.app
- In-app support: Settings → Help & Support

---

## 📄 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

- Expo team for the amazing framework
- Supabase for backend infrastructure
- Stripe for payment processing
- Better Auth for authentication
- React Native community

---

**Last Updated:** January 2025  
**Version:** 2.0  
**Status:** Production Ready

This document is a living specification and will be updated as the app evolves.
