
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

console.log('[Index] Module loaded');

const colors = {
  primary: '#FF6B35',
  background: '#0A0A0A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  error: '#FF4444',
};

export default function Index() {
  console.log('[Index] Component rendering');
  
  const { isLoading, isAuthenticated, user, profile, error } = useAuth();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Index] Auth state:', { 
      isLoading, 
      isAuthenticated, 
      hasUser: !!user, 
      hasProfile: !!profile,
      error 
    });

    // Only set redirect when loading is complete
    if (!isLoading) {
      if (isAuthenticated && user && profile) {
        console.log('[Index] Setting redirect to discover (authenticated)');
        setRedirectPath('/(tabs)/discover');
      } else {
        console.log('[Index] Setting redirect to login (not authenticated)');
        setRedirectPath('/(auth)/login');
      }
    }
  }, [isLoading, isAuthenticated, user, profile, error]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('[Index] Showing loading state');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  // Show error if auth failed
  if (error) {
    console.log('[Index] Showing error state:', error);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>⚠️ Authentication Error</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <Text style={styles.loadingText}>Redirecting to login...</Text>
      </View>
    );
  }

  // Redirect based on authentication state
  if (redirectPath) {
    console.log('[Index] Redirecting to:', redirectPath);
    return <Redirect href={redirectPath as any} />;
  }

  // Fallback loading state
  console.log('[Index] Waiting for redirect path...');
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading CarDrop...</Text>
    </View>
  );
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
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
});
