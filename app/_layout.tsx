import 'react-native-url-polyfill/auto';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

console.log('[RootLayout] Module loaded - simplified version');

export default function RootLayout() {
  console.log('[RootLayout] Rendering');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>CarDrop Loading...</Text>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
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
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 24,
  },
});
