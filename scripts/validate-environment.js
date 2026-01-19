
/**
 * Environment Validation Script
 * Validates that all required environment variables and configurations are set
 * before attempting a production build.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating build environment...\n');

let hasErrors = false;
let hasWarnings = false;

// Check NODE_ENV
console.log('📋 Checking NODE_ENV...');
if (!process.env.NODE_ENV) {
  console.error('❌ ERROR: NODE_ENV is not set');
  console.error('   Set it with: export NODE_ENV=production');
  hasErrors = true;
} else {
  console.log(`✅ NODE_ENV is set to: ${process.env.NODE_ENV}`);
}

// Check for .env files
console.log('\n📋 Checking environment files...');
const envFiles = ['.env', '.env.production'];
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('NODE_ENV')) {
      console.log(`   ✓ Contains NODE_ENV configuration`);
    } else {
      console.warn(`   ⚠️  WARNING: ${file} does not contain NODE_ENV`);
      hasWarnings = true;
    }
  } else {
    console.warn(`⚠️  WARNING: ${file} not found`);
    hasWarnings = true;
  }
});

// Check package.json
console.log('\n📋 Checking package.json...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check for cross-env
  if (packageJson.dependencies['cross-env'] || packageJson.devDependencies['cross-env']) {
    console.log('✅ cross-env is installed');
  } else {
    console.error('❌ ERROR: cross-env is not installed');
    console.error('   Install it with: npm install cross-env');
    hasErrors = true;
  }
  
  // Check build scripts
  if (packageJson.scripts['build:android']) {
    const script = packageJson.scripts['build:android'];
    if (script.includes('NODE_ENV=production')) {
      console.log('✅ build:android script sets NODE_ENV=production');
    } else {
      console.error('❌ ERROR: build:android script does not set NODE_ENV=production');
      hasErrors = true;
    }
  } else {
    console.error('❌ ERROR: build:android script not found');
    hasErrors = true;
  }
} else {
  console.error('❌ ERROR: package.json not found');
  hasErrors = true;
}

// Check metro.config.js
console.log('\n📋 Checking metro.config.js...');
const metroConfigPath = path.join(process.cwd(), 'metro.config.js');
if (fs.existsSync(metroConfigPath)) {
  const metroConfig = fs.readFileSync(metroConfigPath, 'utf8');
  
  // Check for metro-cache import (should NOT be present)
  if (metroConfig.includes("require('metro-cache')") || metroConfig.includes('from "metro-cache"')) {
    console.error('❌ ERROR: metro.config.js contains direct metro-cache import');
    console.error('   Metro handles caching internally - remove the import');
    hasErrors = true;
  } else {
    console.log('✅ No direct metro-cache imports found');
  }
  
  // Check for NODE_ENV validation
  if (metroConfig.includes('process.env.NODE_ENV')) {
    console.log('✅ metro.config.js checks NODE_ENV');
  } else {
    console.warn('⚠️  WARNING: metro.config.js does not validate NODE_ENV');
    hasWarnings = true;
  }
} else {
  console.error('❌ ERROR: metro.config.js not found');
  hasErrors = true;
}

// Check babel.config.js
console.log('\n📋 Checking babel.config.js...');
const babelConfigPath = path.join(process.cwd(), 'babel.config.js');
if (fs.existsSync(babelConfigPath)) {
  const babelConfig = fs.readFileSync(babelConfigPath, 'utf8');
  
  if (babelConfig.includes('process.env.NODE_ENV')) {
    console.log('✅ babel.config.js checks NODE_ENV');
  } else {
    console.warn('⚠️  WARNING: babel.config.js does not validate NODE_ENV');
    hasWarnings = true;
  }
} else {
  console.error('❌ ERROR: babel.config.js not found');
  hasErrors = true;
}

// Check app.json
console.log('\n📋 Checking app.json...');
const appJsonPath = path.join(process.cwd(), 'app.json');
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Check scheme placement
  if (appJson.expo.scheme) {
    console.log('✅ scheme is correctly placed in expo config');
  } else if (appJson.scheme) {
    console.error('❌ ERROR: scheme is at root level instead of expo level');
    hasErrors = true;
  }
  
  // Check for required Android config
  if (appJson.expo.android && appJson.expo.android.package) {
    console.log('✅ Android package name is configured');
  } else {
    console.error('❌ ERROR: Android package name not configured');
    hasErrors = true;
  }
} else {
  console.error('❌ ERROR: app.json not found');
  hasErrors = true;
}

// Check for pnpm-lock.yaml (should NOT exist)
console.log('\n📋 Checking for conflicting package managers...');
const pnpmLockPath = path.join(process.cwd(), 'pnpm-lock.yaml');
if (fs.existsSync(pnpmLockPath)) {
  console.error('❌ ERROR: pnpm-lock.yaml exists');
  console.error('   This project uses npm, not pnpm');
  console.error('   Delete it with: rm pnpm-lock.yaml');
  hasErrors = true;
} else {
  console.log('✅ No pnpm-lock.yaml found (using npm)');
}

// Check node_modules
console.log('\n📋 Checking node_modules...');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules exists');
  
  // Check for key dependencies
  const keyDeps = ['expo', 'react-native', 'cross-env'];
  keyDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`   ✓ ${dep} is installed`);
    } else {
      console.error(`   ❌ ${dep} is NOT installed`);
      hasErrors = true;
    }
  });
} else {
  console.error('❌ ERROR: node_modules not found');
  console.error('   Run: npm install --legacy-peer-deps');
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('❌ VALIDATION FAILED - Please fix the errors above');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  VALIDATION PASSED WITH WARNINGS');
  console.warn('   The build may succeed, but review warnings above');
  process.exit(0);
} else {
  console.log('✅ VALIDATION PASSED - Environment is ready for build');
  process.exit(0);
}
