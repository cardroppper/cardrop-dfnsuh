
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { useSubscription } from '@/hooks/useSubscription';
export default function SubscriptionManagementScreen() {
  const { subscription } = useSubscription();

  const handleUpgrade = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Mobile Only',
        'Premium subscriptions are only available on the iOS and Android apps.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Import Superwall dynamically for native platforms
      const { presentPaywall } = await import('expo-superwall');
      await presentPaywall('premium_subscription');
    } catch (error) {
      console.error('[SubscriptionManagement] Error showing paywall:', error);
      Alert.alert('Error', 'Failed to load subscription options. Please try again.');
    }
  };

  const handleManageSubscription = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Mobile Only',
        'Subscription management is only available on the iOS and Android apps.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const { restorePurchases } = await import('expo-superwall');
      
      Alert.alert(
        'Manage Subscription',
        'To manage your subscription, please visit your device settings:\n\niOS: Settings > [Your Name] > Subscriptions\nAndroid: Play Store > Menu > Subscriptions',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore Purchases',
            onPress: async () => {
              try {
                await restorePurchases();
                Alert.alert('Success', 'Your purchases have been restored.');
              } catch (error) {
                console.error('[SubscriptionManagement] Error restoring purchases:', error);
                Alert.alert('Error', 'Failed to restore purchases. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('[SubscriptionManagement] Error:', error);
      Alert.alert('Error', 'Failed to access subscription management.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <IconSymbol
              ios_icon_name={subscription.isPremium ? 'crown.fill' : 'crown'}
              android_material_icon_name="workspace-premium"
              size={48}
              color={subscription.isPremium ? '#FFD700' : colors.textSecondary}
            />
            <Text style={styles.statusTitle}>
              {subscription.isPremium ? 'Premium Member' : 'Free Plan'}
            </Text>
            {subscription.isPremium && subscription.subscriptionSource === 'free_premium' && (
              <Text style={styles.statusSubtitle}>(Free Premium Access)</Text>
            )}
          </View>

          {subscription.isPremium && subscription.startDate && (
            <View style={styles.statusDetails}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Started:</Text>
                <Text style={styles.statusValue}>
                  {new Date(subscription.startDate).toLocaleDateString()}
                </Text>
              </View>
              {subscription.endDate && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Renews:</Text>
                  <Text style={styles.statusValue}>
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {!subscription.isPremium && (
          <TouchableOpacity
            style={[buttonStyles.primary, styles.upgradeButton]}
            onPress={handleUpgrade}
          >
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="workspace-premium"
              size={24}
              color={colors.text}
            />
            <Text style={[buttonStyles.text, { marginLeft: 12 }]}>
              Upgrade to Premium
            </Text>
          </TouchableOpacity>
        )}

        {subscription.isPremium && subscription.subscriptionSource === 'superwall' && (
          <TouchableOpacity
            style={[buttonStyles.outline, styles.manageButton]}
            onPress={handleManageSubscription}
          >
            <IconSymbol
              ios_icon_name="gearshape.fill"
              android_material_icon_name="settings"
              size={24}
              color={colors.primary}
            />
            <Text style={[buttonStyles.text, { color: colors.primary, marginLeft: 12 }]}>
              Manage Subscription
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="clock.fill"
                android_material_icon_name="history"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureText}>24-Hour Detection History</Text>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="antenna.radiowaves.left.and.right"
                android_material_icon_name="bluetooth-searching"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureText}>Always Searching Mode</Text>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="eye.fill"
                android_material_icon_name="visibility"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureText}>Live Meet View</Text>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="person.3.fill"
                android_material_icon_name="groups"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureText}>Unlimited Clubs</Text>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="chart.bar.fill"
                android_material_icon_name="analytics"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureText}>Advanced Analytics</Text>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureText}>Custom Badges</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statusCard: {
    backgroundColor: colors.card,
    margin: 20,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusDetails: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
});
