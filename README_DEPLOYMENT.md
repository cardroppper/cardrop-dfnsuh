
# CarDrop Deployment Guide

This guide covers everything needed to deploy CarDrop to the Apple App Store and Google Play Store.

## Prerequisites

### Required Accounts
- [ ] Expo account (free at expo.dev)
- [ ] Apple Developer account ($99/year)
- [ ] Google Play Console account ($25 one-time)

### Required Tools
- [ ] Node.js 18+ installed
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Xcode (for iOS, Mac only)
- [ ] Android Studio (for Android)

## Step 1: Configure App

### Update app.json
1. Open `app.json`
2. Replace placeholders:
   - `YOUR_EAS_PROJECT_ID` - Get from `eas init`
   - `YOUR_EXPO_USERNAME` - Your Expo username
3. Update bundle identifiers:
   - iOS: `com.cardrop.app` (or your domain)
   - Android: `com.cardrop.app`

### Update eas.json
1. Open `eas.json`
2. For iOS submission, add:
   - `appleId`: Your Apple ID email
   - `ascAppId`: App Store Connect app ID
   - `appleTeamId`: Your Apple Developer Team ID
3. For Android submission, add:
   - `serviceAccountKeyPath`: Path to Google service account JSON

## Step 2: Prepare Assets

### App Icons
Your provided icons are ready:
- Dark mode: `assets/images/b7c66c53-8dea-43bf-bc60-3e5e66ecb613.png`
- Light mode: `assets/images/9128fdf3-ed2f-40d2-8aaf-5f9965d8b139.png`

Rename and configure:
```bash
# iOS icon (1024x1024)
cp assets/images/b7c66c53-8dea-43bf-bc60-3e5e66ecb613.png assets/images/icon-dark.png

# Android adaptive icon
cp assets/images/8b4b7908-f6d2-4b0f-ad18-5b6444964a08.png assets/images/adaptive-icon.png

# Splash screen
cp assets/images/1c867cde-aadb-4f1e-8906-868c43a7f0fa.png assets/images/splash-icon.png
```

### Screenshots
Generate screenshots following `scripts/generate-screenshots.md`:
- iPhone 6.7" (1290 x 2796) - 5-6 images
- iPhone 6.5" (1242 x 2688) - 5-6 images
- iPhone 5.5" (1242 x 2208) - 5-6 images

Use fake data for aesthetic presentation:
- Populated vehicle profiles
- Active clubs with members
- Upcoming events with RSVPs
- Nearby vehicles detected

## Step 3: Legal Documents

Legal documents are ready in `legal/`:
- `PRIVACY_POLICY.md` - Privacy policy
- `TERMS_OF_SERVICE.md` - Terms of service
- `EULA.md` - End user license agreement

### Host Legal Documents
1. Create pages on your website:
   - `https://cardrop.app/privacy`
   - `https://cardrop.app/terms`
   - `https://cardrop.app/eula`
2. Or use GitHub Pages:
   - Create `docs/` folder
   - Add HTML versions of legal docs
   - Enable GitHub Pages in repo settings

## Step 4: Initialize EAS

```bash
# Login to Expo
eas login

# Initialize EAS project
eas init

# Configure project
eas build:configure
```

This creates/updates:
- `eas.json` - Build configuration
- `app.json` - Project ID added

## Step 5: Build for iOS

### Development Build (Testing)
```bash
eas build --platform ios --profile development
```

### Production Build (App Store)
```bash
eas build --platform ios --profile production
```

This will:
1. Prompt for Apple Developer credentials
2. Generate certificates and provisioning profiles
3. Build the app in the cloud
4. Provide download link when complete

## Step 6: Build for Android

### Preview Build (APK for Testing)
```bash
eas build --platform android --profile preview
```

### Production Build (Play Store)
```bash
eas build --platform android --profile production
```

This will:
1. Generate Android App Bundle (.aab)
2. Sign with your keystore
3. Provide download link when complete

## Step 7: Submit to App Store

### Prerequisites
1. Create app in App Store Connect:
   - Go to appstoreconnect.apple.com
   - Click "+" to create new app
   - Fill in app information
   - Set bundle ID to `com.cardrop.app`

2. Prepare App Store listing:
   - App name: CarDrop
   - Subtitle: Real Cars. Real Owners. Real Meets.
   - Description: Use `app-store/APP_STORE_DESCRIPTION.md`
   - Keywords: car, automotive, social, meet, club
   - Screenshots: Upload generated screenshots
   - Privacy Policy URL: https://cardrop.app/privacy
   - Support URL: https://cardrop.app/support

