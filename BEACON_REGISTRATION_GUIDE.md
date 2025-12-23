
# CarDrop Beacon Registration System

## Overview

The CarDrop beacon registration system allows the `@cardrop` account to register and configure Feasycom FSC-BP108B BLE beacons wholesale, ensuring only authorized beacons work with the app. When users receive a beacon and turn it on, they'll see an AirPods-like pairing UI that guides them through attaching the beacon to a vehicle.

## Features Implemented

### 1. Database Schema

**Table: `registered_beacons`**
- Stores all registered beacons with their configuration status
- Tracks assignment to users and vehicles
- Only accessible by `@cardrop` account for management
- Users can view beacons assigned to them

**Key Fields:**
- `beacon_uuid`: Unique identifier for the beacon
- `device_model`: FSC-BP108B
- `manufacturer`: FEASYCOM
- `is_configured`: Whether the beacon has been configured
- `is_assigned`: Whether the beacon is assigned to a user
- `assigned_to_user_id`: The user who owns this beacon
- `registered_by`: The admin who registered it (@cardrop)

### 2. Dev-Only Settings Button

**Location:** Settings screen (`app/(tabs)/settings.tsx`)

**Visibility:** Only shown when `profile.username === 'cardrop'`

**Features:**
- Prominent developer tools section
- Styled with secondary color (cyan) to stand out
- Direct navigation to beacon registration screen

### 3. Beacon Registration Screen

**Location:** `app/dev/beacon-registration.tsx`

**Features:**
- Scan for nearby FSC-BP108B beacons
- Real-time signal strength indicators (Excellent/Good/Fair/Weak)
- Register new beacons with optional notes
- View all registered beacons with status (Available/Assigned)
- Delete beacon registrations
- Filter out already-registered beacons from scan results

**BLE Detection:**
The system detects beacons by name patterns:
- `CARDROP`
- `CD-`
- `FSC-BP`
- `FEASYCOM`

### 4. AirPods-Like Pairing UI

**Component:** `BeaconPairingModal` (`components/BeaconPairingModal.tsx`)

**Features:**
- Beautiful animated modal with blur background
- Pulsing beacon icon animation
- Scale-in entrance animation
- Haptic feedback on interactions
- Two pairing options:
  - Add New Car: Navigate to vehicle creation
  - Choose from Garage: Navigate to garage to select existing vehicle
- "Not Now" dismissal option

**Behavior:**
- Automatically appears when a registered, unassigned beacon is detected nearby (RSSI >= -60)
- 24-hour cooldown per beacon to avoid annoying repeated prompts
- Only shows for beacons that are:
  - Registered in the system
  - Configured (`is_configured = true`)
  - Not yet assigned (`is_assigned = false`)
  - Within close proximity (strong signal)

### 5. Beacon Pairing Hook

**Hook:** `useBeaconPairing` (`hooks/useBeaconPairing.ts`)

**Features:**
- Background monitoring for new beacons
- Automatic cooldown management (24 hours)
- Session-based duplicate detection
- Checks beacon registration status
- Verifies user doesn't already have the beacon

### 6. Beacon Selector Component

**Component:** `BeaconSelector` (`components/BeaconSelector.tsx`)

**Features:**
- Shows all available (unassigned) beacons
- Real-time scanning to highlight nearby beacons
- Visual indicators for:
  - Selected beacon (checkmark, highlighted)
  - Nearby beacons (Bluetooth icon, "Nearby" badge)
- Clear selection option
- Empty state when no beacons available

### 7. Vehicle Creation Integration

**Updated:** `app/vehicles/add.tsx`

**Features:**
- New "Beacon Assignment" section
- Integrated BeaconSelector component
- Automatic beacon assignment on vehicle creation
- Creates `vehicle_beacons` entry
- Updates `registered_beacons` to mark as assigned
- Graceful error handling (vehicle still created if beacon assignment fails)

## User Flow

### Admin Flow (@cardrop)

1. Navigate to Settings
2. Tap "Beacon Registration" button (dev-only)
3. Tap "Start Scanning"
4. Wait for FSC-BP108B beacons to appear
5. Tap "Register" on each beacon
6. Optionally add notes (e.g., "Batch #123")
7. Beacon is now registered and available for users

### End User Flow

**Scenario 1: New Beacon Pairing**

1. User receives CarDrop beacon in mail
2. User turns on beacon
3. User opens CarDrop app
4. AirPods-like modal appears automatically
5. User chooses:
   - **Add New Car**: Fills out vehicle form with beacon pre-selected
   - **Choose from Garage**: Selects existing vehicle to attach beacon

**Scenario 2: Manual Beacon Assignment**

1. User navigates to "Add Vehicle"
2. Fills out vehicle information
3. In "Beacon Assignment" section:
   - Sees list of available beacons
   - Taps "Scan" to find nearby beacons
   - Selects desired beacon
4. Submits form
5. Vehicle and beacon are linked

## Technical Details

### BLE Scanning

**Service:** `BLEService` (`services/BLEService.ts`)

**Detection Logic:**
```typescript
private isCarDropBeacon(device: any): boolean {
  if (!device.name) return false;
  const name = device.name.toUpperCase();
  return name.includes('CARDROP') || 
         name.startsWith('CD-') || 
         name.includes('FSC-BP') ||
         name.includes('FEASYCOM');
}
```

### Proximity Threshold

- **Very Close:** RSSI >= -60 dBm (triggers auto-pairing)
- **Close:** RSSI >= -75 dBm
- **Nearby:** RSSI >= -90 dBm

### Security

**RLS Policies:**
- Only `@cardrop` can view all beacons
- Only `@cardrop` can insert/update/delete beacons
- Users can only view beacons assigned to them
- All operations require authentication

### Platform Support

- **iOS:** Full support with native BLE
- **Android:** Full support with native BLE
- **Web:** Limited support (BLE not available, shows appropriate messages)

## Database Relationships

```
registered_beacons
  ├─ registered_by → auth.users (admin who registered)
  └─ assigned_to_user_id → auth.users (user who owns it)

vehicle_beacons
  ├─ vehicle_id → vehicles
  └─ beacon_uuid → registered_beacons.beacon_uuid

vehicles
  └─ user_id → auth.users
```

## Future Enhancements

1. **Batch Registration:** Register multiple beacons at once
2. **Beacon Configuration:** Configure beacon settings (TX power, interval)
3. **Beacon Analytics:** Track beacon battery life, signal history
4. **Transfer Beacons:** Allow users to transfer beacons between vehicles
5. **Beacon Marketplace:** Buy beacons directly in-app
6. **Beacon Health:** Monitor beacon status and alert on issues

## Testing

### Test as @cardrop

1. Create account with username `cardrop`
2. Verify "Beacon Registration" button appears in Settings
3. Test beacon scanning and registration
4. Verify beacons appear in registered list

### Test as Regular User

1. Create regular user account
2. Verify "Beacon Registration" button does NOT appear
3. Have @cardrop register a test beacon
4. Turn on beacon near device
5. Verify pairing modal appears
6. Test both pairing flows (new car, existing car)

## Troubleshooting

**Beacon not detected:**
- Ensure Bluetooth is enabled
- Check beacon battery
- Verify beacon is within range (< 10 meters)
- Confirm beacon name matches detection patterns

**Pairing modal not appearing:**
- Check 24-hour cooldown hasn't been triggered
- Verify beacon is registered and unassigned
- Ensure RSSI is strong enough (>= -60 dBm)
- Check app has Bluetooth permissions

**Registration fails:**
- Verify logged in as @cardrop
- Check beacon UUID is unique
- Ensure database connection is active
