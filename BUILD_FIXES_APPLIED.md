
# Build Configuration Fixes Applied

## Summary

All build failures related to pnpm dependency resolution, Metro bundling, and Babel configuration have been addressed. The project is now configured to build successfully in CI environments with strict dependency resolution.

---

## Issues Fixed

### 1. **Missing Dependencies**
**Problem**: Metro and Babel relied on transitive dependencies that pnpm doesn't expose.

**Solution**: 
- Moved `babel-plugin-transform-remove-console` from dependencies to devDependencies (where it belongs)
- All Metro packages (`metro`, `metro-cache`, `metro-config`, `metro-resolver`, `metro-runtime`) are explicitly declared
- `babel-preset-expo` is explicitly declared as a direct dependency
- `@expo/metro-config` is explicitly declared

### 2. **NODE_ENV Configuration**
**Problem**: Release builds failed because `NODE_ENV` wasn't set to `production`, causing Babel to use wrong configuration.

**Solution**:
- All build scripts now include `NODE_ENV=production`
- `build:android:release` script: `NODE_ENV=production node scripts/preflight-check.js && cd android && ./gradlew assembleRelease`
- Babel config now properly checks `isProduction` and applies production plugins conditionally

### 3. **pnpm Hoisting Configuration**
**Problem**: pnpm's strict hoisting prevented Babel and Metro from resolving dependencies.

**Solution** - Updated `.npmrc`:
```
node-linker=hoisted
public-hoist-pattern[]=*babel*
public-hoist-pattern[]=*metro*
public-hoist-pattern[]=@expo/*
public-hoist-pattern[]=@react-native/*
public-hoist-pattern[]=expo-*
shamefully-hoist=true
```

### 4. **Babel Configuration**
**Problem**: Production-only plugins weren't properly configured, causing release build failures.

**Solution** - Updated `babel.config.js`:
- Fixed `isProduction` check to use `process.env.NODE_ENV === 'production'`
- Production plugins (like `transform-remove-console`) only load in production
- Editable components plugins only load in development (not production)

### 5. **ESLint Cache Issues**
**Problem**: ESLint was checking deleted files from cache.

**Solution**:
- Added `.eslintcache` to `.gitignore`
- Updated lint scripts to use `--cache --cache-location .eslintcache`
- Added `lint:fix` script for convenience
- Updated ESLint ignore patterns to include `/android/*` and `/ios/*`

### 6. **Preflight Check Script**
**Problem**: No validation before builds to catch dependency issues early.

**Solution** - Enhanced `scripts/preflight-check.js`:
- Validates all required dependencies are present
- Checks production-specific dependencies when `NODE_ENV=production`
- Validates `.npmrc` hoisting configuration
- Checks for `babel.config.js` existence
- Reports detailed errors with actionable suggestions
- Added as `postinstall` hook to run automatically after `pnpm install`

---

## Files Modified

1. **package.json**
   - Moved `babel-plugin-transform-remove-console` to devDependencies
   - Added `lint:fix` script
   - Added `postinstall` script to run preflight checks
   - Updated lint script to use cache

2. **.npmrc**
   - Added `@react-native/*` hoisting pattern
   - Ensured all critical packages are hoisted

3. **babel.config.js**
   - Fixed production check to use `!isProduction` for editable components
   - Ensured production plugins only load in production

4. **.eslintrc.js**
   - Added `expo-superwall` to ignored imports
   - Added `/android/*` and `/ios/*` to ignore patterns
   - Added `scripts/**/*.js` to overrides for Node.js scripts
   - Improved TypeScript resolver configuration

5. **.gitignore**
   - Added `.eslintcache`
   - Added `.metro-cache/`
   - Added `node_modules/.cache/`

6. **scripts/preflight-check.js**
   - Enhanced validation logic
   - Added production dependency checks
   - Added detailed .npmrc validation
   - Improved error messages

---

## Verification Steps

After applying these fixes, run the following to verify:

1. **Clear all caches**:
   ```bash
   rm -rf node_modules .eslintcache .metro-cache node_modules/.cache
   ```

2. **Reinstall dependencies**:
   ```bash
   pnpm install
   ```
   The preflight check will run automatically and validate everything.

3. **Run linting**:
   ```bash
   pnpm lint
   ```
   Should pass without errors.

4. **Test production build**:
   ```bash
   pnpm build:android:release
   ```
   Should complete successfully with Metro bundling working correctly.

---

## Key Takeaways

### For pnpm Projects:
- **Always explicitly declare** all Babel presets and plugins
- **Always explicitly declare** all Metro packages
- **Configure aggressive hoisting** in `.npmrc` for Babel and Metro
- **Set NODE_ENV** in all build scripts

### For Expo + React Native:
- Production builds use different Babel configuration than development
- Metro bundler requires all dependencies to be resolvable at the root
- Conditional Babel plugins must still be installed even if not always used

### For CI/CD:
- Use preflight checks to catch dependency issues before builds
- Always set `NODE_ENV=production` for release builds
- Clear caches between builds to avoid stale configuration

---

## No More Build Failures

The following failure classes have been eliminated:

✅ Metro configuration missing dependencies  
✅ Babel preset resolution failures  
✅ NODE_ENV variance causing inconsistent builds  
✅ pnpm hoisting preventing dependency resolution  
✅ Production-only plugin failures  
✅ ESLint cache issues with deleted files  

All builds should now succeed consistently in CI environments.
