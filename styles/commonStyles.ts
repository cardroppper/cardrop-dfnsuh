
import { StyleSheet } from 'react-native';

// Color palette for CarDrop
export const colors = {
  // Primary colors
  primary: '#FF4500',      // OrangeRed - main brand color
  secondary: '#1E90FF',    // DodgerBlue - secondary accent
  accent: '#FF4500',       // Same as primary for consistency
  
  // Background colors
  background: '#000000',   // Pure black for dark mode
  card: '#1A1A1A',        // Dark gray for cards
  
  // Text colors
  text: '#FFFFFF',         // White for primary text
  textSecondary: '#999999', // Gray for secondary text
  
  // Status colors
  success: '#00FF00',      // Green for success states
  warning: '#FFA500',      // Orange for warnings
  error: '#FF0000',        // Red for errors
  
  // UI elements
  border: '#333333',       // Dark gray for borders
  disabled: '#666666',     // Gray for disabled states
};

// Common styles used across the app
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 2,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  inputFocused: {
    borderColor: colors.primary,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 4,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});

// Button styles
export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(255, 69, 0, 0.3)',
    elevation: 4,
  },
  
  secondary: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  
  disabled: {
    backgroundColor: colors.disabled,
    opacity: 0.5,
  },
  
  small: {
    padding: 12,
    borderRadius: 8,
  },
  
  large: {
    padding: 20,
    borderRadius: 16,
  },
});
