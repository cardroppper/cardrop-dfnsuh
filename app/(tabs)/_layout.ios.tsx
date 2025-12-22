
import React, { useEffect } from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('iOS TabLayout - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
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

  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.primary}
      iconColor={colors.textSecondary}
    >
      <NativeTabs.Trigger name="discover">
        <Icon sf="sparkles" />
        <Label>Discover</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nearby">
        <Icon sf="location.fill" />
        <Label>Nearby</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="garage">
        <Icon sf="car.fill" />
        <Label>Garage</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="clubs">
        <Icon sf="person.3.fill" />
        <Label>Clubs</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf="gearshape.fill" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
