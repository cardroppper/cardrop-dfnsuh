
# ✅ BUILD FIXES APPLIED - CarDrop Android Release Build

## 🔴 Critical Issues Fixed

### 1. ✅ NODE_ENV Environment Variable
**Problem:** NODE_ENV was not set during Android builds, causing Metro bundler failures.

**Solution:**
- Created `.env` and `.env.production` files with NODE_ENV configuration
- Updated all build scripts in `package.json` to explicitly set `NODE_ENV=production`
- Metro config now defaults to 'development' if NODE_ENV is not set

**Files Modified:**
- `.env` (created)
- `.env.production` (created)
- `package.json` (updated build scripts)
- `metro.config.js` (added NODE_ENV fallback)

### 2. ✅ Stripe Native Module Web Build Error
**Problem:** Web builds tried to import `@stripe/stripe-react-native` which contains native-only code.

**Solution:**
- Created platform-specific files: `useStripeClubPayment.ts` (web) and `useStripeClubPayment.native.ts` (iOS/Android)
- Web version shows "Not Available" alert instead of importing native Stripe SDK
- Metro config blocks native Stripe files from web builds

**Files Modified:**
- `hooks/useStripeClubPayment.ts` (web version - no native imports)
- `hooks/useStripeClubPayment.native.ts` (native version - uses Stripe SDK)
- `metro.config.js` (added blocklist for native Stripe files)

### 3. ✅ Expo Router Native Tabs CSS Missing
**Problem:** Web builds failed because `expo-router/unstable-native-tabs` tried to import a CSS file that doesn't exist.

**Solution:**
- Created platform-specific layouts: `_layout.ios.tsx`, `_layout.web.tsx`, `_layout.tsx`
- iOS layout conditionally imports native tabs only on iOS platform
- Web/Android layouts use standard Expo Router Tabs (no native tabs)
- Added try-catch around native tabs import to prevent crashes

**Files Modified:**
- `app/(tabs)/_layout.ios.tsx` (iOS-only, conditionally imports native tabs)
- `app/(tabs)/_layout.web.tsx` (web-specific, uses standard tabs)
- `app/(tabs)/_layout.tsx` (default for Android, uses standard tabs)

### 4. ✅ Expo Config Root-Level Scheme Warning
**Problem:** Root-level "expo" object had "scheme" key outside the proper location.

**Solution:**
- Moved `scheme: "cardrop"` to the correct location in `app.json`
- Removed duplicate/misplaced scheme configuration

**Files Modified:**
- `app.json` (fixed scheme location)

### 5. ✅ Package Manager Conflicts (pnpm vs npm)
**Problem:** Project had both `package-lock.json` and `pnpm-lock.yaml`, causing dependency resolution issues.

**Solution:**
- Deleted `pnpm-lock.yaml` to enforce npm usage
- Updated `.npmrc` to explicitly set `package-manager=npm`
- All scripts now use npm exclusively

**Files Modified:**
- `pnpm-lock.yaml` (deleted)
- `.npmrc` (added package-manager=npm)

## 🟢 Build Commands

### Clean Build (Recommended)
```bash
# Clean everything and rebuild
npm run clean:all
npm install --legacy-peer-deps

# Build Android release
npm run build:android
```

### Quick Build (If dependencies are already installed)
```bash
# Just build Android release
npm run build:android
```

### Build Android Bundle (AAB for Play Store)
```bash
npm run build:android:bundle
```

## 📋 Build Checklist

Before building, ensure:

- [ ] `NODE_ENV=production` is set in build scripts ✅
- [ ] No `pnpm-lock.yaml` file exists ✅
- [ ] `.env` and `.env.production` files exist ✅
- [ ] Platform-specific files are in place:
  - [ ] `hooks/useStripeClubPayment.ts` (web) ✅
  - [ ] `hooks/useStripeClubPayment.native.ts` (native) ✅
  - [ ] `app/(tabs)/_layout.ios.tsx` (iOS) ✅
  - [ ] `app/(tabs)/_layout.web.tsx` (web) ✅
  - [ ] `app/(tabs)/_layout.tsx` (Android/default) ✅

## 🔧 Metro Configuration

Metro is now configured to:
- Resolve `.mjs` and `.cjs` files for Supabase compatibility
- Block native-only Stripe modules from web builds
- Support platform-specific file extensions (`.ios.tsx`, `.android.tsx`, `.web.tsx`, `.native.tsx`)
- Minify production builds with Terser
- Default to `development` environment if NODE_ENV is not set

## 🚀 Next Steps

1. **Test the build:**
   ```bash
   npm run build:android
   ```

2. **If build succeeds:**
   - APK will be in: `android/app/build/outputs/apk/release/app-release.apk`
   - Install on device: `adb install android/app/build/outputs/apk/release/app-release.apk`

3. **If build fails:**
   - Check Metro bundler logs for JS errors
   - Verify NODE_ENV is set: `echo $NODE_ENV`
   - Ensure no pnpm files exist: `ls -la | grep pnpm`
   - Check platform-specific files are correct

## 📝 Technical Details

### Platform-Specific File Resolution Order

Metro resolves files in this order:
1. `.ios.tsx` (iOS only)
2. `.android.tsx` (Android only)
3. `.native.tsx` (iOS + Android)
4. `.web.tsx` (Web only)
5. `.tsx` (All platforms)

### Environment Variables

- `NODE_ENV`: Set to `production` for release builds, `development` for dev
- `EXPO_NO_TELEMETRY`: Disables Expo telemetry
- `EXPO_PUBLIC_*`: Public environment variables accessible in app code

### Build Output Locations

- **APK:** `android/app/build/outputs/apk/release/app-release.apk`
- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`
- **Logs:** `android/app/build/outputs/logs/`

## ⚠️ Common Issues

### Issue: "NODE_ENV is required but was not specified"
**Solution:** Ensure build scripts have `NODE_ENV=production` prefix

### Issue: "Cannot find module '@stripe/stripe-react-native'"
**Solution:** Check that platform-specific files exist and Metro blocklist is configured

### Issue: "Unable to resolve module native-tabs.module.css"
**Solution:** Ensure iOS layout conditionally imports native tabs, web layout uses standard tabs

### Issue: "PGRST116" errors in Supabase
**Solution:** This is normal - it means "no rows found". Code handles this gracefully.

## 🎯 Success Criteria

Build is successful when:
- ✅ Metro bundler completes without errors
- ✅ Gradle assembleRelease completes
- ✅ APK file is generated in `android/app/build/outputs/apk/release/`
- ✅ APK installs and runs on device without crashes
- ✅ All features work (auth, navigation, Stripe on native, etc.)

## 📞 Support

If issues persist:
1. Check Metro bundler logs for JS errors
2. Check Gradle logs for Android compilation errors
3. Verify all platform-specific files are in place
4. Ensure NODE_ENV is set correctly
5. Try clean build: `npm run clean:all && npm install --legacy-peer-deps && npm run build:android`
