
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function header(message) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(message, colors.cyan);
  log('='.repeat(60), colors.cyan);
}

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (err) {
    return null;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    success(`${description} exists`);
    return true;
  } else {
    error(`${description} missing`);
    return false;
  }
}

function checkPackage(packageName) {
  const pkgPath = path.join(__dirname, '..', 'node_modules', packageName);
  if (fs.existsSync(pkgPath)) {
    success(`${packageName}`);
    return true;
  } else {
    error(`${packageName} - MISSING`);
    return false;
  }
}

async function main() {
  header('🔍 CarDrop Build Diagnostics');

  // 1. Environment Check
  header('1️⃣  Environment Check');
  const nodeVersion = exec('node -v');
  const npmVersion = exec('npm -v');
  
  if (nodeVersion) {
    const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (nodeMajor >= 18) {
      success(`Node version: ${nodeVersion}`);
    } else {
      error(`Node version: ${nodeVersion} (requires >= 18.0.0)`);
    }
  } else {
    error('Node not found');
  }

  if (npmVersion) {
    success(`npm version: ${npmVersion}`);
  } else {
    error('npm not found');
  }

  // Check for pnpm (should not be used)
  const pnpmVersion = exec('pnpm -v');
  if (pnpmVersion) {
    warning(`pnpm detected (${pnpmVersion}) - Should use npm only!`);
  }

  // 2. Configuration Files
  header('2️⃣  Configuration Files');
  checkFile('package.json', 'package.json');
  checkFile('app.json', 'app.json');
  checkFile('babel.config.js', 'babel.config.js');
  checkFile('metro.config.js', 'metro.config.js');
  checkFile('.npmrc', '.npmrc');
  checkFile('index.ts', 'index.ts');

  // 3. Dependencies Check
  header('3️⃣  Critical Dependencies');
  const criticalDeps = [
    'expo',
    'react',
    'react-native',
    'expo-router',
    '@expo/metro-runtime',
    '@react-native-async-storage/async-storage',
    '@supabase/supabase-js',
    'babel-preset-expo',
    'metro-minify-terser',
    '@babel/runtime',
    'react-native-reanimated',
  ];

  let missingCount = 0;
  for (const dep of criticalDeps) {
    if (!checkPackage(dep)) {
      missingCount++;
    }
  }

  if (missingCount > 0) {
    warning(`${missingCount} critical dependencies missing`);
    info('Run: npm install --legacy-peer-deps');
  }

  // 4. Android Project Check
  header('4️⃣  Android Project');
  const androidExists = fs.existsSync('android');
  if (androidExists) {
    success('Android folder exists');
    checkFile('android/settings.gradle', 'settings.gradle');
    checkFile('android/build.gradle', 'build.gradle');
    checkFile('android/gradle.properties', 'gradle.properties');
    checkFile('android/app/build.gradle', 'app/build.gradle');
    checkFile('android/gradlew', 'gradlew');
  } else {
    warning('Android folder missing - needs expo prebuild');
    info('Run: npx expo prebuild -p android --clean');
  }

  // 5. Cache Check
  header('5️⃣  Cache Status');
  const cacheLocations = [
    'node_modules/.cache',
    '.expo',
    'android/.gradle',
    'android/app/build',
    'android/build',
  ];

  let cacheExists = false;
  for (const cache of cacheLocations) {
    if (fs.existsSync(cache)) {
      warning(`${cache} exists (may need cleaning)`);
      cacheExists = true;
    }
  }

  if (!cacheExists) {
    success('No cache files found');
  }

  // 6. Package Manager Check
  header('6️⃣  Package Manager');
  if (fs.existsSync('package-lock.json')) {
    success('Using npm (package-lock.json found)');
  } else {
    warning('package-lock.json missing');
  }

  if (fs.existsSync('pnpm-lock.yaml')) {
    error('pnpm-lock.yaml found - Should use npm only!');
    info('Delete pnpm-lock.yaml and use npm');
  }

  if (fs.existsSync('yarn.lock')) {
    warning('yarn.lock found - Should use npm only!');
  }

  // 7. Metro Config Check
  header('7️⃣  Metro Configuration');
  try {
    const metroConfig = fs.readFileSync('metro.config.js', 'utf8');
    if (metroConfig.includes('metro-minify-terser')) {
      success('Metro minifier configured');
    } else {
      warning('Metro minifier not configured');
    }
    if (metroConfig.includes("'mjs'") && metroConfig.includes("'cjs'")) {
      success('Metro supports .mjs and .cjs files');
    } else {
      warning('Metro may not support .mjs/.cjs files');
    }
  } catch (err) {
    error('Could not read metro.config.js');
  }

  // 8. Babel Config Check
  header('8️⃣  Babel Configuration');
  try {
    const babelConfig = fs.readFileSync('babel.config.js', 'utf8');
    if (babelConfig.includes('babel-preset-expo')) {
      success('Babel preset configured');
    } else {
      error('babel-preset-expo not configured');
    }
    if (babelConfig.includes('react-native-reanimated/plugin')) {
      success('Reanimated plugin configured');
    } else {
      warning('Reanimated plugin not configured');
    }
  } catch (err) {
    error('Could not read babel.config.js');
  }

  // Summary
  header('📊 Summary');
  
  if (missingCount > 0) {
    error(`Found ${missingCount} missing dependencies`);
    info('Action: Run npm install --legacy-peer-deps');
  }

  if (!androidExists) {
    warning('Android project not generated');
    info('Action: Run npx expo prebuild -p android --clean');
  }

  if (cacheExists) {
    warning('Cache files present (may cause issues)');
    info('Action: Consider running npm run clean:cache');
  }

  if (fs.existsSync('pnpm-lock.yaml')) {
    error('Using wrong package manager');
    info('Action: Delete pnpm-lock.yaml and use npm only');
  }

  log('\n');
  if (missingCount === 0 && androidExists && !fs.existsSync('pnpm-lock.yaml')) {
    success('✨ Project looks good! Ready to build.');
    info('Run: npm run build:android:fix');
  } else {
    warning('⚠️  Issues detected. Follow the actions above to fix.');
  }

  log('\n');
}

main().catch(console.error);
