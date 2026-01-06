
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Running build validation...\n');

try {
  // Check app.json
  const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
  const plugins = appJson.expo.plugins || [];
  
  if (plugins.includes('expo-web-browser')) {
    throw new Error('❌ expo-web-browser should not be in plugins array');
  }
  
  console.log('✅ app.json configuration valid');
  
  // Run expo prebuild dry-run
  console.log('\n🔨 Testing prebuild...');
  execSync('npx expo prebuild --clean --no-install', { stdio: 'inherit' });
  
  console.log('\n✅ Build validation passed!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Build validation failed:', error.message);
  process.exit(1);
}
