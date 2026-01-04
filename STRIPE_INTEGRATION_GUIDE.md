
# Stripe Integration Guide for CarDrop

## Overview

CarDrop now uses **Stripe** for payment processing, supporting both:
- **Premium User Subscriptions** - Monthly/yearly recurring subscriptions for premium features
- **Club Membership Payments** - Tiered pricing based on club size

## Architecture

### Frontend Components

1. **StripeProvider** (`contexts/StripeContext.tsx`)
   - Wraps the app with Stripe React Native provider
   - Handles publishable key initialization
   - Configures URL schemes for payment redirects

2. **Hooks**
   - `useStripeSubscription` - Manages premium user subscriptions
   - `useStripeClubPayment` - Handles club payment flows
   - `useSubscription` - Wrapper that uses Stripe on native, fallback on web

3. **Screens**
   - `app/subscription/premium.tsx` - Premium subscription management
   - Updated `app/(tabs)/settings.tsx` - Subscription status and management
   - Updated `app/(tabs)/clubs.tsx` - Club payment integration

### Database Schema

Tables created via migration `add_stripe_tables`:

- **stripe_customers** - Maps users to Stripe customer IDs
- **stripe_subscriptions** - Tracks premium user subscriptions
- **stripe_club_subscriptions** - Tracks club payment subscriptions
- **stripe_payment_intents** - Records one-time payments

All tables have RLS policies enabled for security.

## Backend Integration Required

The frontend is ready, but you need to implement these backend Edge Functions:

### 1. Create Subscription Payment Intent

**Endpoint**: `POST /stripe/create-subscription`

**Purpose**: Creates a Stripe subscription for premium users

**Request Body**:
```json
{
  "priceId": "price_xxx",
  "userId": "uuid"
}
```

**Response**:
```json
{
  "paymentIntent": "pi_xxx",
  "ephemeralKey": "ek_xxx",
  "customer": "cus_xxx"
}
```

**Implementation Steps**:
1. Get or create Stripe customer for user
2. Create subscription with the specified price ID
3. Return payment intent client secret and ephemeral key
4. Store subscription in `stripe_subscriptions` table

### 2. Create Club Payment Intent

**Endpoint**: `POST /stripe/create-club-subscription`

**Purpose**: Creates a Stripe subscription for club payments

**Request Body**:
```json
{
  "clubId": "uuid",
  "memberCount": 50,
  "userId": "uuid"
}
```

**Response**:
```json
{
  "paymentIntent": "pi_xxx",
  "ephemeralKey": "ek_xxx",
  "customer": "cus_xxx"
}
```

**Implementation Steps**:
1. Calculate pricing based on member count
2. Get or create appropriate Stripe price
3. Create subscription
4. Store in `stripe_club_subscriptions` table

### 3. Cancel Subscription

**Endpoint**: `POST /stripe/cancel-subscription`

**Purpose**: Cancels a user's premium subscription

**Request Body**:
```json
{
  "userId": "uuid"
}
```

**Implementation Steps**:
1. Find active subscription for user
2. Cancel at period end in Stripe
3. Update `stripe_subscriptions` table

### 4. Reactivate Subscription

**Endpoint**: `POST /stripe/reactivate-subscription`

**Purpose**: Reactivates a canceled subscription

**Request Body**:
```json
{
  "userId": "uuid"
}
```

**Implementation Steps**:
1. Find subscription marked for cancellation
2. Remove cancellation in Stripe
3. Update `stripe_subscriptions` table

### 5. Webhook Handler

**Endpoint**: `POST /stripe/webhook`

**Purpose**: Handles Stripe webhook events

**Events to Handle**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Implementation Steps**:
1. Verify webhook signature
2. Update database based on event type
3. Send notifications to users if needed

## Stripe Dashboard Setup

### 1. Create Products and Prices

**Premium Subscription**:
- Product: "CarDrop Premium"
- Prices:
  - Monthly: $9.99/month (ID: `price_monthly_xxx`)
  - Yearly: $99.99/year (ID: `price_yearly_xxx`)

