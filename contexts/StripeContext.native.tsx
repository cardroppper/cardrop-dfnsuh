
// Native version (iOS/Android) - Uses Stripe React Native SDK
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StripeProvider as StripeProviderNative } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

interface StripeContextType {
  isInitialized: boolean;
  publishableKey: string | null;
}

const StripeContext = createContext<StripeContextType>({
  isInitialized: false,
  publishableKey: null,
});

export const useStripeContext = () => useContext(StripeContext);

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // TODO: Backend Integration - Fetch Stripe publishable key from backend
    // For now, using a placeholder. In production, this should come from your backend
    const key = 'pk_test_YOUR_PUBLISHABLE_KEY'; // Replace with actual key from backend
    setPublishableKey(key);
    setIsInitialized(true);
  }, []);

  if (!publishableKey) {
    return null;
  }

  // Create proper URL scheme for redirects
  const urlScheme =
    Constants.appOwnership === 'expo'
      ? Linking.createURL('/--/')
      : Linking.createURL('');

  return (
    <StripeProviderNative
      publishableKey={publishableKey}
      urlScheme={urlScheme}
      merchantIdentifier="merchant.com.cardrop.app" // TODO: Replace with your Apple merchant ID
    >
      <StripeContext.Provider value={{ isInitialized, publishableKey }}>
        {children}
      </StripeContext.Provider>
    </StripeProviderNative>
  );
}
