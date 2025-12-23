
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import BLEService from '@/services/BLEService';
import { supabase } from '@/app/integrations/supabase/client';
import { RegisteredBeacon } from '@/app/integrations/supabase/types';
import * as Haptics from 'expo-haptics';

interface UnregisteredBeacon {
  id: string;
  name: string | null;
  rssi: number;
  manufacturerData?: string;
}

export default function BeaconRegistrationScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [unregisteredBeacons, setUnregisteredBeacons] = useState<UnregisteredBeacon[]>([]);
  const [registeredBeacons, setRegisteredBeacons] = useState<RegisteredBeacon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBeacon, setSelectedBeacon] = useState<UnregisteredBeacon | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadRegisteredBeacons();
    
    return () => {
      if (isScanning) {
        BLEService.stopScanning();
      }
    };
  }, [isScanning]);

  const loadRegisteredBeacons = async () => {
    try {
      const { data, error } = await supabase
        .from('registered_beacons')
        .select('*')
        .order('registered_at', { ascending: false });

      if (error) {
        console.error('Error loading registered beacons:', error);
        return;
      }

      setRegisteredBeacons(data || []);
    } catch (error) {
      console.error('Error loading registered beacons:', error);
    }
  };

  const startScanning = async () => {
    if (!BLEService.isBluetoothSupported()) {
      Alert.alert(
        'Not Supported',
        'Bluetooth is not supported on this platform. Please use a physical device.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const hasPermissions = await BLEService.requestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'Bluetooth permissions are required to scan for beacons.',
          [{ text: 'OK' }]
        );
        return;
      }

      const state = await BLEService.checkBluetoothState();
      if (state !== 'PoweredOn') {
        Alert.alert(
          'Bluetooth Disabled',
          'Please enable Bluetooth to scan for beacons.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsScanning(true);
      setUnregisteredBeacons([]);
      
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start scanning for all BLE devices
      const success = await BLEService.startScanning(
        (beacons) => {
          // Filter for FSC-BP108B beacons (Feasycom beacons)
          const feasycomBeacons = beacons
            .filter(beacon => {
              // Check if beacon is already registered
              const isRegistered = registeredBeacons.some(
                rb => rb.beacon_uuid === beacon.deviceId
              );
              return !isRegistered;
            })
            .map(beacon => ({
              id: beacon.deviceId,
              name: null, // We'll get this from the actual device
              rssi: beacon.rssi,
            }));

          setUnregisteredBeacons(feasycomBeacons);
        },
        (error) => {
          console.error('Scanning error:', error);
          Alert.alert('Scanning Error', error.message);
          setIsScanning(false);
        }
      );

      if (!success) {
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Error starting scan:', error);
      Alert.alert('Error', 'Failed to start scanning');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    BLEService.stopScanning();
    setIsScanning(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const registerBeacon = async (beacon: UnregisteredBeacon) => {
    setSelectedBeacon(beacon);
    
    Alert.alert(
      'Register Beacon',
      `Register beacon ${beacon.id}?\n\nThis will add it to the CarDrop system.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            await performRegistration(beacon);
          },
        },
      ]
    );
  };

  const performRegistration = async (beacon: UnregisteredBeacon) => {
    setIsLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('registered_beacons')
        .insert({
          beacon_uuid: beacon.id,
          device_model: 'FSC-BP108B',
          manufacturer: 'FEASYCOM',
          is_configured: true,
          is_assigned: false,
          registered_by: userData.user?.id,
          configured_at: new Date().toISOString(),
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering beacon:', error);
        Alert.alert('Error', 'Failed to register beacon: ' + error.message);
        return;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Success',
        'Beacon registered successfully!',
        [{ text: 'OK' }]
      );

      setNotes('');
      setSelectedBeacon(null);
      
      // Remove from unregistered list
      setUnregisteredBeacons(prev => prev.filter(b => b.id !== beacon.id));
      
      // Reload registered beacons
      await loadRegisteredBeacons();
    } catch (error) {
      console.error('Error registering beacon:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBeacon = async (beaconId: string) => {
    Alert.alert(
      'Delete Beacon',
      'Are you sure you want to delete this beacon registration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('registered_beacons')
                .delete()
                .eq('id', beaconId);

              if (error) {
                console.error('Error deleting beacon:', error);
                Alert.alert('Error', 'Failed to delete beacon');
                return;
              }

              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await loadRegisteredBeacons();
            } catch (error) {
              console.error('Error deleting beacon:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const getSignalStrength = (rssi: number): { label: string; color: string } => {
    if (rssi >= -60) {
      return { label: 'Excellent', color: colors.success };
    } else if (rssi >= -75) {
      return { label: 'Good', color: colors.secondary };
    } else if (rssi >= -90) {
      return { label: 'Fair', color: colors.warning };
    } else {
      return { label: 'Weak', color: colors.accent };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="antenna.radiowaves.left.and.right"
          android_material_icon_name="bluetooth-searching"
          size={48}
          color={colors.secondary}
        />
        <Text style={styles.headerTitle}>Beacon Registration</Text>
        <Text style={styles.headerSubtitle}>
          Scan and register FSC-BP108B beacons for CarDrop
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scan for New Beacons</Text>
          {isScanning && (
            <ActivityIndicator size="small" color={colors.secondary} />
          )}
        </View>

        <TouchableOpacity
          style={[
            buttonStyles.primary,
            isScanning && styles.scanningButton,
          ]}
          onPress={isScanning ? stopScanning : startScanning}
          disabled={isLoading}
        >
          <Text style={buttonStyles.text}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Text>
        </TouchableOpacity>

        {unregisteredBeacons.length > 0 && (
          <View style={styles.beaconList}>
            <Text style={styles.listTitle}>
              Found {unregisteredBeacons.length} unregistered beacon(s)
            </Text>
            {unregisteredBeacons.map((beacon, index) => {
              const signal = getSignalStrength(beacon.rssi);
              return (
                <View key={index} style={styles.beaconCard}>
                  <View style={styles.beaconInfo}>
                    <View style={styles.beaconHeader}>
                      <IconSymbol
                        ios_icon_name="dot.radiowaves.left.and.right"
                        android_material_icon_name="bluetooth"
                        size={24}
                        color={colors.secondary}
                      />
                      <Text style={styles.beaconId} numberOfLines={1}>
                        {beacon.id}
                      </Text>
                    </View>
                    <View style={styles.beaconDetails}>
                      <View style={styles.signalBadge}>
                        <Text style={[styles.signalText, { color: signal.color }]}>
                          {signal.label}
                        </Text>
                        <Text style={styles.rssiText}>{beacon.rssi} dBm</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => registerBeacon(beacon)}
                    disabled={isLoading}
                  >
                    <Text style={styles.registerButtonText}>Register</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {isScanning && unregisteredBeacons.length === 0 && (
          <View style={styles.scanningState}>
            <Text style={styles.scanningText}>
              Scanning for FSC-BP108B beacons...
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Registered Beacons ({registeredBeacons.length})
        </Text>

        {registeredBeacons.length === 0 ? (
          <View style={commonStyles.emptyState}>
            <IconSymbol
              ios_icon_name="antenna.radiowaves.left.and.right.slash"
              android_material_icon_name="bluetooth-disabled"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={commonStyles.emptyStateText}>
              No beacons registered yet
            </Text>
          </View>
        ) : (
          <View style={styles.beaconList}>
            {registeredBeacons.map((beacon) => (
              <View key={beacon.id} style={styles.registeredBeaconCard}>
                <View style={styles.beaconInfo}>
                  <View style={styles.beaconHeader}>
                    <IconSymbol
                      ios_icon_name={beacon.is_assigned ? 'checkmark.circle.fill' : 'circle'}
                      android_material_icon_name={beacon.is_assigned ? 'check-circle' : 'radio-button-unchecked'}
                      size={24}
                      color={beacon.is_assigned ? colors.success : colors.textSecondary}
                    />
                    <View style={styles.beaconTextInfo}>
                      <Text style={styles.beaconId} numberOfLines={1}>
                        {beacon.beacon_uuid}
                      </Text>
                      <Text style={styles.beaconModel}>
                        {beacon.manufacturer} {beacon.device_model}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.beaconMeta}>
                    <Text style={styles.beaconMetaText}>
                      {beacon.is_assigned ? 'Assigned' : 'Available'}
                    </Text>
                    <Text style={styles.beaconMetaText}>
                      {new Date(beacon.registered_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {beacon.notes && (
                    <Text style={styles.beaconNotes}>{beacon.notes}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteBeacon(beacon.id)}
                >
                  <IconSymbol
                    ios_icon_name="trash"
                    android_material_icon_name="delete"
                    size={20}
                    color={colors.accent}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
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
  },
  scanningButton: {
    backgroundColor: colors.accent,
  },
  beaconList: {
    marginTop: 16,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  beaconCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  registeredBeaconCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  beaconInfo: {
    flex: 1,
  },
  beaconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  beaconTextInfo: {
    flex: 1,
  },
  beaconId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  beaconModel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  beaconDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rssiText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  registerButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  deleteButton: {
    padding: 8,
  },
  beaconMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  beaconMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  beaconNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  scanningState: {
    alignItems: 'center',
    padding: 32,
  },
  scanningText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});
