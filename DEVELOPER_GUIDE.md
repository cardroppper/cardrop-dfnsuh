
# CarDrop Developer Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Supabase account

### Installation
```bash
npm install
```

### Running the App
```bash
# iOS
npm run ios

# Android
npm run android

# Web (limited BLE support)
npm run web
```

## 📁 Project Structure

```
CarDrop/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Authentication screens
│   ├── (tabs)/                   # Main tab screens
│   ├── vehicles/                 # Vehicle-related screens
│   ├── clubs/                    # Club-related screens
│   └── integrations/supabase/    # Supabase client and types
├── components/                   # Reusable components
│   ├── IconSymbol.tsx           # Cross-platform icon component
│   ├── FloatingTabBar.tsx       # Bottom navigation
│   └── PaywallScreen.tsx        # Premium paywall
├── contexts/                     # React contexts
│   └── AuthContext.tsx          # Authentication state
├── hooks/                        # Custom React hooks
│   ├── useBLEScanning.ts        # BLE beacon scanning
│   ├── useVehicles.ts           # Vehicle operations
│   ├── useClubs.ts              # Club operations
│   ├── useSubscription.ts       # Premium subscription
│   └── useBeaconDetections.ts   # Detection history
├── services/                     # Business logic services
│   └── BLEService.ts            # BLE manager
├── styles/                       # Shared styles
│   └── commonStyles.ts          # Design system
├── types/                        # TypeScript types
│   ├── ble.ts                   # BLE-related types
│   ├── vehicle.ts               # Vehicle types
│   └── club.ts                  # Club types
└── utils/                        # Utility functions
    └── errorLogger.ts           # Error logging
```

## 🎨 Design System

### Colors
```typescript
colors = {
  background: '#0A0A0A',      // Main background
  card: '#1A1A1A',            // Card background
  text: '#FFFFFF',            // Primary text
  textSecondary: '#999999',   // Secondary text
  primary: '#FF6B35',         // Primary brand color
  secondary: '#4ECDC4',       // Secondary brand color
  accent: '#FF3366',          // Accent/error color
  success: '#4CAF50',         // Success state
  warning: '#FFC107',         // Warning state
  highlight: '#2A2A2A',       // Subtle highlight
}
```

### Typography
- **Titles**: 36px, weight 900
- **Section Headers**: 20px, weight 700
- **Body**: 16px, weight 400
- **Captions**: 14px, weight 500

### Components
- **Cards**: 16px border radius, shadow elevation
- **Buttons**: 12px border radius, 18px padding
- **Inputs**: 12px border radius, 16px padding

## 🔐 Authentication Flow

1. User lands on auth screen
2. Sign up or log in with email/password
3. Profile is automatically created
4. User is redirected to main app
5. Session persists across app restarts

### Auth Context Usage
```typescript
const { user, profile, logout } = useAuth();

if (!user) {
  // Show auth screens
}
```

## 📡 BLE Beacon System

### How It Works
1. User manually starts scanning in Nearby tab
2. BLEService scans for devices with "CarDrop" or "CD-" prefix
3. Detected beacons are matched against vehicle_beacons table
4. Only public vehicles from non-private profiles are shown
5. Detection is recorded in beacon_detections table

### BLE Service Usage
```typescript
import BLEService from '@/services/BLEService';

// Check if supported
const isSupported = BLEService.isBluetoothSupported();

// Request permissions
const granted = await BLEService.requestPermissions();

// Start scanning
await BLEService.startScanning(
  (beacons) => {
    // Handle detected beacons
  },
  (error) => {
    // Handle errors
  }
);

// Stop scanning
BLEService.stopScanning();
```

### Platform Support
- ✅ iOS: Full support
- ✅ Android: Full support
- ❌ Web: Not supported (shows message)

## 🗄️ Database Schema

### Key Tables

#### profiles
- User profile information
- Username (unique), display name, bio
- Social media handles
- Privacy settings

#### vehicles
- Vehicle specifications
- Owner relationship
- Public/private visibility
- Location data (optional)

#### vehicle_beacons
- Associates beacon UUID with vehicle
- One-to-many relationship

#### clubs
- Club information
- Owner and visibility settings
- Logo and banner images

#### club_members
- Many-to-many relationship
- Roles: owner, admin, member

#### events
- Club events
- RSVP and check-in tracking
- Optional beacon for auto check-in

#### user_subscriptions
- Premium subscription status
- Start and end dates

#### beacon_detections
- Historical detection records
- Includes RSSI and location

### RLS Policies
All tables have Row Level Security enabled:
- Users can only modify their own data
- Club content restricted to members
- Private profiles/vehicles are hidden
- Admin actions require proper role

## 🎣 Custom Hooks

