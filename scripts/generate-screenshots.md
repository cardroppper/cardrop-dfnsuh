
# Screenshot Generation Guide for CarDrop

## Required Screenshots

### iPhone 6.7" Display (1290 x 2796 pixels)
Required for iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max

### iPhone 6.5" Display (1242 x 2688 pixels)
Required for iPhone 11 Pro Max, 11, XS Max, XR

### iPhone 5.5" Display (1242 x 2208 pixels)
Required for iPhone 8 Plus, 7 Plus, 6s Plus

## Screenshot Content

### Screenshot 1: Nearby Detection
**Screen**: Nearby tab with detected vehicles
**Content**:
- 5-6 vehicle cards showing nearby cars
- Signal strength indicators
- Distance labels ("Very Close", "Near", "Far")
- Vehicle thumbnails and names
- Owner usernames
**Caption**: "Discover nearby vehicles in real-time"

### Screenshot 2: Vehicle Profile
**Screen**: Detailed vehicle profile
**Content**:
- Hero image of a modified car
- Vehicle specs (Make, Model, Year, Color)
- Modification list
- Owner profile section
- "Message Owner" button
**Caption**: "Showcase your build with stunning profiles"

### Screenshot 3: Garage
**Screen**: User's garage with multiple vehicles
**Content**:
- 3-4 vehicle cards in grid layout
- Vehicle thumbnails
- Make/model labels
- "Add Vehicle" button
**Caption**: "Manage your entire collection"

### Screenshot 4: Clubs
**Screen**: Clubs tab with club list
**Content**:
- 4-5 club cards
- Club names and member counts
- "Join" buttons
- Club icons/logos
- "Create Club" button
**Caption**: "Join clubs and connect with enthusiasts"

### Screenshot 5: Event Detail
**Screen**: Car meet event detail
**Content**:
- Event banner image
- Event name, date, time, location
- RSVP count
- Attending vehicle list
- "RSVP" button
- Event gallery preview
**Caption**: "Attend car meets and share the experience"

### Screenshot 6: Premium Map (Optional)
**Screen**: Global meet map
**Content**:
- Map view with event pins
- Multiple event markers
- "Premium Feature" badge
- Event preview cards
**Caption**: "Premium: Discover meets worldwide"

## Fake Data Population

### Users
- **Username**: @stanced_civic, @boost_life, @classic_muscle, @euro_tuner, @jdm_legend
- **Display Names**: Mike Chen, Sarah Rodriguez, James Wilson, Emma Thompson, Alex Kim

### Vehicles
1. **2020 Honda Civic Type R**
   - Owner: @stanced_civic
   - Mods: Coilovers, Exhaust, Tune
   - Color: Championship White

2. **2018 Subaru WRX STI**
   - Owner: @boost_life
   - Mods: Turbo Upgrade, Intercooler, Wheels
   - Color: WR Blue Pearl

3. **1969 Chevrolet Camaro**
   - Owner: @classic_muscle
   - Mods: LS3 Swap, Suspension, Brakes
   - Color: Rally Red

4. **2021 BMW M3**
   - Owner: @euro_tuner
   - Mods: Carbon Fiber, Exhaust, Tune
   - Color: Isle of Man Green

5. **1998 Toyota Supra**
   - Owner: @jdm_legend
   - Mods: Single Turbo, Coilovers, Wheels
   - Color: Midnight Purple

### Clubs
- **JDM Society** - 1,247 members
- **Euro Enthusiasts** - 892 members
- **American Muscle** - 1,534 members
- **Stance Nation** - 2,103 members
- **Boost Addicts** - 756 members

### Events
- **Cars & Coffee - Downtown** - Saturday 8:00 AM - 45 RSVPs
- **Sunset Cruise** - Friday 6:00 PM - 32 RSVPs
- **Track Day at Laguna Seca** - Sunday 9:00 AM - 28 RSVPs

## Design Guidelines

### Colors
- **Dark Mode**: Grey (#2A2A2A) primary, Orange (#FF8C42) accents
- **Light Mode**: Orange (#FF8C42) primary, Grey (#2A2A2A) accents

### Typography
- **Headings**: Bold, 24-28px
- **Body**: Regular, 16px
- **Captions**: Regular, 14px

### Spacing
- Consistent 16px padding
- 12px between elements
- 24px between sections

### Images
- High-quality car photos
- Consistent aspect ratios
- Professional lighting
- Clean backgrounds

## Tools for Screenshot Generation

### Option 1: Simulator + Xcode
1. Run app in iOS Simulator
2. Populate with fake data
3. Use Xcode > Debug > Take Screenshot
4. Save as PNG

### Option 2: Figma/Sketch
1. Create mockups with exact dimensions
2. Use real app UI components
3. Add fake data and images
4. Export as PNG at 2x resolution

### Option 3: Screenshot Automation
1. Use Fastlane Snapshot
2. Write UI tests that navigate and capture
3. Automatically generate all sizes
4. Add localized captions

## Post-Processing

### Image Optimization
- Compress to < 500KB per screenshot
- Use PNG format
- Maintain quality at 90%+

### Device Frames (Optional)
- Add iPhone device frames
- Use tools like Screely or Mockuphone
- Ensure frames don't obscure content

### Captions
- Keep under 170 characters
- Highlight key feature
- Use action-oriented language
- Match brand voice

## Checklist

- [ ] Generate 6.7" screenshots (5-6 images)
- [ ] Generate 6.5" screenshots (5-6 images)
- [ ] Generate 5.5" screenshots (5-6 images)
- [ ] Add captions to each screenshot
- [ ] Optimize file sizes
- [ ] Review for consistency
- [ ] Test on actual devices
- [ ] Upload to App Store Connect
