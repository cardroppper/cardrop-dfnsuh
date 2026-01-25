// Initialize Natively console log capture before anything else
try {
  require('./utils/errorLogger');
} catch (error) {
  console.error('[Index] Failed to initialize error logger:', error);
}

import 'expo-router/entry';
