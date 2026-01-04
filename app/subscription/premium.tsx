
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';

const PREMIUM_FEATURES = [
  { icon: 'star', title: 'Unlimited Vehicle Profiles', description: 'Add as many vehicles as you want' },
  { icon: 'photo', title: 'Unlimited Photo Uploads', description: 'No limits on timeline photos and galleries' },
  { icon: 'notifications', title: 'Priority Notifications', description: 'Get notified first about nearby meets' },
  { icon: 'group', title: 'Join Unlimited Clubs', description: 'No restrictions on club memberships' },
  { icon: 'verified', title: 'Premium Badge', description: 'Stand out with a premium profile badge' },
  { icon: 'analytics', title: 'Advanced Analytics', description: 'Track your vehicle views and engagement' },
];

const PRICING_OPTIONS = [
  { id: 'monthly', label: 'Monthly', price: 9.99, priceId: 'price_monthly_placeholder' },
  { id: 'yearly', label: 'Yearly', price: 99.99, priceId: 'price_yearly_placeholder', savings: 'Save 17%' },
];

export default function PremiumSubscriptionScreen() {
  const router = useRouter();
  const { isPremium, status, currentPeriodEnd, cancelAtPeriodEnd, isLoading, subscribe, cancelSubscription, reactivateSubscription } = useStripeSubscription();
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const handleSubscribe = async () => {
    const plan = PRICING_OPTIONS.find(p => p.id === selectedPlan);
    if (!plan) return;

    const success = await subscribe(plan.priceId);
    if (success) {
      router.back();
    }
  };

  const handleCancelSubscription = async () => {
    const success = await cancelSubscription();
    if (success) {
      // Status will be updated automatically
    }
  };

  const handleReactivateSubscription = async () => {
    const success = await reactivateSubscription();
    if (success) {
      // Status will be updated automatically
    }
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <Stack.Screen options={{ title: 'Premium Subscription', headerShown: true }} />
        <View style={[commonStyles.container, styles.centerContent]}>
          <IconSymbol ios_icon_name="exclamationmark.triangle" android_material_icon_name="warning" size={48} color={colors.warning} />
          <Text style={[commonStyles.text, styles.warningText]}>
            Stripe payments are not available on web. Please use the mobile app to subscribe.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Premium Subscription', headerShown: true }} />
      <ScrollView style={commonStyles.container} contentContainerStyle={styles.content}>
        {isPremium ? (
          <View style={styles.activeSubscriptionCard}>
            <View style={styles.premiumBadge}>
              <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={24} color={colors.primary} />
              <Text style={styles.premiumBadgeText}>Premium Active</Text>
            </View>
            
            <Text style={[commonStyles.text, styles.statusText]}>
              Status: <Text style={styles.statusValue}>{status}</Text>
            </Text>
            
            {currentPeriodEnd && (
              <Text style={[commonStyles.text, styles.statusText]}>
                {cancelAtPeriodEnd ? 'Expires' : 'Renews'} on: {currentPeriodEnd.toLocaleDateString()}
              </Text>
            )}

            {cancelAtPeriodEnd ? (
              <TouchableOpacity
                style={[buttonStyles.primary, styles.actionButton]}
                onPress={handleReactivateSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={buttonStyles.primaryText}>Reactivate Subscription</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[buttonStyles.secondary, styles.actionButton]}
                onPress={handleCancelSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={buttonStyles.secondaryText}>Cancel Subscription</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={48} color={colors.primary} />
              <Text style={styles.title}>Go Premium</Text>
              <Text style={[commonStyles.text, styles.subtitle]}>
                Unlock all features and take your CarDrop experience to the next level
              </Text>
            </View>

            <View style={styles.featuresContainer}>
              {PREMIUM_FEATURES.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <IconSymbol
                    ios_icon_name={`${feature.icon}.fill`}
                    android_material_icon_name={feature.icon}
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={[commonStyles.text, styles.featureDescription]}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.pricingContainer}>
              <Text style={styles.pricingTitle}>Choose Your Plan</Text>
              {PRICING_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.pricingCard,
                    selectedPlan === option.id && styles.pricingCardSelected,
                  ]}
                  onPress={() => setSelectedPlan(option.id)}
                >
                  <View style={styles.pricingHeader}>
                    <View style={styles.radioButton}>
                      {selectedPlan === option.id && <View style={styles.radioButtonInner} />}
                    </View>
                    <View style={styles.pricingInfo}>
                      <Text style={styles.pricingLabel}>{option.label}</Text>
                      <Text style={styles.pricingPrice}>${option.price}</Text>
                    </View>
                    {option.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{option.savings}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, styles.subscribeButton]}
              onPress={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={buttonStyles.primaryText}>Subscribe Now</Text>
              )}
            </TouchableOpacity>

            <Text style={[commonStyles.text, styles.disclaimer]}>
              Cancel anytime. No hidden fees. Secure payment powered by Stripe.
            </Text>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  warningText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  pricingContainer: {
    marginBottom: 24,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  pricingCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pricingCardSelected: {
    borderColor: colors.primary,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  pricingInfo: {
    flex: 1,
  },
  pricingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  pricingPrice: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  savingsBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  subscribeButton: {
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
  activeSubscriptionCard: {
    backgroundColor: colors.cardBackground,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  premiumBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
  },
  statusValue: {
    fontWeight: '600',
    color: colors.primary,
  },
  actionButton: {
    marginTop: 24,
    minWidth: 200,
  },
});
