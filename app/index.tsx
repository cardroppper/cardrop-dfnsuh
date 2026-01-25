
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

console.log('[Index] Module loaded');

export default function Index() {
  console.log('[Index] Component rendering');
  
  const { isLoading, isAuthenticated, user, profile } = useAuth();

  useEffect(() => {
    console.log('[Index] Auth state:', { 
      isLoading, 
      isAuthenticated, 
      hasUser: !!user, 
      hasProfile: !!profile 
    });
  }, [isLoading, isAuthenticated, user, profile]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('[Index] Showing loading state');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading CarDrop...</Text>
      </View>
    );
  }

  // Redirect based on authentication state
  if (isAuthenticated && user && profile) {
    console.log('[Index] Redirecting to discover (authenticated)');
    return <Redirect href="/(tabs)/discover" />;
  }

  console.log('[Index] Redirecting to login (not authenticated)');
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
