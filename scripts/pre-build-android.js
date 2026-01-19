
/**
 * Pre-Build Android Script
 * Ensures environment is properly configured before starting Android build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Pre-Build Android Preparation\n');

// Step 1: Set NODE_ENV if not already set
if (!process.env.NODE_ENV) {
  console.log('📝 Setting NODE_ENV=production');
  process.env.NODE_ENV = 'production';
} else {
  console.log(`📝 NODE_ENV is already set to: ${process.env.NODE_ENV}`);
}

// Step 2: Validate environment
console.log('\n🔍 Validating environment...');
try {
  execSync('node scripts/validate-environment.js', { stdio: 'inherit' });
  console.log('✅ Environment validation passed\n');
} catch (error) {
  console.error('❌ Environment validation failed');
  process.exit(1);
}

// Step 3: Clean cache
console.log('🧹 Cleaning build cache...');
const cacheDirs = [
  'node_modules/.cache',
  '.expo',
  'android/.gradle',
  'android/app/build',
  'android/build'
];

cacheDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`   Removing ${dir}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
});
console.log('✅ Cache cleaned\n');

// Step 4: Verify dependencies
console.log('📦 Verifying dependencies...');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('   Installing dependencies...');
  try {
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

// Step 5: Check Android directory
console.log('📱 Checking Android directory...');
const androidDir = path.join(process.cwd(), 'android');
if (!fs.existsSync(androidDir)) {
  console.log('   Android directory not found, running expo prebuild...');
  try {
    execSync('npx expo prebuild -p android --clean', {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log('✅ Android directory created\n');
  } catch (error) {
    console.error('❌ Failed to create Android directory');
    process.exit(1);
  }
} else {
  console.log('✅ Android directory exists\n');
}

console.log('✅ Pre-build preparation complete!\n');
console.log('You can now run the Android build:');
console.log('  cd android && ./gradlew assembleRelease\n');
