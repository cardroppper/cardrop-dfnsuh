
module.exports = function (api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === 'production';

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
      ["babel-preset-expo", { 
        jsxRuntime: "automatic",
        lazyImports: true
      }]
    ],
    plugins: [
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
      ...EDITABLE_COMPONENTS,
      "@babel/plugin-transform-export-namespace-from",
      "react-native-reanimated/plugin",
    ],
  };
};
