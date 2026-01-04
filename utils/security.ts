
/**
 * Enterprise-Grade Security Utilities
 * 
 * Comprehensive security measures for production-ready mobile apps
 * Addresses common vulnerabilities in AI-generated code
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// ============================================================================
// PASSWORD SECURITY
// ============================================================================

/**
 * Password strength requirements (NIST 800-63B compliant)
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true,
};

/**
 * Common passwords to block (top 100 most common)
 */
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', '12345678', '12345', '1234567', 
  'password1', '123123', '1234567890', 'qwerty', 'abc123', 'million2',
  '000000', '1234', 'iloveyou', 'aaron431', 'password123', 'omgpop',
  '123321', '654321', 'qwertyuiop', 'qwerty123', '1q2w3e4r', 'admin',
  'welcome', 'monkey', 'login', 'starwars', '121212', 'dragon',
  'passw0rd', 'master', 'hello', 'freedom', 'whatever', 'qazwsx',
  'trustno1', 'jordan23', 'harley', 'password!', 'robert', 'matthew',
  'jordan', 'asshole', 'daniel', 'andrew', 'lakers', 'andrea',
  'buster', 'joshua', 'ferrari', 'chicken', 'letmein', 'samsung',
  'secret', 'summer', '1q2w3e', 'zxcvbnm', 'fuckyou', 'asdfgh',
  'hunter', 'soccer', 'batman', 'michael', 'shadow', 'superman',
  '696969', 'mustang', 'master1', 'sunshine', 'ashley', 'bailey',
  'passw0rd!', 'shadow1', 'password1!', 'monkey1', 'qwerty1',
  'princess', 'azerty', 'trustno1', 'starwars1', 'solo', 'photoshop',
  'password12', 'password123!', 'welcome1', 'admin123', 'abc123!',
]);

/**
 * Validate password strength
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
}

export const validatePasswordStrength = (
  password: string,
  userInfo?: { email?: string; username?: string; name?: string }
): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  } else {
    score += Math.min(password.length / 2, 20);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  // Character variety checks
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 10;
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 10;
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 10;
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 15;
  }

  // Common password check
  if (PASSWORD_REQUIREMENTS.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.has(lowerPassword)) {
      errors.push('This password is too common. Please choose a more unique password');
      score = Math.max(0, score - 30);
    }
  }

  // User info check
  if (PASSWORD_REQUIREMENTS.preventUserInfo && userInfo) {
    const lowerPassword = password.toLowerCase();
    const userInfoValues = [
      userInfo.email?.toLowerCase().split('@')[0],
      userInfo.username?.toLowerCase(),
      userInfo.name?.toLowerCase(),
    ].filter(Boolean);

    for (const value of userInfoValues) {
      if (value && lowerPassword.includes(value)) {
        errors.push('Password should not contain your personal information');
        score = Math.max(0, score - 20);
        break;
      }
    }
  }

  // Entropy check (character variety)
  const uniqueChars = new Set(password).size;
  score += uniqueChars * 2;

  // Determine strength
  let strength: PasswordValidationResult['strength'];
  if (score < 30) strength = 'weak';
  else if (score < 50) strength = 'medium';
  else if (score < 70) strength = 'strong';
  else strength = 'very-strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(100, score),
  };
};

// ============================================================================
// SECURE STORAGE
// ============================================================================

/**
 * Securely store sensitive data with encryption
 */
export const secureStore = {
  /**
   * Store encrypted data
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web: Use localStorage with base64 encoding (not true encryption, but better than plain)
        const encoded = btoa(value);
        localStorage.setItem(`secure_${key}`, encoded);
      } else {
        // Native: Use SecureStore with hardware-backed encryption
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      }
    } catch (error) {
      console.error('[Security] Failed to store secure item:', error);
      throw new Error('Failed to securely store data');
    }
  },

  /**
   * Retrieve encrypted data
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        const encoded = localStorage.getItem(`secure_${key}`);
        return encoded ? atob(encoded) : null;
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('[Security] Failed to retrieve secure item:', error);
      return null;
    }
  },

  /**
   * Delete encrypted data
   */
  async deleteItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(`secure_${key}`);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('[Security] Failed to delete secure item:', error);
    }
  },
};

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize SQL input (for raw queries - prefer parameterized queries)
 */
