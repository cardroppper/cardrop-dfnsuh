
// ═══════════════════════════════════════════════════════════════════════════
// CRITICAL: NODE_ENV MUST BE SET BEFORE BABEL CONFIG IS EVALUATED
// ═══════════════════════════════════════════════════════════════════════════
// This check MUST be at the very top of this file, before any other code.
// Expo and Metro require NODE_ENV to be set for proper plugin resolution.
// Without this, the build will fail during the bundling phase.
// ═══════════════════════════════════════════════════════════════════════════

if (!process.env.NODE_ENV) {
  // Default to development if not set
  process.env.NODE_ENV = 'development';
  console.warn('⚠️  [Babel Config] NODE_ENV was not set! Defaulting to development.');
  console.warn('⚠️  [Babel Config] For production builds, ensure NODE_ENV=production is set BEFORE running Gradle.');
} else {
  console.log(`✅ [Babel Config] NODE_ENV is correctly set to: ${process.env.NODE_ENV}`);
}

// Validate that we're in a known environment
const validEnvironments = ['development', 'production', 'test'];
if (!validEnvironments.includes(process.env.NODE_ENV)) {
  console.error(`❌ [Babel Config] Invalid NODE_ENV: ${process.env.NODE_ENV}`);
  console.error(`❌ [Babel Config] Must be one of: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

module.exports = function (api) {
  api.cache(true);

  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  console.log(`[Babel] Building for ${nodeEnv} environment`);

  // Disable editable components in production
  const EDITABLE_COMPONENTS =
    process.env.EXPO_PUBLIC_ENABLE_EDIT_MODE === "TRUE" && !isProduction
      ? [
          ["./babel-plugins/editable-elements.js", {}],
          ["./babel-plugins/inject-source-location.js", {}],
        ]
      : [];

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxRuntime: "automatic",
          lazyImports: true,
        }
      ]
    ],
    plugins: [
      // Module resolver must come first
      [
        "module-resolver",
        {
          root: ["./"],
          extensions: [
            ".ios.ts",
            ".android.ts",
            ".ts",
            ".ios.tsx",
            ".android.tsx",
            ".tsx",
            ".jsx",
            ".js",
            ".mjs",
            ".cjs",
            ".json",
          ],
          alias: {
            "@": "./",
            "@components": "./components",
            "@style": "./style",
            "@hooks": "./hooks",
            "@types": "./types",
            "@contexts": "./contexts",
            "@lib": "./lib",
          },
        },
      ],
      // Export namespace transform plugin
      "@babel/plugin-proposal-export-namespace-from",
      // Editable components (dev only)
      ...EDITABLE_COMPONENTS,
      // Reanimated plugin must be last
      "react-native-reanimated/plugin",
    ],
    env: {
      production: {
        plugins: [
          // Additional production optimizations
          ["transform-remove-console", { "exclude": ["error", "warn"] }]
        ]
      }
    }
  };
};
