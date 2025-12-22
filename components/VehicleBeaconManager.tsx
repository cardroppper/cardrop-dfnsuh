
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { CARDROP_BEACON_UUID } from '@/types/ble';

interface VehicleBeaconManagerProps {
  vehicleId: string;
  onClose: () => void;
}

export function VehicleBeaconManager({ vehicleId, onClose }: VehicleBeaconManagerProps) {
  const [beaconId, setBeaconId] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingBeacon, setExistingBeacon] = useState<any>(null);
  const [fetchingBeacon, setFetchingBeacon] = useState(true);

  useEffect(() => {
    fetchExistingBeacon();
  }, [vehicleId]);

  const fetchExistingBeacon = async () => {
    try {
      setFetchingBeacon(true);
      const { data, error } = await supabase
        .from('vehicle_beacons')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching beacon:', error);
        return;
      }

      if (data) {
        setExistingBeacon(data);
        setBeaconId(data.beacon_uuid);
      }
    } catch (err) {
      console.error('Error fetching beacon:', err);
    } finally {
      setFetchingBeacon(false);
    }
  };

  const handleSaveBeacon = async () => {
    if (!beaconId.trim()) {
      Alert.alert('Error', 'Please enter a beacon identifier');
      return;
    }

    try {
      setLoading(true);

      if (existingBeacon) {
        const { error } = await supabase
          .from('vehicle_beacons')
          .update({
            beacon_uuid: beaconId.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingBeacon.id);

        if (error) throw error;

        Alert.alert('Success', 'Beacon updated successfully');
      } else {
        const { error } = await supabase
          .from('vehicle_beacons')
          .insert({
            vehicle_id: vehicleId,
            beacon_uuid: beaconId.trim(),
          });

        if (error) throw error;

        Alert.alert('Success', 'Beacon added successfully');
      }

      await fetchExistingBeacon();
    } catch (err: any) {
      console.error('Error saving beacon:', err);
      Alert.alert('Error', err.message || 'Failed to save beacon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBeacon = async () => {
    if (!existingBeacon) return;

    Alert.alert(
      'Remove Beacon',
      'Are you sure you want to remove this beacon? Your vehicle will no longer be discoverable via Bluetooth.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase
                .from('vehicle_beacons')
                .delete()
                .eq('id', existingBeacon.id);

              if (error) throw error;

              setExistingBeacon(null);
              setBeaconId('');
              Alert.alert('Success', 'Beacon removed successfully');
            } catch (err: any) {
              console.error('Error removing beacon:', err);
              Alert.alert('Error', err.message || 'Failed to remove beacon');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (fetchingBeacon) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Beacon</Text>
          <TouchableOpacity onPress={onClose}>
            <IconSymbol
              ios_icon_name="xmark.circle.fill"
              android_material_icon_name="close"
              size={28}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Beacon</Text>
        <TouchableOpacity onPress={onClose}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="close"
            size={28}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <IconSymbol
          ios_icon_name="antenna.radiowaves.left.and.right"
          android_material_icon_name="bluetooth"
          size={32}
          color={colors.primary}
        />
        <Text style={styles.infoTitle}>BLE Beacon Setup</Text>
        <Text style={styles.infoText}>
          Associate a Bluetooth Low Energy (BLE) beacon with this vehicle to make it discoverable 
          to other CarDrop users nearby. The beacon must broadcast with a CarDrop-compatible identifier.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Beacon Identifier</Text>
        <Text style={styles.helperText}>
          Enter the unique identifier of your CarDrop beacon device
        </Text>
        <TextInput
          style={styles.input}
          value={beaconId}
          onChangeText={setBeaconId}
          placeholder="e.g., CD-ABC123"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <View style={styles.uuidCard}>
          <Text style={styles.uuidLabel}>CarDrop Beacon UUID:</Text>
          <Text style={styles.uuidText}>{CARDROP_BEACON_UUID}</Text>
          <Text style={styles.uuidHelper}>
            Your beacon must use this UUID to be recognized by CarDrop
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[buttonStyles.primary, styles.button, loading && styles.buttonDisabled]}
            onPress={handleSaveBeacon}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={buttonStyles.text}>
                {existingBeacon ? 'Update Beacon' : 'Add Beacon'}
              </Text>
            )}
          </TouchableOpacity>

          {existingBeacon && (
            <TouchableOpacity
              style={[buttonStyles.outline, styles.button, styles.removeButton]}
              onPress={handleRemoveBeacon}
              disabled={loading}
            >
              <Text style={[buttonStyles.text, styles.removeButtonText]}>
                Remove Beacon
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.requirementsCard}>
        <Text style={styles.requirementsTitle}>Beacon Requirements:</Text>
        <View style={styles.requirement}>
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check-circle"
            size={20}
            color={colors.success}
          />
          <Text style={styles.requirementText}>
            Must broadcast with CarDrop UUID
          </Text>
        </View>
        <View style={styles.requirement}>
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check-circle"
            size={20}
            color={colors.success}
          />
          <Text style={styles.requirementText}>
            Device name must include &quot;CarDrop&quot; or start with &quot;CD-&quot;
          </Text>
        </View>
        <View style={styles.requirement}>
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check-circle"
            size={20}
            color={colors.success}
          />
          <Text style={styles.requirementText}>
            Vehicle must be set to public visibility
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.card,
    marginBottom: 16,
  },
  uuidCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  uuidLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  uuidText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.primary,
    marginBottom: 8,
  },
  uuidHelper: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  removeButton: {
    borderColor: colors.error,
  },
  removeButtonText: {
    color: colors.error,
  },
  requirementsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
