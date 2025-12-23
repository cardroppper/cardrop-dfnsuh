
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Tabs, Redirect, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { BeaconPairingModal } from '@/components/BeaconPairingModal';
import { useBeaconPairing } from '@/hooks/useBeaconPairing';

export default function TabLayout() {
  const { isLoading, isAuthenticated, user, profile } = useAuth();
  const { pairingBeacon, startMonitoring, stopMonitoring, dismissPairing } = useBeaconPairing();

  useEffect(() => {
    console.log('[TabLayout] Auth state:', { isLoading, isAuthenticated, hasUser: !!user, hasProfile: !!profile });
  }, [isLoading, isAuthenticated, user, profile]);

  // Start monitoring for new beacons when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[TabLayout] Starting beacon pairing monitoring');
      startMonitoring();
      
      return () => {
        console.log('[TabLayout] Stopping beacon pairing monitoring');
        stopMonitoring();
      };
    }
  }, [isAuthenticated, startMonitoring, stopMonitoring]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log('[TabLayout] Not authenticated, redirecting to auth');
    return <Redirect href="/(auth)/login" />;
  }

  const handlePairWithNewCar = () => {
    dismissPairing();
    // Navigate to add vehicle screen
    // The beacon will be available in the BeaconSelector
    router.push('/vehicles/add');
  };

  const handlePairWithExistingCar = () => {
    dismissPairing();
    // Navigate to garage where user can select a vehicle
    // Then they can assign the beacon from the vehicle details
    router.push('/(tabs)/garage');
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.highlight,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol
              ios_icon_name="sparkles"
              android_material_icon_name="explore"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: 'Nearby',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="near-me"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="garage"
        options={{
          title: 'Garage',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol
              ios_icon_name="car.2.fill"
              android_material_icon_name="garage"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'Clubs',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol
              ios_icon_name="person.3.fill"
              android_material_icon_name="groups"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol
              ios_icon_name="gearshape.fill"
              android_material_icon_name="settings"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>

    {/* Beacon Pairing Modal */}
    <BeaconPairingModal
      visible={!!pairingBeacon}
      beaconId={pairingBeacon || ''}
      onPairWithNewCar={handlePairWithNewCar}
      onPairWithExistingCar={handlePairWithExistingCar}
      onDismiss={dismissPairing}
    />
  </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
