module.exports = function (api) {
  api.cache(true);

  console.log('Babel: Configuring transpilation...');

  // Temporarily disable editable components plugins to fix build loop
  // These can be re-enabled once the build is stable
  const EDITABLE_COMPONENTS = [];

  const config = {
    presets: ["babel-preset-expo"],
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
            "@hooks": "./hooks",
            "@types": "./types",
            "@contexts": "./contexts",
            "@lib": "./lib",
          },
        },
      ],
      "@babel/plugin-proposal-export-namespace-from",
      ...EDITABLE_COMPONENTS,
      "react-native-reanimated/plugin",
    ],
  };

  console.log('Babel: Configuration complete');
  return config;
};
