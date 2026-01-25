// Simplified error logger - minimal initialization to prevent build blocking
// This file is loaded first in index.ts, so it must be bulletproof

// Export a no-op function to satisfy imports
export const setupErrorLogging = () => {
  console.log('[ErrorLogger] Initialized (simplified mode)');
};
