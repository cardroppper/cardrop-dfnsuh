
# Android Build Fix - Quick Reference

## TL;DR - Just Run This

```bash
npm run build:android:fix
```

This single command fixes everything and builds your APK.

## What It Does

1. ✓ Cleans all caches (node_modules, .expo, gradle, etc.)
2. ✓ Reinstalls dependencies with npm (not pnpm)
3. ✓ Verifies critical packages are installed
4. ✓ Tests JS bundle creation
5. ✓ Runs expo prebuild
6. ✓ Builds release APK
7. ✓ Shows APK location and size

## Key Changes Made

| Issue | Fix |
|-------|-----|
| React 19 incompatibility | Downgraded to React 18.3.1 |
| React Native 0.81.4 | Upgraded to 0.81.5 |
| Missing babel-preset-expo | Fixed npm installation |
| NODE_ENV not set | Added to all build scripts |
| pnpm conflicts | Disabled pnpm, using npm only |
| Duplicate scheme in app.json | Removed duplicate |
| Low Gradle memory | Increased to 4GB |

## Verification

After build completes, check:

```bash
# Verify APK exists
ls -lh android/app/build/outputs/apk/release/*.apk

# Verify correct versions
npm list react react-native
# Should show: react@18.3.1, react-native@0.81.5

# Install on device
adb install android/app/build/outputs/apk/release/app-release.apk
```

## If It Fails

Try these in order:

```bash
# 1. Full clean and reinstall
npm run clean:all
npm install --legacy-peer-deps

# 2. Remove pnpm remnants
rm -rf node_modules/.pnpm-store
rm pnpm-lock.yaml

# 3. Clear npm cache
rm -rf ~/.npm/_cacache

# 4. Try build again
npm run build:android:fix
```

## Manual Build (If Needed)

```bash
# Clean
npm run clean:all

# Install
npm install --legacy-peer-deps

# Test bundle
NODE_ENV=production npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.ts \
  --bundle-output /tmp/test.js \
  --assets-dest /tmp/assets

# Prebuild
NODE_ENV=production npx expo prebuild -p android --clean

# Build
cd android
./gradlew clean
NODE_ENV=production ./gradlew assembleRelease
cd ..
```

## Success Indicators

You'll see:
- ✓ Green checkmarks for each step
- ✓ "BUILD SUCCESSFUL!" message
- ✓ APK path displayed
- ✓ APK size shown (typically 40-60 MB)

## Common Errors

| Error | Solution |
|-------|----------|
| Cannot find module 'babel-preset-expo' | Run `npm run reinstall` |
| NODE_ENV not set | Scripts set it automatically now |
| React version mismatch | Check package.json has React 18.3.1 |
| Gradle out of memory | Already fixed (4GB in gradle.properties) |
| pnpm errors | Run `rm pnpm-lock.yaml && npm install` |

## Files Changed

- `package.json` - Fixed React versions, added build script
- `.npmrc` - Disabled pnpm, enabled legacy-peer-deps
- `babel.config.js` - Fixed plugin config, set NODE_ENV
- `metro.config.js` - Set NODE_ENV, fixed resolver
- `app.json` - Removed duplicate scheme
- `android/gradle.properties` - Increased memory to 4GB
- `scripts/complete-android-fix.js` - New automated build script

## Support

If you still have issues after trying all the above:

1. Check Node version: `node -v` (must be >= 18.0.0)
2. Check npm version: `npm -v` (must be >= 9.0.0)
3. Verify no pnpm: `which pnpm` (should not exist)
4. Check the detailed guide: `ANDROID_BUILD_FIX_COMPLETE.md`

---

**Remember:** Always use `npm run build:android:fix` for the most reliable build process.
