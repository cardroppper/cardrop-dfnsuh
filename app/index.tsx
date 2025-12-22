
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('[Index] Auth state:', { isLoading, isAuthenticated });
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
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
});
