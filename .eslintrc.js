
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
  plugins: ['@typescript-eslint', 'react', 'import'],
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
    '/android/*',
    '/ios/*',
    'scripts/**/*.js',
    '.expo/*',
    'node_modules/*',
    '*.md'
  ],
  env: {
    browser: true,
    node: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        moduleDirectory: ['node_modules', './']
      }
    },
    'import/ignore': [
      'react-native',
      '@react-native',
      'node_modules/react-native'
    ]
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-var-requires": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-wrapper-object-types": "off",
    "@typescript-eslint/ban-tslint-comment": "off",
    "react/no-unescaped-entities": "off",
    "import/no-unresolved": ["error", {
      ignore: [
        '^react-native$',
        '^@react-native',
        '^@stripe/stripe-react-native$',
        '^expo-superwall$',
        '^@/styles/commonStyles$',
        '^@/constants/Colors$'
      ]
    }],
    "prefer-const": "off",
    "react/prop-types": 1,
    "no-case-declarations": "off",
    "no-empty": "off",
    "react/display-name": "off",
    "no-constant-condition": "off",
    "no-var": "off",
    "no-useless-escape": "off",
    "no-undef": "off"
  },
  overrides: [
    {
      files: ['metro.config.js', 'babel.config.js', 'scripts/**/*.js'],
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off'
      }
    }
  ]
};
