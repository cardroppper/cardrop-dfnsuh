
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export function useSubscription() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Superwall not available on web');
      return;
    }

    const initializeSuperwallAndFetchSubscription = async () => {
      try {
        setIsLoading(true);
        const Superwall = require('expo-superwall');
        
        // Use user from useAuth hook called at top level
        if (user) {
          console.log('Identifying user with Superwall:', user.id);
          await Superwall.identify(user.id);
          
          // Fetch subscription status
          const status = await fetchSubscription();
          setIsPremium(status);
        } else {
          console.log('No user available for Superwall identification');
          setIsPremium(false);
        }
      } catch (error) {
        console.error('Error loading Superwall user:', error);
        setIsPremium(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSuperwallAndFetchSubscription();
  }, [user]);

  const fetchSubscription = async (): Promise<boolean> => {
    try {
      console.log('Fetching subscription status');
      // TODO: Backend Integration - Fetch subscription status from backend API
      // For now, return false as default
      return false;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return false;
    }
  };

  return { isPremium, isLoading };
}
