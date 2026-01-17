
module.exports = {
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'import'],
  ignorePatterns: [
    '/dist/*',
    '/public/*',
    '/babel-plugins/*',
    '/backend/*',
    '/scripts/*',
    'scripts/**/*',
    'metro.config.js',
    'babel.config.js',
    'workbox-config.js',
    '*.config.js',
    'node_modules/',
    '.expo/',
    'android/',
    'ios/'
  ],
  overrides: [
    {
      files: ['metro.config.js', 'babel.config.js', 'workbox-config.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      },
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'never'
      }
    ]
  }
};
