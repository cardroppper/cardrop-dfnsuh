
import { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  isPremium: boolean;
  status: 'free' | 'premium';
  startDate: string | null;
  endDate: string | null;
  isFreePremium: boolean;
}

export function useSubscription() {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isPremium: false,
    status: 'free',
    startDate: null,
    endDate: null,
    isFreePremium: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user, profile?.free_premium]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      // Check if user has free premium enabled
      const hasFreePremium = profile?.free_premium || false;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        // If user has free premium, they get premium access regardless of subscription status
        const isPremium = hasFreePremium || data.subscription_status === 'premium';
        
        setSubscription({
          isPremium,
          status: isPremium ? 'premium' : 'free',
          startDate: data.subscription_start_date,
          endDate: data.subscription_end_date,
          isFreePremium: hasFreePremium,
        });
      } else {
        // Create default free subscription
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            subscription_status: 'free',
          });

        if (insertError) {
          console.error('Error creating subscription:', insertError);
        }

        // Still grant premium if free premium is enabled
        setSubscription({
          isPremium: hasFreePremium,
          status: hasFreePremium ? 'premium' : 'free',
          startDate: null,
          endDate: null,
          isFreePremium: hasFreePremium,
        });
      }
    } catch (err) {
      console.error('Error in fetchSubscription:', err);
    } finally {
      setLoading(false);
    }
  };

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
