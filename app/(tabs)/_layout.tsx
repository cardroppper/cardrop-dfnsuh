
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function TabLayout() {
  const { isLoading, isAuthenticated, user, profile } = useAuth();

  useEffect(() => {
    console.log('[TabLayout] Mounted');
    console.log('[TabLayout] Auth state:', { isLoading, isAuthenticated, hasUser: !!user, hasProfile: !!profile });
  }, [isLoading, isAuthenticated, user, profile]);

  if (isLoading) {
    console.log('[TabLayout] Loading...');
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

  console.log('[TabLayout] Rendering tabs');

  return (
    <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
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
                android_material_icon_name="location-on"
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
                android_material_icon_name="group"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, size }) => (
              <IconSymbol
                ios_icon_name="message.fill"
                android_material_icon_name="message"
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
