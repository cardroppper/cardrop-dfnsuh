
# CarDrop Pricing & Paywall Implementation Guide

This guide explains how to set up real pricing, paywalls, and subscription management in the CarDrop app using Superwall.

## Overview

CarDrop uses **Superwall** for subscription management and paywall presentation. The implementation includes:

- **Monthly Premium Subscription**: $4.99/month
- **7-Day Free Trial**: New users can try premium features for free
- **Feature Gating**: Premium features are locked behind paywalls
- **Subscription Verification**: Server-side verification via Supabase
- **Multiple Subscription Sources**: Supports both Superwall subscriptions and free premium grants

## Architecture

### 1. Superwall Integration

The app is wrapped with `SuperwallProvider` in `app/_layout.tsx`:

```typescript
<SuperwallProvider
  apiKeys={{
    ios: "YOUR_IOS_API_KEY",
    android: "YOUR_ANDROID_API_KEY",
  }}
  onConfigurationError={(error) => {
    console.error("[Superwall] Configuration error:", error);
  }}
>
  {/* App content */}
</SuperwallProvider>
```

### 2. Subscription Management

The `useSubscription` hook manages subscription state and integrates with both Superwall and Supabase:

```typescript
const { subscription, loading } = useSubscription();

// subscription object contains:
// - isPremium: boolean
// - status: 'free' | 'premium'
// - subscriptionSource: 'free_premium' | 'superwall' | 'none'
// - startDate, endDate
```

### 3. Paywall Presentation

The `PaywallScreen` component uses Superwall's `usePlacement` hook to present paywalls:

```typescript
<PaywallScreen
  feature="premium_subscription"
  placementId="premium_features"
  onDismiss={() => setShowPaywall(false)}
/>
```

## Setup Steps

### Step 1: Create Superwall Account

