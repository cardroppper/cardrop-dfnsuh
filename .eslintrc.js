
// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  root: true,
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  ignorePatterns: [
    '/dist/*',
    '/public/*',
    '/babel-plugins/*',
    '/backend/*',
    '/scripts/*',
    '/assets/*',
    '*.config.js',
    '.expo/*',
    'node_modules/*',
    '*.md'
  ],
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    },
    'import/ignore': [
      'react-native-ble-plx',
      'expo-superwall',
      '@stripe/stripe-react-native'
    ]
  },
  rules: {
    // TypeScript rules
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-wrapper-object-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-empty-function": "off",
    
    // React rules
    "react/react-in-jsx-scope": "off",
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    
    // Import rules - ignore optional native dependencies
    "import/no-unresolved": ["error", {
      "ignore": [
        "^react-native-ble-plx$",
        "^expo-superwall$",
        "^@stripe/stripe-react-native$"
      ]
    }],
    
    // General rules
    "prefer-const": "off",
    "no-case-declarations": "off",
    "no-empty": "off",
    "no-constant-condition": "off",
    "no-var": "off",
    "no-useless-escape": "off",
    "no-prototype-builtins": "off",
    "no-extra-boolean-cast": "off"
  }
};
