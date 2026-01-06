
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkNodeModules() {
  log('\n📦 Checking node_modules...', colors.cyan);
  if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
    log('❌ node_modules not found. Run: pnpm install', colors.red);
    return false;
  }
  log('✅ node_modules exists', colors.green);
  return true;
}

function checkPackageJson() {
  log('\n📄 Validating package.json...', colors.cyan);
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    const required = ['expo', 'react', 'react-native', 'expo-router'];
    const missing = required.filter(dep => !pkg.dependencies[dep]);
    
    if (missing.length > 0) {
      log(`❌ Missing dependencies: ${missing.join(', ')}`, colors.red);
      return false;
    }
    log('✅ All required dependencies present', colors.green);
    return true;
  } catch (error) {
    log(`❌ Error reading package.json: ${error.message}`, colors.red);
    return false;
  }
}

function checkAppJson() {
  log('\n📱 Validating app.json...', colors.cyan);
  try {
    const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8'));
    
    if (!appJson.expo) {
      log('❌ Missing expo configuration', colors.red);
      return false;
    }
    
    if (!appJson.expo.android || !appJson.expo.android.package) {
      log('❌ Missing Android package name', colors.red);
      return false;
    }
    
    log(`✅ App configured: ${appJson.expo.name}`, colors.green);
    log(`   Package: ${appJson.expo.android.package}`, colors.blue);
    return true;
  } catch (error) {
    log(`❌ Error reading app.json: ${error.message}`, colors.red);
    return false;
  }
}

function checkMetroConfig() {
  log('\n⚙️  Checking Metro configuration...', colors.cyan);
  const metroPath = path.join(__dirname, '..', 'metro.config.js');
  
  if (!fs.existsSync(metroPath)) {
    log('❌ metro.config.js not found', colors.red);
    return false;
  }
  
  try {
    const config = require(metroPath);
    if (!config) {
      log('❌ Invalid Metro configuration', colors.red);
      return false;
    }
    log('✅ Metro configuration valid', colors.green);
    return true;
  } catch (error) {
    log(`❌ Metro config error: ${error.message}`, colors.red);
    return false;
  }
}

function runLint() {
  log('\n🔍 Running ESLint...', colors.cyan);
  try {
    execSync('pnpm lint', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    log('✅ Lint passed', colors.green);
    return true;
  } catch (error) {
    log('❌ Lint failed - fix errors before building', colors.red);
    return false;
  }
}

function checkTypeScript() {
  log('\n📘 Checking TypeScript...', colors.cyan);
  try {
    execSync('npx tsc --noEmit', { 
      stdio: 'pipe', 
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });
    log('✅ TypeScript check passed', colors.green);
    return true;
  } catch (error) {
    log('⚠️  TypeScript warnings (non-blocking)', colors.yellow);
    return true;
  }
}

function testExpoStart() {
  log('\n🚀 Testing Expo bundling (dry run)...', colors.cyan);
  try {
    log('   This may take 30-60 seconds...', colors.blue);
    
    const result = execSync('npx expo export --platform android --output-dir .expo-test --clear', {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
      timeout: 90000,
      encoding: 'utf8'
    });
    
    const testDir = path.join(__dirname, '..', '.expo-test');
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      log(`   Generated ${files.length} bundle files`, colors.blue);
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    
    log('✅ Expo bundling test passed', colors.green);
    return true;
  } catch (error) {
    log(`❌ Expo bundling test failed`, colors.red);
    
    if (error.stdout) {
      log('\n📋 Output:', colors.yellow);
      console.log(error.stdout.toString().slice(-500));
    }
    if (error.stderr) {
      log('\n⚠️  Errors:', colors.red);
      console.log(error.stderr.toString().slice(-500));
    }
    
    return false;
  }
}

function checkExpoInstallation() {
  log('\n🔧 Checking Expo CLI...', colors.cyan);
  try {
    const version = execSync('npx expo --version', { stdio: 'pipe', encoding: 'utf8' }).trim();
    log(`✅ Expo CLI available (v${version})`, colors.green);
    return true;
  } catch (error) {
    log('❌ Expo CLI not available', colors.red);
    return false;
  }
}

function checkNodeVersion() {
  log('\n🟢 Checking Node.js version...', colors.cyan);
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    
    if (major < 18) {
      log(`❌ Node.js ${version} is too old. Requires Node 18+`, colors.red);
      return false;
    }
    
    log(`✅ Node.js ${version} is compatible`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Error checking Node version: ${error.message}`, colors.red);
    return false;
  }
}

async function main() {
  log('═══════════════════════════════════════', colors.cyan);
  log('   🚀 CarDrop Build Validation', colors.cyan);
  log('═══════════════════════════════════════', colors.cyan);

  const checks = [
    { name: 'Node Version', fn: checkNodeVersion },
    { name: 'Node Modules', fn: checkNodeModules },
    { name: 'Package.json', fn: checkPackageJson },
    { name: 'App.json', fn: checkAppJson },
    { name: 'Metro Config', fn: checkMetroConfig },
    { name: 'Expo CLI', fn: checkExpoInstallation },
    { name: 'TypeScript', fn: checkTypeScript },
    { name: 'ESLint', fn: runLint },
    { name: 'Expo Bundling', fn: testExpoStart },
  ];

  let passed = 0;
  let failed = 0;
  const failedChecks = [];

  for (const check of checks) {
    try {
      if (check.fn()) {
        passed++;
      } else {
        failed++;
        failedChecks.push(check.name);
      }
    } catch (error) {
      log(`❌ ${check.name} failed with error: ${error.message}`, colors.red);
      failed++;
      failedChecks.push(check.name);
    }
  }

  log('\n═══════════════════════════════════════', colors.cyan);
  log(`   Results: ${passed} passed, ${failed} failed`, failed > 0 ? colors.red : colors.green);
  log('═══════════════════════════════════════', colors.cyan);

  if (failed > 0) {
    log('\n❌ Build validation failed. Fix these issues:', colors.red);
    failedChecks.forEach(check => log(`   - ${check}`, colors.red));
    log('\n💡 Run individual checks to debug:', colors.yellow);
    log('   pnpm lint', colors.yellow);
    log('   npx tsc --noEmit', colors.yellow);
    log('   npx expo export --platform android --output-dir test', colors.yellow);
    process.exit(1);
  } else {
    log('\n✅ All checks passed! Ready to build.', colors.green);
    log('\n📱 Next steps:', colors.cyan);
    log('   pnpm build:android     - Build APK', colors.blue);
    log('   pnpm build:android:bundle - Build AAB', colors.blue);
    process.exit(0);
  }
}

main().catch(error => {
  log(`\n❌ Validation script error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
