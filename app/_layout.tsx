
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Platform } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import { colors } from "@/styles/commonStyles";
import { useBackgroundBLEScanning } from "@/hooks/useBackgroundBLEScanning";
import { SuperwallProvider } from "expo-superwall";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

function BackgroundBLEManager() {
  // This component manages background BLE scanning
  useBackgroundBLEScanning();
  return null;
}

// Wrapper component that conditionally renders SuperwallProvider only on native platforms
function ConditionalSuperwallProvider({ children }: { children: React.ReactNode }) {
  // Only use Superwall on native platforms (iOS and Android)
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      return (
        <SuperwallProvider
          apiKeys={{
            ios: "pk_d1c3c5e8e8f8e8e8e8e8e8e8e8e8e8e8",
            android: "pk_d1c3c5e8e8f8e8e8e8e8e8e8e8e8e8e8",
          }}
          onConfigurationError={(error) => {
            console.error("[Superwall] Configuration error:", error);
          }}
        >
          {children}
        </SuperwallProvider>
      );
    } catch (error) {
      console.warn('[ConditionalSuperwallProvider] Superwall not available:', error);
      return <>{children}</>;
    }
  }

  // On web, just render children without Superwall
  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const CarDropDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.highlight,
      notification: colors.accent,
    },
  };

  return (
    <>
      <StatusBar style="light" />
      <ThemeProvider value={CarDropDarkTheme}>
        <ConditionalSuperwallProvider>
          <AuthProvider>
            <BackgroundBLEManager />
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
              <SystemBars style="light" />
            </GestureHandlerRootView>
          </AuthProvider>
        </ConditionalSuperwallProvider>
      </ThemeProvider>
    </>
  );
}
