
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useBLEScanning } from '@/hooks/useBLEScanning';
import { getDistanceLabel } from '@/types/ble';

export default function NearbyScreen() {
  const router = useRouter();
  const {
    isScanning,
    nearbyVehicles,
    error,
    permissionGranted,
    startScanning,
    stopScanning,
    requestPermissions,
  } = useBLEScanning();

  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isScanning, stopScanning]);

  const handleStartScanning = async () => {
    await startScanning();
  };

  const handleStopScanning = () => {
    stopScanning();
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'CarDrop needs Bluetooth access to discover nearby vehicles. Please enable Bluetooth permissions in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVehiclePress = (vehicleId: string) => {
    router.push(`/vehicles/${vehicleId}`);
  };

  const getSignalStrengthIcon = (rssi: number) => {
    if (rssi >= -60) {
      return 'antenna.radiowaves.left.and.right';
    } else if (rssi >= -75) {
      return 'antenna.radiowaves.left.and.right';
    } else {
      return 'antenna.radiowaves.left.and.right';
    }
  };

  const getSignalStrengthColor = (rssi: number) => {
    if (rssi >= -60) {
      return colors.success;
    } else if (rssi >= -75) {
      return colors.warning;
    } else {
      return colors.textSecondary;
    }
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
          <Text style={styles.subtitle}>
            Discover vehicles near you using Bluetooth
          </Text>
        </View>

        {permissionGranted === false && (
          <View style={styles.permissionCard}>
            <IconSymbol
              ios_icon_name="antenna.radiowaves.left.and.right.slash"
              android_material_icon_name="bluetooth-disabled"
              size={48}
              color={colors.primary}
            />
            <Text style={styles.permissionTitle}>Bluetooth Permission Required</Text>
            <Text style={styles.permissionText}>
              CarDrop uses Bluetooth to discover vehicles that are physically near you. 
              This feature only works when you explicitly start scanning.
            </Text>
            <TouchableOpacity
              style={[buttonStyles.primary, styles.permissionButton]}
              onPress={handleRequestPermission}
            >
              <Text style={buttonStyles.text}>Enable Bluetooth</Text>
            </TouchableOpacity>
          </View>
        )}

        {permissionGranted === true && (
          <>
            <View style={styles.controlSection}>
              {!isScanning ? (
                <TouchableOpacity
                  style={[buttonStyles.primary, styles.scanButton]}
                  onPress={handleStartScanning}
                >
                  <IconSymbol
                    ios_icon_name="antenna.radiowaves.left.and.right"
                    android_material_icon_name="bluetooth-searching"
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={[buttonStyles.text, styles.scanButtonText]}>
                    Start Scanning
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[buttonStyles.secondary, styles.scanButton]}
                  onPress={handleStopScanning}
                >
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[buttonStyles.text, styles.scanButtonText, { color: colors.primary }]}>
                    Stop Scanning
                  </Text>
                </TouchableOpacity>
              )}

              {isScanning && (
                <View style={styles.scanningIndicator}>
                  <View style={styles.scanningDot} />
                  <Text style={styles.scanningText}>
                    Scanning for nearby vehicles...
                  </Text>
                </View>
              )}
            </View>

            {error && (
              <View style={styles.errorCard}>
                <IconSymbol
                  ios_icon_name="exclamationmark.triangle.fill"
                  android_material_icon_name="error"
                  size={24}
                  color={colors.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconSymbol
                  ios_icon_name="car.fill"
                  android_material_icon_name="directions-car"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={styles.sectionTitle}>
                  Nearby Vehicles {nearbyVehicles.length > 0 && `(${nearbyVehicles.length})`}
                </Text>
              </View>

              {nearbyVehicles.length === 0 && !isScanning && (
                <View style={commonStyles.emptyState}>
                  <IconSymbol
                    ios_icon_name="magnifyingglass"
                    android_material_icon_name="search"
                    size={48}
                    color={colors.textSecondary}
                    style={{ opacity: 0.5 }}
                  />
                  <Text style={commonStyles.emptyStateText}>
                    Start scanning to discover nearby vehicles
                  </Text>
                </View>
              )}

              {nearbyVehicles.length === 0 && isScanning && (
                <View style={commonStyles.emptyState}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[commonStyles.emptyStateText, { marginTop: 16 }]}>
                    Looking for nearby vehicles...
                  </Text>
                </View>
              )}

              {nearbyVehicles.map((vehicle, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.vehicleCard}
                  onPress={() => handleVehiclePress(vehicle.vehicleId)}
                  activeOpacity={0.7}
                >
                  {vehicle.primaryImageUrl ? (
                    <Image
                      source={{ uri: vehicle.primaryImageUrl }}
                      style={styles.vehicleImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.vehicleImage, styles.vehicleImagePlaceholder]}>
                      <IconSymbol
                        ios_icon_name="car.fill"
                        android_material_icon_name="directions-car"
                        size={32}
                        color={colors.textSecondary}
                      />
                    </View>
                  )}

                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName} numberOfLines={1}>
                      {vehicle.vehicleName}
                    </Text>
                    <Text style={styles.vehicleOwner} numberOfLines={1}>
                      @{vehicle.ownerUsername}
                    </Text>

                    <View style={styles.vehicleMetadata}>
                      <View style={styles.distanceBadge}>
                        <IconSymbol
                          ios_icon_name={getSignalStrengthIcon(vehicle.rssi)}
                          android_material_icon_name="bluetooth"
                          size={14}
                          color={getSignalStrengthColor(vehicle.rssi)}
                        />
                        <Text style={[styles.distanceText, { color: getSignalStrengthColor(vehicle.rssi) }]}>
                          {getDistanceLabel(vehicle.distance)}
                        </Text>
                      </View>

                      <Text style={styles.rssiText}>
                        Signal: {vehicle.rssi} dBm
                      </Text>
                    </View>
                  </View>

                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>How it works</Text>
                  <Text style={styles.infoText}>
                    CarDrop uses Bluetooth Low Energy (BLE) beacons to detect vehicles near you. 
                    Only vehicles with CarDrop beacons and public visibility will appear. 
                    Scanning only happens when you start it manually.
                  </Text>
                </View>
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
    paddingBottom: 120,
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
  controlSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  scanningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  scanningText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },
  vehicleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  vehicleImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  vehicleImagePlaceholder: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    gap: 4,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  vehicleOwner: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  vehicleMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rssiText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  infoContent: {
    flex: 1,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
