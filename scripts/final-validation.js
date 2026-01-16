
#!/usr/bin/env node

/**
 * Final Validation Script
 * Performs a comprehensive check before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 Final Deployment Validation\n');
console.log('='.repeat(60));

let score = 0;
const maxScore = 15;

// Test 1: NODE_ENV
console.log('\n1️⃣  Checking NODE_ENV...');
if (process.env.NODE_ENV === 'production') {
  console.log('   ✅ NODE_ENV is set to production');
  score++;
} else {
  console.log(`   ❌ NODE_ENV is ${process.env.NODE_ENV || 'not set'} (should be production)`);
}

// Test 2: Environment files
console.log('\n2️⃣  Checking environment files...');
const envFiles = ['.env', '.env.production'];
let envScore = 0;
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('NODE_ENV')) {
      envScore++;
    }
  }
});
if (envScore === envFiles.length) {
  console.log('   ✅ All environment files configured correctly');
  score++;
} else {
  console.log(`   ❌ Only ${envScore}/${envFiles.length} environment files configured`);
}

// Test 3: Metro config
console.log('\n3️⃣  Checking metro.config.js...');
const metroConfig = fs.readFileSync('metro.config.js', 'utf8');
const hasMetroCacheImport = metroConfig.includes("require('metro-cache')") || 
                            metroConfig.includes('from "metro-cache"');
const hasNodeEnvCheck = metroConfig.includes('process.env.NODE_ENV');

if (!hasMetroCacheImport && hasNodeEnvCheck) {
  console.log('   ✅ Metro config is correct');
  score++;
} else {
  console.log('   ❌ Metro config has issues');
  if (hasMetroCacheImport) console.log('      - Contains metro-cache import');
  if (!hasNodeEnvCheck) console.log('      - Missing NODE_ENV check');
}

// Test 4: Babel config
console.log('\n4️⃣  Checking babel.config.js...');
const babelConfig = fs.readFileSync('babel.config.js', 'utf8');
if (babelConfig.includes('process.env.NODE_ENV')) {
  console.log('   ✅ Babel config checks NODE_ENV');
  score++;
} else {
  console.log('   ❌ Babel config missing NODE_ENV check');
}

// Test 5: App.json structure
console.log('\n5️⃣  Checking app.json structure...');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
if (appJson.expo.scheme && !appJson.scheme) {
  console.log('   ✅ Scheme is correctly placed in expo config');
  score++;
} else {
  console.log('   ❌ Scheme placement is incorrect');
}

// Test 6: Package manager
console.log('\n6️⃣  Checking package manager...');
if (!fs.existsSync('pnpm-lock.yaml')) {
  console.log('   ✅ No pnpm-lock.yaml (using npm)');
  score++;
} else {
  console.log('   ❌ pnpm-lock.yaml exists (should use npm)');
}

// Test 7: Dependencies
console.log('\n7️⃣  Checking dependencies...');
if (fs.existsSync('node_modules')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasCrossEnv = packageJson.dependencies['cross-env'] || 
                      packageJson.devDependencies['cross-env'];
  if (hasCrossEnv && fs.existsSync('node_modules/cross-env')) {
    console.log('   ✅ Dependencies installed correctly');
    score++;
  } else {
    console.log('   ❌ Missing required dependencies');
  }
} else {
  console.log('   ❌ node_modules not found');
}

// Test 8: Build scripts
console.log('\n8️⃣  Checking build scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const buildScript = packageJson.scripts['build:android'];
if (buildScript && buildScript.includes('NODE_ENV=production')) {
  console.log('   ✅ Build scripts set NODE_ENV');
  score++;
} else {
  console.log('   ❌ Build scripts missing NODE_ENV');
}

// Test 9: Gradle properties
console.log('\n9️⃣  Checking Gradle properties...');
const gradleProps = fs.readFileSync('android/gradle.properties', 'utf8');
const hasEnoughMemory = gradleProps.includes('Xmx4096m') || 
                        gradleProps.includes('Xmx6144m') ||
                        gradleProps.includes('Xmx8192m');
if (hasEnoughMemory) {
  console.log('   ✅ Gradle has sufficient memory allocation');
  score++;
} else {
  console.log('   ❌ Gradle memory allocation may be insufficient');
}

// Test 10: Android directory
console.log('\n🔟 Checking Android directory...');
if (fs.existsSync('android') && fs.existsSync('android/app/build.gradle')) {
  console.log('   ✅ Android directory exists and configured');
  score++;
} else {
  console.log('   ⚠️  Android directory needs to be generated (run expo prebuild)');
}

// Test 11: Keystore
console.log('\n1️⃣1️⃣  Checking release keystore...');
if (fs.existsSync('android/app/release.keystore')) {
  console.log('   ✅ Release keystore exists');
  score++;
} else {
  console.log('   ⚠️  Release keystore not found (will be generated)');
}

// Test 12: Cache cleanliness
console.log('\n1️⃣2️⃣  Checking cache directories...');
const cacheDirs = ['node_modules/.cache', '.expo', 'android/.gradle'];
const cacheExists = cacheDirs.some(dir => fs.existsSync(dir));
if (!cacheExists) {
  console.log('   ✅ Cache directories are clean');
  score++;
} else {
  console.log('   ⚠️  Cache directories exist (consider cleaning)');
  score += 0.5;
}

// Test 13: TypeScript config
console.log('\n1️⃣3️⃣  Checking TypeScript configuration...');
if (fs.existsSync('tsconfig.json')) {
  console.log('   ✅ TypeScript configured');
  score++;
} else {
  console.log('   ⚠️  No tsconfig.json found');
}

// Test 14: Entry point
console.log('\n1️⃣4️⃣  Checking entry point...');
if (fs.existsSync('index.ts')) {
  const indexContent = fs.readFileSync('index.ts', 'utf8');
  if (indexContent.includes('expo-router/entry')) {
    console.log('   ✅ Entry point configured correctly');
    score++;
  } else {
    console.log('   ❌ Entry point missing expo-router/entry');
  }
} else {
  console.log('   ❌ index.ts not found');
}

// Test 15: Validation scripts
console.log('\n1️⃣5️⃣  Checking validation scripts...');
if (fs.existsSync('scripts/validate-environment.js') && 
    fs.existsSync('scripts/pre-build-android.js')) {
  console.log('   ✅ Validation scripts available');
  score++;
} else {
  console.log('   ❌ Validation scripts missing');
}

// Final score
console.log('\n' + '='.repeat(60));
console.log(`\n📊 FINAL SCORE: ${score}/${maxScore} (${Math.round(score/maxScore*100)}%)\n`);

if (score === maxScore) {
  console.log('🎉 PERFECT SCORE! Ready for deployment!');
  console.log('\nNext steps:');
  console.log('  1. Run: npm run build:android');
  console.log('  2. Test APK on device');
  console.log('  3. Upload to Play Store\n');
  process.exit(0);
} else if (score >= maxScore * 0.8) {
  console.log('✅ GOOD SCORE! Ready for deployment with minor warnings.');
  console.log('\nYou can proceed with:');
  console.log('  npm run build:android\n');
  process.exit(0);
} else if (score >= maxScore * 0.6) {
  console.log('⚠️  PASSING SCORE. Build may succeed but review warnings above.');
  console.log('\nRecommended:');
  console.log('  1. Fix warnings above');
  console.log('  2. Run: node scripts/validate-environment.js');
  console.log('  3. Then: npm run build:android\n');
  process.exit(0);
} else {
  console.log('❌ FAILING SCORE. Please fix critical issues before building.');
  console.log('\nRequired actions:');
  console.log('  1. Review all ❌ items above');
  console.log('  2. Run: node scripts/validate-environment.js');
  console.log('  3. Fix all errors');
  console.log('  4. Run this validation again\n');
  process.exit(1);
}
