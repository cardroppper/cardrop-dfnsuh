
# CarDrop Beacon Registration - Admin Quick Start

## For @cardrop Account Only

This guide is for the CarDrop admin account to register and manage FSC-BP108B beacons.

## Quick Start

### 1. Access Beacon Registration

1. Open CarDrop app
2. Navigate to **Settings** tab (bottom right)
3. Scroll down to **Developer Tools** section
4. Tap **Beacon Registration**

> **Note:** This button only appears for the @cardrop account.

### 2. Register New Beacons

1. Tap **Start Scanning**
2. Wait for beacons to appear (they'll show up as they're detected)
3. Each beacon shows:
   - Beacon UUID (unique identifier)
   - Signal strength (Excellent/Good/Fair/Weak)
   - RSSI value (signal strength in dBm)
4. Tap **Register** on each beacon you want to add
5. Confirm registration in the popup
6. Beacon is now registered and available for users

### 3. View Registered Beacons

Scroll down to see all registered beacons with:
- Beacon UUID
- Device model (FSC-BP108B)
- Status (Available or Assigned)
- Registration date
- Optional notes

### 4. Delete Beacons

1. Find the beacon in the registered list
2. Tap the trash icon
3. Confirm deletion

> **Warning:** Only delete beacons that are not assigned to users.

## Beacon Specifications

**Device:** Feasycom FSC-BP108B

**Specifications:**
- Chipset: Dialog DA14531
- Bluetooth: 5.1
- TX Power: -19.5 dBm to +2.5 dBm
- Antenna: Ceramic
- Battery: CR3032 (550 mAh)
- Battery Life: ~6 years
- Size: 48 × 37 × 7.8 mm
- Protection: IP67
- Certifications: FCC, IC, CE, TELEC

## Detection Patterns

The app detects beacons with names containing:
- `CARDROP`
- `CD-`
- `FSC-BP`
- `FEASYCOM`

## Signal Strength Guide

- **Excellent** (>= -60 dBm): Very close, triggers auto-pairing
- **Good** (>= -75 dBm): Close proximity
- **Fair** (>= -90 dBm): Nearby
- **Weak** (< -90 dBm): Far away

## Best Practices

### Registration

1. **Batch Registration:** Register beacons in batches for efficiency
2. **Add Notes:** Use notes field to track batch numbers or dates
3. **Verify Signal:** Only register beacons with Good or Excellent signal
4. **Check Duplicates:** System prevents duplicate registrations automatically

### Inventory Management

1. **Track Status:** Monitor which beacons are Available vs Assigned
2. **Regular Audits:** Periodically review registered beacons
3. **Clean Up:** Remove beacons that are damaged or lost
4. **Documentation:** Keep external records of beacon shipments

### User Support

When users report beacon issues:

1. **Check Registration:** Verify beacon is in the system
2. **Check Assignment:** Confirm beacon assignment status
3. **Check Signal:** Ask user to check Bluetooth is enabled
4. **Re-register:** If needed, delete and re-register beacon

## Troubleshooting

### Beacon Not Detected

**Problem:** Beacon doesn't appear in scan results

**Solutions:**
- Ensure beacon is powered on
- Check beacon battery
- Move closer to beacon (< 5 meters)
- Verify Bluetooth is enabled on device
- Check beacon name matches detection patterns

### Registration Fails

**Problem:** "Failed to register beacon" error

**Solutions:**
- Check internet connection
- Verify you're logged in as @cardrop
- Ensure beacon UUID is not already registered
- Try again after a few seconds

### Can't Delete Beacon

**Problem:** Deletion fails or shows error

**Solutions:**
- Check if beacon is assigned to a user (can't delete assigned beacons)
- Verify internet connection
- Refresh the screen and try again

## User Pairing Process

After you register a beacon, here's what happens when a user receives it:

1. **User turns on beacon**
2. **User opens CarDrop app**
3. **Pairing modal appears automatically** (if beacon is nearby)
4. **User chooses:**
   - Add New Car → Fills out vehicle form
   - Choose from Garage → Selects existing vehicle
5. **Beacon is assigned to user's vehicle**
6. **Beacon status changes to "Assigned"**

## Support

For technical issues or questions:
- Check the full documentation: `BEACON_REGISTRATION_GUIDE.md`
- Review implementation details: `IMPLEMENTATION_SUMMARY_BEACON.md`

## Security Notes

- Only the @cardrop account can access beacon registration
- All beacon operations are logged
- RLS policies prevent unauthorized access
- Users can only see beacons assigned to them

## Quick Reference

| Action | Location | Button |
|--------|----------|--------|
| Access Registration | Settings → Developer Tools | Beacon Registration |
| Start Scanning | Beacon Registration Screen | Start Scanning |
| Register Beacon | Next to beacon in scan results | Register |
| Delete Beacon | Next to beacon in registered list | Trash icon |
| Stop Scanning | Beacon Registration Screen | Stop Scanning |

## Workflow Diagram

```
┌─────────────────┐
│  Receive Beacon │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Open Settings  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Beacon Reg Tool │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Start Scanning │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Register Beacon │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Ship to User   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  User Pairs It  │
└─────────────────┘
```

## Tips for Efficiency

1. **Prepare Workspace:** Have all beacons ready before starting
2. **Batch Process:** Register multiple beacons in one session
3. **Use Notes:** Add batch info for tracking
4. **Verify Each:** Check signal strength before registering
5. **Document:** Keep external records of registrations
6. **Test One:** Register and test one beacon before doing a full batch

## Common Questions

**Q: How many beacons can I register at once?**
A: No limit, but register them one at a time for accuracy.

**Q: Can I edit beacon information after registration?**
A: Currently no, but you can delete and re-register if needed.

**Q: What if a user loses their beacon?**
A: The beacon remains assigned. User should contact support to unassign it.

**Q: Can I see which user a beacon is assigned to?**
A: Yes, assigned beacons show the assignment status in the list.

**Q: How do I know if a beacon is working?**
A: Check the signal strength during scanning. Good or Excellent means it's working.