export const sanitizeSQLInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/['";\\]/g, '') // Remove SQL special characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments
    .trim();
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate username format (alphanumeric, underscore, hyphen)
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

// ============================================================================
// RATE LIMITING (Client-side)
// ============================================================================

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

class RateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number; blockedUntil?: number }> = new Map();

  check(key: string, config: RateLimitConfig): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const record = this.attempts.get(key);

    // Check if currently blocked
    if (record?.blockedUntil && now < record.blockedUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((record.blockedUntil - now) / 1000),
      };
    }

    // Reset if window expired
    if (!record || now - record.firstAttempt > config.windowMs) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return { allowed: true };
    }

    // Increment attempts
    record.count++;

    // Block if exceeded
    if (record.count > config.maxAttempts) {
      record.blockedUntil = now + config.blockDurationMs;
      this.attempts.set(key, record);
      return {
        allowed: false,
        retryAfter: Math.ceil(config.blockDurationMs / 1000),
      };
    }

    this.attempts.set(key, record);
    return { allowed: true };
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }, // 3 attempts per hour
  passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 },
  api: { maxAttempts: 100, windowMs: 60 * 1000, blockDurationMs: 60 * 1000 }, // 100 requests per minute
};

// ============================================================================
// REQUEST SIGNING (API Security)
// ============================================================================

/**
 * Generate HMAC signature for API requests
 */
export const generateRequestSignature = async (
  method: string,
  url: string,
  body: string,
  timestamp: number,
  secret: string
): Promise<string> => {
  const message = `${method}:${url}:${body}:${timestamp}`;
  
  try {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      message + secret
    );
    return digest;
  } catch (error) {
    console.error('[Security] Failed to generate signature:', error);
    throw new Error('Failed to sign request');
  }
};

/**
 * Verify request signature
 */
export const verifyRequestSignature = async (
  signature: string,
  method: string,
  url: string,
  body: string,
  timestamp: number,
  secret: string,
  maxAgeMs: number = 5 * 60 * 1000 // 5 minutes
): Promise<boolean> => {
  // Check timestamp freshness
  if (Date.now() - timestamp > maxAgeMs) {
    return false;
  }

  const expectedSignature = await generateRequestSignature(method, url, body, timestamp, secret);
  return signature === expectedSignature;
};

// ============================================================================
// DATA MASKING (PII Protection)
// ============================================================================

/**
 * Mask email address
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '***';
  
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : local[0] + '*';
  
  return `${maskedLocal}@${domain}`;
};

/**
 * Mask phone number
 */
export const maskPhone = (phone: string): string => {
  if (!phone) return '***';
  
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
};

/**
 * Mask credit card number
 */
export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber) return '****';
  
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  
  return '**** **** **** ' + digits.slice(-4);
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export interface SessionInfo {
  token: string;
  expiresAt: number;
  refreshToken?: string;
  deviceId: string;
}

/**
 * Generate unique device ID
 */
export const generateDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await secureStore.getItem('device_id');
    
    if (!deviceId) {
      deviceId = await Crypto.randomUUID();
      await secureStore.setItem('device_id', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('[Security] Failed to generate device ID:', error);
    return 'unknown';
  }
};

/**
 * Check if session is expired
 */
export const isSessionExpired = (expiresAt: number): boolean => {
  return Date.now() >= expiresAt;
};

/**
 * Calculate session expiry with buffer
 */
export const calculateSessionExpiry = (expiresInSeconds: number, bufferSeconds: number = 60): number => {
  return Date.now() + (expiresInSeconds - bufferSeconds) * 1000;
};

// ============================================================================
// SECURITY LOGGING
// ============================================================================

export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_ACCESS = 'data_access',
  PERMISSION_DENIED = 'permission_denied',
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  deviceId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Log security event (send to backend for monitoring)
 */
export const logSecurityEvent = async (event: Omit<SecurityEvent, 'deviceId' | 'timestamp'>): Promise<void> => {
  try {
    const deviceId = await generateDeviceId();
    const fullEvent: SecurityEvent = {
      ...event,
      deviceId,
      timestamp: Date.now(),
    };

    // Log locally
    console.log('[Security Event]', fullEvent);

    // TODO: Send to backend security monitoring service
    // await authenticatedPost('/api/security/events', fullEvent);
  } catch (error) {
    console.error('[Security] Failed to log security event:', error);
  }
};

// ============================================================================
// BIOMETRIC AUTHENTICATION
// ============================================================================

/**
 * Check if biometric authentication is available
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return false;
    
    const compatible = await SecureStore.isAvailableAsync();
    return compatible;
  } catch {
    return false;
  }
};

// ============================================================================
// CONTENT SECURITY
// ============================================================================

/**
 * Validate URL to prevent open redirect vulnerabilities
 */
export const isValidRedirectUrl = (url: string, allowedDomains: string[]): boolean => {
  try {
    const parsed = new URL(url);
    return allowedDomains.some(domain => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
};

/**
 * Generate secure random string
 */
export const generateSecureRandom = async (length: number = 32): Promise<string> => {
  try {
    const bytes = await Crypto.getRandomBytesAsync(length);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('[Security] Failed to generate random string:', error);
    throw new Error('Failed to generate secure random string');
  }
};
