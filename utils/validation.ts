
/**
 * Input Validation Utilities
 * 
 * Comprehensive validation for all user inputs
 * Prevents injection attacks and data corruption
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  const typos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
  };

  if (domain && typos[domain]) {
    return {
      isValid: false,
      error: `Did you mean ${email.split('@')[0]}@${typos[domain]}?`,
    };
  }

  return { isValid: true };
};

// ============================================================================
// USERNAME VALIDATION
// ============================================================================

export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 30) {
    return { isValid: false, error: 'Username must not exceed 30 characters' };
  }

  // Alphanumeric, underscore, hyphen only
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens',
    };
  }

  // Must start with letter or number
  if (!/^[a-zA-Z0-9]/.test(username)) {
    return { isValid: false, error: 'Username must start with a letter or number' };
  }

  // Reserved usernames
  const reserved = [
    'admin', 'administrator', 'root', 'system', 'moderator', 'support',
    'help', 'api', 'www', 'mail', 'ftp', 'localhost', 'test', 'demo',
  ];

  if (reserved.includes(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved' };
  }

  return { isValid: true };
};

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 12) {
    return { isValid: false, error: 'Password must be at least 12 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must not exceed 128 characters' };
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

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

// ============================================================================
// DISPLAY NAME VALIDATION
// ============================================================================

export const validateDisplayName = (name: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: 'Display name is required' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters' };
  }

  if (name.length > 50) {
    return { isValid: false, error: 'Display name must not exceed 50 characters' };
  }

  // Allow letters, numbers, spaces, and common punctuation
  const nameRegex = /^[a-zA-Z0-9\s\-'.]+$/;
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      error: 'Display name contains invalid characters',
    };
  }

  return { isValid: true };
};

// ============================================================================
// VEHICLE VALIDATION (CarDrop specific)
// ============================================================================

export const validateVehicleYear = (year: number): { isValid: boolean; error?: string } => {
  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = currentYear + 2; // Allow next year models

  if (year < minYear || year > maxYear) {
    return {
      isValid: false,
      error: `Year must be between ${minYear} and ${maxYear}`,
    };
  }

  return { isValid: true };
};

export const validateVehicleMake = (make: string): { isValid: boolean; error?: string } => {
  if (!make) {
    return { isValid: false, error: 'Make is required' };
  }

  if (make.length < 2 || make.length > 50) {
    return { isValid: false, error: 'Make must be between 2 and 50 characters' };
  }

  return { isValid: true };
};

export const validateVehicleModel = (model: string): { isValid: boolean; error?: string } => {
  if (!model) {
    return { isValid: false, error: 'Model is required' };
  }

  if (model.length < 1 || model.length > 50) {
    return { isValid: false, error: 'Model must be between 1 and 50 characters' };
  }

  return { isValid: true };
};

// ============================================================================
// CLUB VALIDATION (CarDrop specific)
// ============================================================================

export const validateClubName = (name: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: 'Club name is required' };
  }

  if (name.length < 3) {
    return { isValid: false, error: 'Club name must be at least 3 characters' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Club name must not exceed 100 characters' };
  }

  return { isValid: true };
};

export const validateClubDescription = (description: string): { isValid: boolean; error?: string } => {
  if (description && description.length > 500) {
    return { isValid: false, error: 'Description must not exceed 500 characters' };
  }

  return { isValid: true };
};

// ============================================================================
// URL VALIDATION
// ============================================================================

export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const parsed = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// ============================================================================
// PHONE NUMBER VALIDATION
// ============================================================================

export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check length (10-15 digits for international numbers)
  if (digits.length < 10 || digits.length > 15) {
    return { isValid: false, error: 'Invalid phone number length' };
  }

  return { isValid: true };
};

// ============================================================================
// NUMERIC VALIDATION
// ============================================================================

export const validatePositiveNumber = (
  value: number,
  fieldName: string
): { isValid: boolean; error?: string } => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (value <= 0) {
    return { isValid: false, error: `${fieldName} must be positive` };
  }

  return { isValid: true };
};

export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): { isValid: boolean; error?: string } => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (value < min || value > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }

  return { isValid: true };
};

// ============================================================================
// FILE VALIDATION
// ============================================================================

export const validateImageFile = (
  file: { size: number; type: string; name: string }
): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    return { isValid: false, error: 'Image must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { isValid: false, error: 'Image must be JPEG, PNG, or WebP format' };
  }

  return { isValid: true };
};

export const validateVideoFile = (
  file: { size: number; type: string; name: string }
): { isValid: boolean; error?: string } => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-m4v'];

  if (file.size > maxSize) {
    return { isValid: false, error: 'Video must be less than 100MB' };
  }

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { isValid: false, error: 'Video must be MP4 or MOV format' };
  }

  return { isValid: true };
};
