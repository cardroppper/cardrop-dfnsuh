
# CarDrop Paywall Integration Guide

This guide explains how to integrate Superwall paywalls into CarDrop to monetize premium features.

## 📦 Prerequisites

The Superwall SDK is already installed in `package.json`:
```json
"expo-superwall": "^1.0.0"
```

## 🎯 Premium Features to Gate

CarDrop has the following premium features ready for paywall integration:

### 1. **Global Meet Map** 
- **Location**: `app/(tabs)/discover.tsx` or new `app/premium/global-map.tsx`
- **Feature**: See all car meets happening worldwide on a map
- **Value**: Discover meets in other cities, plan road trips

### 2. **Always Searching**
- **Location**: `app/(tabs)/settings.tsx`
- **Feature**: Background BLE scanning for nearby vehicles
- **Value**: Never miss a rare car, automatic detection

### 3. **Enhanced Club Permissions**
- **Location**: `app/clubs/[clubId].tsx`
- **Feature**: Advanced admin controls for club owners
- **Value**: Better club management, custom roles

### 4. **Priority Support**
- **Location**: `app/(tabs)/settings.tsx`
- **Feature**: Direct support channel, faster response times
- **Value**: Get help when you need it

## 🔧 Implementation Steps

### Step 1: Configure Superwall

Create a new file `app/config/superwall.ts`:

```typescript
import Superwall from 'expo-superwall';
import { Platform } from 'react-native';

export const initializeSuperwall = async () => {
  try {
    await Superwall.configure({
      apiKey: Platform.select({
        ios: 'YOUR_IOS_API_KEY',
        android: 'YOUR_ANDROID_API_KEY',
      }),
      options: {
        logging: {
          level: __DEV__ ? 'debug' : 'error',
        },
      },
    });

    console.log('[Superwall] Initialized successfully');
  } catch (error) {
    console.error('[Superwall] Initialization failed:', error);
  }
};

export const showPaywall = async (feature: string) => {
  try {
    const result = await Superwall.present({
      event: feature,
    });

    return result.state === 'purchased';
  } catch (error) {
    console.error('[Superwall] Failed to show paywall:', error);
    return false;
  }
};

export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const status = await Superwall.getSubscriptionStatus();
    return status === 'active';
  } catch (error) {
    console.error('[Superwall] Failed to check subscription:', error);
    return false;
  }
};
```

### Step 2: Initialize in App Root

Update `app/_layout.tsx`:

```typescript
import { initializeSuperwall } from '@/app/config/superwall';

export default function RootLayout() {
  // ... existing code ...

  useEffect(() => {
    // Initialize Superwall
    initializeSuperwall();
  }, []);

  // ... rest of component ...
}
```

### Step 3: Create Paywall Hook

Create `hooks/usePaywall.ts`:

```typescript
import { useState, useEffect } from 'react';
import { showPaywall, checkSubscriptionStatus } from '@/app/config/superwall';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';

export function usePaywall() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, [user]);

  const checkPremiumStatus = async () => {
    try {
      setLoading(true);

      // Check Superwall subscription
      const superwallActive = await checkSubscriptionStatus();

      // Check database for free premium
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('subscription_status')
        .eq('user_id', user?.id)
        .single();

      const dbPremium = subscription?.subscription_status === 'premium';

      // Check profile for free premium flag
      const { data: profile } = await supabase
        .from('profiles')
        .select('free_premium')
        .eq('id', user?.id)
        .single();

      const freePremium = profile?.free_premium === true;

      setIsPremium(superwallActive || dbPremium || freePremium);
    } catch (error) {
      console.error('[Paywall] Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  const requestPremiumAccess = async (feature: string): Promise<boolean> => {
    if (isPremium) {
      return true;
    }

    const purchased = await showPaywall(feature);

    if (purchased) {
      // Update database
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user?.id,
          subscription_status: 'premium',
          subscription_start_date: new Date().toISOString(),
        });

      await checkPremiumStatus();
      return true;
    }

    return false;
  };

  return {
    isPremium,
    loading,
    requestPremiumAccess,
    refresh: checkPremiumStatus,
  };
}
```

### Step 4: Gate Premium Features

#### Example 1: Global Meet Map

```typescript
// app/premium/global-map.tsx
import { usePaywall } from '@/hooks/usePaywall';

export default function GlobalMapScreen() {
  const { isPremium, requestPremiumAccess } = usePaywall();

  useEffect(() => {
    if (!isPremium) {
      requestPremiumAccess('global_meet_map');
    }
  }, [isPremium]);

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.message}>
          Upgrade to Premium to see car meets happening worldwide
        </Text>
      </View>
    );
  }

  return (
    // ... map implementation ...
  );
}
```

#### Example 2: Always Searching Toggle

