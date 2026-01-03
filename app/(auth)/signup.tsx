
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';

export default function SignupScreen() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const validateUsername = (text: string) => {
    const normalized = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(normalized);
    
    if (normalized.length > 0 && normalized.length < 3) {
      setUsernameError('Username must be at least 3 characters');
    } else if (normalized.length > 30) {
      setUsernameError('Username must be 30 characters or less');
    } else {
      setUsernameError('');
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !displayName || !username) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[Signup] Attempting signup...');
      const result = await signup(email, password, username, displayName);
      
      if (result.success) {
        if (result.needsVerification) {
          Alert.alert(
            'Verify Your Email',
            'We\'ve sent a verification link to your email. Please verify your email address before logging in.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(auth)/login'),
              },
            ]
          );
        } else {
          console.log('[Signup] Signup successful, navigating to discover');
          router.replace('/(tabs)/discover');
        }
      } else {
        console.error('[Signup] Signup failed:', result.error);
        
        // Provide helpful error messages
        let errorTitle = 'Signup Failed';
        let errorMessage = result.error || 'An error occurred during signup';
        
        if (errorMessage.includes('Network connection error')) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
          errorTitle = 'Account Exists';
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (errorMessage.includes('already taken')) {
          errorTitle = 'Username Taken';
          errorMessage = 'This username is already in use. Please choose a different username.';
        }
        
        Alert.alert(errorTitle, errorMessage);
      }
    } catch (error) {
      console.error('[Signup] Unexpected error:', error);
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/6a39751f-03b5-4411-acbb-1e92f6a5988e.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Join CarDrop</Text>
          <Text style={styles.slogan}>BE PROUD. DROP IT.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Your full name"
              placeholderTextColor={colors.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoComplete="name"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[commonStyles.input, usernameError ? styles.inputError : null]}
              placeholder="username (lowercase, numbers, _)"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={validateUsername}
              autoCapitalize="none"
              autoComplete="username"
              editable={!isLoading}
            />
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.signupButton, isLoading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={buttonStyles.text}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.outline, styles.loginButton]}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={buttonStyles.textOutline}>
              Already have an account? Log In
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginTop: 8,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  slogan: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginButton: {
    marginBottom: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
