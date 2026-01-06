
const fs = require('fs');
const path = require('path');

console.log('\n🔧 Running post-install checks...\n');

let issues = [];

// Check 1: Verify critical packages installed
console.log('📦 Verifying critical packages...');
const criticalPackages = [
  'expo',
  'react',
  'react-native',
  'expo-router',
  '@supabase/supabase-js',
  '@expo/vector-icons'
];

for (const pkg of criticalPackages) {
  const pkgPath = path.join(__dirname, '../node_modules', pkg);
  if (!fs.existsSync(pkgPath)) {
    console.error(`   ❌ Missing: ${pkg}`);
    issues.push(`Package ${pkg} not installed`);
  } else {
    console.log(`   ✅ ${pkg}`);
  }
}

// Check 2: Verify Android directory
console.log('\n🤖 Checking Android setup...');
if (!fs.existsSync(path.join(__dirname, '../android'))) {
  console.log('   ⚠️  Android directory not found (run expo prebuild)');
} else {
  console.log('   ✅ Android directory exists');
}

// Check 3: Verify TypeScript config
console.log('\n📘 Checking TypeScript config...');
if (!fs.existsSync(path.join(__dirname, '../tsconfig.json'))) {
  console.error('   ❌ tsconfig.json missing');
  issues.push('TypeScript config missing');
} else {
  console.log('   ✅ tsconfig.json found');
}

// Summary
if (issues.length > 0) {
  console.log('\n⚠️  Post-install issues found:');
  issues.forEach(issue => console.log(`   - ${issue}`));
  console.log('\n💡 These may need attention before building\n');
} else {
  console.log('\n✅ Post-install checks passed!\n');
}
