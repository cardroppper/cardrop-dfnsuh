
# App Review Notes for CarDrop

## For Apple App Store Review Team

### App Overview
CarDrop is an automotive social networking application that connects car enthusiasts through Bluetooth proximity detection, club memberships, and event coordination.

### Test Account Credentials
**Username**: reviewer@cardrop.app
**Password**: ReviewTest2025!

This account has:
- Pre-populated vehicle profiles
- Membership in test clubs
- Access to premium features
- Sample event RSVPs

### Key Features to Test

#### 1. Authentication
- Email/password signup and login
- Profile creation with username and display name
- Password reset functionality

#### 2. Vehicle Detection (Bluetooth)
- Requires physical Bluetooth beacons for full testing
- Demo mode available: Navigate to Settings > Developer Options > Enable Demo Mode
- Demo mode simulates nearby vehicles without actual beacons

#### 3. Vehicle Profiles
- Add vehicle: Tap "Garage" > "+" button
- Edit vehicle: Tap vehicle > "Edit" button
- Vehicle timeline: Tap vehicle > "Timeline" tab
- Upload photos from camera or library

#### 4. Clubs & Events
- Browse clubs: "Clubs" tab
- Join club: Tap club > "Join" button
- Create event: Club detail > "Create Event"
- RSVP to event: Event detail > "RSVP" button
- Event gallery: Event detail > "Gallery" tab

#### 5. Nearby Detection
- "Nearby" tab shows detected vehicles
- Requires location permission
- Requires Bluetooth permission
- Demo mode available for testing without beacons

#### 6. Premium Features
- Premium subscription via in-app purchase
- Global meet map (Premium only)
- Test subscription: Use sandbox Apple ID

### Permissions Required

#### Location (NSLocationWhenInUseUsageDescription)
**Why**: To show nearby vehicles and car meets based on user's location
**When**: Requested when user taps "Nearby" tab or views meet map
**Fallback**: App functions without location, but proximity features are limited

#### Bluetooth (NSBluetoothAlwaysUsageDescription)
**Why**: To detect nearby CarDrop beacons attached to vehicles
**When**: Requested when user starts scanning in "Nearby" tab
**Fallback**: App functions without Bluetooth, but vehicle detection is disabled

#### Camera (NSCameraUsageDescription)
**Why**: To take photos of vehicles and at car meets
**When**: Requested when user taps "Take Photo" in vehicle editor or event gallery
**Fallback**: User can select from photo library instead

#### Photo Library (NSPhotoLibraryUsageDescription)
**Why**: To upload existing photos of vehicles and meets
**When**: Requested when user taps "Choose Photo"
**Fallback**: User can take new photo with camera instead

### Backend Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for images/videos
- **Real-time**: Supabase Realtime for chat and live updates

### Privacy & Data Handling

#### Data Collection
- Email address (for authentication)
- Username and display name (public profile)
- Vehicle information (user-generated)
- Location data (for proximity features)
- Bluetooth beacon IDs (for vehicle detection)
- Photos/videos (user-uploaded)

#### Data Usage
- All data used solely for app functionality
- No data sold to third parties
- No advertising or tracking
- See Privacy Policy for full details

#### Data Retention
- Active accounts: Data retained while account active
- Deleted accounts: Data permanently deleted within 30 days

### Content Moderation
- User-generated content (vehicle profiles, photos, messages)
- Reporting system: Long-press content > "Report"
- Moderation team reviews reports within 24 hours
- Automated filters for inappropriate content
- Club admins can moderate club content

### In-App Purchases
- **CarDrop Premium** (Monthly): $4.99/month
- **CarDrop Premium** (Annual): $49.99/year

Premium features:
- Global meet map
- Advanced search
- Priority support
- Ad-free experience

### Known Limitations
- Bluetooth detection requires physical beacons (not included with app)
- Location accuracy depends on device GPS
- Real-time chat requires internet connection
- Image uploads limited to 10MB per file

### Testing Tips
1. **Enable Demo Mode**: Settings > Developer Options > Enable Demo Mode
2. **Simulate Location**: Use Xcode location simulation for testing proximity
3. **Test Offline**: Disable network to test offline behavior
4. **Test Permissions**: Deny permissions to test fallback behavior

### Support Contact
- **Email**: support@cardrop.app
- **Response Time**: Within 24 hours
- **In-App**: Settings > Help & Support

### Additional Notes
- App requires iOS 15.0 or later
- Optimized for iPhone (iPad support coming soon)
- Supports Dark Mode and Light Mode
- Fully accessible with VoiceOver
- Localized for English (more languages coming)

Thank you for reviewing CarDrop! We're excited to bring this automotive social network to car enthusiasts worldwide.
