
# CarDrop Troubleshooting Guide

## Common Issues and Solutions

### Build Issues

#### "Cannot find module '@react-native-async-storage/async-storage'"
**Solution**: Dependencies have been installed. If issue persists:
```bash
rm -rf node_modules
npm install
```

#### "Cannot find module '@supabase/supabase-js'"
**Solution**: Dependencies have been installed. If issue persists:
```bash
rm -rf node_modules
npm install
```

#### Metro bundler errors
**Solution**: Clear Metro cache:
```bash
npx expo start --clear
```

### Runtime Issues

#### App crashes on startup
**Possible causes**:
1. Supabase configuration missing
2. AsyncStorage not initialized
3. Network connectivity issues

**Solution**: Check logs and verify Supabase URL/keys are correct in `app/integrations/supabase/client.ts`

#### Icons showing as "?" on Android
**Cause**: Invalid Material icon names

**Solution**: All icon names have been fixed to use valid Material Design icons:
- `location-on` (not `near-me`)
- `group` (not `groups`)
- `directions-car` (not `car`)
- `person` (not `profile`)
- `settings` (not `cog`)

#### Bluetooth not working
**Possible causes**:
1. Permissions not granted
2. Bluetooth not enabled on device
3. Running on web (not supported)

**Solution**: 
- Ensure permissions are granted in device settings
- Test on physical device (not simulator)
- Check that Bluetooth is enabled

#### Images not loading
**Possible causes**:
1. Network connectivity
2. Invalid image URLs
3. CORS issues (web only)

**Solution**: Check network logs and verify image URLs are accessible

### Platform-Specific Issues

#### iOS

**Issue**: App doesn't request permissions
**Solution**: Permissions are configured in app.json. Rebuild with:
```bash
npx expo prebuild --clean
```

**Issue**: Native tabs not working
**Solution**: Ensure `expo-router/unstable-native-tabs` is installed and iOS-specific layout file exists

#### Android

**Issue**: App crashes on startup
**Solution**: Check that all permissions are declared in app.json and rebuild:
```bash
npx expo prebuild --clean
```

**Issue**: Status bar overlaps content
**Solution**: Top padding of 48px has been added to Android screens

#### Web

**Issue**: Bluetooth features not working
**Solution**: This is expected. Bluetooth is not supported on web. The app displays appropriate messages.

**Issue**: Maps not working
**Solution**: react-native-maps is not supported on web. The app displays appropriate messages.

### Development Issues

#### Hot reload not working
**Solution**: Restart the dev server:
```bash
npx expo start --clear
```

#### TypeScript errors
**Solution**: Ensure tsconfig.json is valid (trailing comma has been fixed)

#### ESLint errors
**Solution**: Run auto-fix:
```bash
npm run lint -- --fix
```

### Database Issues

#### "Failed to load profile"
**Possible causes**:
1. Profile doesn't exist in database
2. Network connectivity
3. Supabase configuration incorrect

**Solution**: 
1. Check Supabase dashboard to verify profile exists
2. Verify network connectivity
3. Check Supabase URL and keys

#### "Authentication failed"
**Possible causes**:
1. Invalid credentials
2. Rate limiting
3. Network connectivity

**Solution**:
1. Verify credentials are correct
2. Wait if rate limited (error message will indicate)
3. Check network connectivity

### Performance Issues

#### Slow app startup
**Solution**: 
1. Ensure production build is optimized
2. Check for unnecessary re-renders
3. Verify images are properly optimized

#### Laggy scrolling
**Solution**:
1. Ensure FlatList is used for long lists
2. Implement proper key extraction
3. Use memoization where appropriate

## Getting Help

### Logs
Check logs for detailed error information:
- **iOS**: Xcode console or `npx expo start --ios`
- **Android**: Android Studio Logcat or `npx expo start --android`
- **Web**: Browser console

### Debug Mode
Enable debug mode by setting environment variable:
```bash
EXPO_PUBLIC_ENABLE_DEBUG=true npx expo start
```

### Common Log Messages

**"[Auth] Initializing authentication..."**
- Normal startup message

**"[Auth] Session found, loading user data..."**
- User is logged in

**"[Auth] No active session found"**
- User needs to log in

**"[TabLayout] Not authenticated, redirecting to auth"**
- Normal redirect to login screen

**"[Supabase] Client initialized successfully"**
- Database connection established

### Reset App State

If app is in a bad state, reset it:
```bash
# Clear Metro cache
npx expo start --clear

# Clear iOS simulator
xcrun simctl erase all

# Clear Android emulator
adb shell pm clear com.cardrop.CarDrop

# Clear web storage
# Open browser dev tools > Application > Clear storage
```

## Still Having Issues?

1. Check that all dependencies are installed: `npm install`
2. Clear all caches: `npx expo start --clear`
3. Rebuild native code: `npx expo prebuild --clean`
4. Check Supabase dashboard for database issues
5. Verify all configuration files are valid
6. Test on a different device/platform

## Known Working Configuration

- **Node**: 18.x or higher
- **npm**: 9.x or higher
- **Expo**: ~54.0.1
- **React Native**: 0.81.4
- **iOS**: 13.0+
- **Android**: API 21+ (Android 5.0+)
