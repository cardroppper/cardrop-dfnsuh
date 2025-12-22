
import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('TabLayout - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabs: TabBarItem[] = [
    {
      name: 'discover',
      route: '/(tabs)/discover',
      icon: 'explore',
      label: 'Discover',
    },
    {
      name: 'nearby',
      route: '/(tabs)/nearby',
      icon: 'location-on',
      label: 'Nearby',
    },
    {
      name: 'garage',
      route: '/(tabs)/garage',
      icon: 'garage',
      label: 'Garage',
    },
    {
      name: 'clubs',
      route: '/(tabs)/clubs',
      icon: 'groups',
      label: 'Clubs',
    },
    {
      name: 'settings',
      route: '/(tabs)/settings',
      icon: 'settings',
      label: 'Settings',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="discover" />
        <Stack.Screen name="nearby" />
        <Stack.Screen name="garage" />
        <Stack.Screen name="clubs" />
        <Stack.Screen name="settings" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
