
# CarDrop - Build Instructions

## Prerequisites

- Node.js 18+ and npm 9+
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Expo CLI (installed via npm)

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Production Build (Android)

```bash
# Build release APK
npm run build:android

# Build release AAB (for Play Store)
npm run build:android:bundle
```

The build process will:
1. ✅ Validate environment (NODE_ENV, configs, dependencies)
2. ✅ Clean previous builds
3. ✅ Run Expo prebuild
4. ✅ Execute Gradle with proper environment
5. ✅ Create release APK/AAB

### Output Location

- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

## Build Scripts Explained

### `npm run build:android`
Complete build process for Android release APK:
- Validates environment
- Cleans old builds
- Runs prebuild
- Executes Gradle with NODE_ENV=production

### `npm run build:android:bundle`
Same as above but creates AAB instead of APK (for Play Store submission)

### `npm run validate`
Validates build environment without building:
- Checks NODE_ENV
- Verifies configs
- Validates dependencies
- Checks Android project structure

### `npm run clean:cache`
Removes build caches:
- node_modules/.cache
- .expo
- android/.gradle
- android/app/build
- android/build

### `npm run clean:all`
Complete clean (use when things are broken):
- Everything from clean:cache
- node_modules
- package-lock.json

## Troubleshooting

### Build Fails with NODE_ENV Error

**Error:**
```
The NODE_ENV environment variable is required but was not specified.
```

**Solution:**
This should not happen with the new build scripts. If it does:

```bash
# Validate environment
node scripts/validate-build-environment.js

# If validation fails, clean and rebuild
npm run clean:all
npm install
npm run build:android
```

### Build Fails at Metro Bundling

**Symptoms:**
- Build fails at `:app:createBundleReleaseJsAndAssets`
- Metro errors about missing modules

**Solution:**
```bash
# Clean Metro cache
npm run clean:cache

# Rebuild
npm run build:android
```

### Gradle Out of Memory

**Error:**
```
Expiring Daemon because JVM heap space is exhausted
```

**Solution:**
The gradle.properties is already configured with 4GB heap. If you still see this:

1. Close other applications
2. Restart your computer
3. Try building again

### Android Directory Missing

**Error:**
```
android directory does not exist
```

**Solution:**
```bash
# Run prebuild to generate Android project
npm run prebuild:android
```

## Build Validation

Before submitting to Play Store, validate your build:

```bash
# 1. Validate environment
npm run validate

# 2. Build release
npm run build:android:bundle

# 3. Test the APK on a real device
# Install: adb install android/app/build/outputs/apk/release/app-release.apk
```

## Environment Variables

The build process uses these environment variables:

- `NODE_ENV=production` - Required for release builds
- `EXPO_NO_TELEMETRY=1` - Disables Expo telemetry

These are automatically set by the build scripts.

## Build Process Flow

```
npm run build:android
    ↓
[1] Validate Environment
    - Check NODE_ENV
    - Verify configs
    - Check dependencies
    ↓
[2] Clean Previous Builds
    - Remove old artifacts
    - Clear caches
    ↓
[3] Expo Prebuild
    - Generate native projects
    - Configure Android
    ↓
[4] Gradle Build
    - Bundle JavaScript
    - Compile native code
    - Sign APK
    ↓
[5] Output
    - APK in android/app/build/outputs/apk/release/
```

## Success Indicators

When the build is working correctly, you'll see:

```
✅ [ensure-node-env] Set NODE_ENV=production
✅ [ensure-node-env] Environment validation complete
✅ [Metro Config] NODE_ENV is correctly set to: production
✅ [Babel Config] NODE_ENV is correctly set to: production
✅ Gradle build completed successfully!
```

## Common Issues

### Issue: "Cannot find module 'metro-cache'"

**Cause:** Old build scripts tried to import metro-cache directly

**Solution:** This is fixed in the new scripts. If you see this:
```bash
npm run clean:all
npm install
npm run build:android
```

### Issue: Build succeeds but app crashes on launch

**Cause:** Usually a native module configuration issue

**Solution:**
```bash
# Clean and rebuild native modules
npm run clean:cache
npm run prebuild:android
npm run build:android
```

### Issue: "Execution failed for task ':app:createBundleReleaseJsAndAssets'"

**Cause:** Metro bundler failed

**Solution:**
```bash
# Check Metro config
node scripts/validate-build-environment.js

# If validation passes, clean and rebuild
npm run clean:cache
npm run build:android
```

## Additional Resources

- [Expo Build Documentation](https://docs.expo.dev/build/setup/)
- [React Native Android Build](https://reactnative.dev/docs/signed-apk-android)
- [Gradle Documentation](https://docs.gradle.org/)

## Support

If you encounter issues not covered here:

1. Run `node scripts/validate-build-environment.js` for diagnostics
2. Check the console output for specific error messages
3. Review `BUILD_FIX_FINAL.md` for detailed technical information
4. Try `npm run clean:all && npm install` as a last resort
