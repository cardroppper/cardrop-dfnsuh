import 'react-native-url-polyfill/auto';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { StripeProvider } from '@/contexts/StripeContext';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Keep the splash screen visible while we load resources
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn('Failed to prevent splash screen auto-hide:', err);
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('RootLayout: Initializing app...');
    
    async function prepare() {
      try {
        // Add any initialization logic here
        console.log('RootLayout: App initialization complete');
        setIsReady(true);
        
        // Hide splash screen after initialization
        await SplashScreen.hideAsync();
      } catch (err) {
        console.error('RootLayout: Initialization error:', err);
        setIsReady(true); // Still set ready to show error boundary
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    // Failsafe: Always set ready after 2 seconds
    const failsafeTimer = setTimeout(() => {
      console.warn('RootLayout: Failsafe timeout - forcing isReady to true');
      setIsReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 2000);

    return () => clearTimeout(failsafeTimer);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  console.log('RootLayout: Rendering navigation stack');

  return (
    <ErrorBoundary>
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
});
