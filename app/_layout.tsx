
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

console.log('[RootLayout] Initializing app...');

SplashScreen.preventAutoHideAsync().catch((err) => {
  console.error('[RootLayout] SplashScreen error:', err);
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.error('[RootLayout] Font loading error:', error);
    }
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  if (error) {
    console.error('[RootLayout] Font failed to load, continuing anyway');
    SplashScreen.hideAsync();
  }

  try {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <StripeProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="index" />
              <Stack.Screen name="subscription/premium" options={{ presentation: 'modal' }} />
            </Stack>
          </StripeProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  } catch (err: any) {
    console.error('[RootLayout] Render error:', err);
    return (
      <View style={fallbackStyles.container}>
        <Text style={fallbackStyles.text}>App initialization error</Text>
        <Text style={fallbackStyles.error}>{err.message}</Text>
      </View>
    );
  }
}

const fallbackStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  error: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
  },
});
