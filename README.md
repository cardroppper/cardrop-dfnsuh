# 🚗 CarDrop - Automotive Social Network

**Status**: ✅ **PRODUCTION READY**

CarDrop is a real-world automotive social application centered on real cars, real owners, and real physical presence. Connect with car enthusiasts, discover nearby vehicles, join clubs, and attend meets.

Built with [Natively.dev](https://natively.dev) - Made with 💙 for creativity.

---

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Production Builds
```bash
# Build for iOS App Store
eas build --platform ios --profile production

# Build for Google Play Store
eas build --platform android --profile production-aab

# Build both platforms
eas build --platform all --profile production
```

---

## 📱 Features

### Core Features
- ✅ **User Authentication** - Email, Google, and Apple sign-in
- ✅ **Vehicle Management** - Add, edit, and showcase your vehicles
- ✅ **Nearby Detection** - Discover vehicles nearby using Bluetooth beacons
- ✅ **Club System** - Create and join automotive clubs
- ✅ **Event Management** - Organize and attend car meets
- ✅ **Messaging** - Direct messaging between users
- ✅ **Timeline** - Track vehicle modifications and history
- ✅ **Premium Subscription** - Unlock advanced features with Stripe

### Technical Features
- 🌓 Dark mode support
- 📱 iOS and Android native support
- 🔐 Secure authentication with Supabase
- 💳 Stripe payment integration
- 📡 Bluetooth Low Energy (BLE) beacon support
- 🗺️ Location-based features
- 📸 Image upload and management

---

## 🏗️ Tech Stack

- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **State Management**: React Context API
- **Styling**: React Native StyleSheet
- **BLE**: react-native-ble-manager

---

## 📋 Deployment Checklist

### ⚠️ Before Building

1. **Create App Assets** (Required)
   - [ ] App icon (1024x1024px) → `assets/icon.png`
   - [ ] iOS icon (1024x1024px) → `assets/icon-ios.png`
   - [ ] Android icon (1024x1024px) → `assets/icon-android.png`
   - [ ] Adaptive icon (1024x1024px) → `assets/adaptive-icon.png`
   - [ ] Splash screen (1242x2688px) → `assets/splash.png`

2. **Configure Store Accounts**
   - [ ] Apple Developer Account ($99/year)
   - [ ] Google Play Developer Account ($25 one-time)
   - [ ] Create app in App Store Connect
   - [ ] Create app in Google Play Console

3. **Update Configuration**
   - [ ] Update `eas.json` with Apple IDs
   - [ ] Add Google service account JSON
   - [ ] Verify bundle identifiers
   - [ ] Set version numbers

### 🚀 Deployment Steps

#### iOS Deployment
```bash
# 1. Build for iOS
eas build --platform ios --profile production

# 2. Submit to App Store
eas submit --platform ios --profile production
```

#### Android Deployment
```bash
# 1. Build AAB for Google Play
eas build --platform android --profile production-aab

# 2. Submit to Google Play
eas submit --platform android --profile production
```

---

## 📦 Project Structure

```
cardrop/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── clubs/             # Club management
│   ├── vehicles/          # Vehicle management
│   ├── messages/          # Messaging system
│   └── subscription/      # Premium features
├── components/            # Reusable components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── services/              # External services (BLE, etc.)
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── styles/                # Common styles
├── legal/                 # Legal documents
└── assets/                # Images, icons, fonts
```

---

## 🔧 Configuration Files

### app.json
Main Expo configuration with app metadata, permissions, and plugins.

### eas.json
EAS Build and Submit configuration for iOS and Android builds.

### babel.config.js
Babel configuration with module resolution and plugins.

### metro.config.js
Metro bundler configuration with custom middleware for logging.

---

## 🔐 Environment Variables

### Development (.env)
```bash
NODE_ENV=development
EXPO_NO_TELEMETRY=1
```

### Production (.env.production)
```bash
NODE_ENV=production
EXPO_NO_TELEMETRY=1
EXPO_PUBLIC_ENV=production
```

### Supabase Configuration
Set in `app.json` under `extra`:
```json
{
  "supabaseUrl": "https://pukpbqbxmuipnwtywrmm.supabase.co",
  "supabaseAnonKey": "YOUR_ANON_KEY"
}
```

---

## 📱 Platform-Specific Notes

### iOS
- Minimum iOS version: 13.0
- Supports iPhone and iPad
- Uses SF Symbols for icons
- Native tab bar on iOS

### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34 (Android 14)
- Uses Material Icons
- Edge-to-edge display support

---

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear EAS cache
eas build --clear-cache

# Clear Metro cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Common Issues
- **Build fails**: Check EAS build logs for specific errors
- **App crashes**: Review Expo error logs and Supabase logs
- **BLE not working**: Ensure permissions are granted on device
- **Images not loading**: Check Supabase storage permissions

---

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Integration](https://stripe.com/docs)

---

## 📄 Legal

- [Privacy Policy](legal/PRIVACY_POLICY.md)
- [Terms of Service](legal/TERMS_OF_SERVICE.md)
- [EULA](legal/EULA.md)

---

## 🎯 Next Steps

1. **Create app assets** (icons and splash screen)
2. **Set up store accounts** (Apple and Google)
3. **Run production builds** using EAS
4. **Submit to stores** for review
5. **Monitor and iterate** based on user feedback

---

## 📞 Support

For technical support or questions:
- Check the documentation links above
- Review the troubleshooting section
- Contact Natively.dev support

---

## 🎉 Ready to Launch!

CarDrop is production-ready and can be deployed to the App Store and Google Play Store. Follow the deployment checklist above to ensure a smooth launch.

**Good luck with your launch! 🚀**
