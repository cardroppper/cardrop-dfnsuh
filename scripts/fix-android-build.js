
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 CarDrop Android Build Fix Script');
console.log('=====================================\n');

function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`🗑️  Removing ${dirPath}...`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed ${dirPath}`);
  }
}

// Step 1: Clean existing Android build artifacts
console.log('\n🧹 Step 1: Cleaning existing Android artifacts...');
removeDirectory(path.join(process.cwd(), 'android'));
removeDirectory(path.join(process.cwd(), '.expo'));
removeDirectory(path.join(process.cwd(), 'node_modules/.cache'));

// Step 2: Verify dependencies
console.log('\n📦 Step 2: Verifying dependencies...');
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.log('⚠️  node_modules not found. Installing dependencies...');
  runCommand('npm install', 'Installing dependencies');
}

// Step 3: Run expo prebuild for Android
console.log('\n🏗️  Step 3: Generating Android native project...');
const prebuildSuccess = runCommand(
  'npx expo prebuild --platform android --clean',
  'Running expo prebuild for Android'
);

if (!prebuildSuccess) {
  console.error('\n❌ Prebuild failed. Trying alternative approach...');
  runCommand(
    'npx expo prebuild -p android',
    'Running expo prebuild (without clean flag)'
  );
}

// Step 4: Verify Android project structure
console.log('\n🔍 Step 4: Verifying Android project structure...');
const androidPath = path.join(process.cwd(), 'android');
const requiredFiles = [
  'settings.gradle',
  'build.gradle',
  'gradle.properties',
  'app/build.gradle'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(androidPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('\n✅ Android project structure is complete!');
  console.log('\n📱 Next steps:');
  console.log('   1. Run: npm run build:android:apk');
  console.log('   2. Or run: cd android && ./gradlew assembleRelease');
} else {
  console.log('\n❌ Android project structure is incomplete.');
  console.log('   Please check the errors above and try running:');
  console.log('   npx expo prebuild --platform android --clean');
}

console.log('\n=====================================');
console.log('🏁 Fix script completed\n');
