
# 🚀 Quick Build Guide - CarDrop Android Release

## ⚡ Fast Build (3 Steps)

### Step 1: Clean (if needed)
```bash
npm run clean:cache
```

### Step 2: Install Dependencies (if needed)
```bash
npm install --legacy-peer-deps
```

### Step 3: Build
```bash
npm run build:android
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔧 What Was Fixed

1. ✅ **NODE_ENV** - Now set in all build scripts
2. ✅ **Stripe Web Error** - Platform-specific files prevent native imports on web
3. ✅ **Native Tabs CSS** - iOS-only conditional import
4. ✅ **Package Manager** - Removed pnpm, using npm only
5. ✅ **Expo Config** - Fixed scheme location

---

## 📦 Build Commands

| Command | Description |
|---------|-------------|
| `npm run build:android` | Build APK for release |
| `npm run build:android:bundle` | Build AAB for Play Store |
| `npm run clean:cache` | Clear build cache |
| `npm run clean:all` | Nuclear clean (removes node_modules) |

---

## ✅ Pre-Build Checklist

- [ ] NODE_ENV is set in scripts
- [ ] No pnpm-lock.yaml file
- [ ] .env files exist
- [ ] Platform-specific files in place

---

## 🐛 Quick Troubleshooting

**Build fails at Metro bundler?**
→ Check NODE_ENV is set: `echo $NODE_ENV`

**Stripe import error on web?**
→ Verify `useStripeClubPayment.ts` and `.native.ts` exist

**Native tabs CSS error?**
→ Check `_layout.ios.tsx` conditionally imports native tabs

**Dependency conflicts?**
→ Delete pnpm-lock.yaml: `rm pnpm-lock.yaml`

---

## 🎯 Success = APK Generated

If you see:
```
BUILD SUCCESSFUL in Xs
```

And file exists:
```
android/app/build/outputs/apk/release/app-release.apk
```

**You're done! 🎉**

Install on device:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```
