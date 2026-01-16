
# CarDrop Android Deployment Guide

## 🚨 Critical Fixes Applied

This guide documents all fixes applied to resolve Android build deployment errors.

### Root Causes Identified

1. **NODE_ENV not set early enough** - Metro and Babel were starting before NODE_ENV was configured
2. **metro-cache import issues** - Direct imports of metro-cache were causing failures
3. **Expo config structure** - The `scheme` property was incorrectly placed
4. **Package manager conflicts** - pnpm-lock.yaml was conflicting with npm usage
5. **Insufficient memory allocation** - Gradle needed more heap space for large builds

### Fixes Applied

#### 1. Environment Variable Configuration

**Created/Updated Files:**
- `.env` - Base environment variables
- `.env.local` - Local development overrides
- `.env.production` - Production environment variables

All files now explicitly set `NODE_ENV` before any build process starts.

#### 2. Metro Configuration (`metro.config.js`)

**Changes:**
- Added NODE_ENV validation at the top of the file (before any imports)
- Removed any direct `metro-cache` imports
- Metro now uses built-in caching automatically via `node_modules/.cache/metro`
- Added logging to confirm NODE_ENV is set

#### 3. Babel Configuration (`babel.config.js`)

**Changes:**
- Added NODE_ENV validation at the top of the file
- Ensured NODE_ENV is set before Babel processes anything
- Added logging to confirm environment

#### 4. Expo Configuration (`app.json`)

**Changes:**
- Moved `scheme` from root level to `expo.scheme` (correct placement)
- This fixes the "Root-level expo object found" warning

#### 5. Package Manager Configuration

**Changes:**
- Deleted `pnpm-lock.yaml` to prevent conflicts
- Updated `.npmrc` with better timeout and retry settings
- Ensured all scripts use `npm` exclusively

#### 6. Gradle Configuration (`android/gradle.properties`)

**Changes:**
- Increased JVM heap size: `-Xmx4096m` (was 2048m)
- Increased MetaspaceSize: `-XX:MaxMetaspaceSize=1024m` (was 512m)
- Added heap dump on OOM for debugging
- Enabled Gradle daemon and caching for better performance
- Disabled minify and resource shrinking to avoid potential issues

#### 7. Build Scripts (`package.json`)

**Changes:**
- All build scripts now use `cross-env NODE_ENV=production`
- Added `GRADLE_OPTS` to increase memory allocation
- Added `--no-daemon` and `--stacktrace` flags for better error reporting
- Updated build commands to ensure NODE_ENV is set early

## 🚀 How to Build

### Prerequisites

1. **Node.js**: Version 18 or higher
2. **npm**: Version 9 or higher
3. **Java JDK**: Version 17 (for Android builds)
4. **Android SDK**: Installed via Android Studio

### Step-by-Step Build Process

#### Option 1: Automated Build (Recommended)

```bash
# Run pre-build validation and preparation
node scripts/pre-build-android.js

# Build the APK
npm run build:android

# Or build an AAB (Android App Bundle)
npm run build:android:bundle
```

#### Option 2: Manual Build

```bash
# 1. Validate environment
node scripts/validate-environment.js

# 2. Clean cache
npm run clean:cache

# 3. Install dependencies (if needed)
npm install --legacy-peer-deps

# 4. Run prebuild
cross-env NODE_ENV=production expo prebuild -p android --clean

# 5. Build the APK
cd android
cross-env NODE_ENV=production GRADLE_OPTS="-Dorg.gradle.jvmargs=-Xmx4096m" ./gradlew assembleRelease --no-daemon --stacktrace
```

### Build Output Locations

- **APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

## 🔍 Troubleshooting

### If Build Still Fails

1. **Check NODE_ENV is set:**
   ```bash
   echo $NODE_ENV
   # Should output: production
   ```

2. **Validate environment:**
   ```bash
   node scripts/validate-environment.js
   ```

3. **Clean everything and rebuild:**
   ```bash
   npm run clean:all
   npm install --legacy-peer-deps
   npm run build:android
   ```

4. **Check Gradle logs:**
   ```bash
   cd android
   ./gradlew assembleRelease --stacktrace --info
   ```

### Common Errors and Solutions

#### Error: "NODE_ENV is required but was not specified"

**Solution:** Ensure NODE_ENV is set before running any build command:
```bash
export NODE_ENV=production
npm run build:android
```

#### Error: "Cannot find module 'metro-cache'"

**Solution:** This should be fixed now. Metro uses built-in caching. If you still see this:
1. Check `metro.config.js` doesn't have `require('metro-cache')`
2. Run `npm run clean:cache`
3. Rebuild

#### Error: "Root-level expo object found"

**Solution:** This is fixed in the new `app.json`. The `scheme` property is now correctly placed under `expo.scheme`.

#### Error: "OutOfMemoryError" during Gradle build

**Solution:** The new `gradle.properties` allocates 4GB of heap space. If you still get OOM:
1. Close other applications
2. Increase heap size further in `android/gradle.properties`:
   ```properties
   org.gradle.jvmargs=-Xmx6144m -XX:MaxMetaspaceSize=1536m
   ```

#### Error: "pnpm-lock.yaml conflicts"

**Solution:** Delete the file:
```bash
rm pnpm-lock.yaml
npm install --legacy-peer-deps
```

## ✅ Verification Checklist

Before deploying, verify:

- [ ] `node scripts/validate-environment.js` passes
- [ ] NODE_ENV is set to `production`
- [ ] No `pnpm-lock.yaml` file exists
- [ ] `node_modules` is installed with npm
- [ ] Build completes without errors
- [ ] APK/AAB file is generated
- [ ] App installs and runs on a physical device

## 📝 Build Logs

Build logs are stored in:
- Metro bundler: `.natively/expo_server.log`
- App console: `.natively/app_console.log`
- Gradle: `android/build/reports/`

## 🎯 Next Steps

After successful build:

1. **Test the APK:**
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

2. **Upload to Play Store:**
   - Use the AAB file for Play Store submission
   - Follow Google Play Console upload process

3. **Monitor for issues:**
   - Check crash reports
   - Monitor user feedback
   - Review performance metrics

## 🔐 Security Notes

- The release keystore is located at `android/app/release.keystore`
- Keystore password is configured in `android/app/build.gradle`
- **Never commit keystore files to version control in production**
- For production, use environment variables for keystore credentials

## 📚 Additional Resources

- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Android Build](https://reactnative.dev/docs/signed-apk-android)
- [Gradle Build Configuration](https://developer.android.com/studio/build)
- [Metro Bundler Configuration](https://facebook.github.io/metro/docs/configuration)

---

**Last Updated:** $(date)
**Build System:** Expo 54 + React Native 0.81.5
**Target:** Android Release Build
