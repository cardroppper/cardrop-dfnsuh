
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build configuration...\n');

const checks = [
  {
    name: 'package.json exists',
    check: () => fs.existsSync('package.json'),
  },
  {
    name: 'node_modules exists',
    check: () => fs.existsSync('node_modules'),
  },
  {
    name: 'app.json exists',
    check: () => fs.existsSync('app.json'),
  },
  {
    name: 'index.ts exists',
    check: () => fs.existsSync('index.ts'),
  },
  {
    name: 'app/_layout.tsx exists',
    check: () => fs.existsSync('app/_layout.tsx'),
  },
  {
    name: 'tsconfig.json exists',
    check: () => fs.existsSync('tsconfig.json'),
  },
  {
    name: 'babel.config.js exists',
    check: () => fs.existsSync('babel.config.js'),
  },
  {
    name: 'metro.config.js exists',
    check: () => fs.existsSync('metro.config.js'),
  },
];

let allPassed = true;

checks.forEach(({ name, check }) => {
  const passed = check();
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (!passed) allPassed = false;
});

console.log('\n' + (allPassed ? '✅ All checks passed!' : '❌ Some checks failed!'));

if (!allPassed) {
  console.log('\n💡 Try running: npm install');
  process.exit(1);
}

console.log('\n💡 If build still fails, try:');
console.log('   1. npm install');
console.log('   2. Clear Metro cache: npx expo start -c');
console.log('   3. Check for TypeScript errors: npx tsc --noEmit');

process.exit(0);
