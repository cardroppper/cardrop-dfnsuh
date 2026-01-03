
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { LoadingButton } from '@/components/LoadingButton';
import { autoDebugger } from '@/utils/autoDebugger';
import { colors } from '@/styles/commonStyles';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryAttempt, setRetryAttempt] = useState(0);
  
  const { signup } = useAuth();

  const handleSignup = async () => {
    setError('');
    setRetryAttempt(0);

    if (!email || !password || !username || !displayName) {
      setError('All fields are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError('Username must be 3-20 characters (letters, numbers, underscore only)');
      return;
    }

    console.log('🔵 Starting signup process...', { email, username });
    setLoading(true);

    try {
      const result = await signup(email, password, username, displayName);
      
      console.log('✅ Signup result:', result);

      if (result.success) {
        if (result.needsVerification) {
          // Email verification required
          Alert.alert(
            'Check Your Email',
            `We've sent a verification link to ${email}. Please check your email and click the link to verify your account before logging in.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('🔄 Navigating to login screen...');
                  router.replace('/(auth)/login');
                },
              },
            ]
          );
        } else {
          // No verification needed, account created and logged in
          Alert.alert('Success', 'Account created successfully!', [
            {
              text: 'OK',
              onPress: () => {
                console.log('🔄 Navigating to tabs...');
                router.replace('/(tabs)');
              },
            },
          ]);
        }
      } else {
        setError(result.error || 'Signup failed');
        console.error('❌ Signup failed:', result.error);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'An unexpected error occurred';
      setError(errorMsg);
      console.error('🚨 SIGNUP ERROR:', err);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join CarDrop</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}
        
        {retryAttempt > 0 ? (
          <View style={styles.infoContainer}>
            <Text style={styles.info}>🔄 Retry attempt {retryAttempt}/3</Text>
            <Text style={styles.infoSubtext}>
              Automatically retrying with exponential backoff...
            </Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Display Name"
          placeholderTextColor="#666"
          value={displayName}
          onChangeText={setDisplayName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          autoCorrect={false}
        />

        <LoadingButton
          title="Create Account"
          onPress={handleSignup}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity
          onPress={() => {
            console.log('🔄 Navigating to login...');
            router.push('/(auth)/login');
          }}
          disabled={loading}
        >
          <Text style={styles.link}>Already have an account? Log in</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugButton}
            onPress={async () => {
              const summary = await autoDebugger.getHealthSummary();
              console.log(summary);
              Alert.alert('System Health', summary);
            }}
          >
            <Text style={styles.debugButtonText}>🏥 System Health Check</Text>
          </TouchableOpacity>
        )}
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
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  error: {
    color: '#ff3b30',
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  info: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  infoSubtext: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 4,
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: 16,
  },
  debugButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  debugButtonText: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: 14,
  },
});
