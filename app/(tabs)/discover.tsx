
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const FEATURED_VEHICLES = [
  {
    id: '1',
    make: 'Porsche',
    model: '911 GT3 RS',
    year: 2023,
    owner: 'mike_racing',
    location: 'Los Angeles, CA',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
  },
  {
    id: '2',
    make: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    owner: 'bmw_enthusiast',
    location: 'Miami, FL',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
  },
  {
    id: '3',
    make: 'Toyota',
    model: 'Supra A90',
    year: 2023,
    owner: 'jdm_legend',
    location: 'Seattle, WA',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
  },
];

export default function DiscoverScreen() {
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
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Featured builds and owners</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={24}
              color={colors.accent}
            />
            <Text style={styles.sectionTitle}>Featured Vehicles</Text>
          </View>

          {FEATURED_VEHICLES.map((vehicle, index) => (
            <TouchableOpacity key={index} style={styles.vehicleCard}>
              <Image
                source={{ uri: vehicle.image }}
                style={styles.vehicleImage}
                resizeMode="cover"
              />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
                <View style={styles.vehicleMeta}>
                  <IconSymbol
                    ios_icon_name="person.fill"
                    android_material_icon_name="person"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.vehicleMetaText}>@{vehicle.owner}</Text>
                </View>
                <View style={styles.vehicleMeta}>
                  <IconSymbol
                    ios_icon_name="location.fill"
                    android_material_icon_name="location-on"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.vehicleMetaText}>{vehicle.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="flame.fill"
              android_material_icon_name="whatshot"
              size={24}
              color={colors.secondary}
            />
            <Text style={styles.sectionTitle}>Trending Builds</Text>
          </View>
          <View style={commonStyles.emptyState}>
            <IconSymbol
              ios_icon_name="wrench.and.screwdriver.fill"
              android_material_icon_name="build"
              size={48}
              color={colors.textSecondary}
              style={{ opacity: 0.5 }}
            />
            <Text style={commonStyles.emptyStateText}>
              Check back soon for trending builds
            </Text>
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
  vehicleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.highlight,
  },
  vehicleInfo: {
    padding: 16,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  vehicleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  vehicleMetaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
