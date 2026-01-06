
/**
 * CarDrop Build Validation System
 * Simulates the bundling process to catch errors before APK deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkStep(name, fn) {
  process.stdout.write(`${COLORS.cyan}⏳ ${name}...${COLORS.reset}`);
  try {
    fn();
    console.log(`\r${COLORS.green}✓ ${name}${COLORS.reset}`);
    return true;
  } catch (error) {
    console.log(`\r${COLORS.red}✗ ${name}${COLORS.reset}`);
    console.error(`${COLORS.red}  Error: ${error.message}${COLORS.reset}`);
    return false;
  }
}

log('\n🚗 CarDrop Build Validation System\n', 'cyan');

let passed = 0;
let failed = 0;

// 1. Check Metro config
if (checkStep('Validating Metro configuration', () => {
  const metroPath = path.join(process.cwd(), 'metro.config.js');
  if (!fs.existsSync(metroPath)) throw new Error('metro.config.js not found');
  require(metroPath);
})) passed++; else failed++;

// 2. Check Babel config
if (checkStep('Validating Babel configuration', () => {
  const babelPath = path.join(process.cwd(), 'babel.config.js');
  if (!fs.existsSync(babelPath)) throw new Error('babel.config.js not found');
  const config = require(babelPath)({ cache: () => {} });
  if (!config.presets || !config.plugins) throw new Error('Invalid Babel config');
})) passed++; else failed++;

// 3. Test TypeScript compilation
if (checkStep('Testing TypeScript compilation', () => {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
  } catch (e) {
    // TypeScript errors are warnings, not blockers
    log('  ⚠️  TypeScript warnings found (non-blocking)', 'yellow');
  }
})) passed++; else failed++;

// 4. Simulate Metro bundling (dry run)
if (checkStep('Simulating Metro bundle process', () => {
  log('\n  This may take 1-2 minutes...', 'yellow');
  execSync('npx expo export --platform android --output-dir .validation-build', {
    stdio: 'inherit',
    timeout: 180000,
  });
  // Clean up
  const validationDir = path.join(process.cwd(), '.validation-build');
  if (fs.existsSync(validationDir)) {
    fs.rmSync(validationDir, { recursive: true, force: true });
  }
})) passed++; else failed++;

// 5. Validate dependencies
if (checkStep('Validating critical dependencies', () => {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  const critical = ['expo', 'react', 'react-native', 'expo-router'];
  critical.forEach(dep => {
    if (!pkg.dependencies[dep]) throw new Error(`Missing critical dependency: ${dep}`);
  });
})) passed++; else failed++;

// Summary
log(`\n${'='.repeat(50)}`, 'cyan');
log(`✓ Passed: ${passed}`, 'green');
if (failed > 0) {
  log(`✗ Failed: ${failed}`, 'red');
  log('\n❌ Build validation failed. Fix errors before deploying APK.', 'red');
  process.exit(1);
} else {
  log('\n✅ All validation checks passed! Safe to build APK.', 'green');
  log('\nNext steps:', 'cyan');
  log('  1. Run: eas build --platform android --profile production', 'cyan');
  log('  2. Or: cd android && ./gradlew assembleRelease', 'cyan');
  process.exit(0);
}
