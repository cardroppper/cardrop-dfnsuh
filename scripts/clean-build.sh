
#!/bin/bash

echo "🧹 Cleaning all build artifacts and caches..."

# Remove node_modules
echo "Removing node_modules..."
rm -rf node_modules

# Remove package-lock
echo "Removing package-lock.json..."
rm -f package-lock.json

# Clear Metro cache
echo "Clearing Metro cache..."
rm -rf node_modules/.cache/metro
rm -rf .expo

# Clear Gradle cache
echo "Clearing Gradle cache..."
rm -rf android/.gradle
rm -rf android/app/build
rm -rf android/build

# Clear watchman
echo "Clearing watchman..."
watchman watch-del-all 2>/dev/null || true

echo "✅ Clean complete. Run 'npm install' then rebuild."
