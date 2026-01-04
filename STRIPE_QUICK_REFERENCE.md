
# Stripe Integration Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npx expo install @stripe/stripe-react-native
```

### 2. Configure app.json
```json
{
  "plugins": [
    [
      "@stripe/stripe-react-native",
      {
        "merchantIdentifier": "merchant.com.cardrop.app",
        "enableGooglePay": true
      }
    ]
  ]
}
```

### 3. Update Publishable Key
In `contexts/StripeContext.tsx`:
```typescript
const key = 'pk_test_YOUR_ACTUAL_KEY'; // Replace with your key
```

## 📱 Usage Examples

### Subscribe to Premium
```typescript
import { useStripeSubscription } from '@/hooks/useStripeSubscription';

function MyComponent() {
  const { isPremium, subscribe, isLoading } = useStripeSubscription();
  
  const handleSubscribe = async () => {
    const success = await subscribe('price_monthly_xxx');
    if (success) {
      console.log('Subscribed!');
    }
  };
  
  return (
    <Button onPress={handleSubscribe} disabled={isLoading}>
      {isPremium ? 'Manage' : 'Subscribe'}
    </Button>
  );
}
```

### Pay for Club
```typescript
import { useStripeClubPayment } from '@/hooks/useStripeClubPayment';

function ClubComponent({ clubId, memberCount }) {
  const { payForClub, isLoading } = useStripeClubPayment();
  
  const handlePayment = async () => {
    const success = await payForClub(clubId, memberCount);
    if (success) {
      console.log('Payment successful!');
    }
  };
  
  return (
    <Button onPress={handlePayment} disabled={isLoading}>
      Set Up Payment
    </Button>
  );
}
```

### Check Subscription Status
```typescript
import { useStripeSubscription } from '@/hooks/useStripeSubscription';

function StatusComponent() {
  const { 
    isPremium, 
    status, 
    currentPeriodEnd, 
    cancelAtPeriodEnd 
  } = useStripeSubscription();
  
  return (
    <View>
      <Text>Premium: {isPremium ? 'Yes' : 'No'}</Text>
      <Text>Status: {status}</Text>
      {currentPeriodEnd && (
        <Text>
          {cancelAtPeriodEnd ? 'Expires' : 'Renews'}: 
          {currentPeriodEnd.toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}
```

## 🗄️ Database Queries

### Get User Subscription
```typescript
const { data } = await supabase
  .from('stripe_subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();
```

### Get Club Subscription
```typescript
const { data } = await supabase
  .from('stripe_club_subscriptions')
  .select('*')
  .eq('club_id', clubId)
  .single();
```

### Get Customer ID
```typescript
const { data } = await supabase
  .from('stripe_customers')
  .select('stripe_customer_id')
  .eq('user_id', userId)
  .single();
```

## 🔧 Backend Edge Functions Needed

### 1. Create Subscription
```typescript
// POST /stripe/create-subscription
{
  priceId: string,
  userId: string
}
// Returns: { paymentIntent, ephemeralKey, customer }
```

### 2. Create Club Subscription
```typescript
// POST /stripe/create-club-subscription
{
  clubId: string,
  memberCount: number,
  userId: string
}
// Returns: { paymentIntent, ephemeralKey, customer }
```

### 3. Cancel Subscription
```typescript
// POST /stripe/cancel-subscription
{
  userId: string
}
// Returns: { success: boolean }
```

### 4. Reactivate Subscription
```typescript
// POST /stripe/reactivate-subscription
{
  userId: string
}
// Returns: { success: boolean }
```

### 5. Webhook Handler
```typescript
// POST /stripe/webhook
// Handles: subscription.created, subscription.updated, 
//          subscription.deleted, invoice.payment_succeeded, etc.
```

## 💳 Stripe Price IDs

Update these in your code after creating products in Stripe:

**Premium Subscription**:
- Monthly: `price_monthly_xxx` → Replace in `app/subscription/premium.tsx`
- Yearly: `price_yearly_xxx` → Replace in `app/subscription/premium.tsx`

**Club Tiers**:
- Tier 50: `price_club_50_xxx`
- Tier 100: `price_club_100_xxx`
- Tier 200: `price_club_200_xxx`
- Tier 500: `price_club_500_xxx`

## 🧪 Test Cards

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155
- **Insufficient Funds**: 4000 0000 0000 9995

## 🔐 Security Checklist

- ✅ Publishable key in frontend (safe)
- ❌ Secret key in frontend (NEVER!)
- ✅ Webhook signature verification
- ✅ RLS policies on all tables
- ✅ HTTPS for all API calls
- ✅ Never store card details

## 📊 Club Pricing Formula

```typescript
function calculatePrice(memberCount: number): number {
  if (memberCount <= 15) return 0;
  if (memberCount <= 50) return 15;
  if (memberCount <= 100) return 25;
  if (memberCount <= 200) return 40;
  if (memberCount <= 500) return 75;
  return memberCount * 0.15; // Custom pricing
}
```

## 🐛 Common Issues

### "Stripe not initialized"
- Check publishable key is set
- Verify StripeProvider wraps your app
- Ensure not running on web

### "Payment sheet not showing"
- Check payment intent is valid
- Verify customer and ephemeral key
- Check console for errors

### "Subscription not updating"
- Verify webhook is configured
- Check webhook signature
- Review Edge Function logs

## 📱 Platform Support

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Payment Sheet | ✅ | ✅ | ❌ |
| Apple Pay | ✅ | ❌ | ❌ |
| Google Pay | ❌ | ✅ | ❌ |
| Subscriptions | ✅ | ✅ | ❌ |

## 🔗 Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Docs](https://stripe.com/docs)
- [Stripe React Native](https://github.com/stripe/stripe-react-native)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhook Events](https://stripe.com/docs/api/events/types)

## 💡 Pro Tips

1. **Always test in test mode first** - Use test keys and test cards
2. **Set up webhooks early** - Critical for subscription updates
3. **Handle all webhook events** - Don't miss payment failures
4. **Use metadata** - Store user/club IDs in Stripe metadata
5. **Monitor Stripe Dashboard** - Check for failed payments
6. **Test on real devices** - Apple Pay and Google Pay need real devices
7. **Keep keys secure** - Never commit secret keys to git

## 🎯 Next Steps

1. ✅ Frontend integrated (done!)
2. ⏳ Implement backend Edge Functions
3. ⏳ Create Stripe products and prices
4. ⏳ Configure webhooks
5. ⏳ Test payment flow
6. ⏳ Set up Apple Pay
7. ⏳ Set up Google Pay
8. ⏳ Go live with real keys
