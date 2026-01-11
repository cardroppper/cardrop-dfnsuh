
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running pre-build checks...\n');

// Check if android/ios folders exist
const androidExists = fs.existsSync(path.join(__dirname, '..', 'android'));
const iosExists = fs.existsSync(path.join(__dirname, '..', 'ios'));

if (androidExists || iosExists) {
  console.log('⚠️  Native folders detected. Cleaning...');
  try {
    if (androidExists) {
      fs.rmSync(path.join(__dirname, '..', 'android'), { recursive: true, force: true });
      console.log('✅ Removed android folder');
    }
    if (iosExists) {
      fs.rmSync(path.join(__dirname, '..', 'ios'), { recursive: true, force: true });
      console.log('✅ Removed ios folder');
    }
  } catch (error) {
    console.error('❌ Error cleaning native folders:', error.message);
    process.exit(1);
  }
}

// Clean Gradle cache
const gradleCache = path.join(__dirname, '..', 'android', '.gradle');
if (fs.existsSync(gradleCache)) {
  console.log('🧹 Cleaning Gradle cache...');
  try {
    fs.rmSync(gradleCache, { recursive: true, force: true });
    console.log('✅ Gradle cache cleaned');
  } catch (error) {
    console.warn('⚠️  Could not clean Gradle cache:', error.message);
  }
}

// Verify node_modules
if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  console.log('❌ node_modules not found. Run: pnpm install');
  process.exit(1);
}

// Verify critical dependencies
console.log('📦 Verifying critical dependencies...');
const criticalDeps = [
  'expo',
  'react',
  'react-native',
  'expo-router',
  '@expo/metro-runtime'
];

let missingDeps = [];
for (const dep of criticalDeps) {
  const depPath = path.join(__dirname, '..', 'node_modules', dep);
  if (!fs.existsSync(depPath)) {
    missingDeps.push(dep);
  }
}

if (missingDeps.length > 0) {
  console.error('❌ Missing critical dependencies:', missingDeps.join(', '));
  console.error('   Run: pnpm install');
  process.exit(1);
}

console.log('✅ All critical dependencies present');
console.log('✅ Pre-build checks passed\n');
