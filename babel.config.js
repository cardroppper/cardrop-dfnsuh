
module.exports = function (api) {
  api.cache(true);

  // Ensure NODE_ENV is set
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
