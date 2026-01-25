import 'react-native-url-polyfill/auto';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { StripeProvider } from '@/contexts/StripeContext';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

console.log('[RootLayout] Module loaded');

// Keep the splash screen visible while we load resources
SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('[RootLayout] SplashScreen.preventAutoHideAsync failed');
});

export default function RootLayout() {
  console.log('[RootLayout] Rendering');

  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {
        console.log('[RootLayout] SplashScreen.hideAsync failed');
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <StripeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="vehicles" />
          <Stack.Screen name="clubs" />
          <Stack.Screen name="messages" />
          <Stack.Screen name="subscription" />
          <Stack.Screen name="dev" />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              title: 'Modal'
            }} 
          />
          <Stack.Screen 
            name="formsheet" 
            options={{ 
              presentation: 'formSheet',
              headerShown: true,
              title: 'Form Sheet'
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
            options={{ 
              headerShown: true,
              title: 'Manage Subscription'
            }} 
          />
        </Stack>
      </StripeProvider>
    </AuthProvider>
  );
}
