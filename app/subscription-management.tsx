
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useSubscription } from '@/hooks/useSubscription';
import { PaywallScreen } from '@/components/PaywallScreen';
import { usePlacement } from 'expo-superwall';

export default function SubscriptionManagementScreen() {
  const { subscription, loading } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  const { registerPlacement } = usePlacement({
    onDismiss: (info, result) => {
      console.log('[SubscriptionManagement] Paywall dismissed:', result);
      setShowPaywall(false);
    },
  });

  const premiumFeatures = [
    {
      icon: 'clock.fill',
      androidIcon: 'history',
      title: '24-Hour Detection History',
      description: 'Access your full beacon detection history from the last 24 hours',
    },
    {
      icon: 'antenna.radiowaves.left.and.right',
      androidIcon: 'bluetooth-searching',
      title: 'Always Searching',
      description: 'Continuous background scanning for nearby vehicles',
    },
    {
      icon: 'eye.fill',
      androidIcon: 'visibility',
      title: 'Live Meet View',
      description: 'See all cars at club meets in real-time, even remotely',
    },
    {
      icon: 'location.fill',
      androidIcon: 'location-on',
      title: 'Automatic Attendance',
      description: 'Auto check-in to events when you arrive at the location',
    },
    {
      icon: 'person.3.fill',
      androidIcon: 'groups',
      title: 'Unlimited Clubs',
      description: 'Join as many clubs as you want without restrictions',
    },
    {
      icon: 'chart.bar.fill',
      androidIcon: 'analytics',
      title: 'Advanced Analytics',
      description: 'Track your meets, connections, and engagement metrics',
    },
  ];

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'To manage your subscription, cancel, or change your plan, please visit your device\'s subscription settings.',
      [
        {
          text: 'Open Settings',
          onPress: () => {
            // On iOS, this would open App Store subscriptions
            // On Android, this would open Play Store subscriptions
            Alert.alert('Info', 'Please open your device settings and navigate to subscriptions.');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {subscription.isPremium ? (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <IconSymbol
                ios_icon_name="crown.fill"
                android_material_icon_name="workspace-premium"
                size={48}
                color="#FFD700"
              />
              <Text style={styles.statusTitle}>Premium Active</Text>
            </View>
            <Text style={styles.statusDescription}>
              {subscription.subscriptionSource === 'free_premium'
                ? 'You have free premium access granted by CarDrop.'
                : 'You have full access to all premium features.'}
            </Text>
            {subscription.subscriptionSource === 'superwall' && (
              <TouchableOpacity
                style={[buttonStyles.outline, styles.manageButton]}
                onPress={handleManageSubscription}
              >
                <Text style={buttonStyles.textOutline}>Manage Subscription</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.upgradeCard}>
            <View style={styles.upgradeHeader}>
              <IconSymbol
                ios_icon_name="crown.fill"
                android_material_icon_name="workspace-premium"
                size={64}
                color={colors.primary}
              />
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtitle}>Unlock the full CarDrop experience</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>$4.99</Text>
                <Text style={styles.priceLabel}>/month</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.upgradeButton]}
              onPress={handleUpgrade}
            >
              <Text style={buttonStyles.text}>Start Free Trial</Text>
            </TouchableOpacity>
            <Text style={styles.trialNote}>7-day free trial, then $4.99/month</Text>
          </View>
        )}

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>
            {subscription.isPremium ? 'Your Premium Features' : 'Premium Features'}
          </Text>
          {premiumFeatures.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <IconSymbol
                  ios_icon_name={feature.icon}
                  android_material_icon_name={feature.androidIcon}
                  size={24}
                  color={subscription.isPremium ? colors.success : colors.primary}
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              {subscription.isPremium && (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={24}
                  color={colors.success}
                />
              )}
            </View>
          ))}
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes! You can cancel your subscription at any time from your device settings. 
              You&apos;ll continue to have access until the end of your billing period.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What happens after the free trial?</Text>
            <Text style={styles.faqAnswer}>
              After your 7-day free trial, you&apos;ll be charged $4.99/month. 
              You can cancel anytime during the trial without being charged.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Do I need premium for basic features?</Text>
            <Text style={styles.faqAnswer}>
              No! You can still scan for nearby vehicles, join clubs, and attend events with a free account. 
              Premium unlocks advanced features like background scanning and live meet views.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaywall(false)}
      >
        <PaywallScreen
          feature="premium_subscription"
          placementId="premium_features"
          onDismiss={() => setShowPaywall(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    margin: 20,
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  manageButton: {
    width: '100%',
  },
  upgradeCard: {
    margin: 20,
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  upgradeHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  upgradeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  upgradeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  upgradeButton: {
    width: '100%',
    marginBottom: 12,
  },
  trialNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    padding: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  faqSection: {
    padding: 20,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