### useVehicles
```typescript
const { vehicles, isLoading, error, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
```

### useClubs
```typescript
const { clubs, myClubs, loading, createClub, joinClub, leaveClub } = useClubs();
```

### useSubscription
```typescript
const { subscription, loading, updateSubscription } = useSubscription();

if (subscription.isPremium) {
  // Show premium features
}
```

### useBLEScanning
```typescript
const {
  isScanning,
  nearbyVehicles,
  error,
  isSupported,
  startScanning,
  stopScanning,
} = useBLEScanning();
```

## 🎯 Feature Gating

### Premium Features
Use the `useSubscription` hook to gate features:

```typescript
const { subscription } = useSubscription();

if (!subscription.isPremium) {
  // Show paywall
  return <PaywallScreen feature="24-hour-history" />;
}

// Show premium feature
```

### Free vs Premium Limits
- **Free**: 7-day detection history, 3 clubs max
- **Premium**: 24-hour detection history, unlimited clubs, analytics

## 🔄 Real-time Features

### Supabase Realtime Setup
```typescript
import { supabase } from '@/app/integrations/supabase/client';

// Subscribe to club messages
const channel = supabase
  .channel(`club:${clubId}:messages`, {
    config: { private: true }
  })
  .on('broadcast', { event: 'INSERT' }, (payload) => {
    // Handle new message
  })
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### Database Triggers
Triggers are set up for:
- Club messages → `club:${clubId}:messages`
- Event check-ins → `event:${eventId}:checkins`
- Hub detections → `hub:${hubId}:detections`

## 🖼️ Image Handling

### Image Picker
```typescript
import * as ImagePicker from 'expo-image-picker';

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [16, 9],
  quality: 0.8,
});

if (!result.canceled) {
  const imageUri = result.assets[0].uri;
  // TODO: Upload to Supabase Storage
}
```

### TODO: Supabase Storage Integration
Images should be uploaded to Supabase Storage buckets:
- `vehicle-images`
- `profile-avatars`
- `club-logos`
- `timeline-images`

## 🎨 Icons

### IconSymbol Component
Cross-platform icon component using SF Symbols (iOS) and Material Icons (Android):

```typescript
<IconSymbol
  ios_icon_name="car.fill"
  android_material_icon_name="directions-car"
  size={24}
  color={colors.primary}
/>
```

### Common Icons
- **Car**: `car.fill` / `directions-car`
- **Person**: `person.fill` / `person`
- **Location**: `location.fill` / `location-on`
- **Calendar**: `calendar` / `event`
- **Settings**: `gearshape.fill` / `settings`
- **Add**: `plus.circle.fill` / `add-circle`
- **Edit**: `pencil` / `edit`
- **Delete**: `trash` / `delete`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Authentication flow (sign up, login, logout)
- [ ] Vehicle CRUD operations
- [ ] BLE scanning (iOS/Android only)
- [ ] Club creation and joining
- [ ] Event RSVP and check-in
- [ ] Profile editing
- [ ] Premium paywall display

### Platform-Specific Testing
- **iOS**: Test on physical device for BLE
- **Android**: Test permissions flow
- **Web**: Verify BLE not supported message

## 🐛 Debugging

### Common Issues

#### BLE Not Working
- Check platform (web not supported)
- Verify permissions granted
- Ensure Bluetooth is enabled
- Check beacon UUID format

#### Supabase Errors
- Verify RLS policies
- Check user authentication
- Confirm table relationships
- Review error logs in Supabase dashboard

#### Image Upload Fails
- TODO: Implement Supabase Storage upload
- Check file size limits
- Verify storage bucket permissions

### Logging
```typescript
console.log('[Component] Action:', data);
console.error('[Component] Error:', error);
```

## 📦 Deployment

### Environment Variables
Create `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Build Commands
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 🔮 Future Enhancements

### High Priority
1. Complete vehicle detail tabs (Timeline, Mods, Performance)
2. Club detail page with all tabs
3. Event detail page with real-time updates
4. Scanned tab with detection history
5. Enhanced user profile page

### Medium Priority
6. Superwall integration for payments
7. Push notifications
8. Background BLE scanning
9. Hub device integration
10. Analytics dashboard

### Low Priority
11. Social features (comments, likes)
12. Advanced search and filters
13. Export vehicle data
14. Dark/light mode toggle
15. Internationalization

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native BLE PLX](https://github.com/dotintent/react-native-ble-plx)
- [Superwall Documentation](https://superwall.com/docs)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [Material Icons](https://fonts.google.com/icons)

## 🤝 Contributing

1. Create feature branch
2. Implement changes
3. Test on iOS and Android
4. Submit pull request
5. Update documentation

## 📄 License

Proprietary - All rights reserved
