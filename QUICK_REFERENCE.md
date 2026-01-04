
# CarDrop Quick Reference Guide

Quick reference for common production tasks and troubleshooting.

## 🔧 Common Commands

### Development
```bash
# Start development server
npm run dev

# Start on specific platform
npm run ios
npm run android
npm run web

# Clear cache and restart
npm run dev -- --clear
```

### Building
```bash
# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production

# Build for testing
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

### Database
```bash
# Run migrations
npx supabase db push

# Reset database (DANGER!)
npx supabase db reset

# Generate TypeScript types
npx supabase gen types typescript --project-id pukpbqbxmuipnwtywrmm > app/integrations/supabase/types.ts
```

## 🐛 Troubleshooting

### App Won't Start
```bash
# Clear all caches
rm -rf node_modules
rm -rf .expo
npm install
npm run dev -- --clear
```

### Database Connection Issues
1. Check Supabase URL in `app/integrations/supabase/client.ts`
2. Verify API key is correct
3. Check network connection
4. Verify RLS policies allow access

### Build Failures
1. Check EAS credentials: `eas credentials`
2. Verify app.json configuration
3. Check for TypeScript errors: `npx tsc --noEmit`
4. Review build logs in EAS dashboard

### Authentication Issues
1. Check Supabase Auth settings
2. Verify email templates are configured
3. Check RLS policies on profiles table
4. Verify trigger for profile creation exists

## 📊 Database Queries

### Check User Subscription
```sql
SELECT 
  p.username,
  us.subscription_status,
  p.free_premium
FROM profiles p
LEFT JOIN user_subscriptions us ON us.user_id = p.id
WHERE p.id = 'USER_ID';
```

### Grant Free Premium
```sql
UPDATE profiles
SET free_premium = true
WHERE id = 'USER_ID';
```

### View Recent Errors
```sql
-- If you have error logging table
SELECT *
FROM error_logs
ORDER BY created_at DESC
LIMIT 50;
```

### Check RLS Policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 🔐 Security

### Rotate API Keys
1. Generate new keys in Supabase dashboard
2. Update `app/integrations/supabase/client.ts`
3. Rebuild and redeploy app
4. Revoke old keys after 24 hours

### Check Security Advisors
```typescript
// Use Supabase CLI
npx supabase db lint

// Or check in dashboard:
// Project Settings > Database > Advisors
```

## 📱 Testing

### Test on Physical Device
```bash
# iOS
eas build --profile development --platform ios
# Install on device via TestFlight or direct install

# Android
eas build --profile development --platform android
# Install APK on device
```

### Test Offline Mode
1. Enable airplane mode on device
2. Try to use app features
3. Verify cached data loads
4. Verify error messages are user-friendly
5. Disable airplane mode
6. Verify data syncs

### Test Premium Features
```typescript
// Temporarily grant premium in code
const testPremium = true; // Set to true for testing

if (testPremium || isPremium) {
  // Show premium feature
}
```

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Database migrations applied
- [ ] Environment variables set

### Deploy to Production
```bash
# 1. Build production version
eas build --platform all --profile production

# 2. Submit to stores
eas submit --platform ios
eas submit --platform android

# 3. Monitor for issues
# Check Sentry/error tracking
# Monitor user reviews
# Watch analytics
```

## 📈 Monitoring

### Key Metrics to Watch
- **Crash-free rate**: Should be > 99%
- **App launch time**: Should be < 3 seconds
- **API response time**: Should be < 500ms
- **User retention**: Day 1, Day 7, Day 30
- **Conversion rate**: Free to premium

### Where to Check
- **Crashes**: Sentry dashboard
- **Performance**: Firebase Performance
- **Analytics**: Mixpanel/Amplitude
- **Reviews**: App Store Connect / Google Play Console
- **Server**: Supabase dashboard

## 🔄 Common Updates

### Update Dependencies
```bash
# Check for updates
npx expo install --check

# Update all dependencies
npx expo install --fix

# Update specific package
npm install package-name@latest
```

### Update Expo SDK
```bash
# Upgrade to latest Expo SDK
npx expo install expo@latest

# Update all Expo packages
npx expo install --fix
```

### Update Database Schema
```sql
-- 1. Create migration file
-- supabase/migrations/YYYYMMDDHHMMSS_description.sql

-- 2. Write migration
ALTER TABLE table_name ADD COLUMN new_column type;

-- 3. Apply migration
npx supabase db push
```

## 🆘 Emergency Procedures

### App is Crashing for All Users
1. Check Sentry for crash reports
2. Identify the issue
3. If critical, submit hotfix build immediately
4. If not critical, prepare fix for next update
5. Communicate with users via social media

### Database is Down
1. Check Supabase status page
2. Check your project dashboard
3. If Supabase issue, wait for resolution
4. If your issue, check RLS policies and queries
5. Enable maintenance mode if needed

### API Keys Leaked
1. Immediately revoke compromised keys
2. Generate new keys
3. Update app configuration
4. Submit emergency update
5. Monitor for unauthorized access
6. Notify users if data was compromised

## 📞 Support Contacts

### Supabase Support
- Dashboard: https://app.supabase.com
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

### Expo Support
- Dashboard: https://expo.dev
- Docs: https://docs.expo.dev
- Forums: https://forums.expo.dev

### App Store Support
- iOS: https://developer.apple.com/support
- Android: https://support.google.com/googleplay

## 💡 Pro Tips

1. **Always test on physical devices** before submitting to stores
2. **Keep a changelog** of all changes for each version
3. **Monitor crash reports daily** in the first week after launch
4. **Respond to user reviews** within 24 hours
5. **Have a rollback plan** for critical issues
6. **Test offline mode** thoroughly
7. **Use feature flags** for gradual rollouts
8. **Keep dependencies updated** monthly
9. **Run security audits** quarterly
10. **Backup database** before major changes

## 🎯 Performance Optimization

### Reduce App Size
```bash
# Remove unused dependencies
npm prune

# Optimize images
# Use WebP format
# Compress images before adding to project

# Enable Hermes (Android)
# Already enabled in app.json
```

### Improve Load Time
```typescript
// Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Preload critical data
useEffect(() => {
  preloadCriticalData();
}, []);

// Use React.memo for expensive renders
export default React.memo(ExpensiveComponent);
```

### Optimize Database Queries
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_table_column ON table(column);

-- Use EXPLAIN ANALYZE to check query performance
EXPLAIN ANALYZE
SELECT * FROM table WHERE condition;
```

---

**Keep this guide handy for quick reference during development and production! 📚**
