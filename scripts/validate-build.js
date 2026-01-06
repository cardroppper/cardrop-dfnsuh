
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running comprehensive build validation...\n');
console.log('═'.repeat(60));
console.log('BUILD VALIDATION - CarDrop Android');
console.log('═'.repeat(60) + '\n');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// Check 1: Verify app.json configuration
console.log('📋 Checking app.json configuration...');
try {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  if (appJson.expo.android.kotlinVersion) {
    checks.passed.push(`✅ Kotlin version: ${appJson.expo.android.kotlinVersion}`);
  } else {
    checks.failed.push('❌ Kotlin version not specified in app.json');
  }

  if (appJson.expo.android.gradleVersion) {
    checks.passed.push(`✅ Gradle version: ${appJson.expo.android.gradleVersion}`);
  } else {
    checks.warnings.push('⚠️  Gradle version not specified (will use default)');
  }

  if (appJson.expo.android.buildToolsVersion) {
    checks.passed.push(`✅ Build tools version: ${appJson.expo.android.buildToolsVersion}`);
  } else {
    checks.warnings.push('⚠️  Build tools version not specified (will use default)');
  }
} catch (error) {
  checks.failed.push('❌ Failed to read or parse app.json');
}

// Check 2: Verify package.json dependencies
console.log('📦 Checking dependencies...');
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = ['expo', 'react', 'react-native'];
  const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missing.length === 0) {
    checks.passed.push('✅ Core dependencies present');
  } else {
    checks.failed.push(`❌ Missing dependencies: ${missing.join(', ')}`);
  }

  // Check for Expo SDK version
  const expoVersion = packageJson.dependencies.expo;
  if (expoVersion) {
    checks.passed.push(`✅ Expo SDK: ${expoVersion}`);
  }
} catch (error) {
  checks.failed.push('❌ Failed to read package.json');
}

// Check 3: Verify node_modules exists
console.log('📁 Checking node_modules...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  checks.passed.push('✅ node_modules exists');
  
  // Check for critical packages
  const criticalPackages = ['expo', 'react-native', '@expo/prebuild-config'];
  criticalPackages.forEach(pkg => {
    const pkgPath = path.join(nodeModulesPath, pkg);
    if (fs.existsSync(pkgPath)) {
      checks.passed.push(`✅ ${pkg} installed`);
    } else {
      checks.failed.push(`❌ ${pkg} not found - run pnpm install`);
    }
  });
} else {
  checks.failed.push('❌ node_modules not found - run pnpm install');
}

// Check 4: Verify Expo CLI is available
console.log('🔧 Checking Expo CLI...');
try {
  const expoVersion = execSync('npx expo --version', { 
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  }).toString().trim();
  checks.passed.push(`✅ Expo CLI available: ${expoVersion}`);
} catch (error) {
  checks.failed.push('❌ Expo CLI not available');
}

// Check 5: Test prebuild configuration (dry run)
console.log('🏗️  Testing Android prebuild configuration...');
console.log('   (This may take a moment...)\n');
try {
  // Run prebuild with --clean to test configuration without actually building
  const prebuildOutput = execSync('npx expo prebuild --platform android --clean --no-install', {
    stdio: 'pipe',
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8'
  });
  
  checks.passed.push('✅ Android prebuild configuration valid');
  
  // Check for Kotlin/KSP warnings in output
  if (prebuildOutput.includes('KSP')) {
    if (prebuildOutput.includes('error') || prebuildOutput.includes('failed')) {
      checks.warnings.push('⚠️  KSP warnings detected in prebuild output');
    } else {
      checks.passed.push('✅ KSP configuration looks good');
    }
  }
} catch (error) {
  checks.failed.push('❌ Android prebuild configuration failed');
  
  const errorOutput = error.stderr ? error.stderr.toString() : error.message;
  
  // Check for specific Kotlin/KSP errors
  if (errorOutput.includes('KSP version')) {
    checks.failed.push('❌ Kotlin/KSP version mismatch detected');
    console.error('\n⚠️  KOTLIN/KSP ERROR DETAILS:');
    console.error('   ' + errorOutput.split('\n').filter(line => 
      line.includes('KSP') || line.includes('Kotlin') || line.includes('version')
    ).join('\n   '));
  }
  
  // Check for Gradle errors
  if (errorOutput.includes('Gradle')) {
    checks.failed.push('❌ Gradle configuration error detected');
  }
  
  // Check for plugin errors
  if (errorOutput.includes('plugin')) {
    checks.failed.push('❌ Plugin configuration error detected');
  }
}

// Check 6: Verify android folder doesn't exist (clean state)
console.log('🧹 Checking for clean build state...');
const androidPath = path.join(__dirname, '..', 'android');
const iosPath = path.join(__dirname, '..', 'ios');
if (!fs.existsSync(androidPath) && !fs.existsSync(iosPath)) {
  checks.passed.push('✅ Clean build state (no android/ios folders)');
} else {
  checks.warnings.push('⚠️  Native folders exist - run pnpm run prebuild:clean for fresh build');
}

// Check 7: Verify EAS configuration if using EAS Build
console.log('☁️  Checking EAS configuration...');
const easJsonPath = path.join(__dirname, '..', 'eas.json');
if (fs.existsSync(easJsonPath)) {
  try {
    const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));
    if (easJson.build && easJson.build.production) {
      checks.passed.push('✅ EAS Build configuration found');
    } else {
      checks.warnings.push('⚠️  eas.json exists but production profile not configured');
    }
  } catch (error) {
    checks.warnings.push('⚠️  eas.json exists but could not be parsed');
  }
} else {
  checks.warnings.push('⚠️  eas.json not found (required for EAS Build)');
}

// Print results
console.log('\n' + '═'.repeat(60));
console.log('VALIDATION RESULTS');
console.log('═'.repeat(60) + '\n');

if (checks.passed.length > 0) {
  console.log('✅ PASSED CHECKS:');
  checks.passed.forEach(check => console.log('   ' + check));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  checks.warnings.forEach(check => console.log('   ' + check));
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ FAILED CHECKS:');
  checks.failed.forEach(check => console.log('   ' + check));
  console.log('');
  console.log('═'.repeat(60));
  console.log('❌ BUILD VALIDATION FAILED');
  console.log('═'.repeat(60));
  console.log('\n💡 RECOMMENDED ACTIONS:');
  console.log('   1. Run: pnpm install');
  console.log('   2. Run: pnpm run prebuild:clean');
  console.log('   3. Check app.json for correct Kotlin/Gradle versions');
  console.log('   4. Run: pnpm run validate:build again\n');
  process.exit(1);
}

console.log('═'.repeat(60));
console.log('✅ ALL VALIDATION CHECKS PASSED!');
console.log('═'.repeat(60));
console.log('\n🚀 Your build configuration is ready!');
console.log('\n📱 Next steps:');
console.log('   • Local build: pnpm run build:android');
console.log('   • EAS Build: pnpm run build:android:release');
console.log('   • Clean build: pnpm run prebuild:clean && pnpm run build:android\n');

process.exit(0);
