
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useEventAttendance } from '@/hooks/useEventAttendance';

interface LiveMeetViewProps {
  eventId: string;
  eventName: string;
}

export function LiveMeetView({ eventId, eventName }: LiveMeetViewProps) {
  const router = useRouter();
  const {
    liveVehicles,
    isPremium,
    isCheckedIn,
    loading,
    refetch,
  } = useEventAttendance(eventId);

  if (!isPremium) {
    return (
      <View style={styles.premiumRequired}>
        <IconSymbol
          ios_icon_name="crown.fill"
          android_material_icon_name="workspace-premium"
          size={48}
          color="#FFD700"
        />
        <Text style={styles.premiumTitle}>Premium Feature</Text>
        <Text style={styles.premiumDescription}>
          Upgrade to Premium to see all vehicles at this meet in real-time, even when you&apos;re not there!
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading live meet view...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.title}>{eventName}</Text>
        </View>
        <Text style={styles.subtitle}>
          {liveVehicles.length} {liveVehicles.length === 1 ? 'vehicle' : 'vehicles'} detected
        </Text>
      </View>

      {!isCheckedIn && (
        <View style={styles.infoBox}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.secondary}
          />
          <Text style={styles.infoText}>
            Check in to the event to help detect vehicles and act as a gateway for other members
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {liveVehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="car.fill"
              android_material_icon_name="directions-car"
              size={64}
              color={colors.textSecondary}
              style={{ opacity: 0.3 }}
            />
            <Text style={styles.emptyStateTitle}>No Vehicles Detected Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Vehicles will appear here as members check in and detect cars at the meet
            </Text>
          </View>
        ) : (
          <View style={styles.vehicleGrid}>
            {liveVehicles.map((vehicle, index) => (
              <TouchableOpacity
                key={index}
                style={styles.vehicleCard}
                onPress={() => router.push(`/vehicles/${vehicle.vehicle_id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.redBorder}>
                  <View style={styles.vehicleImageContainer}>
                    {vehicle.primary_image_url ? (
                      <Image
                        source={{ uri: vehicle.primary_image_url }}
                        style={styles.vehicleImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <IconSymbol
                          ios_icon_name="car.fill"
                          android_material_icon_name="directions-car"
                          size={40}
                          color={colors.textSecondary}
                        />
                      </View>
                    )}
                    <View style={styles.liveBadge}>
                      <View style={styles.liveBadgeDot} />
                    </View>
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName} numberOfLines={1}>
                      {vehicle.vehicle_name}
                    </Text>
                    <Text style={styles.ownerName} numberOfLines={1}>
                      @{vehicle.owner_username}
                    </Text>
                    <Text style={styles.detectedTime}>
                      {getTimeAgo(vehicle.detected_at)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = Date.now();
  const detected = new Date(timestamp).getTime();
  const diffMs = now - detected;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return 'Yesterday';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.highlight,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  vehicleCard: {
    width: '47%',
  },
  redBorder: {
    borderWidth: 3,
    borderColor: colors.accent,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  vehicleImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.text,
  },
  liveBadgeDot: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  vehicleInfo: {
    padding: 12,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detectedTime: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  premiumRequired: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
