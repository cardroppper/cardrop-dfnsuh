
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';
import Constants from 'expo-constants';

export default function Index() {
  const { isLoading, isAuthenticated, user, profile, error } = useAuth();
  const router = useRouter();
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    console.log('[Index] App started');
    console.log('[Index] Platform:', Platform.OS);
    console.log('[Index] Expo version:', Constants.expoVersion);
    console.log('[Index] App version:', Constants.expoConfig?.version);
    console.log('[Index] Supabase URL configured:', !!Constants.expoConfig?.extra?.supabaseUrl);
    console.log('[Index] Auth state:', { isLoading, isAuthenticated, hasUser: !!user, hasProfile: !!profile, error });
    
    // Once loading is complete, navigate based on auth state
    if (!isLoading) {
      try {
        if (isAuthenticated && user && profile) {
          console.log('[Index] User authenticated with profile, navigating to discover');
          // Use router.replace instead of Redirect for more reliable navigation
          setTimeout(() => {
            try {
              router.replace('/(tabs)/discover');
            } catch (navError: any) {
              console.error('[Index] Navigation error:', navError);
              setNavigationError(navError.message);
            }
          }, 100);
        } else if (!isAuthenticated) {
          console.log('[Index] User not authenticated, navigating to auth');
          setTimeout(() => {
            try {
              router.replace('/(auth)/login');
            } catch (navError: any) {
              console.error('[Index] Navigation error:', navError);
              setNavigationError(navError.message);
            }
          }, 100);
        }
      } catch (err: any) {
        console.error('[Index] Error in navigation logic:', err);
        setNavigationError(err.message);
      }
    }
  }, [isLoading, isAuthenticated, user, profile, router, error]);

  // Show error state if navigation failed
  if (navigationError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>⚠️ Navigation Error</Text>
        <Text style={styles.errorText}>{navigationError}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setNavigationError(null);
            if (isAuthenticated && user && profile) {
              router.replace('/(tabs)/discover');
            } else {
              router.replace('/(auth)/login');
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading CarDrop...</Text>
        {Platform.OS === 'android' && (
          <TouchableOpacity 
            style={styles.diagnosticsButton}
            onPress={() => setShowDiagnostics(!showDiagnostics)}
          >
            <Text style={styles.diagnosticsButtonText}>
              {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
            </Text>
          </TouchableOpacity>
        )}
        {showDiagnostics && (
          <View style={styles.diagnosticsContainer}>
            <Text style={styles.diagnosticsText}>Platform: {Platform.OS}</Text>
            <Text style={styles.diagnosticsText}>Version: {Constants.expoConfig?.version}</Text>
            <Text style={styles.diagnosticsText}>
              Supabase: {Constants.expoConfig?.extra?.supabaseUrl ? '✓ Configured' : '✗ Missing'}
            </Text>
            <Text style={styles.diagnosticsText}>Auth Loading: {isLoading ? 'Yes' : 'No'}</Text>
            <Text style={styles.diagnosticsText}>Error: {error || 'None'}</Text>
          </View>
        )}
      </View>
    );
  }

  // Show loading state if user exists but profile is still loading
  if (user && !profile && !error) {
    console.log('[Index] User exists but profile missing, showing setup message');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Setting up your profile...</Text>
      </View>
    );
  }

  // Show error state if auth initialization failed
  if (error) {
    console.log('[Index] Auth error detected:', error);
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>⚠️ Connection Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.retryButtonText}>Continue to Login</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  diagnosticsButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: colors.cardBackground,
  },
  diagnosticsButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  diagnosticsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    width: '100%',
  },
  diagnosticsText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
