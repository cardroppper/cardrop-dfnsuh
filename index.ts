// Entry point for Expo Router
console.log('[Entry] Loading Expo Router entry point...');

try {
  require('expo-router/entry');
  console.log('[Entry] Expo Router loaded successfully');
} catch (error) {
  console.error('[Entry] Failed to load Expo Router:', error);
  throw error;
}
