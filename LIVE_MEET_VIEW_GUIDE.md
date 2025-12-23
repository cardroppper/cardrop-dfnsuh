
# Live Meet View & Attendance Tracking Guide

## Overview

The Live Meet View feature allows premium members to see all vehicles at club events in real-time, even when they're not physically present. This creates a "live feed" of cars at meets, powered by members who are checked in acting as "gateways" that detect and log vehicles.

## Key Features

### 1. **Attendance Tracking**
Premium users can choose between two attendance modes in Settings:

- **Manual Mode (Default)**: Users press a "Check In" button on the event page when they arrive
- **Automatic Mode**: The app automatically checks users in when they arrive at the event location (requires location permissions)

### 2. **Live Meet View**
Premium members can view all vehicles detected at club events in real-time:

- Vehicles are displayed with **red borders** to indicate they're at a live meet
- Shows vehicle photos, owner info, and detection time
- Updates in real-time as new vehicles are detected
- Works even if you're not physically at the event

### 3. **Gateway System**
Users who check in to events become "gateways":

- Their phones automatically detect nearby vehicles via Bluetooth
- Detections are logged to the event's short-term database
- Logged vehicles remain visible for **48 hours**
- Multiple gateways provide better coverage of the event

### 4. **Visual Indicators**

#### In Nearby Tab (Premium Only):
- Vehicles at meets show a **red border** around their card
- "AT MEET" badge with live indicator dot
- Shows which event and club the vehicle is at
- Example: "Cars & Coffee • Bay Area Tuners"

#### In Live Meet View:
- Grid layout of all detected vehicles
- Red borders around vehicle thumbnails
- Live indicator badge on each vehicle
- Real-time count of vehicles at the meet

## How It Works

### For Event Attendees:

1. **Check In to Event**
   - Navigate to your club's event page
   - Press "Check In" button (manual mode)
   - Or arrive at location (automatic mode)

2. **Become a Gateway**
   - Once checked in, your phone automatically logs nearby vehicle detections
   - Works in the background while you use the app
   - No additional action required

3. **View Live Meet**
   - Press "Live Meet View" button on any event
   - See all vehicles detected at the meet
   - Updates automatically every 15 seconds

### For Remote Premium Members:

1. **View Events**
   - Navigate to your club's page
   - See upcoming events with check-in counts

2. **Access Live Meet View**
   - Press "Live Meet View" on any active event
   - See all vehicles currently at the meet
   - View even if you're not there

3. **Discover Vehicles**
   - Browse detected vehicles in grid layout
   - Tap any vehicle to view full profile
   - See who's at the meet in real-time

## Database Structure

### Event Meet Detections Table
```sql
event_meet_detections
- event_id: Which event the detection occurred at
- vehicle_id: Which vehicle was detected
- detected_by_user_id: Who detected the vehicle (gateway)
- rssi: Signal strength at detection
- detected_at: When the detection occurred
- expires_at: When the detection expires (48 hours)
```

### Key Features:
- **48-Hour Expiration**: Detections automatically expire after 2 days
- **Deduplication**: Unique constraint prevents duplicate detections
- **RLS Policies**: Only premium club members can view detections
- **Real-time Updates**: Uses Supabase Realtime for live updates

## Settings Configuration

### Attendance Mode Toggle
Location: Settings → Premium Features → Event Attendance Mode

- **Manual**: Default mode, requires button press to check in
- **Automatic**: Requires location permissions, auto-checks in when at event

### Location Permissions
Required for automatic attendance:
- iOS: "Location When In Use" or "Location Always"
- Android: "ACCESS_FINE_LOCATION" and "ACCESS_COARSE_LOCATION"

## Premium Feature

Live Meet View is a **premium-only feature**:
- Requires active premium subscription OR free_premium flag
- Non-premium users see upgrade prompt
- Check-in functionality available to all club members
- Gateway functionality available to all checked-in users

## Technical Implementation

### Automatic Detection Logging
When a user is checked in to an event:
1. BLE scanning detects nearby vehicles
2. For each detection, a record is inserted into `event_meet_detections`
3. Duplicate detections are ignored (unique constraint)
4. Detections expire after 48 hours automatically

### Geofencing (Automatic Mode)
Events can have location coordinates:
- `latitude` and `longitude` fields
- `geofence_radius_meters` (default: 100m)
- App checks user location every 30 seconds
- Auto-checks in when within radius

### Real-time Updates
- Supabase Realtime subscription on `event_meet_detections`
- Updates every 15 seconds
- Live vehicle count and grid updates
- No manual refresh needed

## User Experience Flow

### Scenario 1: Manual Check-In
1. User arrives at car meet
2. Opens CarDrop app
3. Navigates to club → event
4. Presses "Check In" button
5. Becomes a gateway, starts logging detections
6. Other premium members see their detections in Live Meet View

### Scenario 2: Automatic Check-In
1. User enables automatic mode in settings
2. Grants location permissions
3. Arrives at event location
4. App automatically checks them in
5. Notification confirms check-in
6. Becomes a gateway automatically

### Scenario 3: Remote Viewing
1. Premium user opens club page
2. Sees active event with check-ins
3. Presses "Live Meet View"
4. Sees all vehicles detected at meet
5. Browses vehicles with red borders
6. Taps vehicle to view full profile

## Benefits

### For Event Organizers:
- See who actually attended the meet
- Track attendance automatically
- View meet participation in real-time

### For Premium Members:
- See what cars are at meets remotely
- Decide if you want to attend based on who's there
- Never miss seeing a rare car at a meet

### For All Members:
- Easy check-in process
- Contribute to the community by being a gateway
- See accurate attendance counts

## Privacy & Security

- Only public vehicles are detected and logged
- Ghost mode users are never logged
- Private profiles are excluded
- RLS policies ensure only club members see detections
- Location data only used for automatic check-in (opt-in)
- Detections expire after 48 hours

## Future Enhancements

Potential additions:
- Push notifications when specific cars are detected at meets
- Historical meet attendance analytics
- "Most Popular Meets" based on detection counts
- Integration with club leaderboards
- Meet highlights and photo galleries
