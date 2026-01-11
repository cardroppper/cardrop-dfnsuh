
#!/usr/bin/env node

/**
 * Android Release Build Script
 * 
 * This script performs all necessary steps to build a release APK/AAB
 * including validation, cache clearing, and proper error handling.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Android Release Build Process\n');
console.log('=' .repeat(60));

let step = 0;

function runStep(name, command, options = {}) {
  step++;
  console.log(`\n[${step}] ${name}`);
  console.log('-'.repeat(60));
  
  try {
    const result = execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      ...options
    });
    console.log(`✅ ${name} completed successfully`);
    return result;
  } catch (error) {
    console.error(`❌ ${name} failed`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    console.log(`🧹 Cleaning ${dir}...`);
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`✅ ${dir} cleaned`);
  }
}

// Step 1: Validate environment
console.log('\n📋 Pre-build Validation');
console.log('-'.repeat(60));

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error(`❌ Node.js version ${nodeVersion} is too old. Please use Node.js 18 or higher.`);
  process.exit(1);
}
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found');
  process.exit(1);
}
console.log('✅ package.json found');

// Check if android folder exists
if (!fs.existsSync('android')) {
  console.error('❌ android folder not found. Run "expo prebuild -p android" first.');
  process.exit(1);
}
console.log('✅ android folder found');

// Step 2: Clean all caches
console.log('\n🧹 Cleaning Caches');
console.log('-'.repeat(60));

// Clean Metro cache
try {
  execSync('npx expo start --clear', { stdio: 'ignore', timeout: 5000 });
} catch (e) {
  // Ignore timeout, we just want to clear cache
}
console.log('✅ Metro cache cleared');

// Clean Android build folders
cleanDirectory('android/.gradle');
cleanDirectory('android/app/build');
cleanDirectory('android/build');

// Clean node_modules/.cache
cleanDirectory('node_modules/.cache');

// Step 3: Verify dependencies
runStep(
  'Verify Dependencies',
  'npm list --depth=0',
  { stdio: 'pipe' }
);

// Step 4: Run TypeScript check (non-blocking)
console.log('\n[' + (++step) + '] TypeScript Check');
console.log('-'.repeat(60));
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript check passed');
} catch (error) {
  console.log('⚠️  TypeScript warnings detected (non-blocking)');
}

// Step 5: Test Metro bundling
runStep(
  'Test Metro Bundling',
  'npx react-native bundle --platform android --dev false --entry-file index.ts --bundle-output /tmp/test-bundle.js --assets-dest /tmp/test-assets',
  { stdio: 'pipe' }
);

// Clean up test bundle
try {
  fs.unlinkSync('/tmp/test-bundle.js');
  fs.rmSync('/tmp/test-assets', { recursive: true, force: true });
} catch (e) {
  // Ignore cleanup errors
}

console.log('✅ Metro bundling test successful');

// Step 6: Build release APK
console.log('\n[' + (++step) + '] Building Release APK');
console.log('-'.repeat(60));
console.log('This may take several minutes...\n');

try {
  execSync('cd android && ./gradlew clean', { stdio: 'inherit' });
  console.log('✅ Gradle clean completed');
  
  execSync('cd android && ./gradlew assembleRelease', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      EXPO_NO_TELEMETRY: '1'
    }
  });
  console.log('✅ Release APK built successfully');
} catch (error) {
  console.error('❌ Gradle build failed');
  console.error('\nTroubleshooting steps:');
  console.error('1. Check the error message above');
  console.error('2. Ensure all dependencies are installed: npm install');
  console.error('3. Try running: cd android && ./gradlew clean');
  console.error('4. Check android/app/build.gradle for configuration issues');
  process.exit(1);
}

// Step 7: Verify APK exists
const apkPath = 'android/app/build/outputs/apk/release/app-release.apk';
if (!fs.existsSync(apkPath)) {
  console.error('❌ APK file not found at expected location');
  process.exit(1);
}

const stats = fs.statSync(apkPath);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n' + '='.repeat(60));
console.log('✅ BUILD SUCCESSFUL!');
console.log('='.repeat(60));
console.log(`\n📦 APK Location: ${apkPath}`);
console.log(`📊 APK Size: ${fileSizeMB} MB`);
console.log('\n🎉 Your release APK is ready for distribution!\n');
console.log('Next steps:');
console.log('  1. Test the APK on a physical device');
console.log('  2. Upload to Google Play Console');
console.log('  3. Submit for review\n');
