const { getDefaultConfig } = require('expo/metro-config');

console.log('Metro: Configuring bundler...');

const config = getDefaultConfig(__dirname);

// Enable package exports for better module resolution
config.resolver.unstable_enablePackageExports = true;

console.log('Metro: Configuration complete');

module.exports = config;
