
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { colors, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import BLEService from '@/services/BLEService';
import { supabase } from '@/app/integrations/supabase/client';
import { RegisteredBeacon } from '@/app/integrations/supabase/types';
import * as Haptics from 'expo-haptics';

interface BeaconSelectorProps {
  selectedBeaconId?: string | null;
  onBeaconSelected: (beaconId: string | null) => void;
}

export function BeaconSelector({ selectedBeaconId, onBeaconSelected }: BeaconSelectorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [availableBeacons, setAvailableBeacons] = useState<RegisteredBeacon[]>([]);
  const [nearbyBeacons, setNearbyBeacons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAvailableBeacons();
    
    return () => {
      if (isScanning) {
        BLEService.stopScanning();
      }
    };
  }, [isScanning]);

  const loadAvailableBeacons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('registered_beacons')
        .select('*')
        .eq('is_configured', true)
        .eq('is_assigned', false)
        .order('registered_at', { ascending: false });

      if (error) {
        console.error('Error loading available beacons:', error);
        return;
      }

      setAvailableBeacons(data || []);
    } catch (error) {
      console.error('Error loading available beacons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startScanning = async () => {
    if (!BLEService.isBluetoothSupported()) {
      Alert.alert(
        'Not Supported',
        'Bluetooth is not supported on this platform.',
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
      setNearbyBeacons(new Set());
      
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const success = await BLEService.startScanning(
        (beacons) => {
          const nearby = new Set<string>();
          beacons.forEach(beacon => {
            // Only show beacons that are in our available list
            if (availableBeacons.some(ab => ab.beacon_uuid === beacon.deviceId)) {
              nearby.add(beacon.deviceId);
            }
          });
          setNearbyBeacons(nearby);
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

  const handleSelectBeacon = (beaconId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBeaconSelected(beaconId === selectedBeaconId ? null : beaconId);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (availableBeacons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol
          ios_icon_name="antenna.radiowaves.left.and.right.slash"
          android_material_icon_name="bluetooth-disabled"
          size={32}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyText}>
          No available beacons. Contact support to get a CarDrop beacon.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {availableBeacons.length} beacon(s) available
        </Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={isScanning ? stopScanning : startScanning}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : (
            <IconSymbol
              ios_icon_name="antenna.radiowaves.left.and.right"
              android_material_icon_name="bluetooth-searching"
              size={20}
              color={colors.secondary}
            />
          )}
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.beaconList}>
        {availableBeacons.map((beacon) => {
          const isNearby = nearbyBeacons.has(beacon.beacon_uuid);
          const isSelected = selectedBeaconId === beacon.beacon_uuid;
          
          return (
            <TouchableOpacity
              key={beacon.id}
              style={[
                styles.beaconCard,
                isSelected && styles.beaconCardSelected,
                isNearby && styles.beaconCardNearby,
              ]}
              onPress={() => handleSelectBeacon(beacon.beacon_uuid)}
            >
              <View style={styles.beaconInfo}>
                <IconSymbol
                  ios_icon_name={isSelected ? 'checkmark.circle.fill' : 'circle'}
                  android_material_icon_name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
                  size={24}
                  color={isSelected ? colors.secondary : colors.textSecondary}
                />
                <View style={styles.beaconDetails}>
                  <Text style={styles.beaconId} numberOfLines={1}>
                    {beacon.beacon_uuid.substring(0, 16)}...
                  </Text>
                  <Text style={styles.beaconModel}>
                    {beacon.manufacturer} {beacon.device_model}
                  </Text>
                </View>
              </View>
              {isNearby && (
                <View style={styles.nearbyBadge}>
                  <IconSymbol
                    ios_icon_name="dot.radiowaves.left.and.right"
                    android_material_icon_name="bluetooth"
                    size={16}
                    color={colors.secondary}
                  />
                  <Text style={styles.nearbyText}>Nearby</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedBeaconId && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onBeaconSelected(null)}
        >
          <Text style={styles.clearButtonText}>Clear Selection</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  scanButtonText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
  },
  beaconList: {
    gap: 8,
  },
  beaconCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  beaconCardSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.highlight,
  },
  beaconCardNearby: {
    borderColor: colors.secondary,
  },
  beaconInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  beaconDetails: {
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
  nearbyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.highlight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  nearbyText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
  },
  clearButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
