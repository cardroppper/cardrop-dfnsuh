
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { BeaconSelector } from '@/components/BeaconSelector';
import { supabase } from '@/app/integrations/supabase/client';
import { Vehicle } from '@/app/integrations/supabase/types';
import * as Haptics from 'expo-haptics';

export default function BeaconAssignScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [currentBeaconId, setCurrentBeaconId] = useState<string | null>(null);
  const [selectedBeaconId, setSelectedBeaconId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadVehicleAndBeacon();
  }, [vehicleId]);

  const loadVehicleAndBeacon = async () => {
    try {
      setIsLoading(true);

      // Load vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();

      if (vehicleError) {
        console.error('Error loading vehicle:', vehicleError);
        Alert.alert('Error', 'Failed to load vehicle');
        router.back();
        return;
      }

      setVehicle(vehicleData);

      // Load current beacon if exists
      const { data: beaconData, error: beaconError } = await supabase
        .from('vehicle_beacons')
        .select('beacon_uuid')
        .eq('vehicle_id', vehicleId)
        .maybeSingle();

      if (beaconError) {
        console.error('Error loading beacon:', beaconError);
      }

      if (beaconData) {
        setCurrentBeaconId(beaconData.beacon_uuid);
        setSelectedBeaconId(beaconData.beacon_uuid);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!vehicle) return;

    // If no change, just go back
    if (selectedBeaconId === currentBeaconId) {
      router.back();
      return;
    }

    setIsSaving(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      // If removing beacon
      if (!selectedBeaconId && currentBeaconId) {
        // Delete vehicle_beacon entry
        const { error: deleteError } = await supabase
          .from('vehicle_beacons')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (deleteError) {
          console.error('Error removing beacon:', deleteError);
          Alert.alert('Error', 'Failed to remove beacon');
          return;
        }

        // Update registered_beacon to mark as unassigned
        const { error: updateError } = await supabase
          .from('registered_beacons')
          .update({
            is_assigned: false,
            assigned_to_user_id: null,
            assigned_at: null,
          })
          .eq('beacon_uuid', currentBeaconId);

        if (updateError) {
          console.error('Error updating beacon status:', updateError);
        }

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Beacon removed from vehicle', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }

      // If changing beacon
      if (selectedBeaconId && currentBeaconId && selectedBeaconId !== currentBeaconId) {
        // Remove old beacon
        const { error: deleteError } = await supabase
          .from('vehicle_beacons')
          .delete()
          .eq('vehicle_id', vehicleId);

        if (deleteError) {
          console.error('Error removing old beacon:', deleteError);
          Alert.alert('Error', 'Failed to update beacon');
          return;
        }

        // Mark old beacon as unassigned
        await supabase
          .from('registered_beacons')
          .update({
            is_assigned: false,
            assigned_to_user_id: null,
            assigned_at: null,
          })
          .eq('beacon_uuid', currentBeaconId);
      }

      // If adding new beacon
      if (selectedBeaconId) {
        // Create vehicle_beacon entry
        const { error: insertError } = await supabase
          .from('vehicle_beacons')
          .insert({
            vehicle_id: vehicleId,
            beacon_uuid: selectedBeaconId,
          });

        if (insertError) {
          console.error('Error assigning beacon:', insertError);
          Alert.alert('Error', 'Failed to assign beacon');
          return;
        }

        // Update registered_beacon to mark as assigned
        const { error: updateError } = await supabase
          .from('registered_beacons')
          .update({
            is_assigned: true,
            assigned_to_user_id: userData.user?.id,
            assigned_at: new Date().toISOString(),
          })
          .eq('beacon_uuid', selectedBeaconId);

        if (updateError) {
          console.error('Error updating beacon status:', updateError);
        }
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Beacon updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving beacon:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.text}>Vehicle not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.vehicleCard}>
          <IconSymbol
            ios_icon_name="car.2.fill"
            android_material_icon_name="directions-car"
            size={32}
            color={colors.primary}
          />
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>
              {vehicle.year} {vehicle.manufacturer} {vehicle.model}
            </Text>
            {currentBeaconId && (
              <View style={styles.currentBeaconBadge}>
                <IconSymbol
                  ios_icon_name="dot.radiowaves.left.and.right"
                  android_material_icon_name="bluetooth"
                  size={16}
                  color={colors.secondary}
                />
                <Text style={styles.currentBeaconText}>Beacon Assigned</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assign Beacon</Text>
          <Text style={styles.sectionDescription}>
            {currentBeaconId
              ? 'Change or remove the beacon assigned to this vehicle.'
              : 'Assign a CarDrop beacon to enable proximity detection and automatic check-ins.'}
          </Text>

          <BeaconSelector
            selectedBeaconId={selectedBeaconId}
            onBeaconSelected={setSelectedBeaconId}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[buttonStyles.primary, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving || selectedBeaconId === currentBeaconId}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={buttonStyles.text}>
                {!selectedBeaconId && currentBeaconId ? 'Remove Beacon' : 'Save Changes'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.outline, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={isSaving}
          >
            <Text style={[buttonStyles.text, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
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
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 100,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  currentBeaconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.highlight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  currentBeaconText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 32,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
