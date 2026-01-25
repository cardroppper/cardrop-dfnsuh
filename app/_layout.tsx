
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { StripeProvider } from '@/contexts/StripeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Import URL polyfill for Supabase (must be before any Supabase imports)
import 'react-native-url-polyfill/auto';

// Import reanimated to ensure it's included in the bundle
import 'react-native-reanimated';

console.log('[RootLayout] Module loaded');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.error('[RootLayout] SplashScreen error:', err);
});

export default function RootLayout() {
  console.log('[RootLayout] Component rendering');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[RootLayout] Initializing app');
    
    const initialize = async () => {
      try {
        console.log('[RootLayout] Starting initialization...');
        
        // Give the app a moment to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('[RootLayout] Hiding splash screen');
        await SplashScreen.hideAsync();
        
        console.log('[RootLayout] App ready');
        setIsReady(true);
      } catch (err: any) {
        console.error('[RootLayout] Initialization error:', err);
        console.error('[RootLayout] Error stack:', err?.stack);
        setError(err.message || 'Failed to initialize app');
        setIsReady(true); // Still set ready to show error
        
        // Try to hide splash screen even on error
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.error('[RootLayout] Failed to hide splash screen:', e);
        }
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    console.log('[RootLayout] Showing loading state');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading CarDrop...</Text>
      </View>
    );
  }

  if (error) {
    console.log('[RootLayout] Showing error state:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Initialization Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorDetail}>Check console for details</Text>
      </View>
    );
  }

  console.log('[RootLayout] Rendering app structure');

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
  errorContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  errorDetail: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
  },
});
