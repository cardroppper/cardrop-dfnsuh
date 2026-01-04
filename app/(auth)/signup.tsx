
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateDisplayName,
} from '@/utils/validation';
import { useRouter } from 'expo-router';
import { isOnline, showOfflineAlert } from '@/utils/networkUtils';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
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
import React, { useState } from 'react';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';
import { validatePasswordStrength, PasswordValidationResult } from '@/utils/security';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
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
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    marginTop: 4,
  },
  passwordRequirements: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  requirementMet: {
    color: colors.success,
  },
  requirementNotMet: {
    color: colors.textSecondary,
  },
  signupButton: {
    ...buttonStyles.primary,
    marginTop: 24,
  },
  signupButtonDisabled: {
    ...buttonStyles.primary,
    opacity: 0.5,
  },
  signupButtonText: {
    ...buttonStyles.primaryText,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  securityBadgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  const [passwordStrength, setPasswordStrength] = useState<PasswordValidationResult | null>(null);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'email':
        const emailResult = validateEmail(value);
        setEmailError(emailResult.isValid ? '' : emailResult.error || '');
        break;
      case 'password':
        const passwordResult = validatePassword(value);
        setPasswordError(passwordResult.isValid ? '' : passwordResult.error || '');
        
        // Check password strength
        const strengthResult = validatePasswordStrength(value, {
          email,
          username,
          name: displayName,
        });
        setPasswordStrength(strengthResult);
        break;
      case 'username':
        const usernameResult = validateUsername(value);
        setUsernameError(usernameResult.isValid ? '' : usernameResult.error || '');
        break;
      case 'displayName':
        const displayNameResult = validateDisplayName(value);
        setDisplayNameError(displayNameResult.isValid ? '' : displayNameResult.error || '');
        break;
    }
  };

  const handleSignup = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Check network
    const online = await isOnline();
    if (!online) {
      showOfflineAlert();
      return;
    }

    // Validate all fields
    validateField('email', email);
    validateField('password', password);
    validateField('username', username);
    validateField('displayName', displayName);

    if (emailError || passwordError || usernameError || displayNameError) {
      Alert.alert('Validation Error', 'Please fix the errors before continuing');
      return;
    }

    if (!email || !password || !username || !displayName) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    // Check password strength
    if (passwordStrength && !passwordStrength.isValid) {
      Alert.alert(
        'Weak Password',
        passwordStrength.errors.join('\n\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await signup(email, password, username, displayName);

    if (result.success) {
      if (result.needsVerification) {
        Alert.alert(
          'Verify Your Email',
          'Please check your email and click the verification link to complete your registration.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      } else {
        router.replace('/(tabs)/discover');
      }
    } else {
      Alert.alert('Signup Failed', result.error || 'An error occurred during signup');
    }
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return colors.error;
      case 'medium':
        return '#FFA500';
      case 'strong':
        return '#4CAF50';
      case 'very-strong':
        return '#2E7D32';
      default:
        return colors.border;
    }
  };

  const getPasswordStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      case 'very-strong':
        return 'Very Strong';
      default:
        return '';
    }
  };

  const isFormValid = email && password && username && displayName && 
    !emailError && !passwordError && !usernameError && !displayNameError &&
    passwordStrength?.isValid;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the CarDrop community</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="your@email.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validateField('email', text);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isLoading}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, usernameError ? styles.inputError : null]}
            placeholder="username"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              validateField('username', text);
            }}
            autoCapitalize="none"
            autoComplete="username"
            editable={!isLoading}
          />
          {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={[styles.input, displayNameError ? styles.inputError : null]}
            placeholder="Your Name"
            placeholderTextColor={colors.textSecondary}
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              validateField('displayName', text);
            }}
            autoCapitalize="words"
            autoComplete="name"
            editable={!isLoading}
          />
          {displayNameError ? <Text style={styles.errorText}>{displayNameError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null, { paddingRight: 50 }]}
              placeholder="••••••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validateField('password', text);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 16, top: 16 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <IconSymbol
                ios_icon_name={showPassword ? 'eye.slash' : 'eye'}
                android_material_icon_name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {password && passwordStrength && (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.passwordStrengthBar}>
                <View
                  style={[
                    styles.passwordStrengthFill,
                    {
                      width: `${passwordStrength.score}%`,
                      backgroundColor: getPasswordStrengthColor(passwordStrength.strength),
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.passwordStrengthText,
                  { color: getPasswordStrengthColor(passwordStrength.strength) },
                ]}
              >
                Password Strength: {getPasswordStrengthLabel(passwordStrength.strength)}
              </Text>

              {!passwordStrength.isValid && passwordStrength.errors.length > 0 && (
                <View style={styles.passwordRequirements}>
                  {passwordStrength.errors.map((error, index) => (
                    <Text key={index} style={[styles.requirementText, styles.requirementNotMet]}>
                      • {error}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.securityBadge}>
          <IconSymbol
            ios_icon_name="lock.shield"
            android_material_icon_name="lock"
            size={16}
            color={colors.success}
          />
          <Text style={styles.securityBadgeText}>
            Enterprise-grade security • Encrypted storage • NIST compliant
          </Text>
        </View>

        <TouchableOpacity
          style={isFormValid && !isLoading ? styles.signupButton : styles.signupButtonDisabled}
          onPress={handleSignup}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.signupButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
