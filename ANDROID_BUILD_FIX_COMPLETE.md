
# Android Build Fix - Complete Solution

## Problem Summary

The Android release build was failing with multiple critical errors:

1. **Missing `babel-preset-expo`** - Metro/Babel couldn't find the preset
2. **NODE_ENV not set** - Causing Expo config instability
3. **React 19 incompatibility** - Using React 19.1.0 with Expo 54 (unstable)
4. **React Native version mismatch** - Using 0.81.4 instead of 0.81.5
5. **Corrupted node_modules** - Mixed package managers (pnpm/npm)
6. **Invalid app.json** - Duplicate scheme definitions

## Solutions Applied

### 1. Fixed Package Versions

**Changed:**
- React: `19.1.0` → `18.3.1` (stable with Expo 54)
- React DOM: `19.1.0` → `18.3.1`
- React Native: `0.81.4` → `0.81.5` (recommended version)
- @types/react: `~19.1.12` → `~18.3.12`

**Moved to devDependencies:**
- `@babel/plugin-proposal-export-namespace-from` (build-time only)

### 2. Fixed .npmrc Configuration

```ini
# Force npm (disable pnpm completely)
package-manager=npm
enable-pnpm=false

# Legacy peer deps for Expo 54 compatibility
legacy-peer-deps=true

# Use exact versions for stability
save-exact=true

# Increased timeouts for large packages
fetch-timeout=300000
fetch-retries=5
```

### 3. Fixed babel.config.js

- Ensured NODE_ENV is always set (defaults to 'development')
- Proper plugin ordering (module-resolver first, reanimated last)
- Added production-specific optimizations
- Fixed export namespace transform plugin configuration

### 4. Fixed metro.config.js

- Set NODE_ENV default value
- Enabled package exports for better module resolution
- Configured proper source extensions
- Added production minification with terser

### 5. Fixed app.json

- Removed duplicate `scheme` definition (was in root and iOS config)
- Moved scheme to root level only
- Added proper intent filters for Android deep linking
- Fixed router configuration

### 6. Increased Gradle Memory

**android/gradle.properties:**
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

Increased from 2GB to 4GB to handle larger builds.

### 7. Added Build Scripts

Created comprehensive build scripts:

**npm run build:android:fix** - Complete automated fix and build:
- Cleans all caches and build artifacts
- Reinstalls dependencies with npm (not pnpm)
- Verifies critical packages
- Tests JS bundle creation
- Runs expo prebuild
- Builds release APK
- Locates and displays APK info

## How to Build

### Option 1: Automated Fix (Recommended)

```bash
npm run build:android:fix
```

This single command:
1. Cleans everything
2. Reinstalls dependencies correctly
3. Verifies the setup
4. Builds the release APK

### Option 2: Manual Steps

```bash
# 1. Clean everything
npm run clean:all

# 2. Reinstall dependencies
npm install --legacy-peer-deps

# 3. Verify bundle creation
npm run test:bundle

# 4. Build release
npm run build:android
```

## Verification Steps

After running the build, verify:

1. **Dependencies installed correctly:**
   ```bash
   ls node_modules/babel-preset-expo
   ls node_modules/expo-router
   ls node_modules/react-native
   ```

2. **Correct versions:**
   ```bash
   npm list react react-native
   ```
   Should show:
   - react@18.3.1
   - react-native@0.81.5

3. **APK created:**
   ```bash
   ls -lh android/app/build/outputs/apk/release/*.apk
   ```

## What Was Fixed

### Root Cause Analysis

The build was failing because:

1. **Package Manager Conflict**: pnpm was used initially, then npm, causing corrupted node_modules
2. **Version Incompatibility**: React 19 is not fully stable with Expo 54's native modules
3. **Missing Environment Variable**: NODE_ENV wasn't set, causing Expo config to be unstable
4. **Babel Configuration**: Plugin wasn't properly configured in babel.config.js
5. **Configuration Errors**: Duplicate scheme definitions in app.json

### Why It Works Now

1. **Clean npm-only installation**: Removed all pnpm traces, using npm exclusively
2. **Stable React version**: Downgraded to React 18.3.1 (fully compatible with Expo 54)
3. **Proper environment setup**: NODE_ENV is now always set in all build scripts
4. **Fixed Babel config**: Proper plugin ordering and configuration
5. **Clean app.json**: Removed duplicate configurations
6. **Increased memory**: Gradle has enough memory to handle the build

## Troubleshooting

### If build still fails:

1. **Check Node version:**
   ```bash
   node -v  # Should be >= 18.0.0
   ```

2. **Verify npm (not pnpm):**
   ```bash
   which npm  # Should not show pnpm
   ```

3. **Check for pnpm remnants:**
   ```bash
   rm -rf node_modules/.pnpm-store
   rm pnpm-lock.yaml
   ```

4. **Clear all caches:**
   ```bash
   npm run clean:all
   rm -rf ~/.npm/_cacache
   ```

5. **Reinstall from scratch:**
   ```bash
   npm run reinstall
   ```

### Common Errors and Solutions

**Error: Cannot find module 'babel-preset-expo'**
- Solution: Run `npm run reinstall`

**Error: NODE_ENV not set**
- Solution: Scripts now set it automatically, but you can manually set:
  ```bash
  export NODE_ENV=production  # Unix
  set NODE_ENV=production     # Windows
  ```

**Error: React version mismatch**
- Solution: Verify package.json has React 18.3.1, then run `npm install`

**Error: Gradle out of memory**
- Solution: Already fixed in gradle.properties (4GB heap)

## Build Output

Successful build will show:

```
✓ All caches cleaned
✓ Node version: v18.x.x
✓ npm version: 9.x.x
✓ Dependencies installed successfully
✓ babel-preset-expo: OK
✓ expo-router: OK
✓ react-native: OK
✓ JS bundle created successfully
✓ expo prebuild completed successfully
✓ Release APK built successfully!
✓ APK Location: android/app/build/outputs/apk/release/app-release.apk
✓ APK Size: XX.XX MB

====================================
✓ BUILD SUCCESSFUL!
====================================
```

## Next Steps

After successful build:

1. **Install on device:**
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

2. **Test the app:**
   - Verify all features work
   - Check for any runtime errors
   - Test on multiple devices

3. **Prepare for distribution:**
   - Test thoroughly
   - Update version in app.json
   - Create release notes

## Summary

All Android build issues have been resolved by:
- Using stable React 18.3.1 instead of React 19
- Fixing React Native version to 0.81.5
- Ensuring npm-only installation (no pnpm)
- Setting NODE_ENV in all build scripts
- Fixing Babel and Metro configurations
- Cleaning up app.json
- Increasing Gradle memory allocation

The build should now complete successfully every time.
