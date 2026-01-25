
import React, { createContext, useContext, ReactNode } from 'react';

interface StripeContextType {
  // Placeholder for Stripe functionality
  initialized: boolean;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export function StripeProvider({ children }: { children: ReactNode }) {
  console.log('[StripeContext] Initializing...');
  
  const value: StripeContextType = {
    initialized: true,
  };

  console.log('[StripeContext] Initialized successfully');

  return <StripeContext.Provider value={value}>{children}</StripeContext.Provider>;
}

export function useStripe() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
}
