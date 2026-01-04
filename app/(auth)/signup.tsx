
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateDisplayName,
} from '@/utils/validation';
import { isOnline, showOfflineAlert } from '@/utils/networkUtils';
import * as Haptics from 'expo-haptics';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, checkUsernameAvailability } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-specific errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  const validateField = async (field: string, value: string) => {
    switch (field) {
      case 'email':
        const emailValidation = validateEmail(value);
        setEmailError(emailValidation.isValid ? '' : emailValidation.error || '');
        return emailValidation.isValid;

      case 'password':
        const passwordValidation = validatePassword(value);
        setPasswordError(passwordValidation.isValid ? '' : passwordValidation.error || '');
        return passwordValidation.isValid;

      case 'confirmPassword':
        if (value !== password) {
          setConfirmPasswordError('Passwords do not match');
          return false;
        }
        setConfirmPasswordError('');
        return true;

      case 'username':
        const usernameValidation = validateUsername(value);
        if (!usernameValidation.isValid) {
          setUsernameError(usernameValidation.error || '');
          return false;
        }

        // Check availability
        try {
          const available = await checkUsernameAvailability(value.trim());
          if (!available) {
            setUsernameError('Username is already taken');
            return false;
          }
          setUsernameError('');
          return true;
        } catch (error) {
          console.error('Error checking username:', error);
          return true; // Allow to proceed if check fails
        }

      case 'displayName':
        const displayNameValidation = validateDisplayName(value);
        setDisplayNameError(displayNameValidation.isValid ? '' : displayNameValidation.error || '');
        return displayNameValidation.isValid;

      default:
        return true;
    }
  };

  const handleSignup = async () => {
    try {
      // Haptic feedback
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Check network connection
      if (!(await isOnline())) {
        showOfflineAlert();
        return;
      }

      // Validate all fields
      const emailValid = await validateField('email', email);
      const passwordValid = await validateField('password', password);
      const confirmPasswordValid = await validateField('confirmPassword', confirmPassword);
      const usernameValid = await validateField('username', username);
      const displayNameValid = await validateField('displayName', displayName);

      if (!emailValid || !passwordValid || !confirmPasswordValid || !usernameValid || !displayNameValid) {
        Alert.alert('Validation Error', 'Please fix the errors before continuing');
        return;
      }

      setLoading(true);

      const result = await signup(
        email.trim(),
        password,
        username.trim(),
        displayName.trim()
      );

      if (result.success) {
        if (result.needsVerification) {
          Alert.alert(
            '✅ Account Created',
            'Please check your email to verify your account before logging in.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(auth)/login'),
              },
            ]
          );
        } else {
          // Auto-navigate to app
          router.replace('/(tabs)/discover');
        }
      } else {
        Alert.alert('Signup Failed', result.error || 'An error occurred during signup');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert(
        'Signup Failed',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the CarDrop community</Text>
        </View>

        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              onBlur={() => validateField('email', email)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!loading}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, usernameError && styles.inputError]}
              placeholder="username"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              onBlur={() => validateField('username', username)}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              editable={!loading}
            />
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
          </View>

          {/* Display Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={[styles.input, displayNameError && styles.inputError]}
              placeholder="Your Name"
              placeholderTextColor={colors.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              onBlur={() => validateField('displayName', displayName)}
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="name"
              editable={!loading}
            />
            {displayNameError ? <Text style={styles.errorText}>{displayNameError}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, passwordError && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                onBlur={() => validateField('password', password)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <IconSymbol
                  ios_icon_name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                  android_material_icon_name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, confirmPasswordError && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => validateField('confirmPassword', confirmPassword)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <IconSymbol
                  ios_icon_name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                  android_material_icon_name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.signupButton, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={buttonStyles.text}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} disabled={loading}>
              <Text style={styles.linkText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  form: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  signupButton: {
    marginTop: 12,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});
