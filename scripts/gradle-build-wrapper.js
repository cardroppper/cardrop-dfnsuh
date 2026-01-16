
#!/usr/bin/env node

/**
 * Gradle Build Wrapper with NODE_ENV enforcement
 * 
 * This script wraps the Gradle build process to ensure NODE_ENV is set
 * in the environment before Gradle invokes Metro bundler.
 * 
 * Usage: node scripts/gradle-build-wrapper.js [gradle-task]
 * Example: node scripts/gradle-build-wrapper.js assembleRelease
 */

const { spawn } = require('child_process');
const path = require('path');

// CRITICAL: Set NODE_ENV before anything else
process.env.NODE_ENV = 'production';
process.env.EXPO_NO_TELEMETRY = '1';

console.log('═══════════════════════════════════════════════════════');
console.log('🚀 Gradle Build Wrapper - NODE_ENV Enforcement');
console.log('═══════════════════════════════════════════════════════');
console.log(`✅ NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`✅ EXPO_NO_TELEMETRY: ${process.env.EXPO_NO_TELEMETRY}`);
console.log('═══════════════════════════════════════════════════════\n');

// Get the Gradle task from command line arguments
const gradleTask = process.argv[2] || 'assembleRelease';
const androidDir = path.join(__dirname, '..', 'android');

// Determine the Gradle wrapper command based on platform
const isWindows = process.platform === 'win32';
const gradleCommand = isWindows ? 'gradlew.bat' : './gradlew';

console.log(`📦 Running Gradle task: ${gradleTask}`);
console.log(`📂 Working directory: ${androidDir}\n`);

// Run Gradle with NODE_ENV set in the environment
const gradleProcess = spawn(
  gradleCommand,
  [gradleTask, '--no-daemon', '--stacktrace'],
  {
    cwd: androidDir,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      EXPO_NO_TELEMETRY: '1',
      GRADLE_OPTS: '-Dorg.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m'
    }
  }
);

gradleProcess.on('error', (error) => {
  console.error('\n❌ Failed to start Gradle process:', error.message);
  process.exit(1);
});

gradleProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Gradle build completed successfully!');
  } else {
    console.error(`\n❌ Gradle build failed with exit code ${code}`);
  }
  process.exit(code);
});
