
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from './IconSymbol';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';

interface PaywallScreenProps {
  feature: string;
  onDismiss?: () => void;
}

export function PaywallScreen({ feature, onDismiss }: PaywallScreenProps) {
  const router = useRouter();

  const premiumFeatures = [
    {
      icon: 'clock.fill',
      androidIcon: 'history',
      title: '24-Hour Detection History',
      description: 'Access your full beacon detection history from the last 24 hours',
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
    {
      icon: 'bolt.fill',
      androidIcon: 'flash-on',
      title: 'Priority Support',
      description: 'Get help faster with dedicated premium support',
    },
    {
      icon: 'antenna.radiowaves.left.and.right',
      androidIcon: 'bluetooth-searching',
      title: 'Live Club Meets',
      description: 'Real-time updates during active club events',
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFD700', '#FFA500', '#FF8C00']}
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
        <View style={styles.featuresList}>
          {premiumFeatures.map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <IconSymbol
                  ios_icon_name={item.icon}
                  android_material_icon_name={item.androidIcon}
                  size={24}
                  color="#FFD700"
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
                color="#4CAF50"
              />
            </View>
          ))}
        </View>

        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.upgradeButton]}
            onPress={() => {
              console.log('Upgrade to Premium');
              // TODO: Integrate with Superwall
            }}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeGradient}
            >
              <Text style={styles.upgradeText}>Upgrade to Premium</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.outline, styles.restoreButton]}
            onPress={() => {
              console.log('Restore purchases');
              // TODO: Implement restore purchases
            }}
          >
            <Text style={[buttonStyles.text, { color: colors.textSecondary }]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
          </Text>
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
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
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
    marginBottom: 12,
    overflow: 'hidden',
  },
  upgradeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  restoreButton: {
    marginBottom: 20,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