1. Go to [superwall.com](https://superwall.com) and create an account
2. Create a new project for CarDrop
3. Get your API keys from the dashboard (iOS and Android)

### Step 2: Configure Products in App Stores

#### iOS (App Store Connect)

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app → Features → In-App Purchases
3. Create a new **Auto-Renewable Subscription**:
   - Product ID: `cardrop_premium_monthly`
   - Reference Name: `CarDrop Premium Monthly`
   - Subscription Group: Create new group "CarDrop Premium"
   - Duration: 1 Month
   - Price: $4.99 USD
4. Add a **Free Trial**: 7 days
5. Add localized descriptions and screenshots
6. Submit for review

#### Android (Google Play Console)

1. Log in to [Google Play Console](https://play.google.com/console)
2. Navigate to your app → Monetize → Subscriptions
3. Create a new subscription:
   - Product ID: `cardrop_premium_monthly`
   - Name: `CarDrop Premium Monthly`
   - Billing Period: 1 Month
   - Price: $4.99 USD
4. Add a **Free Trial**: 7 days
5. Add localized descriptions
6. Activate the subscription

### Step 3: Configure Superwall Dashboard

1. **Add Products**:
   - Go to Products section in Superwall dashboard
   - Add iOS product: `cardrop_premium_monthly`
   - Add Android product: `cardrop_premium_monthly`

2. **Create Paywalls**:
   - Go to Paywalls section
   - Create a new paywall named "Premium Features"
   - Design your paywall (or use the default CarDrop design)
   - Add product: `cardrop_premium_monthly`

3. **Create Placements**:
   - Go to Placements section
   - Create placement: `premium_features`
   - Assign the "Premium Features" paywall
   - Configure rules (show to all non-premium users)

4. **Configure Campaigns**:
   - Create a campaign for premium feature access
   - Set triggers (e.g., when user tries to access premium features)
   - Assign the `premium_features` placement

### Step 4: Update API Keys in Code

Replace the placeholder API keys in `app/_layout.tsx`:

```typescript
<SuperwallProvider
  apiKeys={{
    ios: "pk_YOUR_ACTUAL_IOS_KEY",
    android: "pk_YOUR_ACTUAL_ANDROID_KEY",
  }}
>
```

### Step 5: Test Subscriptions

#### iOS Testing

1. Create a **Sandbox Tester** account in App Store Connect
2. Sign out of your Apple ID on your test device
3. Run the app and try to subscribe
4. Sign in with your sandbox tester account when prompted
5. Complete the purchase (you won't be charged)

#### Android Testing

1. Add test accounts in Google Play Console → Settings → License Testing
2. Install the app via internal testing track
3. Try to subscribe (test accounts won't be charged)

## Premium Features

The following features are gated behind the premium subscription:

### 1. Always Searching
- **Description**: Continuous background BLE scanning
- **Implementation**: Enabled via `always_searching_enabled` profile field
- **Location**: Settings → Premium Features

### 2. 24-Hour Detection History
- **Description**: Access full detection history from last 24 hours
- **Implementation**: Query `beacon_detections` table with 24-hour filter
- **Location**: Nearby tab

### 3. Live Meet View
- **Description**: See all cars at club meets in real-time, even remotely
- **Implementation**: Uses `event_meet_detections` table and Supabase Realtime
- **Location**: Club event pages

### 4. Automatic Attendance
- **Description**: Auto check-in to events using geofencing
- **Implementation**: Uses `expo-location` geofencing
- **Location**: Settings → Premium Features

### 5. Unlimited Clubs
- **Description**: Join unlimited clubs (free users limited to 3)
- **Implementation**: Check club count before allowing join
- **Location**: Clubs tab

### 6. Advanced Analytics
- **Description**: Detailed stats and insights
- **Implementation**: Future feature
- **Location**: Profile/Stats page

## Feature Gating Pattern

To gate a feature behind premium, use this pattern:

```typescript
import { useSubscription } from '@/hooks/useSubscription';
import { PaywallScreen } from '@/components/PaywallScreen';

function MyFeature() {
  const { subscription } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const handlePremiumFeature = () => {
    if (!subscription.isPremium) {
      setShowPaywall(true);
      return;
    }
    
    // Execute premium feature
    console.log('Premium feature accessed');
  };

  return (
    <>
      <TouchableOpacity onPress={handlePremiumFeature}>
        <Text>Premium Feature</Text>
      </TouchableOpacity>

      <Modal visible={showPaywall}>
        <PaywallScreen
          feature="my_feature"
          onDismiss={() => setShowPaywall(false)}
        />
      </Modal>
    </>
  );
}
```

## Club Pricing (Future Implementation)

CarDrop also supports tiered pricing for clubs based on member count:

| Tier | Members | Price/Month |
|------|---------|-------------|
| Free | 1-10 | $0 |
| Tier 50 | 11-50 | $9.99 |
| Tier 100 | 51-100 | $19.99 |
| Tier 200 | 101-200 | $39.99 |
| Tier 500 | 201-500 | $79.99 |
| Custom | 500+ | Contact |

This is stored in the `clubs` table with `pricing_tier` and `monthly_price` fields.

## Subscription Verification

Superwall automatically handles subscription verification with Apple and Google. The subscription status is synced to your app via the `useUser` hook:

```typescript
const { subscriptionStatus } = useUser();

// subscriptionStatus.status can be:
// - "ACTIVE": User has active subscription
// - "INACTIVE": User does not have subscription
// - "UNKNOWN": Status not yet determined
```

## Analytics & Metrics

Track these key metrics in Superwall dashboard:

1. **Conversion Rate**: % of users who subscribe after seeing paywall
2. **Trial Conversion**: % of trial users who convert to paid
3. **Churn Rate**: % of users who cancel subscription
4. **Revenue Per User (RPU)**: Average revenue per user
5. **Lifetime Value (LTV)**: Predicted lifetime value of a user

## Promotional Offers

To create promotional offers:

1. **iOS**: Create promotional offers in App Store Connect
2. **Android**: Create promotional offers in Google Play Console
3. **Superwall**: Configure offer codes in dashboard
4. **App**: Use Superwall's promotional offer API

## Troubleshooting

### Paywall Not Showing

1. Check that Superwall is configured with correct API keys
2. Verify placement ID matches dashboard
3. Check campaign rules in Superwall dashboard
4. Look for errors in console logs

### Subscription Not Recognized

1. Verify user is identified with Superwall: `identify(userId)`
2. Check subscription status in Superwall dashboard
3. Ensure app has correct bundle ID / package name
4. Verify products are configured correctly in app stores

### Testing Issues

1. Use sandbox accounts for testing
2. Clear app data between tests
3. Check that test accounts are properly configured
4. Verify network connectivity

## Best Practices

1. **Always identify users**: Call `identify(userId)` when user logs in
2. **Handle errors gracefully**: Show user-friendly error messages
3. **Test thoroughly**: Test on both iOS and Android with sandbox accounts
4. **Monitor analytics**: Track conversion rates and adjust pricing/features
5. **A/B test paywalls**: Use Superwall's A/B testing to optimize conversion
6. **Provide value**: Ensure premium features provide clear value to users
7. **Clear communication**: Be transparent about pricing and what's included

## Support

For issues with:
- **Superwall**: Contact support@superwall.com
- **App Store**: Use App Store Connect support
- **Google Play**: Use Google Play Console support
- **CarDrop App**: Check logs and GitHub issues

## Next Steps

1. Set up Superwall account and get API keys
2. Configure products in App Store Connect and Google Play Console
3. Update API keys in `app/_layout.tsx`
4. Test subscriptions with sandbox accounts
5. Submit app for review with in-app purchases
6. Monitor analytics and optimize conversion rates
7. Implement additional premium features based on user feedback

## Additional Resources

- [Superwall Documentation](https://superwall.com/docs)
- [Apple In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing Guide](https://developer.android.com/google/play/billing)
- [Expo Superwall SDK](https://github.com/superwall/expo-superwall)