```typescript
// app/(tabs)/settings.tsx
import { usePaywall } from '@/hooks/usePaywall';

export default function SettingsScreen() {
  const { isPremium, requestPremiumAccess } = usePaywall();

  const handleAlwaysSearchingToggle = async (value: boolean) => {
    if (value && !isPremium) {
      const granted = await requestPremiumAccess('always_searching');
      if (!granted) {
        return; // User cancelled paywall
      }
    }

    // Update setting
    await updateProfile({ always_searching_enabled: value });
  };

  return (
    // ... settings UI with premium badge ...
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>Always Searching</Text>
      {!isPremium && <Text style={styles.premiumBadge}>PREMIUM</Text>}
      <Switch
        value={alwaysSearching}
        onValueChange={handleAlwaysSearchingToggle}
      />
    </View>
  );
}
```

## 🎨 Paywall UI Components

### Premium Badge Component

```typescript
// components/PremiumBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

export function PremiumBadge({ size = 'small' }: { size?: 'small' | 'large' }) {
  return (
    <View style={[styles.badge, size === 'large' && styles.badgeLarge]}>
      <IconSymbol
        ios_icon_name="crown.fill"
        android_material_icon_name="star"
        size={size === 'large' ? 16 : 12}
        color={colors.gold}
      />
      <Text style={[styles.text, size === 'large' && styles.textLarge]}>
        PREMIUM
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold,
  },
  textLarge: {
    fontSize: 12,
  },
});
```

### Premium Feature Card

```typescript
// components/PremiumFeatureCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';
import { PremiumBadge } from './PremiumBadge';

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: string;
  materialIcon: string;
  onPress: () => void;
  locked?: boolean;
}

export function PremiumFeatureCard({
  title,
  description,
  icon,
  materialIcon,
  onPress,
  locked = true,
}: PremiumFeatureCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, locked && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <IconSymbol
          ios_icon_name={icon}
          android_material_icon_name={materialIcon}
          size={32}
          color={locked ? colors.textSecondary : colors.primary}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {locked && <PremiumBadge />}
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
      <IconSymbol
        ios_icon_name="chevron.right"
        android_material_icon_name="chevron-right"
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardLocked: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
```

## 📊 Superwall Dashboard Setup

1. **Create Account**: Go to [superwall.com](https://superwall.com) and create an account
2. **Create App**: Add your iOS and Android apps
3. **Get API Keys**: Copy your API keys for each platform
4. **Create Paywalls**: Design your paywall screens in the dashboard
5. **Set Up Events**: Create events for each premium feature:
   - `global_meet_map`
   - `always_searching`
   - `enhanced_permissions`
   - `priority_support`
6. **Configure Products**: Link to your App Store Connect and Google Play Console products
7. **Test**: Use Superwall's test mode to verify everything works

## 💰 Pricing Recommendations

### Monthly Subscription
- **Price**: $4.99/month
- **Features**: All premium features
- **Target**: Regular users who attend meets frequently

### Annual Subscription
- **Price**: $39.99/year (33% savings)
- **Features**: All premium features
- **Target**: Dedicated car enthusiasts

### Lifetime
- **Price**: $99.99 one-time
- **Features**: All premium features forever
- **Target**: Power users and club organizers

## 🧪 Testing

### Test Premium Access

```typescript
// For testing, you can manually grant premium access
const grantTestPremium = async (userId: string) => {
  await supabase
    .from('profiles')
    .update({ free_premium: true })
    .eq('id', userId);
};
```

### Test Paywall Flow

1. Disable premium in database
2. Try to access premium feature
3. Verify paywall appears
4. Complete test purchase
5. Verify feature unlocks

## 📱 App Store Configuration

### iOS (App Store Connect)

1. Create in-app purchases:
   - `cardrop_premium_monthly` - $4.99/month
   - `cardrop_premium_annual` - $39.99/year
   - `cardrop_premium_lifetime` - $99.99 one-time

2. Add subscription group: "CarDrop Premium"

3. Configure auto-renewable subscriptions

### Android (Google Play Console)

1. Create in-app products:
   - `cardrop_premium_monthly` - $4.99/month
   - `cardrop_premium_annual` - $39.99/year
   - `cardrop_premium_lifetime` - $99.99 one-time

2. Set up subscription base plans

3. Configure billing periods

## 🚀 Launch Checklist

- [ ] Superwall account created
- [ ] API keys configured
- [ ] Paywalls designed in dashboard
- [ ] Events created and linked
- [ ] Products created in App Store Connect
- [ ] Products created in Google Play Console
- [ ] Test purchases completed
- [ ] Premium features gated
- [ ] Analytics tracking added
- [ ] Support documentation updated
- [ ] Marketing materials prepared

## 📈 Analytics Events to Track

```typescript
// Track paywall impressions
Superwall.logEvent('paywall_viewed', {
  feature: 'global_meet_map',
  source: 'discover_tab',
});

// Track conversions
Superwall.logEvent('premium_purchased', {
  plan: 'monthly',
  price: 4.99,
});

// Track feature usage
Superwall.logEvent('premium_feature_used', {
  feature: 'always_searching',
  timestamp: new Date().toISOString(),
});
```

## 🎉 You're Ready!

Once you complete these steps, CarDrop will have a fully functional paywall system. Users will be able to:

1. Browse free features
2. Discover premium features
3. See paywall when accessing premium features
4. Purchase subscription
5. Unlock all premium features
6. Manage subscription in settings

**Happy monetizing! 💰**
