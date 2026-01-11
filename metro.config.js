
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package exports for better module resolution
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

// Configure transformer for release builds
config.transformer = {
  ...config.transformer,
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    compress: {
      // Keep console logs in development, remove in production
      drop_console: process.env.NODE_ENV === 'production',
      // Remove debugger statements
      drop_debugger: true,
      // Optimize for production
      passes: 3,
    },
    mangle: {
      // Mangle variable names for smaller bundle
      toplevel: false,
    },
    output: {
      // Beautify output in development
      beautify: process.env.NODE_ENV !== 'production',
      comments: false,
    },
  },
  // Ensure proper asset handling
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  // Enable inline requires for better performance
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Ensure proper cache configuration
config.cacheStores = [
  {
    name: 'metro-cache',
    get: () => null,
    set: () => {},
  },
];

module.exports = config;