**Club Subscriptions**:
- Product: "CarDrop Club Membership"
- Prices:
  - Tier 50: $15/month
  - Tier 100: $25/month
  - Tier 200: $40/month
  - Tier 500: $75/month
  - Custom: Dynamic pricing via API

### 2. Configure Webhooks

Add webhook endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`

Select events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 3. Get API Keys

- **Publishable Key**: Update in `contexts/StripeContext.tsx`
- **Secret Key**: Store in Supabase Edge Function secrets

## Apple Pay Setup (iOS)

1. Create Apple Merchant ID at https://developer.apple.com
2. Update `merchantIdentifier` in `app.json`:
   ```json
   {
     "merchantIdentifier": "merchant.com.cardrop.app"
   }
   ```
3. Configure in Stripe Dashboard under Settings > Payment Methods > Apple Pay

## Google Pay Setup (Android)

1. Already enabled in `app.json` via config plugin
2. Configure in Stripe Dashboard under Settings > Payment Methods > Google Pay
3. Add your app package name: `com.cardrop.app`

## Testing

### Test Cards

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### Test Mode

The app uses test mode by default. Switch to live mode by:
1. Updating publishable key in `StripeContext.tsx`
2. Updating secret key in backend Edge Functions
3. Using live price IDs

## Premium Features

When `isPremium` is true, users get:
- ✅ Unlimited vehicle profiles
- ✅ Unlimited photo uploads
- ✅ Priority notifications
- ✅ Join unlimited clubs
- ✅ Premium badge on profile
- ✅ Advanced analytics

## Club Pricing Tiers

| Members | Monthly Cost | Tier |
|---------|-------------|------|
| 0-15 | Free | Free |
| 16-50 | $15 | Tier 50 |
| 51-100 | $25 | Tier 100 |
| 101-200 | $40 | Tier 200 |
| 201-500 | $75 | Tier 500 |
| 500+ | $0.15/member | Custom |

## Security Considerations

1. **Never expose secret keys** - Only use publishable keys in frontend
2. **Verify webhooks** - Always verify Stripe webhook signatures
3. **RLS policies** - All Stripe tables have Row Level Security enabled
4. **HTTPS only** - All Stripe API calls must use HTTPS
5. **PCI compliance** - Never store card details; let Stripe handle it

## Troubleshooting

### Payment Sheet Not Showing

- Check that `@stripe/stripe-react-native` is installed
- Verify publishable key is correct
- Ensure you're not on web (Stripe React Native doesn't support web)
- Check console for initialization errors

### Subscription Not Updating

- Verify webhook is configured correctly
- Check webhook logs in Stripe Dashboard
- Ensure database tables exist and RLS policies are correct
- Check Edge Function logs for errors

### Apple Pay Not Working

- Verify merchant ID is configured in app.json
- Check that merchant ID is registered in Apple Developer account
- Ensure merchant ID is added to Stripe Dashboard
- Test on real device (not simulator)

### Google Pay Not Working

- Verify `enableGooglePay: true` in app.json
- Check that package name is added to Stripe Dashboard
- Test on real device (not emulator)
- Ensure Google Play Services is installed

## Next Steps

1. **Implement Backend Edge Functions** - Create the 5 endpoints listed above
2. **Update Publishable Key** - Replace placeholder in `StripeContext.tsx`
3. **Create Stripe Products** - Set up products and prices in Stripe Dashboard
4. **Configure Webhooks** - Add webhook endpoint and select events
5. **Test Payment Flow** - Use test cards to verify end-to-end flow
6. **Set Up Apple Pay** - Configure merchant ID and test on iOS device
7. **Set Up Google Pay** - Configure package name and test on Android device
8. **Go Live** - Switch to live keys and test with real payments

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe React Native: https://github.com/stripe/stripe-react-native
- Stripe Support: https://support.stripe.com

For CarDrop-specific issues:
- Check console logs for errors
- Review Edge Function logs in Supabase
- Check webhook logs in Stripe Dashboard
