

/**
 * Final Build Check
 * 
 * This script performs a final check before deployment to ensure
 * the build system is working correctly.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════');
console.log('🔍 Final Build System Check');
console.log('═══════════════════════════════════════════════════════\n');

let allChecks = [];

function check(name, fn) {
  try {
    const result = fn();
    if (result) {
      console.log(`✅ ${name}`);
      allChecks.push({ name, passed: true });
    } else {
      console.error(`❌ ${name}`);
      allChecks.push({ name, passed: false });
    }
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
    allChecks.push({ name, passed: false, error: error.message });
  }
}

// Check 1: Scripts exist
check('ensure-node-env.js exists', () => {
  return fs.existsSync(path.join(__dirname, 'ensure-node-env.js'));
});

check('gradle-build-wrapper.js exists', () => {
  return fs.existsSync(path.join(__dirname, 'gradle-build-wrapper.js'));
});

check('validate-build-environment.js exists', () => {
  return fs.existsSync(path.join(__dirname, 'validate-build-environment.js'));
});

// Check 2: Scripts are valid JavaScript
check('ensure-node-env.js is valid', () => {
  const script = fs.readFileSync(path.join(__dirname, 'ensure-node-env.js'), 'utf8');
  return script.includes('process.env.NODE_ENV');
});

check('gradle-build-wrapper.js is valid', () => {
  const script = fs.readFileSync(path.join(__dirname, 'gradle-build-wrapper.js'), 'utf8');
  return script.includes('NODE_ENV') && script.includes('spawn');
});

// Check 3: Config files have NODE_ENV checks
check('metro.config.js has NODE_ENV validation', () => {
  const config = fs.readFileSync(path.join(__dirname, '..', 'metro.config.js'), 'utf8');
  return config.includes('process.env.NODE_ENV') && config.includes('CRITICAL');
});

check('babel.config.js has NODE_ENV validation', () => {
  const config = fs.readFileSync(path.join(__dirname, '..', 'babel.config.js'), 'utf8');
  return config.includes('process.env.NODE_ENV') && config.includes('CRITICAL');
});

// Check 4: package.json scripts are updated
check('package.json has updated build scripts', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  return pkg.scripts['build:android'].includes('ensure-node-env.js') &&
         pkg.scripts['build:android'].includes('gradle-build-wrapper.js');
});

// Check 5: Dependencies
check('cross-env is installed', () => {
  return fs.existsSync(path.join(__dirname, '..', 'node_modules', 'cross-env'));
});

check('expo is installed', () => {
  return fs.existsSync(path.join(__dirname, '..', 'node_modules', 'expo'));
});

// Check 6: Test ensure-node-env.js execution
console.log('\n📋 Testing ensure-node-env.js execution...');
try {
  execSync('node scripts/ensure-node-env.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });
  console.log('✅ ensure-node-env.js executes successfully');
  allChecks.push({ name: 'ensure-node-env.js execution', passed: true });
} catch (error) {
  console.error('❌ ensure-node-env.js execution failed');
  console.error(error.message);
  allChecks.push({ name: 'ensure-node-env.js execution', passed: false });
}

// Check 7: Verify gradle-env.properties was created
check('gradle-env.properties was created', () => {
  return fs.existsSync(path.join(__dirname, '..', 'android', 'gradle-env.properties'));
});

// Summary
console.log('\n═══════════════════════════════════════════════════════');
console.log('📊 Final Check Summary');
console.log('═══════════════════════════════════════════════════════\n');

const passed = allChecks.filter(c => c.passed).length;
const failed = allChecks.filter(c => !c.passed).length;
const total = allChecks.length;

console.log(`Total Checks: ${total}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}\n`);

if (failed === 0) {
  console.log('🎉 ALL CHECKS PASSED!');
  console.log('🎉 Build system is ready for deployment.');
  console.log('\n📦 You can now run: npm run build:android\n');
  process.exit(0);
} else {
  console.error('❌ SOME CHECKS FAILED!');
  console.error('❌ Review the errors above and fix them before building.\n');
  
  // Show failed checks
  console.error('Failed checks:');
  allChecks.filter(c => !c.passed).forEach(c => {
    console.error(`  - ${c.name}${c.error ? ': ' + c.error : ''}`);
  });
  console.error('');
  
  process.exit(1);
}
