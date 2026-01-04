
#!/bin/bash

# CarDrop Build and Submit Script
# This script automates the build and submission process for iOS and Android

set -e  # Exit on error

echo "🚗 CarDrop Build & Submit Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    print_error "EAS CLI not found. Installing..."
    npm install -g eas-cli
    print_success "EAS CLI installed"
fi

# Check if logged in to Expo
echo ""
echo "Checking Expo authentication..."
if ! eas whoami &> /dev/null; then
    print_warning "Not logged in to Expo. Please log in:"
    eas login
fi
print_success "Logged in to Expo"

# Menu
echo ""
echo "What would you like to do?"
echo "1) Build iOS (Production)"
echo "2) Build Android (Production)"
echo "3) Build Both (Production)"
echo "4) Build iOS (Preview/Internal)"
echo "5) Build Android APK (Preview/Internal)"
echo "6) Submit iOS to App Store"
echo "7) Submit Android to Play Store"
echo "8) Run Pre-flight Checks"
echo "9) Exit"
echo ""
read -p "Enter choice [1-9]: " choice

case $choice in
    1)
        echo ""
        echo "🍎 Building iOS Production..."
        eas build --platform ios --profile production
        print_success "iOS build complete!"
        ;;
    2)
        echo ""
        echo "🤖 Building Android Production..."
        eas build --platform android --profile production
        print_success "Android build complete!"
        ;;
    3)
        echo ""
        echo "📱 Building iOS and Android Production..."
        eas build --platform all --profile production
        print_success "Both builds complete!"
        ;;
    4)
        echo ""
        echo "🍎 Building iOS Preview..."
        eas build --platform ios --profile preview
        print_success "iOS preview build complete!"
        ;;
    5)
        echo ""
        echo "🤖 Building Android APK..."
        eas build --platform android --profile preview
        print_success "Android APK build complete!"
        ;;
    6)
        echo ""
        echo "🍎 Submitting iOS to App Store..."
        print_warning "Make sure you have:"
        echo "  - Apple Developer account"
        echo "  - App Store Connect app created"
        echo "  - Certificates and provisioning profiles"
        read -p "Continue? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            eas submit --platform ios --profile production
            print_success "iOS submitted to App Store!"
        fi
        ;;
    7)
        echo ""
        echo "🤖 Submitting Android to Play Store..."
        print_warning "Make sure you have:"
        echo "  - Google Play Console account"
        echo "  - App created in Play Console"
        echo "  - Service account JSON key"
        read -p "Continue? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            eas submit --platform android --profile production
            print_success "Android submitted to Play Store!"
        fi
        ;;
    8)
        echo ""
        echo "🔍 Running Pre-flight Checks..."
        echo ""
        
        # Check app.json
        if [ -f "app.json" ]; then
            print_success "app.json exists"
        else
            print_error "app.json not found!"
        fi
        
        # Check eas.json
        if [ -f "eas.json" ]; then
            print_success "eas.json exists"
        else
            print_error "eas.json not found!"
        fi
        
        # Check legal documents
        if [ -f "legal/PRIVACY_POLICY.md" ]; then
            print_success "Privacy Policy exists"
        else
            print_warning "Privacy Policy not found"
        fi
        
        if [ -f "legal/TERMS_OF_SERVICE.md" ]; then
            print_success "Terms of Service exists"
        else
            print_warning "Terms of Service not found"
        fi
        
        # Check icons
        if [ -f "assets/images/icon-dark.png" ]; then
            print_success "Dark mode icon exists"
        else
            print_warning "Dark mode icon not found"
        fi
        
        if [ -f "assets/images/icon-light.png" ]; then
            print_success "Light mode icon exists"
        else
            print_warning "Light mode icon not found"
        fi
        
        # Check dependencies
        echo ""
        echo "Checking dependencies..."
        npm outdated || true
        
        # Check for common issues
        echo ""
        echo "Checking for common issues..."
        if grep -q "YOUR_EAS_PROJECT_ID" app.json; then
            print_warning "Update EAS project ID in app.json"
        fi
        
        if grep -q "YOUR_EXPO_USERNAME" app.json; then
            print_warning "Update Expo username in app.json"
        fi
        
        print_success "Pre-flight checks complete!"
        ;;
    9)
        echo "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "================================"
echo "🎉 Done!"
echo ""
