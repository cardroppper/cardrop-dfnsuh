# CarDrop - Automotive Social Platform

A real-world automotive social application centered on real cars, real owners, and real physical presence.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Validate before building (runs automatically, but can run manually)
pnpm validate

# Build Android APK (includes automatic validation)
pnpm build:android
```

## ✅ Build Validation System

**NEW:** Automatic validation runs before every build to catch errors early!

The validation system prevents build failures by checking:
- ✅ Node.js version compatibility
- ✅ Dependencies installation
- ✅ Configuration files validity
- ✅ Code quality (ESLint)
- ✅ TypeScript compilation
- ✅ **Metro bundling simulation** (catches Gradle errors before they happen!)

**See [BUILD_VALIDATION_GUIDE.md](./BUILD_VALIDATION_GUIDE.md) for complete details.**

### Why Validation Matters

**Without validation:**
- Build → Wait 15 min → Cryptic Gradle error → Guess → Repeat
- **Time wasted: 20-30+ minutes per error**

**With validation:**
- Validate → 1-2 min → Clear error → Fix → Build succeeds
- **Time saved: 10-15 minutes per build cycle**

## 📱 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm validate` | Run all validation checks |
| `pnpm build:android` | Build Android APK (with validation) |
| `pnpm build:android:bundle` | Build Android AAB (with validation) |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Check TypeScript |
| `pnpm clean` | Clean build artifacts |
| `pnpm clean:full` | Clean everything and reinstall |

## 🏗️ Project Structure

```
app/
├── (auth)/          # Authentication screens
├── (tabs)/          # Main tab navigation
├── clubs/           # Club detail screens
├── vehicles/        # Vehicle management
└── messages/        # Messaging screens

components/          # Reusable components
hooks/              # Custom React hooks
contexts/           # React contexts
services/           # Business logic
utils/              # Utility functions
styles/             # Common styles
```

## 🔧 Development

1. **Make changes** to your code
2. **Validation runs automatically** when you build
3. **If validation fails**, fix the errors shown
4. **Build succeeds** when validation passes

## 📚 Documentation

- [BUILD_VALIDATION_GUIDE.md](./BUILD_VALIDATION_GUIDE.md) - Complete validation system guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [SECURITY.md](./SECURITY.md) - Security implementation details

---

This app was built using [Natively.dev](https://natively.dev) - a platform for creating mobile apps.

Made with 💙 for creativity.
