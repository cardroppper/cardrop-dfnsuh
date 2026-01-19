
/**
 * Build Environment Validation Script
 * 
 * This script validates that all necessary environment variables and configurations
 * are in place before attempting an Android release build.
 * 
 * Run this before any build to catch configuration issues early.
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 Build Environment Validation');
console.log('═══════════════════════════════════════════════════════\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: NODE_ENV
console.log('1️⃣  Checking NODE_ENV...');
if (!process.env.NODE_ENV) {
  console.error('   ❌ NODE_ENV is not set!');
  console.error('   ❌ This will cause the build to fail.');
  console.error('   ❌ Set NODE_ENV=production before building.');
  hasErrors = true;
} else if (process.env.NODE_ENV !== 'production') {
  console.warn(`   ⚠️  NODE_ENV is set to "${process.env.NODE_ENV}" (expected "production")`);
  hasWarnings = true;
} else {
  console.log('   ✅ NODE_ENV is correctly set to "production"');
}

// Check 2: .env.production file
console.log('\n2️⃣  Checking .env.production file...');
const envProductionPath = path.join(__dirname, '..', '.env.production');
if (!fs.existsSync(envProductionPath)) {
  console.warn('   ⚠️  .env.production file does not exist');
  hasWarnings = true;
} else {
  const envContent = fs.readFileSync(envProductionPath, 'utf8');
  if (!envContent.includes('NODE_ENV=production')) {
    console.warn('   ⚠️  .env.production does not contain NODE_ENV=production');
    hasWarnings = true;
  } else {
    console.log('   ✅ .env.production exists and contains NODE_ENV=production');
  }
}

// Check 3: metro.config.js
console.log('\n3️⃣  Checking metro.config.js...');
const metroConfigPath = path.join(__dirname, '..', 'metro.config.js');
if (!fs.existsSync(metroConfigPath)) {
  console.error('   ❌ metro.config.js does not exist!');
  hasErrors = true;
} else {
  const metroConfig = fs.readFileSync(metroConfigPath, 'utf8');
  if (!metroConfig.includes('process.env.NODE_ENV')) {
    console.error('   ❌ metro.config.js does not check NODE_ENV!');
    hasErrors = true;
  } else {
    console.log('   ✅ metro.config.js has NODE_ENV validation');
  }
}

// Check 4: babel.config.js
console.log('\n4️⃣  Checking babel.config.js...');
const babelConfigPath = path.join(__dirname, '..', 'babel.config.js');
if (!fs.existsSync(babelConfigPath)) {
  console.error('   ❌ babel.config.js does not exist!');
  hasErrors = true;
} else {
  const babelConfig = fs.readFileSync(babelConfigPath, 'utf8');
  if (!babelConfig.includes('process.env.NODE_ENV')) {
    console.error('   ❌ babel.config.js does not check NODE_ENV!');
    hasErrors = true;
  } else {
    console.log('   ✅ babel.config.js has NODE_ENV validation');
  }
}

// Check 5: package.json scripts
console.log('\n5️⃣  Checking package.json build scripts...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('   ❌ package.json does not exist!');
  hasErrors = true;
} else {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const buildScript = packageJson.scripts['build:android'];
  
  if (!buildScript) {
    console.error('   ❌ build:android script not found in package.json!');
    hasErrors = true;
  } else if (!buildScript.includes('NODE_ENV=production')) {
    console.warn('   ⚠️  build:android script does not explicitly set NODE_ENV=production');
    hasWarnings = true;
  } else {
    console.log('   ✅ build:android script sets NODE_ENV=production');
  }
}

// Check 6: Android directory
console.log('\n6️⃣  Checking Android project structure...');
const androidDir = path.join(__dirname, '..', 'android');
if (!fs.existsSync(androidDir)) {
  console.error('   ❌ android directory does not exist!');
  console.error('   ❌ Run "npm run prebuild:android" first');
  hasErrors = true;
} else {
  console.log('   ✅ android directory exists');
  
  // Check for gradlew
  const gradlewPath = path.join(androidDir, 'gradlew');
  if (!fs.existsSync(gradlewPath)) {
    console.error('   ❌ android/gradlew does not exist!');
    hasErrors = true;
  } else {
    console.log('   ✅ android/gradlew exists');
  }
}

// Check 7: Node modules
console.log('\n7️⃣  Checking node_modules...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('   ❌ node_modules does not exist!');
  console.error('   ❌ Run "npm install" first');
  hasErrors = true;
} else {
  console.log('   ✅ node_modules exists');
  
  // Check for critical packages
  const criticalPackages = ['expo', 'react-native', 'cross-env'];
  for (const pkg of criticalPackages) {
    const pkgPath = path.join(nodeModulesPath, pkg);
    if (!fs.existsSync(pkgPath)) {
      console.error(`   ❌ Critical package "${pkg}" is not installed!`);
      hasErrors = true;
    }
  }
  
  if (!hasErrors) {
    console.log('   ✅ All critical packages are installed');
  }
}

// Check 8: Gradle properties
console.log('\n8️⃣  Checking Gradle configuration...');
const gradlePropsPath = path.join(__dirname, '..', 'android', 'gradle.properties');
if (fs.existsSync(gradlePropsPath)) {
  const gradleProps = fs.readFileSync(gradlePropsPath, 'utf8');
  
  // Check memory settings
  if (gradleProps.includes('org.gradle.jvmargs')) {
    const jvmArgsMatch = gradleProps.match(/org\.gradle\.jvmargs=(.+)/);
    if (jvmArgsMatch) {
      const jvmArgs = jvmArgsMatch[1];
      if (jvmArgs.includes('-Xmx')) {
        console.log('   ✅ Gradle JVM memory is configured');
      } else {
        console.warn('   ⚠️  Gradle JVM memory not explicitly set');
        hasWarnings = true;
      }
    }
  }
} else {
  console.warn('   ⚠️  android/gradle.properties not found');
  hasWarnings = true;
}

// Summary
console.log('\n═══════════════════════════════════════════════════════');
console.log('📊 Validation Summary');
console.log('═══════════════════════════════════════════════════════\n');

if (hasErrors) {
  console.error('❌ VALIDATION FAILED - Critical errors found!');
  console.error('❌ Fix the errors above before attempting to build.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  VALIDATION PASSED WITH WARNINGS');
  console.warn('⚠️  The build may succeed, but review warnings above.\n');
  process.exit(0);
} else {
  console.log('✅ VALIDATION PASSED - All checks successful!');
  console.log('✅ Environment is ready for Android release build.\n');
  process.exit(0);
}
