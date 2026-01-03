
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from './IconSymbol';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';

interface PaywallScreenProps {
  feature: string;
  onDismiss?: () => void;
  placementId?: string;
}

// Hook to manage Superwall placement (only on native)
function useSuperwallPlacement(placementId: string, onDismiss?: () => void) {
  const [registerPlacement, setRegisterPlacement] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const loadSuperwall = async () => {
      try {
        const { usePlacement } = await import('expo-superwall');
        const placementData = usePlacement({
          onPresent: (info: any) => {
            console.log('[Paywall] Presented:', info);
          },
          onDismiss: (info: any, result: any) => {
            console.log('[Paywall] Dismissed:', info, 'Result:', result);
            if (result === 'purchased' || result === 'restored') {
              Alert.alert(
                'Welcome to Premium!',
                'You now have access to all premium features. Enjoy!',
                [{ text: 'OK', onPress: onDismiss }]
              );
            } else {
              onDismiss?.();
            }
          },
          onError: (error: any) => {
            console.error('[Paywall] Error:', error);
            Alert.alert('Error', 'Failed to load paywall. Please try again.');
          },
          onSkip: (reason: any) => {
            console.log('[Paywall] Skipped:', reason);
            // User already has access, dismiss the paywall
            onDismiss?.();
          },
        });

        setRegisterPlacement(() => placementData.registerPlacement);
      } catch (error) {
        console.error('[Paywall] Error loading Superwall:', error);
      }
    };

    loadSuperwall();
  }, [placementId, onDismiss]);

  return registerPlacement;
}

export function PaywallScreen({ feature, onDismiss, placementId = 'premium_features' }: PaywallScreenProps) {
  const router = useRouter();
  const registerPlacement = useSuperwallPlacement(placementId, onDismiss);

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
    {
      icon: 'star.fill',
      androidIcon: 'star',
      title: 'Custom Badges',
      description: 'Stand out with exclusive premium profile badges',
    },
  ];

  const handleUpgrade = async () => {
    // On web, show a message that payments are only available on mobile
    if (Platform.OS === 'web') {
      Alert.alert(
        'Mobile Only',
        'Premium subscriptions are only available on the iOS and Android apps. Please download the mobile app to upgrade.',
        [{ text: 'OK' }]
      );
      return;
    }

    // On native platforms, use Superwall
    if (!registerPlacement) {
      Alert.alert('Error', 'Payment system is not available. Please try again later.');
      return;
    }

    try {
      await registerPlacement({
        placement: placementId,
        feature: () => {
          console.log('[Paywall] User has access to feature');
          onDismiss?.();
        },
      });
    } catch (error) {
      console.error('[Paywall] Error registering placement:', error);
      Alert.alert('Error', 'Failed to show paywall. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark, '#D35400']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="cancel"
            size={32}
            color="rgba(0, 0, 0, 0.6)"
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <IconSymbol
            ios_icon_name="crown.fill"
            android_material_icon_name="workspace-premium"
            size={64}
            color="#000"
          />
          <Text style={styles.headerTitle}>CarDrop Premium</Text>
          <Text style={styles.headerSubtitle}>Unlock the full experience</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>$4.99</Text>
            <Text style={styles.priceLabel}>/month</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Platform.OS === 'web' && (
          <View style={styles.webNotice}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.webNoticeText}>
              Premium subscriptions are only available on the iOS and Android apps.
              Download the mobile app to upgrade!
            </Text>
          </View>
        )}

        <View style={styles.featuresList}>
          {premiumFeatures.map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <IconSymbol
                  ios_icon_name={item.icon}
                  android_material_icon_name={item.androidIcon}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDescription}>{item.description}</Text>
              </View>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color={colors.success}
              />
            </View>
          ))}
        </View>

        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.upgradeButton]}
            onPress={handleUpgrade}
          >
            <Text style={[buttonStyles.text, styles.upgradeText]}>
              {Platform.OS === 'web' ? 'Download Mobile App' : 'Upgrade to Premium'}
            </Text>
          </TouchableOpacity>

          {Platform.OS !== 'web' && (
            <Text style={styles.disclaimer}>
              Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
              {'\n\n'}
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          )}
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
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000',
  },
  priceLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.7)',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    padding: 16,
    margin: 20,
    borderRadius: 12,
    gap: 12,
  },
  webNoticeText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  featuresList: {
    padding: 20,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 2,
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
  featureText: {
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
  ctaSection: {
    padding: 20,
    paddingBottom: 40,
  },
  upgradeButton: {
    marginBottom: 20,
  },
  upgradeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
