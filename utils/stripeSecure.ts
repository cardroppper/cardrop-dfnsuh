
/**
 * Stripe Security Utilities
 * 
 * Enterprise-grade security for Stripe payment processing
 * Prevents common payment vulnerabilities
 */

import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import { secureStore, logSecurityEvent, SecurityEventType } from './security';

// ============================================================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================================================

/**
 * Verify Stripe webhook signature
 * CRITICAL: Always verify webhooks to prevent payment fraud
 */
export const verifyStripeWebhookSignature = async (
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> => {
  try {
    const [timestamp, ...signatures] = signature.split(',');
    const timestampValue = timestamp.split('=')[1];
    
    // Check timestamp (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    const webhookTimestamp = parseInt(timestampValue, 10);
    
    if (now - webhookTimestamp > 300) { // 5 minute tolerance
      console.error('[Stripe Security] Webhook timestamp too old');
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestampValue}.${payload}`;
    const expectedSignature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      signedPayload + secret
    );

    // Compare signatures (constant-time comparison)
    for (const sig of signatures) {
      const providedSignature = sig.split('=')[1];
      if (constantTimeCompare(providedSignature, expectedSignature)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[Stripe Security] Webhook verification failed:', error);
    return false;
  }
};

/**
 * Constant-time string comparison (prevents timing attacks)
 */
const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

// ============================================================================
// PAYMENT AMOUNT VALIDATION
// ============================================================================

/**
 * Validate payment amount to prevent manipulation
 */
export interface PaymentValidation {
  isValid: boolean;
  errors: string[];
}

export const validatePaymentAmount = (
  amount: number,
  currency: string,
  expectedAmount: number,
  tolerance: number = 0
): PaymentValidation => {
  const errors: string[] = [];

  // Check amount is positive
  if (amount <= 0) {
    errors.push('Payment amount must be positive');
  }

  // Check amount matches expected (with tolerance for rounding)
  if (Math.abs(amount - expectedAmount) > tolerance) {
    errors.push('Payment amount does not match expected amount');
    logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      metadata: {
        reason: 'payment_amount_mismatch',
        provided: amount,
        expected: expectedAmount,
      },
    });
  }

  // Check currency is valid
  const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];
  if (!validCurrencies.includes(currency.toLowerCase())) {
    errors.push('Invalid currency');
  }

  // Check amount is within reasonable limits
  const maxAmount = 1000000; // $10,000 in cents
  if (amount > maxAmount) {
    errors.push('Payment amount exceeds maximum allowed');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// IDEMPOTENCY KEY MANAGEMENT
// ============================================================================

/**
 * Generate idempotency key for Stripe requests
 * Prevents duplicate charges from network retries
 */
export const generateIdempotencyKey = async (
  userId: string,
  operation: string,
  timestamp?: number
): Promise<string> => {
  const ts = timestamp || Date.now();
  const data = `${userId}:${operation}:${ts}`;
  
  try {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
    return hash;
  } catch (error) {
    console.error('[Stripe Security] Failed to generate idempotency key:', error);
    throw new Error('Failed to generate idempotency key');
  }
};

/**
 * Store idempotency key to prevent reuse
 */
export const storeIdempotencyKey = async (key: string, expiryMs: number = 24 * 60 * 60 * 1000): Promise<void> => {
  try {
    const expiry = Date.now() + expiryMs;
    await secureStore.setItem(`idempotency_${key}`, expiry.toString());
  } catch (error) {
    console.error('[Stripe Security] Failed to store idempotency key:', error);
  }
};

/**
 * Check if idempotency key was already used
 */
export const isIdempotencyKeyUsed = async (key: string): Promise<boolean> => {
  try {
    const expiryStr = await secureStore.getItem(`idempotency_${key}`);
    if (!expiryStr) return false;
    
    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry) {
      await secureStore.deleteItem(`idempotency_${key}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Stripe Security] Failed to check idempotency key:', error);
    return false;
  }
};

// ============================================================================
// PAYMENT METHOD VALIDATION
// ============================================================================

/**
 * Validate credit card number using Luhn algorithm
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate CVV format
 */
export const validateCVV = (cvv: string, cardType?: string): boolean => {
  const digits = cvv.replace(/\D/g, '');
  
  // American Express uses 4 digits, others use 3
  if (cardType === 'amex') {
    return digits.length === 4;
  }
  
  return digits.length === 3;
};

/**
 * Validate expiry date
 */
export const validateExpiryDate = (month: number, year: number): boolean => {
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Convert 2-digit year to 4-digit
  const fullYear = year < 100 ? 2000 + year : year;
  
  if (fullYear < currentYear) return false;
  if (fullYear === currentYear && month < currentMonth) return false;
  
  return true;
};

// ============================================================================
// SUBSCRIPTION SECURITY
// ============================================================================

