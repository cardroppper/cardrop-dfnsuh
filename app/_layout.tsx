
import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert, View, Text, StyleSheet } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { FloatingDebugButton } from "@/components/FloatingDebugButton";
import { setupErrorLogging } from "@/utils/errorLogger";

// Set up global error logging
setupErrorLogging();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn('[RootLayout] SplashScreen.preventAutoHideAsync failed:', error);
});

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [initError, setInitError] = useState<string | null>(null);
  const [loaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleError = (error: any) => {
      console.error('[RootLayout] Unhandled error:', error);
      // Don't crash the app, just log the error
    };

    const handleRejection = (event: any) => {
      console.error('[RootLayout] Unhandled promise rejection:', event.reason);
      // Don't crash the app, just log the error
    };

    // Add global error handlers
    if (typeof ErrorUtils !== 'undefined') {
      ErrorUtils.setGlobalHandler(handleError);
    }

    // For web
    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleRejection);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleRejection);
      }
    };
  }, []);

  useEffect(() => {
    console.log('[RootLayout] Initializing app...');
    
    // Check for font loading errors
    if (fontError) {
      console.error('[RootLayout] Font loading error:', fontError);
      setInitError('Failed to load fonts. Please restart the app.');
    }
    
    if (loaded) {
      console.log('[RootLayout] Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync().catch((error) => {
        console.warn('[RootLayout] SplashScreen.hideAsync failed:', error);
      });
    }
  }, [loaded, fontError]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      console.log('[RootLayout] Network offline detected');
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  // Show error state if initialization failed
  if (initError) {
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.title}>⚠️ Initialization Error</Text>
        <Text style={errorStyles.message}>{initError}</Text>
      </View>
    );
  }

  if (!loaded) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(255, 140, 0)",
      background: "rgb(242, 242, 247)",
      card: "rgb(255, 255, 255)",
      text: "rgb(0, 0, 0)",
      border: "rgb(216, 216, 220)",
      notification: "rgb(255, 59, 48)",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(255, 140, 0)",
      background: "rgb(18, 18, 18)",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(255, 69, 58)",
    },
  };

  return (
    <ErrorBoundary>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <AuthProvider>
          <WidgetProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="vehicles" options={{ headerShown: false }} />
                <Stack.Screen name="clubs" options={{ headerShown: false }} />
                <Stack.Screen name="dev" options={{ headerShown: false }} />
                <Stack.Screen name="messages" options={{ headerShown: false }} />
                <Stack.Screen
                  name="subscription-management"
                  options={{
                    presentation: "modal",
                    title: "Manage Subscription",
                  }}
                />
              </Stack>
              <SystemBars style={"auto"} />
              <FloatingDebugButton />
            </GestureHandlerRootView>
          </WidgetProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
});
