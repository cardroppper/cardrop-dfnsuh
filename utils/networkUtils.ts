
/**
 * Production-ready network utilities with retry logic and error handling
 */

import * as Network from 'expo-network';
import { Alert } from 'react-native';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected === true && networkState.isInternetReachable === true;
  } catch (error) {
    console.error('[NetworkUtils] Error checking network state:', error);
    return false;
  }
}

/**
 * Wait for network connection
 */
export async function waitForConnection(timeoutMs: number = 10000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await isOnline()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return false;
}

/**
 * Execute function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check network connection before attempting
      if (!(await isOnline())) {
        throw new Error('No internet connection');
      }

      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        console.log(`[NetworkUtils] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError!;
}

/**
 * Show offline alert
 */
export function showOfflineAlert() {
  Alert.alert(
    '📡 No Internet Connection',
    'Please check your internet connection and try again.',
    [{ text: 'OK' }]
  );
}

/**
 * Show network error alert with retry option
 */
export function showNetworkErrorAlert(onRetry?: () => void) {
  Alert.alert(
    '⚠️ Network Error',
    'Something went wrong. Please try again.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Retry', onPress: onRetry },
    ]
  );
}

/**
 * Execute with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    ),
  ]);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}
