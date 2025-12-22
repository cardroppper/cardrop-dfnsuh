
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/styles/commonStyles';

export default function AuthIndex() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('Auth index - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/discover" />;
  }

  return <Redirect href="/(auth)/login" />;
}
