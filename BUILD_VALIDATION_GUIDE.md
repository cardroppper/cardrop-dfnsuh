
# Build Validation Guide

## The Problem You Encountered

The error `Can't find KSP version for Kotlin version '1.9.24'` occurs when Android native dependencies have incompatible Kotlin versions. This typically happens during the prebuild phase when Expo generates native Android code.

## The Solution

We've implemented:

1. **Updated Kotlin to 2.0.0** - Compatible with Expo 54 and modern Android tooling
2. **Configured Gradle 8.10.2** - Latest stable version for better build performance
3. **Added Build Validation Script** - Catches errors BEFORE you commit to a full build

## How to Use Build Validation

### Before Every Build

Run this command to validate your build configuration:

```bash
pnpm run validate:build
```

This will check:
- ✅ Kotlin/Gradle/Build Tools versions in app.json
- ✅ All required dependencies are installed
- ✅ Expo CLI is available
- ✅ Android prebuild configuration is valid
- ✅ No Kotlin/KSP version mismatches
- ✅ Clean build state

### Build Commands

```bash
# Validate and build locally
pnpm run build:android

# Validate and build with EAS (production)
pnpm run build:android:release

# Clean native folders and start fresh
pnpm run prebuild:clean
```

## What the Validation Script Does

The script simulates the build process WITHOUT actually building the APK. It:

1. **Reads your configuration** - Checks app.json for correct versions
2. **Verifies dependencies** - Ensures all packages are installed
3. **Tests prebuild** - Runs `expo prebuild --clean --no-install` to validate configuration
4. **Catches errors early** - Detects Kotlin/KSP, Gradle, and plugin errors
5. **Provides actionable feedback** - Tells you exactly what to fix

## Common Issues and Fixes

### Issue: "KSP version not found"
**Fix:** Already resolved! Kotlin 2.0.0 is configured in app.json

### Issue: "node_modules not found"
**Fix:** Run `pnpm install`

### Issue: "Prebuild configuration failed"
**Fix:** 
1. Run `pnpm run prebuild:clean`
2. Run `pnpm install`
3. Run `pnpm run validate:build` again

### Issue: "Native folders exist"
**Fix:** Run `pnpm run prebuild:clean` to remove android/ios folders

## Build Workflow

```
1. Make code changes
   ↓
2. Run: pnpm run validate:build
   ↓
3. Fix any errors reported
   ↓
4. Run validation again until it passes
   ↓
5. Run: pnpm run build:android (or build:android:release)
   ↓
6. Build succeeds! 🎉
```

## Why This Matters

**Before:** You'd run a full build (10-30 minutes), only to discover a Kotlin version error at the end.

**After:** Validation catches the error in ~30 seconds, you fix it, and THEN build with confidence.

## Configuration Details

### Current Versions (app.json)
- **Kotlin:** 2.0.0 (compatible with Expo 54)
- **Gradle:** 8.10.2 (latest stable)
- **Build Tools:** 35.0.0 (latest)

These versions are tested and compatible with:
- Expo SDK 54
- React Native 0.81.4
- All native modules in your project

## Troubleshooting

If validation fails:

1. **Read the error output carefully** - It tells you exactly what's wrong
2. **Check the "RECOMMENDED ACTIONS" section** - Follow the steps
3. **Run validation again** - Repeat until all checks pass
4. **Still stuck?** Check that:
   - You're using pnpm (not npm or yarn)
   - Node.js version is compatible (v18+)
   - No conflicting global packages

## Benefits

✅ **Catch errors early** - Before wasting time on full builds
✅ **Save time** - 30 seconds vs 30 minutes
✅ **Build confidence** - Know your config is valid before building
✅ **Clear feedback** - Actionable error messages
✅ **Automated checks** - No manual configuration verification

---

**Remember:** Always run `pnpm run validate:build` before building!
