
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║       🔍 PRE-BUILD VALIDATION - CARDROP APK           ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

let hasErrors = false;
let warnings = [];

// Check 1: Node modules exist
console.log('📦 [1/6] Checking node_modules...');
if (!fs.existsSync(path.join(__dirname, '../node_modules'))) {
  console.error('   ❌ node_modules not found. Run: npm install');
  hasErrors = true;
} else {
  console.log('   ✅ node_modules found');
}

// Check 2: Critical files exist
console.log('\n📄 [2/6] Checking critical files...');
const criticalFiles = ['app.json', 'metro.config.js', 'tsconfig.json', 'android/build.gradle'];
for (const file of criticalFiles) {
  if (!fs.existsSync(path.join(__dirname, '..', file))) {
    console.error(`   ❌ Missing: ${file}`);
    hasErrors = true;
  } else {
    console.log(`   ✅ ${file}`);
  }
}

// Check 3: Android directory structure
console.log('\n🤖 [3/6] Checking Android structure...');
const androidDirs = ['android/app', 'android/app/src/main'];
for (const dir of androidDirs) {
  if (!fs.existsSync(path.join(__dirname, '..', dir))) {
    console.error(`   ❌ Missing: ${dir}`);
    hasErrors = true;
  } else {
    console.log(`   ✅ ${dir}`);
  }
}

// Check 4: TypeScript compilation
console.log('\n📘 [4/6] Checking TypeScript...');
try {
  execSync('npx tsc --noEmit', { 
    stdio: 'pipe', 
    cwd: path.join(__dirname, '..'),
    timeout: 30000 
  });
  console.log('   ✅ TypeScript compilation successful');
} catch (error) {
  console.error('   ⚠️  TypeScript errors found (non-blocking)');
  warnings.push('TypeScript has errors - review before production');
}

// Check 5: ESLint
console.log('\n🔍 [5/6] Running ESLint...');
try {
  execSync('npm run lint', { 
    stdio: 'pipe', 
    cwd: path.join(__dirname, '..'),
    timeout: 30000 
  });
  console.log('   ✅ ESLint passed');
} catch (error) {
  console.error('   ⚠️  ESLint warnings found (non-blocking)');
  warnings.push('ESLint has warnings - review code quality');
}

// Check 6: Package dependencies
console.log('\n📚 [6/6] Checking critical dependencies...');
const packageJson = require('../package.json');
const criticalDeps = [
  'expo',
  'react',
  'react-native',
  'expo-router',
  '@supabase/supabase-js'
];

for (const dep of criticalDeps) {
  if (packageJson.dependencies[dep]) {
    console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.error(`   ❌ Missing dependency: ${dep}`);
    hasErrors = true;
  }
}

// Summary
console.log('\n╔════════════════════════════════════════════════════════╗');
if (hasErrors) {
  console.log('║                  ❌ VALIDATION FAILED                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.error('🚫 Critical errors found. Fix them before building:\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('║              ⚠️  VALIDATION PASSED WITH WARNINGS       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log('⚠️  Warnings:\n');
  warnings.forEach(w => console.log(`   - ${w}`));
  console.log('\n✅ Build can proceed, but review warnings\n');
} else {
  console.log('║              ✅ ALL VALIDATION CHECKS PASSED           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log('🚀 Ready to build Android APK!\n');
}
