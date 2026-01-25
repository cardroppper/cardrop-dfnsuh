
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  RefreshControl,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useEventAttendance } from '@/hooks/useEventAttendance';
import { useRouter } from 'expo-router';

interface LiveMeetViewProps {
  eventId: string;
  eventTitle: string;
}

function resolveImageSource(
  source: string | number | ImageSourcePropType | undefined
): ImageSourcePropType {
  if (!source) {
    return { uri: '' };
  }
  if (typeof source === 'string') {
    return { uri: source };
  }
  return source as ImageSourcePropType;
}

export function LiveMeetView({ eventId, eventTitle }: LiveMeetViewProps) {
  const router = useRouter();
  const {
    attendees,
    isLoading,
    error,
    isUserInGeofence,
    checkGeofence,
    refreshAttendees,
  } = useEventAttendance(eventId);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    console.log('[LiveMeetView] Component mounted for event:', eventId);
    checkGeofence();
  }, [eventId]);

  const handleRefresh = async () => {
    console.log('[LiveMeetView] Refreshing attendees');
    setIsRefreshing(true);
    await refreshAttendees();
    await checkGeofence();
    setIsRefreshing(false);
  };

  const handleVehiclePress = (vehicleId: string) => {
    console.log('[LiveMeetView] Vehicle pressed:', vehicleId);
    router.push(`/vehicles/${vehicleId}`);
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

  const formatDetectionTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return 'Just now';
    }
    if (diffMins < 60) {
      const minsText = diffMins === 1 ? 'min' : 'mins';
      return `${diffMins} ${minsText} ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    const hoursText = diffHours === 1 ? 'hour' : 'hours';
    return `${diffHours} ${hoursText} ago`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading live meet data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol
          ios_icon_name="exclamationmark.triangle"
          android_material_icon_name="warning"
          size={48}
          color={colors.error}
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const attendeeCount = attendees.length;
  const attendeeText = attendeeCount === 1 ? 'vehicle' : 'vehicles';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.liveIndicator, isUserInGeofence && styles.liveIndicatorActive]}>
            <View style={styles.liveIndicatorDot} />
            <Text style={styles.liveIndicatorText}>
              {isUserInGeofence ? 'LIVE' : 'NOT AT EVENT'}
            </Text>
          </View>
          <Text style={styles.attendeeCount}>
            {attendeeCount} {attendeeText} detected
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.attendeesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {attendees.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="antenna.radiowaves.left.and.right.slash"
              android_material_icon_name="bluetooth-disabled"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateTitle}>No vehicles detected</Text>
            <Text style={styles.emptyStateText}>
              {isUserInGeofence
                ? 'Vehicles with Bluetooth beacons will appear here when detected'
                : 'You need to be at the event location to see detected vehicles'}
            </Text>
          </View>
        ) : (
          attendees.map((attendee) => {
            const signalColor = getSignalStrengthColor(attendee.rssi);
            const signalIcon = getSignalStrengthIcon(attendee.rssi);
            const detectionTime = formatDetectionTime(attendee.detected_at);
            const ownerName = attendee.owner_display_name || attendee.owner_username;
            const imageSource = resolveImageSource(attendee.primary_image_url);

            return (
              <TouchableOpacity
                key={attendee.vehicle_id}
                style={styles.attendeeCard}
                onPress={() => handleVehiclePress(attendee.vehicle_id)}
              >
                <Image source={imageSource} style={styles.vehicleImage} />
                <View style={styles.attendeeInfo}>
                  <Text style={styles.vehicleName}>{attendee.vehicle_name}</Text>
                  <Text style={styles.ownerName}>{ownerName}</Text>
                  <View style={styles.detectionMeta}>
                    <View style={styles.detectionMetaItem}>
                      <IconSymbol
                        ios_icon_name="antenna.radiowaves.left.and.right"
                        android_material_icon_name={signalIcon}
                        size={14}
                        color={signalColor}
                      />
                      <Text style={[styles.detectionMetaText, { color: signalColor }]}>
                        {attendee.rssi} dBm
                      </Text>
                    </View>
                    <View style={styles.detectionMetaItem}>
                      <IconSymbol
                        ios_icon_name="clock"
                        android_material_icon_name="access-time"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.detectionMetaText}>{detectionTime}</Text>
                    </View>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveIndicatorActive: {
    opacity: 1,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  liveIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
    letterSpacing: 0.5,
  },
  attendeeCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  refreshButton: {
    padding: 8,
  },
  attendeesList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  vehicleImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  attendeeInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  detectionMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  detectionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detectionMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
