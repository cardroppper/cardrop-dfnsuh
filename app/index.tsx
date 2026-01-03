
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const { isLoading, isAuthenticated, user, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[Index] Auth state:', { isLoading, isAuthenticated, hasUser: !!user, hasProfile: !!profile });
    
    // Once loading is complete, navigate based on auth state
    if (!isLoading) {
      if (isAuthenticated && user && profile) {
        console.log('[Index] User authenticated with profile, navigating to discover');
        // Use router.replace instead of Redirect for more reliable navigation
        setTimeout(() => {
          router.replace('/(tabs)/discover');
        }, 100);
      } else if (!isAuthenticated) {
        console.log('[Index] User not authenticated, navigating to auth');
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 100);
      }
    }
  }, [isLoading, isAuthenticated, user, profile, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading CarDrop...</Text>
      </View>
    );
  }

  // Show loading state if user exists but profile is still loading
  if (user && !profile) {
    console.log('[Index] User exists but profile missing, showing setup message');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Setting up your profile...</Text>
      </View>
    );
  }

  // Fallback redirects (in case useEffect navigation doesn't trigger)
  if (isAuthenticated && user && profile) {
    console.log('[Index] Fallback: Redirecting authenticated user to discover');
    return <Redirect href="/(tabs)/discover" />;
  }

  console.log('[Index] Fallback: Redirecting to auth');
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
