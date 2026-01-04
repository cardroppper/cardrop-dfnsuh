
import { StyleSheet, ViewStyle, TextStyle, useColorScheme } from 'react-native';

// Color schemes based on user's design
export const lightColors = {
  primary: '#FF8C42',      // Orange - major color in light mode
  secondary: '#FF6B1A',    // Darker orange
  accent: '#2A2A2A',       // Grey - minor color in light mode
  background: '#FFFFFF',
  backgroundAlt: '#F5F5F5',
  text: '#2A2A2A',
  textSecondary: '#666666',
  grey: '#E0E0E0',
  card: '#FFFFFF',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkColors = {
  primary: '#2A2A2A',      // Grey - major color in dark mode
  secondary: '#1A1A1A',    // Darker grey
  accent: '#FF8C42',       // Orange - minor color in dark mode
  background: '#121212',
  backgroundAlt: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  grey: '#3A3A3A',
  card: '#1E1E1E',
  border: '#3A3A3A',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Hook to get current theme colors
export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
};

// Legacy export for backwards compatibility
export const colors = darkColors;

export const buttonStyles = StyleSheet.create({
  primary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  secondary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    borderWidth: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  instructionsButton: {
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
});
