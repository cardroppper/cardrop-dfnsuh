
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
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { supabase } from '@/app/integrations/supabase/client';
import BLEService from '@/services/BLEService';

interface RegisteredBeacon {
  id: string;
  name: string | null;
  rssi: number;
}

interface BeaconSelectorProps {
  selectedBeaconId: string | null;
  onBeaconSelect: (beaconId: string | null) => void;
}

export function BeaconSelector({ selectedBeaconId, onBeaconSelect }: BeaconSelectorProps) {
  const [registeredBeacons, setRegisteredBeacons] = useState<RegisteredBeacon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [nearbyBeacons, setNearbyBeacons] = useState<RegisteredBeacon[]>([]);

  useEffect(() => {
    console.log('[BeaconSelector] Component mounted');
    loadRegisteredBeacons();
  }, []);

  const loadRegisteredBeacons = async () => {
    console.log('[BeaconSelector] Loading registered beacons');
    try {
      const { data, error } = await supabase
        .from('beacons')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('[BeaconSelector] Error loading beacons:', error);
        Alert.alert('Error', 'Failed to load registered beacons');
        return;
      }

      console.log('[BeaconSelector] Loaded beacons:', data?.length || 0);
      setRegisteredBeacons(data || []);
    } catch (err) {
      console.error('[BeaconSelector] Exception loading beacons:', err);
      Alert.alert('Error', 'Failed to load registered beacons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanForBeacons = async () => {
    console.log('[BeaconSelector] Starting beacon scan');
    setIsScanning(true);
    setNearbyBeacons([]);

    try {
      const hasPermission = await BLEService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Bluetooth permission is required to scan for beacons');
        setIsScanning(false);
        return;
      }

      await BLEService.startScanning((peripheral) => {
        console.log('[BeaconSelector] Detected beacon:', peripheral.id);
        setNearbyBeacons((prev) => {
          const exists = prev.find((b) => b.id === peripheral.id);
          if (exists) {
            return prev.map((b) =>
              b.id === peripheral.id ? { ...b, rssi: peripheral.rssi } : b
            );
          }
          return [...prev, { id: peripheral.id, name: peripheral.name, rssi: peripheral.rssi }];
        });
      });

      setTimeout(() => {
        BLEService.stopScanning();
        setIsScanning(false);
        console.log('[BeaconSelector] Scan complete');
      }, 10000);
    } catch (err) {
      console.error('[BeaconSelector] Scan error:', err);
      Alert.alert('Error', 'Failed to scan for beacons');
      setIsScanning(false);
    }
  };

  const handleSelectBeacon = (beaconId: string) => {
    console.log('[BeaconSelector] Beacon selected:', beaconId);
    onBeaconSelect(beaconId === selectedBeaconId ? null : beaconId);
  };

  const getSignalStrengthIcon = (rssi: number) => {
    if (rssi > -60) {
      return 'signal-cellular-4-bar';
    }
    if (rssi > -70) {
      return 'signal-cellular-3-bar';
    }
    if (rssi > -80) {
      return 'signal-cellular-2-bar';
    }
    return 'signal-cellular-1-bar';
  };

  const getSignalStrengthColor = (rssi: number) => {
    if (rssi > -60) {
      return '#4CAF50';
    }
    if (rssi > -70) {
      return '#FFC107';
    }
    if (rssi > -80) {
      return '#FF9800';
    }
    return '#F44336';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading beacons...</Text>
      </View>
    );
  }

  const selectedBeaconName = registeredBeacons.find((b) => b.id === selectedBeaconId)?.name || 'Unknown';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bluetooth Beacon</Text>
      <Text style={styles.description}>
        Assign a Bluetooth beacon to this vehicle for automatic detection
      </Text>

      {selectedBeaconId ? (
        <View style={styles.selectedBeaconContainer}>
          <View style={styles.selectedBeaconInfo}>
            <IconSymbol
              ios_icon_name="antenna.radiowaves.left.and.right"
              android_material_icon_name="bluetooth-connected"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.selectedBeaconText}>{selectedBeaconName}</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleSelectBeacon(selectedBeaconId)}
          >
            <IconSymbol
              ios_icon_name="xmark.circle.fill"
              android_material_icon_name="cancel"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[buttonStyles.secondary, styles.scanButton]}
          onPress={handleScanForBeacons}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <IconSymbol
              ios_icon_name="antenna.radiowaves.left.and.right"
              android_material_icon_name="bluetooth-searching"
              size={20}
              color={colors.primary}
            />
          )}
          <Text style={buttonStyles.secondaryText}>
            {isScanning ? 'Scanning...' : 'Scan for Beacons'}
          </Text>
        </TouchableOpacity>
      )}

      {nearbyBeacons.length > 0 && (
        <View style={styles.nearbyBeaconsContainer}>
          <Text style={styles.nearbyBeaconsTitle}>Nearby Beacons</Text>
          {nearbyBeacons.map((beacon) => {
            const isRegistered = registeredBeacons.find((b) => b.id === beacon.id);
            const beaconName = isRegistered?.name || beacon.name || beacon.id.substring(0, 8);
            const signalColor = getSignalStrengthColor(beacon.rssi);
            const signalIcon = getSignalStrengthIcon(beacon.rssi);

            return (
              <TouchableOpacity
                key={beacon.id}
                style={[
                  styles.beaconItem,
                  selectedBeaconId === beacon.id && styles.beaconItemSelected,
                ]}
                onPress={() => handleSelectBeacon(beacon.id)}
                disabled={!isRegistered}
              >
                <View style={styles.beaconItemLeft}>
                  <IconSymbol
                    ios_icon_name="antenna.radiowaves.left.and.right"
                    android_material_icon_name={signalIcon}
                    size={20}
                    color={signalColor}
                  />
                  <Text style={styles.beaconItemName}>{beaconName}</Text>
                </View>
                <View style={styles.beaconItemRight}>
                  <Text style={[styles.beaconItemRssi, { color: signalColor }]}>
                    {beacon.rssi} dBm
                  </Text>
                  {!isRegistered && (
                    <Text style={styles.beaconItemUnregistered}>Not Registered</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {registeredBeacons.length === 0 && (
        <View style={styles.emptyState}>
          <IconSymbol
            ios_icon_name="antenna.radiowaves.left.and.right.slash"
            android_material_icon_name="bluetooth-disabled"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyStateText}>No beacons registered</Text>
          <Text style={styles.emptyStateSubtext}>
            Register beacons in Settings → Beacon Registration
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  selectedBeaconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedBeaconInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedBeaconText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  clearButton: {
    padding: 4,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nearbyBeaconsContainer: {
    marginTop: 16,
  },
  nearbyBeaconsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  beaconItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  beaconItemSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  beaconItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  beaconItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  beaconItemRight: {
    alignItems: 'flex-end',
  },
  beaconItemRssi: {
    fontSize: 12,
    fontWeight: '600',
  },
  beaconItemUnregistered: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
