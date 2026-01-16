
# 🚀 Quick Deploy Reference - CarDrop Android

## ⚡ Fast Build (One Command)

```bash
# Validate, clean, and build in one go
node scripts/pre-build-android.js && npm run build:android
```

## 🔧 Build Commands

```bash
# APK (for direct installation)
npm run build:android

# AAB (for Play Store)
npm run build:android:bundle

# Clean and rebuild
npm run clean:cache && npm run build:android
```

## ✅ Pre-Build Checklist

```bash
# 1. Validate environment
node scripts/validate-environment.js

# 2. Check NODE_ENV
echo $NODE_ENV  # Should be: production

# 3. Verify no pnpm lock
ls pnpm-lock.yaml  # Should not exist

# 4. Check dependencies
npm list cross-env  # Should be installed
```

## 🐛 Quick Fixes

### Build fails with NODE_ENV error
```bash
export NODE_ENV=production
npm run build:android
```

### Build fails with cache issues
```bash
npm run clean:cache
npm install --legacy-peer-deps
npm run build:android
```

### Build fails with memory error
```bash
# Edit android/gradle.properties
# Change: org.gradle.jvmargs=-Xmx4096m
# To:     org.gradle.jvmargs=-Xmx6144m
```

### Build fails with metro-cache error
```bash
# Check metro.config.js has NO direct metro-cache import
# Metro uses built-in caching automatically
npm run clean:cache
npm run build:android
```

## 📍 Build Output Locations

```
APK:  android/app/build/outputs/apk/release/app-release.apk
AAB:  android/app/build/outputs/bundle/release/app-release.aab
Logs: .natively/expo_server.log
```

## 🧪 Test Build

```bash
# Install on connected device
adb install android/app/build/outputs/apk/release/app-release.apk

# Check if device is connected
adb devices
```

## 🔍 Debug Build Issues

```bash
# Detailed Gradle output
cd android
./gradlew assembleRelease --stacktrace --info

# Check Metro bundler
npm run test:bundle

# Validate all configs
node scripts/validate-environment.js
```

## 📊 Build Status Indicators

✅ **Ready to Build:**
- NODE_ENV=production
- No pnpm-lock.yaml
- node_modules installed
- Validation passes

❌ **Not Ready:**
- NODE_ENV not set
- pnpm-lock.yaml exists
- Dependencies missing
- Validation fails

## 🎯 Common Build Times

- **Clean build:** 5-10 minutes
- **Incremental build:** 2-5 minutes
- **Prebuild only:** 1-2 minutes

## 💡 Pro Tips

1. **Always validate first:** `node scripts/validate-environment.js`
2. **Clean cache if unsure:** `npm run clean:cache`
3. **Use AAB for Play Store:** `npm run build:android:bundle`
4. **Check logs on failure:** `.natively/expo_server.log`
5. **Increase memory if OOM:** Edit `android/gradle.properties`

## 🆘 Emergency Reset

```bash
# Nuclear option - reset everything
npm run clean:all
rm -rf android ios
npm install --legacy-peer-deps
npm run build:android
```

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting.
