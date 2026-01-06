
const fs = require('fs');
const path = require('path');

console.log('🔍 Running preflight dependency check...\n');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const allDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

// Critical dependencies that must be present for builds to succeed
const requiredDependencies = [
  'babel-preset-expo',
  'metro',
  'metro-cache',
  '@babel/core',
  '@babel/runtime',
  'expo',
  '@supabase/supabase-js',
  '@react-native-async-storage/async-storage',
  'react-native-ble-manager',
  'expo-crypto',
  '@stripe/stripe-react-native',
];

// Production-only dependencies (only checked when NODE_ENV=production)
const productionDependencies = [
  'babel-plugin-transform-remove-console',
];

const missingDependencies = [];
const missingProductionDependencies = [];

// Check required dependencies
for (const dep of requiredDependencies) {
  if (!allDependencies[dep]) {
    missingDependencies.push(dep);
  }
}

// Check production dependencies if in production mode
if (process.env.NODE_ENV === 'production') {
  for (const dep of productionDependencies) {
    if (!allDependencies[dep]) {
      missingProductionDependencies.push(dep);
    }
  }
}

// Report missing dependencies
if (missingDependencies.length > 0) {
  console.error('❌ Missing required dependencies:\n');
  missingDependencies.forEach((dep) => {
    console.error(`   - ${dep}`);
  });
  console.error('\n💡 Run: pnpm install\n');
  process.exit(1);
}

if (missingProductionDependencies.length > 0) {
  console.error('❌ Missing production dependencies:\n');
  missingProductionDependencies.forEach((dep) => {
    console.error(`   - ${dep}`);
  });
  console.error('\n💡 Run: pnpm install\n');
  process.exit(1);
}

// Check NODE_ENV
if (process.env.NODE_ENV === 'production') {
  console.log('✅ NODE_ENV=production detected');
} else if (process.env.NODE_ENV === 'development') {
  console.log('✅ NODE_ENV=development detected');
} else {
  console.warn('⚠️  NODE_ENV not set (defaulting to development)');
}

// Check .npmrc configuration
const npmrcPath = path.join(__dirname, '..', '.npmrc');
if (fs.existsSync(npmrcPath)) {
  const npmrcContent = fs.readFileSync(npmrcPath, 'utf8');
  const hasHoisting = npmrcContent.includes('public-hoist-pattern');
  const hasShamefulHoist = npmrcContent.includes('shamefully-hoist=true');
  const hasBabelHoist = npmrcContent.includes('*babel*');
  const hasMetroHoist = npmrcContent.includes('*metro*');
  
  if (hasHoisting && hasShamefulHoist && hasBabelHoist && hasMetroHoist) {
    console.log('✅ pnpm hoisting configured correctly');
  } else {
    console.warn('⚠️  .npmrc exists but hoisting may not be configured optimally');
    if (!hasBabelHoist) console.warn('   - Missing Babel hoisting pattern');
    if (!hasMetroHoist) console.warn('   - Missing Metro hoisting pattern');
    if (!hasShamefulHoist) console.warn('   - shamefully-hoist not enabled');
  }
} else {
  console.error('❌ .npmrc not found - pnpm hoisting will not work correctly');
  console.error('   Create .npmrc with hoisting configuration');
  process.exit(1);
}

// Check babel.config.js
const babelConfigPath = path.join(__dirname, '..', 'babel.config.js');
if (fs.existsSync(babelConfigPath)) {
  console.log('✅ babel.config.js found');
} else {
  console.error('❌ babel.config.js not found');
  process.exit(1);
}

console.log('✅ All required dependencies present');
console.log('✅ Preflight check passed\n');
