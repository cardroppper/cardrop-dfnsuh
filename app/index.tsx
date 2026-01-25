import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const colors = {
  primary: '#FF6B35',
  background: '#0A0A0A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
};

export default function Index() {
  const { isLoading, isAuthenticated, user, profile, error } = useAuth();

  useEffect(() => {
    console.log('Index: Auth state:', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!profile,
      error,
    });
  }, [isLoading, isAuthenticated, user, profile, error]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('Index: Showing loading screen');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show error if auth failed (but still redirect to login)
  if (error) {
    console.log('Index: Auth error, redirecting to login:', error);
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect based on authentication state
  if (isAuthenticated && user && profile) {
    console.log('Index: User authenticated, redirecting to discover');
    return <Redirect href="/(tabs)/discover" />;
  }

  // Not authenticated, redirect to login
  console.log('Index: User not authenticated, redirecting to login');
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
