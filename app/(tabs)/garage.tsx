
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useVehicles';
import { useRouter } from 'expo-router';

export default function GarageScreen() {
  const { user, profile } = useAuth();
  const { vehicles, isLoading, error } = useVehicles();
  const router = useRouter();

  const handleAddVehicle = () => {
    router.push('/vehicles/add');
  };

  const handleVehiclePress = (vehicleId: string) => {
    router.push(`/vehicles/${vehicleId}`);
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
          <Text style={styles.title}>My Garage</Text>
          <Text style={styles.subtitle}>@{profile?.username}</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[buttonStyles.primary, styles.addButton]}
            onPress={handleAddVehicle}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add-circle"
              size={24}
              color={colors.text}
            />
            <Text style={[buttonStyles.text, styles.addButtonText]}>
              Add Vehicle
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your garage...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="error"
              size={48}
              color={colors.accent}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : vehicles.length === 0 ? (
          <View style={styles.section}>
            <View style={commonStyles.emptyState}>
              <IconSymbol
                ios_icon_name="car.fill"
                android_material_icon_name="directions-car"
                size={64}
                color={colors.textSecondary}
                style={{ opacity: 0.5 }}
              />
              <Text style={commonStyles.emptyStateText}>
                Your garage is empty
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
                Add your first vehicle to start building your profile
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.vehiclesContainer}>
            {vehicles.map((vehicle, index) => (
              <TouchableOpacity
                key={vehicle.id}
                style={styles.vehicleCard}
                onPress={() => handleVehiclePress(vehicle.id)}
              >
                {vehicle.primary_image_url ? (
                  <Image
                    source={{ uri: vehicle.primary_image_url }}
                    style={styles.vehicleImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.vehicleImagePlaceholder}>
                    <IconSymbol
                      ios_icon_name="car.fill"
                      android_material_icon_name="directions-car"
                      size={48}
                      color={colors.textSecondary}
                    />
                  </View>
                )}
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>
                    {vehicle.year} {vehicle.manufacturer} {vehicle.model}
                  </Text>
                  {vehicle.engine_configuration && (
                    <Text style={styles.vehicleSpec}>
                      {vehicle.engine_configuration}
                    </Text>
                  )}
                  {vehicle.power_output && (
                    <Text style={styles.vehicleSpec}>
                      {vehicle.power_output}
                    </Text>
                  )}
                  <View style={styles.vehicleFooter}>
                    <View style={styles.visibilityBadge}>
                      <IconSymbol
                        ios_icon_name={vehicle.is_public ? "eye.fill" : "eye.slash.fill"}
                        android_material_icon_name={vehicle.is_public ? "visibility" : "visibility-off"}
                        size={14}
                        color={vehicle.is_public ? colors.secondary : colors.textSecondary}
                      />
                      <Text style={[
                        styles.visibilityText,
                        { color: vehicle.is_public ? colors.secondary : colors.textSecondary }
                      ]}>
                        {vehicle.is_public ? 'Public' : 'Hidden'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{vehicles.length}</Text>
            <Text style={styles.statLabel}>Vehicles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Following</Text>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    marginLeft: 0,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.accent,
    textAlign: 'center',
  },
  vehiclesContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  vehicleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    elevation: 4,
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.highlight,
  },
  vehicleImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
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
  vehicleSpec: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  vehicleFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
