

/**
 * CarDrop Deployment Readiness Check
 * 
 * This script validates that all configurations are correct
 * and the app is ready for production deployment.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 CarDrop Deployment Readiness Check\n');
console.log('=' .repeat(50));

let errors = [];
let warnings = [];
let passed = 0;
let total = 0;

function check(name, condition, errorMsg, warningMsg = null) {
  total++;
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else if (warningMsg) {
    console.log(`⚠️  ${name}: ${warningMsg}`);
    warnings.push(warningMsg);
    passed++;
  } else {
    console.log(`❌ ${name}: ${errorMsg}`);
    errors.push(errorMsg);
  }
}

// Check files exist
console.log('\n📁 File Existence Checks:');
check(
  'app.json exists',
  fs.existsSync('app.json'),
  'app.json not found'
);
check(
  'eas.json exists',
  fs.existsSync('eas.json'),
  'eas.json not found'
);
check(
  'package.json exists',
  fs.existsSync('package.json'),
  'package.json not found'
);
check(
  'metro.config.js exists',
  fs.existsSync('metro.config.js'),
  'metro.config.js not found'
);
check(
  'tsconfig.json exists',
  fs.existsSync('tsconfig.json'),
  'tsconfig.json not found'
);

// Check app.json configuration
console.log('\n⚙️  app.json Configuration:');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const expo = appJson.expo;

  check(
    'App name set',
    expo.name && expo.name !== 'Natively',
    'App name should be changed from default',
    expo.name === 'Natively' ? 'Still using default name "Natively"' : null
  );

  check(
    'Bundle identifier set (iOS)',
    expo.ios && expo.ios.bundleIdentifier,
    'iOS bundle identifier not set'
  );

  check(
    'Package name set (Android)',
    expo.android && expo.android.package,
    'Android package name not set'
  );

  check(
    'Scheme configured',
    expo.scheme,
    'URL scheme not configured'
  );

  check(
    'iOS permissions configured',
    expo.ios && expo.ios.infoPlist && 
    expo.ios.infoPlist.NSLocationWhenInUseUsageDescription &&
    expo.ios.infoPlist.NSBluetoothAlwaysUsageDescription &&
    expo.ios.infoPlist.NSCameraUsageDescription,
    'iOS permissions not fully configured'
  );

  check(
    'Android permissions configured',
    expo.android && expo.android.permissions && 
    expo.android.permissions.length > 0,
    'Android permissions not configured'
  );

  check(
    'EAS project ID set',
    expo.extra && expo.extra.eas && expo.extra.eas.projectId,
    'EAS project ID not set',
    expo.extra?.eas?.projectId === 'your-project-id-here' ? 
      'EAS project ID needs to be updated' : null
  );

} catch (error) {
  errors.push(`Failed to parse app.json: ${error.message}`);
}

// Check eas.json configuration
console.log('\n🏗️  eas.json Configuration:');
try {
  const easJson = JSON.parse(fs.readFileSync('eas.json', 'utf8'));

  check(
    'Production build profile exists',
    easJson.build && easJson.build.production,
    'Production build profile not configured'
  );

  check(
    'Production AAB profile exists',
    easJson.build && easJson.build['production-aab'],
    'Production AAB profile not configured'
  );

  check(
    'Submit configuration exists',
    easJson.submit && easJson.submit.production,
    'Submit configuration not set',
    'Submit configuration may need Apple/Google credentials'
  );

} catch (error) {
  errors.push(`Failed to parse eas.json: ${error.message}`);
}

// Check package.json
console.log('\n📦 Dependencies Check:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = [
    'expo',
    'react',
    'react-native',
    'expo-router',
    '@supabase/supabase-js',
    '@react-native-async-storage/async-storage',
    'metro-minify-terser'
  ];

  requiredDeps.forEach(dep => {
    check(
      `${dep} installed`,
      deps[dep],
      `Required dependency ${dep} not installed`
    );
  });

} catch (error) {
  errors.push(`Failed to parse package.json: ${error.message}`);
}

// Check critical files
console.log('\n📄 Critical Files Check:');
check(
  'index.ts exists',
  fs.existsSync('index.ts'),
  'index.ts entry point not found'
);
check(
  'app/_layout.tsx exists',
  fs.existsSync('app/_layout.tsx'),
  'Root layout not found'
);
check(
  'Auth context exists',
  fs.existsSync('contexts/AuthContext.tsx'),
  'AuthContext not found'
);

// Check Android configuration
console.log('\n🤖 Android Configuration:');
check(
  'Android folder exists',
  fs.existsSync('android'),
  'Android folder not found'
);
check(
  'Android build.gradle exists',
  fs.existsSync('android/app/build.gradle'),
  'Android build.gradle not found'
);
check(
  'Release keystore exists',
  fs.existsSync('android/app/release.keystore'),
  'Release keystore not found',
  'Release keystore should be generated for production'
);

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:');
console.log(`✅ Passed: ${passed}/${total}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Errors: ${errors.length}`);

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach((warning, i) => {
    console.log(`  ${i + 1}. ${warning}`);
  });
}

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach((error, i) => {
    console.log(`  ${i + 1}. ${error}`);
  });
  console.log('\n❌ Deployment readiness: FAILED');
  console.log('Please fix the errors above before deploying.\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n⚠️  Deployment readiness: READY WITH WARNINGS');
  console.log('You can deploy, but consider addressing the warnings.\n');
  process.exit(0);
} else {
  console.log('\n✅ Deployment readiness: READY');
  console.log('All checks passed! You can deploy to production.\n');
  console.log('Next steps:');
  console.log('  1. Run: eas build:configure (if not done)');
  console.log('  2. Update EAS project ID in app.json');
  console.log('  3. Build: eas build --platform all --profile production');
  console.log('  4. Submit: eas submit --platform all --latest\n');
  process.exit(0);
}
