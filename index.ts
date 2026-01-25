// Initialize Natively console log capture before anything else
console.log('[index.ts] Starting app initialization...');

try {
  console.log('[index.ts] Loading error logger...');
  require('./utils/errorLogger');
  console.log('[index.ts] Error logger loaded');
} catch (err: any) {
  console.error('[index.ts] Failed to load error logger:', err);
}

console.log('[index.ts] Loading expo-router entry...');

try {
  require('expo-router/entry');
  console.log('[index.ts] Expo router loaded successfully');
} catch (err: any) {
  console.error('[index.ts] Failed to load expo-router:', err);
  throw err;
}
