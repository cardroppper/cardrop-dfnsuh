
# 🔒 CarDrop Security Documentation

## Enterprise-Grade Security Implementation

This document outlines the comprehensive security measures implemented in CarDrop to ensure production-ready, hack-resistant operation.

---

## Table of Contents

1. [Authentication Security](#authentication-security)
2. [Password Security](#password-security)
3. [API Security](#api-security)
4. [Payment Security (Stripe)](#payment-security-stripe)
5. [Data Protection](#data-protection)
6. [Network Security](#network-security)
7. [Session Management](#session-management)
8. [Input Validation](#input-validation)
9. [Security Monitoring](#security-monitoring)
10. [Deployment Checklist](#deployment-checklist)

---

## Authentication Security

### Multi-Factor Authentication (MFA)
- **Status**: Ready for implementation
- **Supported Methods**: TOTP, SMS, Email
- **Implementation**: Use `better-auth` MFA plugin

```typescript
// Enable MFA in backend
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    twoFactor({
      issuer: "CarDrop",
      totpBackupCodes: true,
    }),
  ],
});
```

### OAuth Security
- **Providers**: Google, Apple (production-ready)
- **PKCE Flow**: Enabled for mobile apps
- **State Parameter**: Prevents CSRF attacks
- **Redirect URI Validation**: Strict whitelist

### Session Security
- **Token Rotation**: Automatic on sensitive operations
- **Device Fingerprinting**: Tracks login devices
- **Concurrent Session Limits**: Max 5 devices per user
- **Session Timeout**: 30 days idle, 90 days absolute

---

## Password Security

### Password Requirements (NIST 800-63B Compliant)
- Minimum 12 characters
- Maximum 128 characters
- Must contain: uppercase, lowercase, numbers, special characters
- Blocks top 100 common passwords
- Prevents user info in password

### Password Storage
- **Algorithm**: Argon2id (better-auth default)
- **Salt**: Unique per password
- **Iterations**: Automatically tuned for 100ms hash time
- **Never logged or transmitted in plain text**

### Password Reset Security
- **Rate Limiting**: 3 attempts per hour
- **Token Expiry**: 15 minutes
- **One-time Use**: Tokens invalidated after use
- **Email Verification**: Required before reset

### Implementation Example
```typescript
import { validatePasswordStrength } from '@/utils/security';

const result = validatePasswordStrength(password, {
  email: user.email,
  username: user.username,
});

if (!result.isValid) {
  Alert.alert('Weak Password', result.errors.join('\n'));
  return;
}
```

---

## API Security

### Request Authentication
- **Bearer Tokens**: JWT with RS256 signing
- **Token Expiry**: 1 hour (access), 30 days (refresh)
- **Automatic Refresh**: Handled by auth client

### Request Signing (Optional - High Security)
```typescript
import { generateRequestSignature } from '@/utils/security';

const timestamp = Date.now();
const signature = await generateRequestSignature(
  'POST',
  '/api/vehicles',
  JSON.stringify(data),
  timestamp,
  SECRET_KEY
);

// Include in headers
headers: {
  'X-Timestamp': timestamp.toString(),
  'X-Signature': signature,
}
```

### Rate Limiting (Client-Side)
```typescript
import { rateLimiter, RATE_LIMITS } from '@/utils/security';

const check = rateLimiter.check('login:' + email, RATE_LIMITS.login);

if (!check.allowed) {
  Alert.alert(
    'Too Many Attempts',
    `Please try again in ${check.retryAfter} seconds`
  );
  return;
}
```

### CORS Configuration (Backend)
```typescript
// Strict CORS policy
cors: {
  origin: [
    'https://cardrop.app',
    'https://www.cardrop.app',
    'exp://localhost:8081', // Development only
  ],
  credentials: true,
}
```

---

## Payment Security (Stripe)

### Webhook Verification
**CRITICAL**: Always verify Stripe webhooks to prevent fraud

```typescript
import { verifyStripeWebhookSignature } from '@/utils/stripeSecure';

// In your webhook handler
const isValid = await verifyStripeWebhookSignature(
  req.body,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);

if (!isValid) {
  return res.status(400).send('Invalid signature');
}
```

### Payment Amount Validation
```typescript
import { validatePaymentAmount } from '@/utils/stripeSecure';

const validation = validatePaymentAmount(
  paymentIntent.amount,
  paymentIntent.currency,
  expectedAmount
);

if (!validation.isValid) {
  // Log security event and reject payment
  logSecurityEvent({
    type: SecurityEventType.SUSPICIOUS_ACTIVITY,
    metadata: { reason: 'amount_mismatch' },
  });
  throw new Error('Payment amount mismatch');
}
```

### Idempotency Keys
Prevents duplicate charges from network retries:

```typescript
import { generateIdempotencyKey, isIdempotencyKeyUsed } from '@/utils/stripeSecure';

const idempotencyKey = await generateIdempotencyKey(
  userId,
  'subscribe_premium',
  Date.now()
);

if (await isIdempotencyKeyUsed(idempotencyKey)) {
  throw new Error('Duplicate request detected');
}

// Use with Stripe API
await stripe.paymentIntents.create(
  { amount, currency, customer },
  { idempotencyKey }
);

await storeIdempotencyKey(idempotencyKey);
```

### Card Validation
```typescript
import { validateCardNumber, validateCVV, validateExpiryDate } from '@/utils/stripeSecure';

// Client-side validation before sending to Stripe
if (!validateCardNumber(cardNumber)) {
  Alert.alert('Invalid Card', 'Please check your card number');
  return;
}

if (!validateCVV(cvv, cardType)) {
  Alert.alert('Invalid CVV', 'Please check your security code');
  return;
}

if (!validateExpiryDate(month, year)) {
  Alert.alert('Invalid Expiry', 'Card has expired');
  return;
}
```

### Stripe API Key Security
```typescript
import { ensurePublishableKey, validateStripeKey } from '@/utils/stripeSecure';

// CRITICAL: Never expose secret keys on client
ensurePublishableKey(STRIPE_KEY); // Throws if secret key detected

// Validate key format
if (!validateStripeKey(STRIPE_KEY, 'publishable')) {
  throw new Error('Invalid Stripe publishable key');
}
```

### Club Payment Security
```typescript
import { validateClubPayment, verifyClubMembership } from '@/utils/stripeSecure';

// Verify user is club owner/admin
const isMember = await verifyClubMembership(userId, clubId, 'owner');
if (!isMember) {
  throw new Error('Unauthorized: Not club owner');
}

// Validate payment amount matches member count
const validation = validateClubPayment(memberCount, pricePerMember, amount);
if (!validation.isValid) {
  throw new Error(validation.reason);
}
```

---

## Data Protection

### Sensitive Data Storage
```typescript
import { secureStore } from '@/utils/security';

// Store sensitive data with hardware-backed encryption
await secureStore.setItem('auth_token', token);

// Retrieve
const token = await secureStore.getItem('auth_token');

// Delete
await secureStore.deleteItem('auth_token');
```

### PII Masking
```typescript
import { maskEmail, maskPhone, maskCardNumber } from '@/utils/security';

// Display masked data in UI
console.log(maskEmail('user@example.com')); // u***@example.com
console.log(maskPhone('+1234567890')); // ******7890
console.log(maskCardNumber('4242424242424242')); // **** **** **** 4242
```

### Input Sanitization
```typescript
import { sanitizeInput, sanitizeSQLInput } from '@/utils/security';

// Prevent XSS attacks
const safeInput = sanitizeInput(userInput);

// Prevent SQL injection (use parameterized queries instead when possible)
const safeSQLInput = sanitizeSQLInput(userInput);
```

### Data Encryption at Rest
- **Database**: Supabase provides encryption at rest by default
- **File Storage**: All uploaded files encrypted with AES-256
- **Backups**: Encrypted with separate keys

---

## Network Security

### HTTPS Only
- All API calls must use HTTPS
- HTTP requests automatically rejected
- Certificate pinning for production

### Request Timeout
```typescript
// Prevent hanging requests
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

try {
  const response = await fetch(url, {
    signal: controller.signal,
    headers: { Authorization: `Bearer ${token}` },
  });
} catch (error) {
  if (error.name === 'AbortError') {
    Alert.alert('Request Timeout', 'Please check your connection');
  }
} finally {
  clearTimeout(timeoutId);
}
```

### Retry Logic with Exponential Backoff
```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

## Session Management

### Device Tracking
```typescript
import { generateDeviceId } from '@/utils/security';

const deviceId = await generateDeviceId();

// Include in all authenticated requests
headers: {
  'X-Device-ID': deviceId,
}
```

### Session Expiry
```typescript
import { isSessionExpired, calculateSessionExpiry } from '@/utils/security';

// Check if session expired
if (isSessionExpired(session.expiresAt)) {
  // Refresh token or re-authenticate
  await refreshSession();
}

// Calculate expiry with buffer
const expiresAt = calculateSessionExpiry(3600, 60); // 1 hour - 1 min buffer
```

### Logout Security
```typescript
// Proper logout procedure
async function secureLogout() {
  try {
    // 1. Revoke tokens on backend
    await authClient.signOut();
    
    // 2. Clear local storage
    await secureStore.deleteItem('auth_token');
    await secureStore.deleteItem('refresh_token');
    
    // 3. Clear sensitive state
    setUser(null);
    
    // 4. Navigate to login
    router.replace('/(auth)/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

---

## Input Validation

### Comprehensive Validation
```typescript
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateDisplayName,
  validateVehicleYear,
  validateClubName,
} from '@/utils/validation';

// Email validation
const emailResult = validateEmail(email);
if (!emailResult.isValid) {
  Alert.alert('Invalid Email', emailResult.error);
  return;
}

// Username validation
const usernameResult = validateUsername(username);
if (!usernameResult.isValid) {
  Alert.alert('Invalid Username', usernameResult.error);
  return;
}

// Password validation
const passwordResult = validatePassword(password);
if (!passwordResult.isValid) {
  Alert.alert('Invalid Password', passwordResult.error);
  return;
}
```

### File Upload Validation
```typescript
import { validateImageFile, validateVideoFile } from '@/utils/validation';

// Validate image before upload
const imageResult = validateImageFile({
  size: file.size,
  type: file.type,
  name: file.name,
});

if (!imageResult.isValid) {
  Alert.alert('Invalid Image', imageResult.error);
  return;
}
```

---

## Security Monitoring

### Security Event Logging
```typescript
import { logSecurityEvent, SecurityEventType } from '@/utils/security';

// Log security events
await logSecurityEvent({
  type: SecurityEventType.LOGIN_SUCCESS,
  userId: user.id,
  metadata: { method: 'email', deviceType: Platform.OS },
});

await logSecurityEvent({
  type: SecurityEventType.SUSPICIOUS_ACTIVITY,
  userId: user.id,
  metadata: { reason: 'multiple_failed_logins', attempts: 5 },
});
```

### Anomaly Detection
Monitor for:
- Multiple failed login attempts
- Unusual payment amounts
- Rapid API requests
- Geographic anomalies
- Device changes
- Permission escalation attempts

### Security Alerts
Set up alerts for:
- Failed authentication (>5 attempts)
- Payment fraud attempts
- Data breach indicators
- API abuse
- Unauthorized access attempts

---

## Deployment Checklist

### Pre-Launch Security Audit

#### Authentication
- [ ] MFA enabled for admin accounts
- [ ] OAuth providers configured with production credentials
- [ ] Session timeout configured
- [ ] Password requirements enforced
- [ ] Rate limiting enabled

#### API Security
- [ ] All endpoints require authentication
- [ ] CORS configured with production domains only
- [ ] Rate limiting enabled on backend
- [ ] Request signing implemented for sensitive operations
- [ ] API keys rotated and secured

#### Payment Security
- [ ] Stripe webhook signature verification enabled
- [ ] Payment amount validation implemented
- [ ] Idempotency keys used for all payment operations
- [ ] Refund policies enforced
- [ ] Test mode disabled, live keys configured

#### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] PII masked in logs and UI
- [ ] Secure storage used for tokens
- [ ] Database RLS policies enabled
- [ ] Backup encryption enabled

#### Network Security
- [ ] HTTPS enforced for all requests
- [ ] Certificate pinning enabled (production)
- [ ] Request timeouts configured
- [ ] Retry logic with backoff implemented

#### Monitoring
- [ ] Security event logging enabled
- [ ] Anomaly detection configured
- [ ] Alert system set up
- [ ] Error tracking integrated (Sentry, etc.)
- [ ] Audit logs enabled

#### Code Security
- [ ] Dependencies updated to latest secure versions
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly configured
- [ ] Code obfuscation enabled for production builds
- [ ] Source maps disabled for production

#### Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance verified (if applicable)
- [ ] CCPA compliance verified (if applicable)
- [ ] Data retention policies implemented

---

## Security Best Practices

### For Developers

1. **Never commit secrets**: Use environment variables
2. **Validate all inputs**: Never trust user input
3. **Use parameterized queries**: Prevent SQL injection
4. **Sanitize outputs**: Prevent XSS attacks
5. **Log security events**: Enable audit trail
6. **Keep dependencies updated**: Patch vulnerabilities
7. **Use HTTPS everywhere**: No exceptions
8. **Implement rate limiting**: Prevent abuse
9. **Test security**: Regular penetration testing
10. **Follow principle of least privilege**: Minimal permissions

### For Users

1. **Use strong passwords**: 12+ characters, mixed case, numbers, symbols
2. **Enable MFA**: Add extra security layer
3. **Don't share accounts**: Each user should have own account
4. **Review login activity**: Check for suspicious logins
5. **Keep app updated**: Install security patches
6. **Use secure networks**: Avoid public WiFi for sensitive operations
7. **Report suspicious activity**: Contact support immediately

---

## Incident Response

### Security Breach Protocol

1. **Detect**: Monitor security events and alerts
2. **Contain**: Immediately revoke compromised credentials
3. **Investigate**: Determine scope and impact
4. **Eradicate**: Remove threat and patch vulnerability
5. **Recover**: Restore normal operations
6. **Learn**: Update security measures to prevent recurrence

### Contact

For security issues, contact: security@cardrop.app

**Do not** disclose security vulnerabilities publicly.

---

## Security Updates

This document is maintained and updated regularly. Last updated: 2024

### Version History
- v1.0.0 (2024): Initial comprehensive security implementation

---

## Additional Resources

- [OWASP Mobile Security Project](https://owasp.org/www-project-mobile-security/)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/)
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)
