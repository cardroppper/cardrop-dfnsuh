
# 🚀 CarDrop - Quick Deployment Guide

## One-Page Reference for Launching CarDrop

---

## 🎯 Prerequisites

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure project (first time only)
eas build:configure
```

---

## 📱 Build Commands

### iOS Production Build
```bash
eas build --platform ios --profile production
```

### Android APK (Testing)
```bash
eas build --platform android --profile production
```

### Android AAB (Play Store)
```bash
eas build --platform android --profile production-aab
```

### Web Build
```bash
npm run build:web
# Output: dist/ folder
```

---

## 🔍 Check Build Status

```bash
# List all builds
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Watch build in real-time
eas build --platform ios --profile production --wait
```

---

## 📤 Submit to Stores

### iOS App Store
```bash
eas submit --platform ios --latest
```

### Google Play Store
```bash
eas submit --platform android --latest
```

---

## 🧪 Development & Testing

```bash
# Start dev server
npm run dev

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Clear cache and restart
npx expo start --clear
```

---

## 🔧 Troubleshooting

### Clear Everything
```bash
rm -rf node_modules .expo android/build android/app/build
npm install
```

### Metro Issues
```bash
npx expo start --clear
# or
npx react-native start --reset-cache
```

### Android Gradle Issues
```bash
cd android
./gradlew clean
cd ..
```

---

## 📋 Before First Build

### Update app.json
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID_HERE"
      }
    }
  }
}
```

### Update eas.json (iOS)
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

### Update eas.json (Android)
```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 🎨 Required Assets

### iOS
- App Icon: 1024x1024 PNG
- Screenshots: 6.5", 5.5", 12.9" iPad

### Android
- App Icon: 512x512 PNG
- Feature Graphic: 1024x500 PNG
- Screenshots: Phone and Tablet

### Both
- Privacy Policy URL
- Terms of Service URL
- Support Email
- App Description
- Keywords

---

## ✅ Pre-Launch Checklist

- [ ] EAS project configured
- [ ] App icons created
- [ ] Screenshots taken
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Support email set up
- [ ] App description written
- [ ] Test build successful
- [ ] Tested on physical devices
- [ ] All features working

---

## 🚀 Launch Day

1. **Build Production Versions**
   ```bash
   eas build --platform all --profile production
   ```

2. **Submit to Stores**
   ```bash
   eas submit --platform ios --latest
   eas submit --platform android --latest
   ```

3. **Deploy Web Version**
   ```bash
   npm run build:web
   # Upload dist/ to hosting provider
   ```

4. **Monitor**
   - Check build status
   - Watch for approval
   - Monitor crash reports
   - Respond to reviews

---

## 📊 Post-Launch

### Daily
- Check crash reports
- Monitor user reviews
- Respond to feedback

### Weekly
- Review analytics
- Plan updates
- Fix critical bugs

### Monthly
- Feature updates
- Performance optimization
- Security patches

---

## 🆘 Emergency Fixes

### Critical Bug Found

1. **Fix the code**
2. **Increment version**
   ```json
   {
     "version": "1.0.1"
   }
   ```
3. **Build hotfix**
   ```bash
   eas build --platform all --profile production
   ```
4. **Submit immediately**
   ```bash
   eas submit --platform all --latest
   ```

---

## 📞 Support Resources

- **Expo Docs**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **Expo Forums**: https://forums.expo.dev
- **Discord**: https://chat.expo.dev

---

## 🎉 You're Ready!

**CarDrop is production-ready. Time to launch!** 🚀

Remember:
- Start with internal testing
- Gather feedback
- Iterate quickly
- Launch is just the beginning!

**Good luck!** 🍀
