
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports
config.resolver.unstable_enablePackageExports = true;

// Fix transformer.transform error - use default Expo transformer
// Don't override transformer configuration unless necessary
config.transformer = {
  ...config.transformer,
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    compress: {
      drop_console: false,
    },
  },
};

module.exports = config;
