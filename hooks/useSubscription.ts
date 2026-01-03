
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  isPremium: boolean;
  status: 'free' | 'premium';
  startDate: string | null;
  endDate: string | null;
  isFreePremium: boolean;
  subscriptionSource: 'free_premium' | 'superwall' | 'none';
}

export function useSubscription() {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isPremium: false,
    status: 'free',
    startDate: null,
    endDate: null,
    isFreePremium: false,
    subscriptionSource: 'none',
  });
  const [loading, setLoading] = useState(true);

  // Get Superwall status (only on native platforms)
  const getSuperwallStatus = useCallback(() => {
    if (Platform.OS === 'web') return null;
    
    try {
      // Dynamic import for native-only module
      const SuperwallModule = require('expo-superwall');
      const { useUser } = SuperwallModule;
      const superwallData = useUser();
      return superwallData?.subscriptionStatus;
    } catch (error) {
      console.warn('[useSubscription] Error accessing Superwall data:', error);
      return null;
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    if (!user) return;

    try {
      // Check if user has free premium enabled
      const hasFreePremium = profile?.free_premium || false;

      // Check Superwall subscription status (only on native platforms)
      const superwallStatus = getSuperwallStatus();
      const hasSuperwallPremium = superwallStatus?.status === 'ACTIVE';

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      // Determine subscription source and status
      let isPremium = false;
      let subscriptionSource: 'free_premium' | 'superwall' | 'none' = 'none';

      if (hasFreePremium) {
        isPremium = true;
        subscriptionSource = 'free_premium';
      } else if (hasSuperwallPremium) {
        isPremium = true;
        subscriptionSource = 'superwall';
      }

      if (data) {
        setSubscription({
          isPremium,
          status: isPremium ? 'premium' : 'free',
          startDate: data.subscription_start_date,
          endDate: data.subscription_end_date,
          isFreePremium: hasFreePremium,
          subscriptionSource,
        });
      } else {
        // Create default free subscription
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            subscription_status: isPremium ? 'premium' : 'free',
          });

        if (insertError) {
          console.error('Error creating subscription:', insertError);
        }

        setSubscription({
          isPremium,
          status: isPremium ? 'premium' : 'free',
          startDate: null,
          endDate: null,
          isFreePremium: hasFreePremium,
          subscriptionSource,
        });
      }
    } catch (err) {
      console.error('Error in fetchSubscription:', err);
    } finally {
      setLoading(false);
    }
  }, [user, profile?.free_premium, getSuperwallStatus]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user, profile?.free_premium, fetchSubscription]);

  const updateSubscription = async (status: 'free' | 'premium') => {
    if (!user) return;

    try {
      const updates: any = {
        subscription_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'premium') {
        updates.subscription_start_date = new Date().toISOString();
        // Set end date to 1 month from now
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        updates.subscription_end_date = endDate.toISOString();
      } else {
        updates.subscription_start_date = null;
        updates.subscription_end_date = null;
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating subscription:', error);
        return false;
      }

      await fetchSubscription();
      return true;
    } catch (err) {
      console.error('Error in updateSubscription:', err);
      return false;
    }
  };

  return {
    subscription,
    loading,
    updateSubscription,
    refetch: fetchSubscription,
  };
}
