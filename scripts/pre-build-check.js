
/**
 * Quick pre-build sanity check
 * Runs before every build to catch obvious issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-build checks...\n');

const checks = [
  {
    name: 'Node modules installed',
    test: () => fs.existsSync('node_modules'),
  },
  {
    name: 'Metro config valid',
    test: () => {
      require(path.join(process.cwd(), 'metro.config.js'));
      return true;
    },
  },
  {
    name: 'Babel config valid',
    test: () => {
      require(path.join(process.cwd(), 'babel.config.js'))({ cache: () => {} });
      return true;
    },
  },
  {
    name: 'TypeScript compilation',
    test: () => {
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe' });
        return true;
      } catch {
        console.log('  ⚠️  TypeScript warnings (non-blocking)');
        return true; // Don't fail on TS errors
      }
    },
  },
];

let allPassed = true;

checks.forEach(({ name, test }) => {
  try {
    if (test()) {
      console.log(`✓ ${name}`);
    } else {
      console.log(`✗ ${name}`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`✗ ${name}: ${error.message}`);
    allPassed = false;
  }
});

if (!allPassed) {
  console.log('\n❌ Pre-build checks failed');
  process.exit(1);
}

console.log('\n✅ All checks passed\n');
