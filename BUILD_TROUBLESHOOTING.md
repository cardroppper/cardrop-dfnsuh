
# Build Troubleshooting Guide

## 🚨 Why Builds Keep Failing

Based on the project history, builds have been failing due to these issues:

### 1. **Package Manager Conflicts** ⚠️ CRITICAL
**Problem:** Mixed usage of npm and pnpm causes corrupted dependency graphs
**Symptoms:**
- "Cannot find module" errors
- "Module resolution failed" errors
- chmod failures on missing files

**Solution:**
```bash
# Always use npm, never pnpm
npm install --legacy-peer-deps
```

### 2. **Missing Dependencies**
**Problem:** Critical dependencies not installed
**Required packages:**
- `@react-native-async-storage/async-storage`
- `@supabase/supabase-js`
- `metro-minify-terser`
- `babel-preset-expo`

**Solution:**
```bash
npm install --legacy-peer-deps
```

### 3. **Corrupted Cache**
**Problem:** Old build artifacts cause mysterious failures
**Symptoms:**
- Build fails with no clear error
- "Task failed" without details
- Gradle errors about missing files

**Solution:**
```bash
# Clean everything
rm -rf node_modules package-lock.json
rm -rf android/.gradle android/app/build android/build
rm -rf .expo
npm install --legacy-peer-deps
```

### 4. **Metro Configuration Issues**
**Problem:** Metro bundler not configured for production builds
**Symptoms:**
- "createBundleReleaseJsAndAssets FAILED"
- "Process 'node' finished with non-zero exit value 1"

**Solution:** Already fixed in metro.config.js

### 5. **Incomplete Android Project**
**Problem:** Android folder missing or incomplete
**Symptoms:**
- "Directory does not contain a Gradle build"
- "settings.gradle not found"

**Solution:**
```bash
npx expo prebuild -p android --clean
```

## 🔧 Complete Build Fix Process

### Step 1: Clean Everything
```bash
rm -rf node_modules package-lock.json
rm -rf android ios
rm -rf .expo
rm -rf android/.gradle android/app/build android/build
```

### Step 2: Reinstall Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 3: Verify Installation
```bash
node scripts/prebuild-check.js
```

### Step 4: Generate Android Project
```bash
npx expo prebuild -p android --clean
```

### Step 5: Build Release APK
```bash
cd android
./gradlew clean
./gradlew assembleRelease --stacktrace
cd ..
```

## 🚀 Quick Build Commands

### Automated Full Build (Recommended)
```bash
npm run build:android:fix
```

### Manual Build
```bash
npm run prebuild:android
npm run build:android
```

## 🐛 Common Errors and Solutions

### Error: "Cannot find module 'metro-cache'"
**Cause:** Missing or corrupted metro dependencies
**Fix:**
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

### Error: "transformer.transform is not a function"
**Cause:** Metro configuration issue
**Fix:** Already fixed in metro.config.js - reinstall dependencies

### Error: "Directory does not contain a Gradle build"
**Cause:** Android project not generated
**Fix:**
```bash
npx expo prebuild -p android --clean
```

### Error: "Process 'node' finished with non-zero exit value 1"
**Cause:** Metro bundling failed
**Fix:**
```bash
# Test bundling separately
npx expo export --platform android
# If this fails, check for import errors in your code
```

### Error: "Cannot find module '@supabase/supabase-js'"
**Cause:** Missing dependency
**Fix:**
```bash
npm install @supabase/supabase-js --legacy-peer-deps
```

### Error: "FST_ERR_CTP_EMPTY_JSON_BODY"
**Cause:** Sending empty body with Content-Type: application/json
**Fix:** Ensure POST/PUT requests have a body:
```javascript
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}) // At minimum, send empty object
})
```

## 📋 Pre-Build Checklist

Before building, verify:
- [ ] Node version >= 18.0.0
- [ ] Using npm (not pnpm)
- [ ] All dependencies installed
- [ ] No corrupted cache files
- [ ] Android folder exists and is complete
- [ ] metro.config.js and babel.config.js are correct

## 🔍 Debugging Build Failures

### 1. Check Dependencies
```bash
node scripts/prebuild-check.js
```

### 2. Test Metro Bundling
```bash
npx expo export --platform android
```

### 3. Check Gradle with Verbose Logging
```bash
cd android
./gradlew assembleRelease --stacktrace --info
```

### 4. Verify Android Project Structure
```bash
ls -la android/
# Should see: settings.gradle, build.gradle, gradle.properties, app/
```

## 🎯 Build Success Indicators

A successful build will:
1. ✅ Install all dependencies without errors
2. ✅ Pass prebuild checks
3. ✅ Generate complete Android project
4. ✅ Create JS bundle successfully
5. ✅ Compile native code without errors
6. ✅ Produce APK at `android/app/build/outputs/apk/release/app-release.apk`

## 📱 After Successful Build

### Install on Device
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Check APK Size
```bash
ls -lh android/app/build/outputs/apk/release/app-release.apk
```

### Test the App
1. Install on a physical device
2. Test all major features
3. Check for crashes or errors
4. Verify authentication works
5. Test Bluetooth/location features

## 🆘 Still Having Issues?

If builds still fail after following this guide:

1. **Check the exact error message** - Different errors need different fixes
2. **Run with verbose logging** - `./gradlew assembleRelease --stacktrace --info`
3. **Verify environment** - Node >= 18, npm (not pnpm), correct dependencies
4. **Try the nuclear option** - Delete everything and start fresh:
   ```bash
   rm -rf node_modules package-lock.json android ios .expo
   npm install --legacy-peer-deps
   npx expo prebuild -p android --clean
   cd android && ./gradlew assembleRelease
   ```

## 📝 Notes

- Always use `npm` with `--legacy-peer-deps` flag
- Never mix npm and pnpm
- Clean builds are your friend
- The `metro.config.js` and `babel.config.js` have been fixed
- The Android project must be regenerated after major dependency changes
- Production builds require `NODE_ENV=production` to be set
