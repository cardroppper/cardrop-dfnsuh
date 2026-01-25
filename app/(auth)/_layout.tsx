
import { Stack } from 'expo-router';

export default function AuthLayout() {
  console.log('AuthLayout: Rendering auth navigation stack');
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
