
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure react-native-reanimated is properly resolved
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
