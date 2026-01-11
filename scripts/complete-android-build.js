
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CarDrop Complete Android Build');
console.log('===================================\n');

function runCommand(command, description, exitOnError = true) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    if (exitOnError) {
      console.error('\n❌ Build process stopped due to error.');
      process.exit(1);
    }
    return false;
  }
}

// Check if Android folder exists
const androidPath = path.join(process.cwd(), 'android');
const androidExists = fs.existsSync(androidPath);

if (!androidExists) {
  console.log('⚠️  Android project not found. Running fix script first...\n');
  runCommand('node scripts/fix-android-build.js', 'Fixing Android project');
}

// Verify Android project is ready
const settingsGradle = path.join(androidPath, 'settings.gradle');
if (!fs.existsSync(settingsGradle)) {
  console.error('\n❌ Android project is not properly set up.');
  console.error('   Please run: npm run build:android:fix');
  process.exit(1);
}

console.log('\n✅ Android project is ready');

// Ask user what to build
const buildType = process.argv[2] || 'apk';

if (buildType === 'apk') {
  console.log('\n📱 Building Release APK...');
  runCommand(
    'cd android && ./gradlew assembleRelease',
    'Building Release APK'
  );
  
  const apkPath = path.join(androidPath, 'app/build/outputs/apk/release/app-release.apk');
  if (fs.existsSync(apkPath)) {
    console.log('\n✅ APK built successfully!');
    console.log(`📦 Location: ${apkPath}`);
  }
} else if (buildType === 'aab') {
  console.log('\n📱 Building Release AAB...');
  runCommand(
    'cd android && ./gradlew bundleRelease',
    'Building Release AAB'
  );
  
  const aabPath = path.join(androidPath, 'app/build/outputs/bundle/release/app-release.aab');
  if (fs.existsSync(aabPath)) {
    console.log('\n✅ AAB built successfully!');
    console.log(`📦 Location: ${aabPath}`);
  }
} else {
  console.error(`\n❌ Unknown build type: ${buildType}`);
  console.error('   Use: npm run build:android:complete [apk|aab]');
  process.exit(1);
}

console.log('\n===================================');
console.log('🏁 Build completed successfully!\n');
