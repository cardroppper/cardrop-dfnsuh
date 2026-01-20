
/**
 * Security utilities for password strength validation
 */

export interface PasswordValidationResult {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
  errors: string[];
}

interface UserContext {
  email?: string;
  username?: string;
  name?: string;
}

/**
 * Validate password strength with comprehensive checks
 */
export function validatePasswordStrength(
  password: string,
  userContext?: UserContext
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 8 && password.length < 12) {
    score += 20;
  } else if (password.length >= 12 && password.length < 16) {
    score += 30;
  } else {
    score += 40;
  }

  // Character variety checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 10;
  }

  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 10;
  }

  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  } else {
    score += 15;
  }

  if (!hasSpecialChars) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  } else {
    score += 15;
  }

  // Check for common patterns
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^letmein/i,
    /^welcome/i,
    /^monkey/i,
    /^dragon/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains a common pattern that is easy to guess');
      score = Math.max(0, score - 30);
      break;
    }
  }

  // Check for personal information
  if (userContext) {
    const lowerPassword = password.toLowerCase();
    
    if (userContext.email && lowerPassword.includes(userContext.email.split('@')[0].toLowerCase())) {
      errors.push('Password should not contain your email address');
      score = Math.max(0, score - 20);
    }

    if (userContext.username && lowerPassword.includes(userContext.username.toLowerCase())) {
      errors.push('Password should not contain your username');
      score = Math.max(0, score - 20);
    }

    if (userContext.name && lowerPassword.includes(userContext.name.toLowerCase())) {
      errors.push('Password should not contain your name');
      score = Math.max(0, score - 20);
    }
  }

  // Check for sequential characters
  const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  if (hasSequential) {
    errors.push('Password should not contain sequential characters (abc, 123, etc.)');
    score = Math.max(0, score - 10);
  }

  // Check for repeated characters
  const hasRepeated = /(.)\1{2,}/.test(password);
  if (hasRepeated) {
    errors.push('Password should not contain repeated characters (aaa, 111, etc.)');
    score = Math.max(0, score - 10);
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score < 40) {
    strength = 'weak';
  } else if (score < 60) {
    strength = 'medium';
  } else if (score < 80) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }

  return {
    isValid: errors.length === 0,
    strength,
    score: Math.min(100, Math.max(0, score)),
    errors,
  };
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