3. Submit build:
```bash
eas submit --platform ios --profile production
```

Or manually:
1. Download .ipa from EAS build
2. Upload to App Store Connect via Transporter app
3. Select build in App Store Connect
4. Submit for review

### App Review Information
- Use content from `app-store/REVIEW_NOTES.md`
- Provide test account credentials
- Explain Bluetooth and location usage
- Note demo mode for testing

## Step 8: Submit to Play Store

### Prerequisites
1. Create app in Google Play Console:
   - Go to play.google.com/console
   - Click "Create app"
   - Fill in app details
   - Set package name to `com.cardrop.app`

2. Prepare Play Store listing:
   - App name: CarDrop
   - Short description: Automotive social network for car enthusiasts
   - Full description: Use `app-store/APP_STORE_DESCRIPTION.md`
   - Screenshots: Upload generated screenshots
   - Feature graphic: Create 1024x500 banner
   - Privacy Policy URL: https://cardrop.app/privacy

3. Create service account:
   - Go to Google Cloud Console
   - Create service account
   - Download JSON key
   - Save as `google-service-account.json`
   - Grant access in Play Console

4. Submit build:
```bash
eas submit --platform android --profile production
```

Or manually:
1. Download .aab from EAS build
2. Upload to Play Console
3. Fill in release details
4. Submit for review

## Step 9: Testing

### iOS TestFlight
1. Build with `--profile preview`
2. Submit to TestFlight
3. Add internal testers
4. Distribute build
5. Collect feedback

### Android Internal Testing
1. Build with `--profile preview`
2. Upload to Play Console
3. Create internal testing track
4. Add testers via email
5. Distribute build

## Step 10: Post-Submission

### Monitor Review Status
- **iOS**: Check App Store Connect daily
- **Android**: Check Play Console daily
- Average review time: 1-3 days (iOS), 1-7 days (Android)

### Respond to Rejections
If rejected:
1. Read rejection reason carefully
2. Fix issues
3. Update app if needed
4. Resubmit with explanation

### Common Rejection Reasons
- Missing privacy policy
- Insufficient permission explanations
- Crashes or bugs
- Incomplete functionality
- Misleading screenshots

## Automated Build Script

Use the provided script for easier builds:

```bash
chmod +x scripts/build-and-submit.sh
./scripts/build-and-submit.sh
```

Options:
1. Build iOS (Production)
2. Build Android (Production)
3. Build Both (Production)
4. Build iOS (Preview/Internal)
5. Build Android APK (Preview/Internal)
6. Submit iOS to App Store
7. Submit Android to Play Store
8. Run Pre-flight Checks

## Troubleshooting

### Build Fails
- Check `eas build` logs
- Verify app.json configuration
- Ensure all dependencies are compatible
- Check for TypeScript errors

### Submission Fails
- Verify bundle identifiers match
- Check certificates are valid
- Ensure service account has permissions
- Review submission logs

### App Rejected
- Read rejection email carefully
- Check App Review Guidelines
- Update app and resubmit
- Contact App Review if unclear

## Maintenance

### Update App
1. Increment version in `app.json`
2. Update "What's New" in store listings
3. Build new version
4. Submit update

### Monitor Performance
- Check crash reports in App Store Connect / Play Console
- Monitor user reviews
- Track analytics
- Fix bugs promptly

## Resources

- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)
- [CarDrop Support](mailto:support@cardrop.app)

## Checklist

### Pre-Submission
- [ ] app.json configured
- [ ] eas.json configured
- [ ] Icons prepared (1024x1024)
- [ ] Screenshots generated
- [ ] Legal documents hosted
- [ ] Privacy policy URL active
- [ ] Support URL active
- [ ] Test account created
- [ ] App tested on real devices

### iOS Submission
- [ ] Apple Developer account active
- [ ] App created in App Store Connect
- [ ] Bundle ID registered
- [ ] Certificates generated
- [ ] Production build complete
- [ ] Screenshots uploaded
- [ ] App information filled
- [ ] Review notes provided
- [ ] Build submitted

### Android Submission
- [ ] Play Console account active
- [ ] App created in Play Console
- [ ] Package name registered
- [ ] Service account created
- [ ] Production build complete
- [ ] Screenshots uploaded
- [ ] Store listing filled
- [ ] Content rating complete
- [ ] Build submitted

---

**Need Help?**
- Email: support@cardrop.app
- Documentation: https://cardrop.app/docs
- Community: https://cardrop.app/community
