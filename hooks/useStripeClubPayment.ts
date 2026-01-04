
import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { usePaymentSheet } from '@stripe/stripe-react-native';

export function useStripeClubPayment() {
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  const [isLoading, setIsLoading] = useState(false);

  // Get club subscription status
  const getClubSubscriptionStatus = useCallback(async (clubId: string) => {
    try {
      const { data, error } = await supabase
        .from('stripe_club_subscriptions')
        .select('*')
        .eq('club_id', clubId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching club subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching club subscription status:', error);
      return null;
    }
  }, []);

  // Initialize payment for club subscription
  const initializeClubPayment = async (clubId: string, memberCount: number) => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Stripe payments are not available on web. Please use the mobile app.');
      return false;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to set up club payments.');
      return false;
    }

    try {
      setIsLoading(true);

      // TODO: Backend Integration - Call backend to create club subscription payment intent
      console.log('Creating club payment intent for club:', clubId, 'with', memberCount, 'members');
      
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
      console.error('Error initializing club payment:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Process club payment
  const payForClub = async (clubId: string, memberCount: number) => {
    const initialized = await initializeClubPayment(clubId, memberCount);
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

      Alert.alert('Success', 'Club subscription is now active!');
      return true;
    } catch (error) {
      console.error('Error presenting payment sheet:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
      return false;
    }
  };

  // Cancel club subscription
  const cancelClubSubscription = async (clubId: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to cancel club subscription.');
      return false;
    }

    try {
      setIsLoading(true);

      // TODO: Backend Integration - Call backend to cancel club subscription
      console.log('Canceling club subscription for club:', clubId);

      Alert.alert('Success', 'Club subscription will be canceled at the end of the billing period.');
      return true;
    } catch (error) {
      console.error('Error canceling club subscription:', error);
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getClubSubscriptionStatus,
    payForClub,
    cancelClubSubscription,
  };
}
