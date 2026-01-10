
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning all build artifacts and caches...\n');

// Helper to safely remove directory
function removeDir(dirPath) {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (fs.existsSync(fullPath)) {
    console.log(`Removing ${dirPath}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

// Helper to safely remove file
function removeFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`Removing ${filePath}...`);
    fs.unlinkSync(fullPath);
  }
}

try {
  // Remove node_modules
  removeDir('node_modules');

  // Remove package-lock
  removeFile('package-lock.json');
  removeFile('yarn.lock');
  removeFile('pnpm-lock.yaml');

  // Clear Metro cache
  removeDir('node_modules/.cache/metro');
  removeDir('.expo');
  
  // Clear temp Metro caches
  const tmpDir = process.env.TMPDIR || process.env.TEMP || '/tmp';
  try {
    const tmpFiles = fs.readdirSync(tmpDir);
    tmpFiles.forEach(file => {
      if (file.startsWith('metro-') || file.startsWith('react-')) {
        const tmpPath = path.join(tmpDir, file);
        try {
          fs.rmSync(tmpPath, { recursive: true, force: true });
        } catch (e) {
          // Ignore errors for temp files
        }
      }
    });
  } catch (e) {
    // Ignore if can't access temp dir
  }

  // Clear Gradle cache
  removeDir('android/.gradle');
  removeDir('android/app/build');
  removeDir('android/build');

  // Clear watchman
  try {
    console.log('Clearing watchman...');
    execSync('watchman watch-del-all', { stdio: 'ignore' });
  } catch (e) {
    console.log('Watchman not available or already clear');
  }

  console.log('\n✅ Clean complete!');
  console.log('\n📦 Next steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: cd android && ./gradlew clean && cd ..');
  console.log('3. Run: npx expo prebuild --clean');
  console.log('4. Build your Android release');

} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
  process.exit(1);
}
