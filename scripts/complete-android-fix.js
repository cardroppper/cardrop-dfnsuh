
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ ${message}`, colors.blue);
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: 'inherit',
      ...options,
    });
  } catch (err) {
    error(`Command failed: ${command}`);
    throw err;
  }
}

function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    success(`Cleaned ${dir}`);
  }
}

async function main() {
  log('\n🔧 CarDrop Android Build Fix Script', colors.blue);
  log('====================================\n', colors.blue);

  try {
    // Step 1: Clean everything
    info('Step 1: Cleaning all caches and build artifacts...');
    cleanDirectory('node_modules');
    cleanDirectory('package-lock.json');
    cleanDirectory('.expo');
    cleanDirectory(path.join('node_modules', '.cache'));
    cleanDirectory(path.join('android', '.gradle'));
    cleanDirectory(path.join('android', 'app', 'build'));
    cleanDirectory(path.join('android', 'build'));
    cleanDirectory('ios');
    success('All caches cleaned\n');

    // Step 2: Verify environment
    info('Step 2: Verifying environment...');
    const nodeVersion = execSync('node -v', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
    success(`Node version: ${nodeVersion}`);
    success(`npm version: ${npmVersion}\n`);

    // Step 3: Install dependencies
    info('Step 3: Installing dependencies with npm...');
    process.env.NODE_ENV = 'development';
    exec('npm install --legacy-peer-deps');
    success('Dependencies installed successfully\n');

    // Step 4: Verify critical packages
    info('Step 4: Verifying critical packages...');
    const criticalPackages = [
      'babel-preset-expo',
      'expo-router',
      'react-native',
      'expo',
      '@babel/runtime',
    ];

    for (const pkg of criticalPackages) {
      const pkgPath = path.join('node_modules', pkg);
      if (!fs.existsSync(pkgPath)) {
        error(`${pkg} not found!`);
        process.exit(1);
      }
      success(`${pkg}: OK`);
    }
    log('');

    // Step 5: Test JS bundle creation
    info('Step 5: Testing JS bundle creation...');
    process.env.NODE_ENV = 'production';
    try {
      exec(
        'npx react-native bundle --platform android --dev false --entry-file index.ts --bundle-output /tmp/test-bundle.js --assets-dest /tmp/test-assets',
        { stdio: 'pipe' }
      );
      success('JS bundle created successfully\n');
    } catch (err) {
      error('JS bundle creation failed!');
      throw err;
    }

    // Step 6: Run expo prebuild
    info('Step 6: Running expo prebuild for Android...');
    process.env.NODE_ENV = 'production';
    exec('npx expo prebuild -p android --clean');
    success('expo prebuild completed successfully\n');

    // Step 7: Build release APK
    info('Step 7: Building release APK...');
    process.chdir('android');

    // Make gradlew executable (Unix-like systems)
    if (process.platform !== 'win32') {
      exec('chmod +x gradlew');
    }

    // Clean first
    const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    exec(`${gradleCmd} clean`);

    // Build release
    process.env.NODE_ENV = 'production';
    exec(`${gradleCmd} assembleRelease`);

    process.chdir('..');
    success('Release APK built successfully!\n');

    // Step 8: Locate APK
    info('Step 8: Locating APK...');
    const apkDir = path.join('android', 'app', 'build', 'outputs', 'apk', 'release');
    const files = fs.readdirSync(apkDir);
    const apkFile = files.find((f) => f.endsWith('.apk'));

    if (!apkFile) {
      error('APK not found!');
      process.exit(1);
    }

    const apkPath = path.join(apkDir, apkFile);
    const stats = fs.statSync(apkPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    success(`APK Location: ${apkPath}`);
    success(`APK Size: ${sizeMB} MB`);

    log('\n====================================', colors.green);
    log('✓ BUILD SUCCESSFUL!', colors.green);
    log('====================================\n', colors.green);

    log('Your release APK is ready at:');
    log(apkPath, colors.blue);
    log('\nTo install on a device:');
    log(`adb install ${apkPath}`, colors.blue);
    log('');
  } catch (err) {
    error('\n====================================');
    error('✗ BUILD FAILED!');
    error('====================================\n');
    error(err.message);
    process.exit(1);
  }
}

main();
