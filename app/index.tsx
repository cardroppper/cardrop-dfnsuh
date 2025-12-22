
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const { isLoading, isAuthenticated, user, profile } = useAuth();

  useEffect(() => {
    console.log('[Index] Auth state:', { isLoading, isAuthenticated, hasUser: !!user, hasProfile: !!profile });
  }, [isLoading, isAuthenticated, user, profile]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading CarDrop...</Text>
      </View>
    );
  }

  if (user && !profile) {
    console.log('[Index] User exists but profile missing, showing error');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Setting up your profile...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    console.log('[Index] User authenticated, redirecting to tabs');
    return <Redirect href="/(tabs)/discover" />;
  }

  console.log('[Index] User not authenticated, redirecting to auth');
  return <Redirect href="/(auth)" />;
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
