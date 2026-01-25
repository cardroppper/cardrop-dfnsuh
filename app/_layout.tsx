import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

console.log('[RootLayout] Starting module load...');

// Import URL polyfill for Supabase (must be before any Supabase imports)
try {
  require('react-native-url-polyfill/auto');
  console.log('[RootLayout] URL polyfill loaded');
} catch (error) {
  console.error('[RootLayout] Failed to load URL polyfill:', error);
}

// Import reanimated to ensure it's included in the bundle
try {
  require('react-native-reanimated');
  console.log('[RootLayout] Reanimated loaded');
} catch (error) {
  console.error('[RootLayout] Failed to load reanimated:', error);
}

// Import providers directly (no lazy loading to avoid build issues)
let AuthProvider: any;
let StripeProvider: any;
let ErrorBoundary: any;

try {
  const authModule = require('@/contexts/AuthContext');
  AuthProvider = authModule.AuthProvider;
  console.log('[RootLayout] AuthProvider loaded');
} catch (error) {
  console.error('[RootLayout] Failed to load AuthProvider:', error);
}

try {
  const stripeModule = require('@/contexts/StripeContext');
  StripeProvider = stripeModule.StripeProvider;
  console.log('[RootLayout] StripeProvider loaded');
} catch (error) {
  console.error('[RootLayout] Failed to load StripeProvider:', error);
}

try {
  const errorBoundaryModule = require('@/components/ErrorBoundary');
  ErrorBoundary = errorBoundaryModule.ErrorBoundary;
  console.log('[RootLayout] ErrorBoundary loaded');
} catch (error) {
  console.error('[RootLayout] Failed to load ErrorBoundary:', error);
}

console.log('[RootLayout] Module loaded successfully');

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
        
        // Give the app a moment to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('[RootLayout] Hiding splash screen');
        await SplashScreen.hideAsync();
        
        console.log('[RootLayout] App ready');
        setIsReady(true);
      } catch (err: any) {
        console.error('[RootLayout] Initialization error:', err);
        console.error('[RootLayout] Error stack:', err?.stack);
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

  console.log('[RootLayout] Rendering app structure');

  // Check if providers loaded successfully
  if (!AuthProvider || !StripeProvider || !ErrorBoundary) {
    console.error('[RootLayout] Missing required providers');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ App Failed to Initialize</Text>
        <Text style={styles.errorText}>Required components failed to load</Text>
        <Text style={styles.errorDetail}>
          {!AuthProvider && 'AuthProvider missing. '}
          {!StripeProvider && 'StripeProvider missing. '}
          {!ErrorBoundary && 'ErrorBoundary missing.'}
        </Text>
      </View>
    );
  }

  try {
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
  } catch (error: any) {
    console.error('[RootLayout] Fatal error rendering app:', error);
    console.error('[RootLayout] Error stack:', error?.stack);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ App Failed to Load</Text>
        <Text style={styles.errorText}>{error?.message || 'Unknown error'}</Text>
        <Text style={styles.errorDetail}>Please restart the app</Text>
      </View>
    );
  }
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
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: 12,
  },
  errorDetail: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center' as const,
    lineHeight: 20,
  },
});