/**
 * Validate subscription state transition
 */
export const validateSubscriptionTransition = (
  currentStatus: string,
  newStatus: string
): { isValid: boolean; reason?: string } => {
  const validTransitions: Record<string, string[]> = {
    'inactive': ['active', 'trialing'],
    'trialing': ['active', 'canceled', 'past_due'],
    'active': ['canceled', 'past_due', 'paused'],
    'past_due': ['active', 'canceled'],
    'canceled': ['active'], // Reactivation
    'paused': ['active', 'canceled'],
  };

  const allowed = validTransitions[currentStatus];
  
  if (!allowed || !allowed.includes(newStatus)) {
    return {
      isValid: false,
      reason: `Invalid transition from ${currentStatus} to ${newStatus}`,
    };
  }

  return { isValid: true };
};

/**
 * Verify subscription ownership
 */
export const verifySubscriptionOwnership = (
  subscriptionUserId: string,
  currentUserId: string
): boolean => {
  if (subscriptionUserId !== currentUserId) {
    logSecurityEvent({
      type: SecurityEventType.PERMISSION_DENIED,
      userId: currentUserId,
      metadata: {
        reason: 'subscription_ownership_mismatch',
        subscriptionUserId,
      },
    });
    return false;
  }
  
  return true;
};

// ============================================================================
// PAYMENT INTENT SECURITY
// ============================================================================

/**
 * Validate payment intent metadata
 */
export const validatePaymentMetadata = (
  metadata: Record<string, string>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter(field => !metadata[field]);
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Sanitize payment description
 */
export const sanitizePaymentDescription = (description: string): string => {
  // Remove potentially malicious content
  return description
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .substring(0, 500) // Stripe limit
    .trim();
};

// ============================================================================
// REFUND SECURITY
// ============================================================================

/**
 * Validate refund amount
 */
export const validateRefundAmount = (
  refundAmount: number,
  originalAmount: number,
  previousRefunds: number = 0
): { isValid: boolean; reason?: string } => {
  const totalRefunded = previousRefunds + refundAmount;
  
  if (refundAmount <= 0) {
    return { isValid: false, reason: 'Refund amount must be positive' };
  }
  
  if (totalRefunded > originalAmount) {
    return { isValid: false, reason: 'Total refunds exceed original amount' };
  }
  
  return { isValid: true };
};

/**
 * Check refund eligibility (time-based)
 */
export const isRefundEligible = (
  paymentDate: Date,
  refundWindowDays: number = 30
): boolean => {
  const now = new Date();
  const daysSincePayment = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSincePayment <= refundWindowDays;
};

// ============================================================================
// CLUB PAYMENT SECURITY (CarDrop specific)
// ============================================================================

/**
 * Validate club payment amount based on member count
 */
export const validateClubPayment = (
  memberCount: number,
  pricePerMember: number,
  providedAmount: number
): { isValid: boolean; expectedAmount: number; reason?: string } => {
  const expectedAmount = memberCount * pricePerMember;
  
  if (memberCount < 1) {
    return {
      isValid: false,
      expectedAmount,
      reason: 'Invalid member count',
    };
  }
  
  if (Math.abs(providedAmount - expectedAmount) > 1) { // 1 cent tolerance
    return {
      isValid: false,
      expectedAmount,
      reason: 'Payment amount does not match member count',
    };
  }
  
  return { isValid: true, expectedAmount };
};

/**
 * Verify club membership before payment
 */
export const verifyClubMembership = async (
  userId: string,
  clubId: string,
  role: 'owner' | 'admin' | 'member'
): Promise<boolean> => {
  // TODO: Implement actual membership verification with backend
  // This should check the database to ensure user has proper role
  
  console.log('[Stripe Security] Verifying club membership:', { userId, clubId, role });
  
  // Placeholder - replace with actual API call
  return true;
};

// ============================================================================
// STRIPE API KEY SECURITY
// ============================================================================

/**
 * Validate Stripe API key format
 */
export const validateStripeKey = (key: string, keyType: 'publishable' | 'secret'): boolean => {
  const prefix = keyType === 'publishable' ? 'pk_' : 'sk_';
  
  if (!key.startsWith(prefix)) {
    console.error('[Stripe Security] Invalid key prefix');
    return false;
  }
  
  // Check for test vs live keys
  const isTestKey = key.includes('_test_');
  const isLiveKey = key.includes('_live_');
  
  if (!isTestKey && !isLiveKey) {
    console.error('[Stripe Security] Invalid key format');
    return false;
  }
  
  return true;
};

/**
 * Ensure publishable key is used on client (never secret key)
 */
export const ensurePublishableKey = (key: string): void => {
  if (key.startsWith('sk_')) {
    throw new Error('CRITICAL SECURITY ERROR: Secret key exposed on client side!');
  }
};
