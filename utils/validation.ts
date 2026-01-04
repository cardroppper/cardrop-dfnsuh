
/**
 * Production-ready input validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate username
 * - 3-30 characters
 * - Alphanumeric, underscores, and hyphens only
 * - Cannot start or end with underscore or hyphen
 */
export function validateUsername(username: string): ValidationResult {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (trimmed.length > 30) {
    return { isValid: false, error: 'Username must be 30 characters or less' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  if (/^[_-]/.test(trimmed) || /[_-]$/.test(trimmed)) {
    return { isValid: false, error: 'Username cannot start or end with underscore or hyphen' };
  }

  return { isValid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validate password
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true };
}

/**
 * Validate display name
 */
export function validateDisplayName(displayName: string): ValidationResult {
  if (!displayName || displayName.trim().length === 0) {
    return { isValid: false, error: 'Display name is required' };
  }

  const trimmed = displayName.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: 'Display name must be 50 characters or less' };
  }

  return { isValid: true };
}

/**
 * Validate vehicle year
 */
export function validateVehicleYear(year: number): ValidationResult {
  const currentYear = new Date().getFullYear();

  if (year < 1900) {
    return { isValid: false, error: 'Year must be 1900 or later' };
  }

  if (year > currentYear + 2) {
    return { isValid: false, error: `Year cannot be more than ${currentYear + 2}` };
  }

  return { isValid: true };
}

/**
 * Validate club name
 */
export function validateClubName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Club name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Club name must be at least 3 characters' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Club name must be 100 characters or less' };
  }

  return { isValid: true };
}

/**
 * Validate event name
 */
export function validateEventName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Event name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Event name must be at least 3 characters' };
  }

  if (trimmed.length > 200) {
    return { isValid: false, error: 'Event name must be 200 characters or less' };
  }

  return { isValid: true };
}

/**
 * Validate message text
 */
export function validateMessage(message: string): ValidationResult {
  if (!message || message.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  const trimmed = message.trim();

  if (trimmed.length > 2000) {
    return { isValid: false, error: 'Message must be 2000 characters or less' };
  }

  return { isValid: true };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}
