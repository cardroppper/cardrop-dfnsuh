
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports
config.resolver.unstable_enablePackageExports = true;

// Ensure proper source extensions
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

// Configure minifier for release builds
// Only set minifier if metro-minify-terser is available
try {
  const minifierPath = require.resolve('metro-minify-terser');
  config.transformer = {
    ...config.transformer,
    minifierPath: minifierPath,
    minifierConfig: {
      compress: {
        drop_console: false,
      },
      mangle: {
        keep_fnames: true,
      },
    },
  };
} catch (e) {
  console.warn('metro-minify-terser not found, using default minifier');
}

module.exports = config;
