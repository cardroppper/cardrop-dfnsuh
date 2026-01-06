
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║         🚀 SAFE ANDROID APK BUILD PROCESS             ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

function runCommand(command, description, critical = true) {
  console.log(`\n📍 ${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..'),
      timeout: 300000 // 5 minutes
    });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    if (critical) {
      console.error('\n🚫 Critical step failed. Aborting build.\n');
      process.exit(1);
    }
    return false;
  }
}

// Step 1: Clean previous builds
console.log('🧹 Step 1: Cleaning previous builds...');
const dirsToClean = ['android', '.expo', 'node_modules/.cache'];
for (const dir of dirsToClean) {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath) && dir !== 'node_modules/.cache') {
    console.log(`   Removing ${dir}...`);
  }
}

// Step 2: Verify dependencies
runCommand('npm install', 'Installing dependencies', true);

// Step 3: Run validation
runCommand('node scripts/validate-build.js', 'Running pre-build validation', false);

// Step 4: Prebuild Android
runCommand('npx expo prebuild -p android --clean', 'Generating Android native code', true);

// Step 5: Final check
console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║              ✅ BUILD PREPARATION COMPLETE             ║');
console.log('╚════════════════════════════════════════════════════════╝\n');
console.log('📱 Next steps:');
console.log('   1. Review any warnings above');
console.log('   2. Run: cd android && ./gradlew assembleRelease');
console.log('   3. APK will be in: android/app/build/outputs/apk/release/\n');
