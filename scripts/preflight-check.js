
/**
 * Preflight Check Script
 * Validates dependencies and configuration before Expo builds
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_EXPO_MODULES = [
  'expo-crypto',
  'expo-secure-store',
  'expo-image-picker',
  'expo-haptics',
  'expo-network',
  '@react-native-async-storage/async-storage',
];

function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const missing = [];
  
  for (const module of REQUIRED_EXPO_MODULES) {
    if (!packageJson.dependencies[module] && !packageJson.devDependencies[module]) {
      missing.push(module);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required dependencies:');
    missing.forEach(m => console.error(`   - ${m}`));
    console.error('\nFix: npx expo install ' + missing.join(' '));
    process.exit(1);
  }
  
  console.log('✅ All required dependencies present');
}

function checkNodeModules() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.error('❌ node_modules not found. Run: npm install');
    process.exit(1);
  }
  
  console.log('✅ node_modules exists');
}

console.log('🔍 Running preflight checks...\n');
checkDependencies();
checkNodeModules();
console.log('\n✅ Preflight checks passed');
