
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicleDetails } from '@/hooks/useVehicles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/app/integrations/supabase/client';

export default function VehicleDetailScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const { vehicle, isLoading, error, refetch } = useVehicleDetails(vehicleId);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === vehicle?.user_id;

  const handleEdit = () => {
    if (vehicleId) {
      router.push(`/vehicles/edit/${vehicleId}`);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!vehicleId) return;

    try {
      setIsDeleting(true);
      console.log('[VehicleDetail] Deleting vehicle:', vehicleId);

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) {
        console.error('[VehicleDetail] Error deleting vehicle:', error);
        throw error;
      }

      console.log('[VehicleDetail] Vehicle deleted successfully');
      Alert.alert('Success', 'Vehicle deleted from your garage', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('[VehicleDetail] Error:', error);
      Alert.alert('Error', 'Failed to delete vehicle. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddModification = () => {
    router.push(`/vehicles/modifications/add?vehicleId=${vehicleId}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vehicle...</Text>
      </View>
    );
  }

  if (error || !vehicle) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <IconSymbol
          ios_icon_name="exclamationmark.triangle.fill"
          android_material_icon_name="error"
          size={48}
          color={colors.accent}
        />
        <Text style={styles.errorText}>{error || 'Vehicle not found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={refetch}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupedMods = vehicle.modifications?.reduce((acc, mod) => {
    if (!acc[mod.category]) {
      acc[mod.category] = [];
    }
    acc[mod.category].push(mod);
    return acc;
  }, {} as Record<string, typeof vehicle.modifications>);

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
        {vehicle.primary_image_url ? (
          <Image
            source={{ uri: vehicle.primary_image_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroImagePlaceholder}>
            <IconSymbol
              ios_icon_name="car.fill"
              android_material_icon_name="directions-car"
              size={80}
              color={colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {vehicle.year} {vehicle.manufacturer}
              </Text>
              <Text style={styles.model}>{vehicle.model}</Text>
            </View>
            <View style={styles.visibilityBadge}>
              <IconSymbol
                ios_icon_name={vehicle.is_public ? "eye.fill" : "eye.slash.fill"}
                android_material_icon_name={vehicle.is_public ? "visibility" : "visibility-off"}
                size={20}
                color={vehicle.is_public ? colors.secondary : colors.textSecondary}
              />
            </View>
          </View>

          {isOwner && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEdit}
              >
                <IconSymbol
                  ios_icon_name="pencil"
                  android_material_icon_name="edit"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                <IconSymbol
                  ios_icon_name="trash.fill"
                  android_material_icon_name="delete"
                  size={20}
                  color={colors.accent}
                />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsGrid}>
            {vehicle.body_style && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Body Style</Text>
                <Text style={styles.specValue}>{vehicle.body_style}</Text>
              </View>
            )}
            {vehicle.fuel_type && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Fuel Type</Text>
                <Text style={styles.specValue}>{vehicle.fuel_type}</Text>
              </View>
            )}
            {vehicle.drivetrain && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Drivetrain</Text>
                <Text style={styles.specValue}>{vehicle.drivetrain}</Text>
              </View>
            )}
            {vehicle.engine_configuration && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Engine</Text>
                <Text style={styles.specValue}>{vehicle.engine_configuration}</Text>
              </View>
            )}
            {vehicle.induction_type && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Induction</Text>
                <Text style={styles.specValue}>{vehicle.induction_type}</Text>
              </View>
            )}
            {vehicle.transmission_type && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Transmission</Text>
                <Text style={styles.specValue}>{vehicle.transmission_type}</Text>
              </View>
            )}
            {vehicle.power_output && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Power</Text>
                <Text style={styles.specValue}>{vehicle.power_output}</Text>
              </View>
            )}
            {vehicle.torque_output && (
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Torque</Text>
                <Text style={styles.specValue}>{vehicle.torque_output}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Modifications</Text>
            {isOwner && (
              <TouchableOpacity
                style={styles.addModButton}
                onPress={handleAddModification}
              >
                <IconSymbol
                  ios_icon_name="plus.circle.fill"
                  android_material_icon_name="add-circle"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {!vehicle.modifications || vehicle.modifications.length === 0 ? (
            <View style={styles.emptyMods}>
              <IconSymbol
                ios_icon_name="wrench.fill"
                android_material_icon_name="build"
                size={48}
                color={colors.textSecondary}
                style={{ opacity: 0.5 }}
              />
              <Text style={styles.emptyModsText}>No modifications yet</Text>
              {isOwner && (
                <Text style={styles.emptyModsSubtext}>
                  Add your first modification to track your build
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.modsContainer}>
              {Object.entries(groupedMods || {}).map(([category, mods]) => (
                <View key={category} style={styles.modCategory}>
                  <Text style={styles.modCategoryTitle}>{category}</Text>
                  {mods.map((mod, index) => (
                    <View key={mod.id} style={styles.modItem}>
                      <View style={styles.modBullet} />
                      <View style={styles.modContent}>
                        {mod.brand_name && mod.part_name ? (
                          <Text style={styles.modText}>
                            <Text style={styles.modBrand}>{mod.brand_name}</Text>
                            {' '}
                            {mod.part_name}
                          </Text>
                        ) : (
                          <Text style={styles.modText}>
                            {mod.brand_name || mod.part_name || 'Unnamed modification'}
                          </Text>
                        )}
                        {mod.description && (
                          <Text style={styles.modDescription}>{mod.description}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {vehicle.images && vehicle.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContainer}
            >
              {vehicle.images.map((image, index) => (
                <Image
                  key={image.id}
                  source={{ uri: image.image_url }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  androidPadding: {
    paddingTop: 0,
  },
  heroImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.highlight,
  },
  heroImagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  model: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  visibilityBadge: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  addModButton: {
    padding: 4,
  },
  specsGrid: {
    gap: 16,
  },
  specItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyMods: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  emptyModsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyModsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  modsContainer: {
    gap: 24,
  },
  modCategory: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  modCategoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  modItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
    marginTop: 8,
    marginRight: 12,
  },
  modContent: {
    flex: 1,
  },
  modText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  modBrand: {
    fontWeight: '700',
    color: colors.secondary,
  },
  modDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  galleryContainer: {
    gap: 12,
    paddingRight: 20,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: colors.highlight,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.accent,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
