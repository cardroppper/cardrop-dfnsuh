
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function DevLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="beacon-registration"
        options={{
          title: 'Beacon Registration',
          headerBackTitle: 'Settings',
        }}
      />
    </Stack>
  );
}
