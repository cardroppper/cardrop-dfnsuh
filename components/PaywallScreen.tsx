
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';

interface PaywallScreenProps {
  feature: string;
  onDismiss?: () => void;
  placementId?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  upgradeButton: {
    ...buttonStyles.primary,
    backgroundColor: colors.primary,
  },
  upgradeButtonText: {
    ...buttonStyles.primaryText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dismissButton: {
    ...buttonStyles.secondary,
  },
  dismissButtonText: {
    ...buttonStyles.secondaryText,
  },
});

// Custom hook that properly handles Superwall placement without calling hooks conditionally
function useSuperwallPlacement(placementId: string) {
  const [placement, setPlacement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Superwall not available on web');
      return;
    }

    // For native platforms, dynamically import and use Superwall
    const initSuperwall = async () => {
      try {
        setIsLoading(true);
        // Dynamic import for native platforms only
        const Superwall = await import('expo-superwall');
        console.log('Superwall loaded for placement:', placementId);
        // Store placement data without calling hooks inside this function
        setPlacement({ id: placementId, name: 'Premium Features' });
      } catch (error) {
        console.error('Superwall not available:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSuperwall();
  }, [placementId]);

  return { placement, isLoading };
}

export default function PaywallScreen({ feature, onDismiss, placementId = 'premium_features' }: PaywallScreenProps) {
  const router = useRouter();
  const { placement, isLoading } = useSuperwallPlacement(placementId);

  const handleUpgrade = () => {
    console.log('Navigating to subscription management');
    router.push('/subscription-management');
  };

  const handleDismiss = () => {
    console.log('Dismissing paywall');
    if (onDismiss) {
      onDismiss();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.cardBackground]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={styles.header}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={64}
              color={colors.primary}
              style={styles.icon}
            />
            <Text style={styles.title}>Unlock Premium Features</Text>
            <Text style={styles.subtitle}>
              Upgrade to access {feature} and more
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureText}>Unlimited vehicle profiles</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureText}>Advanced BLE scanning</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureText}>Priority event check-ins</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.featureText}>Exclusive club features</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>

            {onDismiss && (
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
              >
                <Text style={styles.dismissButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
