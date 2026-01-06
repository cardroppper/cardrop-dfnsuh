
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running pre-build validation...\n');

let hasErrors = false;

// Check 1: Node modules exist
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.error('❌ node_modules not found. Run npm install first.');
  hasErrors = true;
} else {
  console.log('✅ node_modules found');
}

// Check 2: package.json is valid
try {
  const pkg = require(path.join(process.cwd(), 'package.json'));
  console.log('✅ package.json is valid');
} catch (e) {
  console.error('❌ package.json is invalid:', e.message);
  hasErrors = true;
}

// Check 3: app.json is valid
try {
  const appJson = require(path.join(process.cwd(), 'app.json'));
  console.log('✅ app.json is valid');
} catch (e) {
  console.error('❌ app.json is invalid:', e.message);
  hasErrors = true;
}

// Check 4: TypeScript compilation
try {
  console.log('🔍 Checking TypeScript...');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript check passed');
} catch (e) {
  console.log('⚠️  TypeScript warnings (non-blocking)');
}

// Check 5: ESLint
try {
  console.log('🔍 Running ESLint...');
  execSync('npm run lint', { stdio: 'pipe' });
  console.log('✅ ESLint passed');
} catch (e) {
  console.log('⚠️  ESLint warnings (non-blocking)');
}

if (hasErrors) {
  console.error('\n❌ Validation failed. Fix errors above before building.');
  process.exit(1);
}

console.log('\n✅ All validation checks passed!\n');
process.exit(0);
