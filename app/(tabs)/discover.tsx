
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useDiscover } from '@/hooks/useDiscover';

export default function DiscoverScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const { vehicles, loading, refreshing, error, refresh } = useDiscover();

  const renderVehicleCard = (vehicle: any, index: number) => {
    const specs = [];
    if (vehicle.year) specs.push(vehicle.year.toString());
    if (vehicle.power_output) specs.push(vehicle.power_output);
    if (vehicle.induction_type) specs.push(vehicle.induction_type);

    return (
      <TouchableOpacity
        key={index}
        style={styles.vehicleCard}
        onPress={() => router.push(`/vehicles/${vehicle.id}`)}
        activeOpacity={0.7}
      >
        {vehicle.is_featured && (
          <View style={styles.featuredBadge}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={16}
              color={colors.accent}
            />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}

        {vehicle.primary_image_url ? (
          <Image
            source={{ uri: vehicle.primary_image_url }}
            style={styles.vehicleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.vehicleImage, styles.placeholderImage]}>
            <IconSymbol
              ios_icon_name="car.fill"
              android_material_icon_name="directions-car"
              size={48}
              color={colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName} numberOfLines={1}>
            {vehicle.manufacturer} {vehicle.model}
          </Text>

          {vehicle.owner && (
            <View style={styles.ownerRow}>
              <IconSymbol
                ios_icon_name="person.fill"
                android_material_icon_name="person"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.ownerName} numberOfLines={1}>
                @{vehicle.owner.username}
              </Text>
            </View>
          )}

          {specs.length > 0 && (
            <Text style={styles.specs} numberOfLines={1}>
              {specs.join(' • ')}
            </Text>
          )}

          {vehicle.modification_count > 0 && (
            <View style={styles.modBadge}>
              <IconSymbol
                ios_icon_name="wrench.fill"
                android_material_icon_name="build"
                size={12}
                color={colors.secondary}
              />
              <Text style={styles.modCount}>
                {vehicle.modification_count} {vehicle.modification_count === 1 ? 'mod' : 'mods'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Curated vehicles from the community</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="error"
              size={24}
              color={colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading && vehicles.length === 0 ? (
          <View style={commonStyles.centerContent}>
            <Text style={commonStyles.textSecondary}>Loading vehicles...</Text>
          </View>
        ) : vehicles.length === 0 ? (
          <View style={commonStyles.emptyState}>
            <IconSymbol
              ios_icon_name="car.fill"
              android_material_icon_name="directions-car"
              size={64}
              color={colors.textSecondary}
              style={{ opacity: 0.5 }}
            />
            <Text style={commonStyles.emptyStateText}>No vehicles to discover yet</Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
              Add your vehicle to the Garage to get started
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {vehicles.map((vehicle, index) => renderVehicleCard(vehicle, index))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  grid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  vehicleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  vehicleImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.highlight,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    padding: 16,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ownerName: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  specs: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  bottomSpacer: {
    height: 20,
  },
});
