
import { Platform } from 'react-native';
import { useStripeSubscription } from './useStripeSubscription';

export function useSubscription() {
  // FIXED: Call hook unconditionally at the top level
  const stripeSubscription = useStripeSubscription();

  // Use Stripe subscription hook for native platforms
  if (Platform.OS !== 'web') {
    return stripeSubscription;
  }

  // For web, return a basic implementation
  return {
    isPremium: false,
    status: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    isLoading: false,
    subscribe: async () => {
      console.log('Stripe not available on web');
      return false;
    },
    cancelSubscription: async () => {
      console.log('Stripe not available on web');
      return false;
    },
    reactivateSubscription: async () => {
      console.log('Stripe not available on web');
      return false;
    },
    refreshStatus: async () => {
      console.log('Stripe not available on web');
    },
  };
}
