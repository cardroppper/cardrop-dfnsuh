
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

// Dynamically import NativeTabs only on iOS to prevent web build errors
let NativeTabs: any = null;
let Icon: any = null;
let Label: any = null;

// Only load native tabs on iOS platform
if (Platform.OS === 'ios') {
  try {
    const nativeTabsModule = require('expo-router/unstable-native-tabs');
    NativeTabs = nativeTabsModule.NativeTabs;
    Icon = nativeTabsModule.Icon;
    Label = nativeTabsModule.Label;
  } catch (error) {
    console.warn('[TabLayout iOS] Failed to load native tabs:', error);
  }
}

export default function TabLayout() {
  const { isLoading, isAuthenticated, user, profile } = useAuth();

  useEffect(() => {
    console.log('[TabLayout iOS] Auth state:', { isLoading, isAuthenticated, hasUser: !!user, hasProfile: !!profile });
  }, [isLoading, isAuthenticated, user, profile]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log('[TabLayout iOS] Not authenticated, redirecting to auth');
    return <Redirect href="/(auth)/login" />;
  }

  // Fallback to null if NativeTabs is not available (shouldn't happen on iOS, but safety check)
  if (!NativeTabs || Platform.OS !== 'ios') {
    console.warn('[TabLayout iOS] NativeTabs not available, this should not happen on iOS');
    return null;
  }

  return (
    <NativeTabs
      tintColor={colors.primary}
      iconColor={colors.textSecondary}
      labelStyle={{
        color: colors.textSecondary,
      }}
    >
      <NativeTabs.Trigger name="discover">
        <Label>Discover</Label>
        <Icon sf="sparkles" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="nearby">
        <Label>Nearby</Label>
        <Icon sf="location.fill" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="garage">
        <Label>Garage</Label>
        <Icon sf="car.2.fill" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="clubs">
        <Label>Clubs</Label>
        <Icon sf="person.3.fill" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="messages">
        <Label>Messages</Label>
        <Icon sf="message.fill" />
      </NativeTabs.Trigger>
      
      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <Icon sf="gearshape.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
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
