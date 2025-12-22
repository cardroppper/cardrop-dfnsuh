
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function ModificationsLayout() {
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
          title: 'Add Modification',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
