import 'react-native-url-polyfill/auto';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { StripeProvider } from '@/contexts/StripeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

console.log('[RootLayout] Module loaded');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.error('[RootLayout] SplashScreen error:', err);
});

export default function RootLayout() {
  console.log('[RootLayout] Component rendering');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('[RootLayout] Initializing app');
    
    const initialize = async () => {
      try {
        console.log('[RootLayout] Starting initialization...');
        // Small delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('[RootLayout] Hiding splash screen...');
        await SplashScreen.hideAsync();
        console.log('[RootLayout] App ready');
        setIsReady(true);
      } catch (err: any) {
        console.error('[RootLayout] Initialization error:', err);
        // Set ready even on error to prevent infinite loading
        setIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.error('[RootLayout] Failed to hide splash screen:', e);
        }
      }
    };

    initialize();
  }, []);

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading CarDrop...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <StripeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="clubs" />
            <Stack.Screen name="vehicles" />
            <Stack.Screen name="messages" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="dev" />
            <Stack.Screen 
              name="modal" 
              options={{ presentation: 'modal' }} 
            />
            <Stack.Screen 
              name="formsheet" 
              options={{ 
                presentation: 'formSheet',
                sheetGrabberVisible: true,
                sheetAllowedDetents: [0.5, 0.8, 1.0],
                sheetCornerRadius: 20
              }} 
            />
            <Stack.Screen 
              name="transparent-modal" 
              options={{ 
                presentation: 'transparentModal',
                headerShown: false 
              }} 
            />
            <Stack.Screen 
              name="subscription-management" 
              options={{ presentation: 'modal' }} 
            />
          </Stack>
        </StripeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#A0A0A0',
    fontWeight: '500',
  },
});
