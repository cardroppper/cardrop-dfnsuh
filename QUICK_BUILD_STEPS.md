
# Quick Build Steps - Android Release

## Prerequisites
- Node.js 18+ installed
- Android SDK installed
- Java 17+ installed

## Build Commands (Copy-Paste Ready)

### 1️⃣ Clean Everything
```bash
npm run clean:all
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Build APK
```bash
npm run build:android
```

**That's it!** 🎉

## Output Location
```
android/app/build/outputs/apk/release/app-release.apk
```

## If Build Fails

### Try This First:
```bash
npm run clean:all
rm -rf pnpm-lock.yaml
npm install
npm run build:android
```

### Still Failing? Test JS Bundle:
```bash
npm run test:bundle
```

### Nuclear Option:
```bash
rm -rf node_modules android ios .expo
npm install
npm run build:android
```

## Build Time
- First build: 10-18 minutes
- Subsequent builds: 5-10 minutes

## Common Errors Fixed

✅ "Cannot find module @babel/plugin-transform-export-namespace-from"
✅ "Failed to resolve plugin for module expo-router"
✅ "Directory does not contain a Gradle build"
✅ "Process 'node' finished with non-zero exit value 1"
✅ "WARN Moving packages installed by a different package manager"
✅ "Root-level expo object found"

## What Was Fixed

1. ✅ Removed pnpm (using npm only)
2. ✅ Fixed Babel configuration
3. ✅ Fixed app.json structure
4. ✅ Added Metro minifier config
5. ✅ Added clean build scripts
6. ✅ Fixed dependency graph

## Success Message
```
BUILD SUCCESSFUL in Xs
```

## Need Help?
Check BUILD_FIX_COMPLETE.md for detailed explanation.
