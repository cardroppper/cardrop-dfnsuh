
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║      🏗️  COMPLETE ANDROID APK BUILD AUTOMATION        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

const steps = [
  {
    name: 'Clean Environment',
    commands: [
      'rm -rf android',
      'rm -rf .expo',
      'rm -rf node_modules/.cache'
    ],
    critical: false
  },
  {
    name: 'Install Dependencies',
    commands: ['npm install'],
    critical: true
  },
  {
    name: 'Validate Build',
    commands: ['node scripts/validate-build.js'],
    critical: false
  },
  {
    name: 'Generate Android Code',
    commands: ['npx expo prebuild -p android --clean'],
    critical: true
  },
  {
    name: 'Build Release APK',
    commands: ['cd android && ./gradlew assembleRelease'],
    critical: true
  }
];

let currentStep = 0;

for (const step of steps) {
  currentStep++;
  console.log(`\n[${ currentStep}/${steps.length}] ${step.name}`);
  console.log('─'.repeat(60));
  
  for (const command of step.commands) {
    try {
      console.log(`   Running: ${command}`);
      execSync(command, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        timeout: 600000 // 10 minutes
      });
      console.log(`   ✅ Success`);
    } catch (error) {
      console.error(`   ❌ Failed: ${command}`);
      if (step.critical) {
        console.error('\n🚫 Critical step failed. Build aborted.\n');
        process.exit(1);
      } else {
        console.log('   ⚠️  Non-critical failure, continuing...');
      }
    }
  }
}

// Find and display APK location
console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║              🎉 BUILD COMPLETED SUCCESSFULLY!          ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

const apkPath = path.join(__dirname, '../android/app/build/outputs/apk/release/app-release.apk');
if (fs.existsSync(apkPath)) {
  const stats = fs.statSync(apkPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('📱 Your APK is ready!\n');
  console.log(`   Location: ${apkPath}`);
  console.log(`   Size: ${sizeMB} MB\n`);
  console.log('🚀 Install on device:');
  console.log(`   adb install "${apkPath}"\n`);
} else {
  console.log('⚠️  APK not found at expected location.');
  console.log('   Check: android/app/build/outputs/apk/\n');
}
