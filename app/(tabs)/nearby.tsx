
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function NearbyScreen() {
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'not-requested'>('not-requested');

  const requestLocationPermission = () => {
    Alert.alert(
      'Location Permission',
      'CarDrop needs access to your location to show nearby vehicles and events.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setLocationPermission('denied'),
        },
        {
          text: 'Allow',
          onPress: () => {
            setLocationPermission('granted');
            console.log('Location permission granted');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === 'android' && styles.androidPadding,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Nearby</Text>
          <Text style={styles.subtitle}>Vehicles and events near you</Text>
        </View>

        {locationPermission === 'not-requested' && (
          <View style={styles.permissionCard}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="location-on"
              size={48}
              color={colors.primary}
            />
            <Text style={styles.permissionTitle}>Enable Location</Text>
            <Text style={styles.permissionText}>
              Allow CarDrop to access your location to discover vehicles and events nearby.
            </Text>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.permissionButton]}
              onPress={requestLocationPermission}
            >
              <Text style={buttonStyles.text}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        )}

        {locationPermission === 'denied' && (
          <View style={commonStyles.emptyState}>
            <IconSymbol
              ios_icon_name="location.slash.fill"
              android_material_icon_name="location-off"
              size={48}
              color={colors.textSecondary}
              style={{ opacity: 0.5 }}
            />
            <Text style={commonStyles.emptyStateText}>
              Location access denied. Enable it in settings to see nearby content.
            </Text>
          </View>
        )}

        {locationPermission === 'granted' && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconSymbol
                  ios_icon_name="car.fill"
                  android_material_icon_name="directions-car"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={styles.sectionTitle}>Nearby Vehicles</Text>
              </View>
              <View style={commonStyles.emptyState}>
                <IconSymbol
                  ios_icon_name="magnifyingglass"
                  android_material_icon_name="search"
                  size={48}
                  color={colors.textSecondary}
                  style={{ opacity: 0.5 }}
                />
                <Text style={commonStyles.emptyStateText}>
                  No vehicles found nearby. Check back later!
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="event"
                  size={24}
                  color={colors.accent}
                />
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
              </View>
              <View style={commonStyles.emptyState}>
                <IconSymbol
                  ios_icon_name="calendar.badge.exclamationmark"
                  android_material_icon_name="event-busy"
                  size={48}
                  color={colors.textSecondary}
                  style={{ opacity: 0.5 }}
                />
                <Text style={commonStyles.emptyStateText}>
                  No events scheduled nearby
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  androidPadding: {
    paddingTop: 48,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  permissionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    width: '100%',
  },
});
