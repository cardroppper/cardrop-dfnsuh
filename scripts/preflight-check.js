
// Preflight check to ensure all required dependencies are installed
const fs = require('fs');
const path = require('path');

console.log('🔍 Running preflight dependency check...');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

if (!fs.existsSync(nodeModulesPath)) {
  console.error('❌ node_modules not found. Run npm install first.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

const criticalDeps = [
  'expo',
  'expo-crypto',
  'expo-router',
  '@supabase/supabase-js',
  '@react-native-async-storage/async-storage',
  'react-native-ble-manager'
];

let hasErrors = false;

for (const dep of criticalDeps) {
  const depPath = path.join(nodeModulesPath, dep);
  if (!fs.existsSync(depPath)) {
    console.error(`❌ Critical dependency missing: ${dep}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${dep}`);
  }
}

if (hasErrors) {
  console.error('\n❌ Preflight check failed. Install missing dependencies with: npm install');
  process.exit(1);
}

console.log('\n✅ Preflight check passed. All critical dependencies are installed.');
process.exit(0);
