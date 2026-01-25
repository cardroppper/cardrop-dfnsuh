
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { StripeProvider } from '@/contexts/StripeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Import URL polyfill for Supabase (must be before any Supabase imports)
import 'react-native-url-polyfill/auto';

// Import reanimated to ensure it's included in the bundle
import 'react-native-reanimated';

console.log('[RootLayout] Starting initialization');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.error('[RootLayout] SplashScreen error:', err);
});

export default function RootLayout() {
  console.log('[RootLayout] Component rendering');
  
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    console.log('[RootLayout] Font loading state:', { loaded, error: !!error });
    
    if (error) {
      console.error('[RootLayout] Font loading error:', error);
      // Continue anyway - fonts are not critical
      SplashScreen.hideAsync().catch(console.error);
    }
    
    if (loaded) {
      console.log('[RootLayout] Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded, error]);

  // Show nothing while fonts are loading (splash screen is visible)
  if (!loaded && !error) {
    console.log('[RootLayout] Waiting for fonts to load');
    return null;
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
