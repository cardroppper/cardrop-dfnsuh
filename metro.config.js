
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

// pnpm-compatible cache configuration
// Avoid importing FileStore directly - use simple in-memory cache instead
config.cacheStores = [
  {
    get: async () => null,
    set: async () => {},
  }
];

// Ensure Metro can resolve all necessary modules with pnpm
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Explicitly define source extensions
config.resolver.sourceExts = [
  'expo.ts',
  'expo.tsx',
  'expo.js',
  'expo.jsx',
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'wasm',
  'svg',
];

module.exports = config;
