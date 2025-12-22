
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function VehiclesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Vehicle',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[vehicleId]"
        options={{
          title: 'Vehicle Details',
        }}
      />
      <Stack.Screen
        name="edit/[vehicleId]"
        options={{
          title: 'Edit Vehicle',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
