
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

// Aggressive cache clearing for release builds
config.cacheStores = [
  new FileStore({ 
    root: path.join(__dirname, 'node_modules', '.cache', 'metro')
  }),
];

// Reset cache on every build to prevent stale module resolution
config.resetCache = process.env.NODE_ENV === 'production';

// Ensure all native modules resolve correctly
config.resolver.sourceExts = ['js', 'json', 'ts', 'tsx', 'jsx'];

module.exports = config;
