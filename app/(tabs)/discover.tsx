
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function DiscoverScreen() {
  const { profile } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Welcome back, {profile?.display_name}!</Text>
      </View>

      <View style={commonStyles.card}>
        <View style={styles.cardHeader}>
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check-circle"
            size={32}
            color={colors.secondary}
          />
          <Text style={styles.cardTitle}>Authentication Complete</Text>
        </View>
        <Text style={commonStyles.text}>
          Your account is fully set up and ready to use. You now have access to all CarDrop features.
        </Text>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.cardTitle}>Your Profile</Text>
        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username:</Text>
            <Text style={styles.infoValue}>@{profile?.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Display Name:</Text>
            <Text style={styles.infoValue}>{profile?.display_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Profile Type:</Text>
            <Text style={styles.infoValue}>
              {profile?.is_private ? 'Private' : 'Public'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since:</Text>
            <Text style={styles.infoValue}>
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={commonStyles.card}>
        <Text style={styles.cardTitle}>Next Steps</Text>
        <View style={styles.nextSteps}>
          <View style={styles.stepItem}>
            <IconSymbol
              ios_icon_name="car.fill"
              android_material_icon_name="directions-car"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.stepText}>Add your first vehicle to your Garage</Text>
          </View>
          <View style={styles.stepItem}>
            <IconSymbol
              ios_icon_name="person.3.fill"
              android_material_icon_name="groups"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.stepText}>Join or create a car club</Text>
          </View>
          <View style={styles.stepItem}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="near-me"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.stepText}>Discover cars and meets nearby</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  profileInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  nextSteps: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});
