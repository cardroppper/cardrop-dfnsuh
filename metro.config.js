
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable CSS support
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-css-interop/metro'),
};

// Add support for additional file extensions
config.resolver = {
  ...config.resolver,
  sourceExts: [
    ...config.resolver.sourceExts,
    'css',
  ],
};

module.exports = config;
