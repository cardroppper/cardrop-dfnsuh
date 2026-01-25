
/**
 * Common styles and colors used throughout the app
 */

export const colors = {
  // Primary brand colors
  primary: '#FF6B35',      // Vibrant orange - main brand color
  secondary: '#4ECDC4',    // Teal - secondary accent
  accent: '#FFD93D',       // Yellow - highlights and badges
  
  // Background colors
  background: '#0A0A0A',   // Almost black
  card: '#1A1A1A',         // Dark gray for cards
  cardBackground: '#1A1A1A',
  highlight: '#2A2A2A',    // Lighter gray for inputs/highlights
  
  // Text colors
  text: '#FFFFFF',         // White for primary text
  textSecondary: '#A0A0A0', // Gray for secondary text
  
  // UI colors
  border: '#333333',       // Border color
  error: '#FF4444',        // Red for errors
  success: '#4CAF50',      // Green for success
  warning: '#FFA726',      // Orange for warnings
  
  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

export const commonStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  
  // Text styles
  text: {
    color: colors.text,
    fontSize: 16,
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  
  // Center content
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
};

export const buttonStyles = {
  // Primary button
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  // Secondary button
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  // Outline button
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  // Button text
  text: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  
  // Outline button text
  outlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
};
