
// Native version (iOS/Android) - Uses Stripe React Native SDK
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { usePaymentSheet } from '@stripe/stripe-react-native';

export interface SubscriptionStatus {
  isPremium: boolean;
  status: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export function useStripeSubscription() {
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isPremium: false,
    status: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch subscription status from database
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus({
        isPremium: false,
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        setSubscriptionStatus({
          isPremium: data.status === 'active',
          status: data.status,
          currentPeriodEnd: new Date(data.current_period_end),
          cancelAtPeriodEnd: data.cancel_at_period_end,
        });
      } else {
        setSubscriptionStatus({
          isPremium: false,
          status: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  // Initialize payment sheet for subscription
  const initializePaymentSheet = async (priceId: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to subscribe.');
      return false;
    }

    try {
      setIsLoading(true);

      // TODO: Backend Integration - Call backend to create subscription payment intent
      // This should call your Edge Function that creates a Stripe subscription
      console.log('Creating subscription payment intent for price:', priceId);
      
      // Placeholder response - replace with actual backend call
      const response = {
        paymentIntent: 'pi_placeholder',
        ephemeralKey: 'ek_placeholder',
        customer: 'cus_placeholder',
      };

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'CarDrop',
        customerId: response.customer,
        customerEphemeralKeySecret: response.ephemeralKey,
        paymentIntentClientSecret: response.paymentIntent,
        allowsDelayedPaymentMethods: true,
        returnURL: 'cardrop://stripe-redirect',
      });

      if (error) {
        console.error('Error initializing payment sheet:', error);
        Alert.alert('Error', error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error initializing payment sheet:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Present payment sheet
  const subscribe = async (priceId: string) => {
    const initialized = await initializePaymentSheet(priceId);
    if (!initialized) {
      return false;
    }

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code !== 'Canceled') {
          Alert.alert('Payment Failed', error.message);
        }
        return false;
      }

      Alert.alert('Success', 'Your subscription is now active!');
      await fetchSubscriptionStatus();
      return true;
    } catch (error) {
      console.error('Error presenting payment sheet:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
      return false;
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to cancel your subscription.');
      return false;
    }

    try {
      setIsLoading(true);

      // TODO: Backend Integration - Call backend to cancel subscription
      console.log('Canceling subscription for user:', user.id);

      Alert.alert('Success', 'Your subscription will be canceled at the end of the billing period.');
      await fetchSubscriptionStatus();
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reactivate subscription
  const reactivateSubscription = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to reactivate your subscription.');
      return false;
    }

    try {
      setIsLoading(true);

      // TODO: Backend Integration - Call backend to reactivate subscription
      console.log('Reactivating subscription for user:', user.id);

      Alert.alert('Success', 'Your subscription has been reactivated!');
      await fetchSubscriptionStatus();
      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      Alert.alert('Error', 'Failed to reactivate subscription. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...subscriptionStatus,
    isLoading,
    subscribe,
    cancelSubscription,
    reactivateSubscription,
    refreshStatus: fetchSubscriptionStatus,
  };
}
