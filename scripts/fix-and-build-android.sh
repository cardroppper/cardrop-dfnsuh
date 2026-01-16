
#!/usr/bin/env bash

set -e

echo "🔧 CarDrop Android Build Fix Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Clean everything
echo "Step 1: Cleaning all caches and build artifacts..."
print_status "Removing node_modules..."
rm -rf node_modules

print_status "Removing package-lock.json..."
rm -rf package-lock.json

print_status "Removing .expo cache..."
rm -rf .expo

print_status "Removing Metro cache..."
rm -rf node_modules/.cache

print_status "Removing Android build artifacts..."
rm -rf android/.gradle
rm -rf android/app/build
rm -rf android/build

print_status "Removing iOS build artifacts (if exists)..."
rm -rf ios

echo ""

# Step 2: Verify Node and npm versions
echo "Step 2: Verifying environment..."
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

print_status "Node version: $NODE_VERSION"
print_status "npm version: $NPM_VERSION"

# Check if Node version is >= 18
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt 18 ]; then
    print_error "Node version must be >= 18.0.0"
    exit 1
fi

echo ""

# Step 3: Install dependencies with npm (not pnpm)
echo "Step 3: Installing dependencies with npm..."
export NODE_ENV=development
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    print_error "npm install failed"
    exit 1
fi

print_status "Dependencies installed successfully"
echo ""

# Step 4: Verify critical packages
echo "Step 4: Verifying critical packages..."

if [ ! -d "node_modules/babel-preset-expo" ]; then
    print_error "babel-preset-expo not found!"
    exit 1
fi
print_status "babel-preset-expo: OK"

if [ ! -d "node_modules/expo-router" ]; then
    print_error "expo-router not found!"
    exit 1
fi
print_status "expo-router: OK"

if [ ! -d "node_modules/react-native" ]; then
    print_error "react-native not found!"
    exit 1
fi
print_status "react-native: OK"

echo ""

# Step 5: Test JS bundle creation
echo "Step 5: Testing JS bundle creation..."
export NODE_ENV=production
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.ts \
  --bundle-output /tmp/test-bundle.js \
  --assets-dest /tmp/test-assets \
  2>&1 | tee /tmp/bundle-test.log

if [ $? -ne 0 ]; then
    print_error "JS bundle creation failed!"
    echo "Check /tmp/bundle-test.log for details"
    exit 1
fi

print_status "JS bundle created successfully"
echo ""

# Step 6: Run expo prebuild
echo "Step 6: Running expo prebuild for Android..."
export NODE_ENV=production
npx expo prebuild -p android --clean

if [ $? -ne 0 ]; then
    print_error "expo prebuild failed!"
    exit 1
fi

print_status "expo prebuild completed successfully"
echo ""

# Step 7: Build release APK
echo "Step 7: Building release APK..."
cd android

# Make gradlew executable
chmod +x gradlew

# Clean first
./gradlew clean

# Build release
export NODE_ENV=production
./gradlew assembleRelease

if [ $? -ne 0 ]; then
    print_error "Gradle build failed!"
    cd ..
    exit 1
fi

cd ..

print_status "Release APK built successfully!"
echo ""

# Step 8: Locate and display APK
echo "Step 8: Locating APK..."
APK_PATH=$(find android/app/build/outputs/apk/release -name "*.apk" | head -n 1)

if [ -z "$APK_PATH" ]; then
    print_error "APK not found!"
    exit 1
fi

APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
print_status "APK Location: $APK_PATH"
print_status "APK Size: $APK_SIZE"

echo ""
echo "===================================="
echo -e "${GREEN}✓ BUILD SUCCESSFUL!${NC}"
echo "===================================="
echo ""
echo "Your release APK is ready at:"
echo "$APK_PATH"
echo ""
echo "To install on a device:"
echo "adb install $APK_PATH"
echo ""
