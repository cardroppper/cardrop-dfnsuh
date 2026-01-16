
#!/usr/bin/env node

/**
 * Make Build Scripts Executable
 * 
 * This script ensures all build-related scripts have proper permissions
 * on Unix-like systems (macOS, Linux).
 */

const fs = require('fs');
const path = require('path');

const scripts = [
  'ensure-node-env.js',
  'gradle-build-wrapper.js',
  'validate-build-environment.js',
  'final-build-check.js',
  'make-executable.js'
];

console.log('Making build scripts executable...\n');

scripts.forEach(script => {
  const scriptPath = path.join(__dirname, script);
  
  if (fs.existsSync(scriptPath)) {
    try {
      // Add execute permission (chmod +x)
      fs.chmodSync(scriptPath, 0o755);
      console.log(`✅ ${script} is now executable`);
    } catch (error) {
      console.warn(`⚠️  Could not make ${script} executable: ${error.message}`);
      console.warn(`   This is normal on Windows and won't affect functionality.`);
    }
  } else {
    console.error(`❌ ${script} not found`);
  }
});

console.log('\n✅ Done!\n');
