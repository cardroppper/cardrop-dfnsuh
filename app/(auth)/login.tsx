
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
import { navigationDebugger } from '@/utils/navigationDebugger';
import { colors } from '@/styles/commonStyles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  const { login } = useAuth();

  // Automatic timeout detection
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      const startTime = Date.now();
      timeoutId = setTimeout(() => {
        const duration = Date.now() - startTime;
        setLoadingTimeout(true);
        setError('Request timeout - check your connection or backend status');
        setLoading(false);
        
        navigationDebugger.markFailure('login', `Timeout after ${duration}ms`);
        console.error('🚨 LOGIN TIMEOUT: Button stuck loading for >10s');
        console.error(navigationDebugger.generateReport());
      }, 10000);
    }
    return () => clearTimeout(timeoutId);
  }, [loading]);

  const handleLogin = async () => {
    setError('');
    setLoadingTimeout(false);

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    const startTime = Date.now();
    const attempt = navigationDebugger.logAttempt('login', '/(auth)/login', '/(tabs)');
    
    console.log('🔵 Starting login process...', { email });
    setLoading(true);

    try {
      const result = await login(email, password);
      const duration = Date.now() - startTime;
      
      console.log('✅ Login result:', result, `(${duration}ms)`);

      if (result.success) {
        navigationDebugger.markSuccess('login', duration);
        console.log('🎉 Login successful, navigating to tabs...');
        router.replace('/(tabs)');
      } else {
        navigationDebugger.markFailure('login', result.error || 'Unknown error');
        setError(result.error || 'Login failed');
        console.error('❌ Login failed:', result.error);
        
        // Provide helpful hints for common errors
        if (result.error?.includes('Email not confirmed')) {
          Alert.alert(
            'Email Not Verified',
            'Please check your email and click the verification link before logging in.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const errorMsg = err?.message || 'An unexpected error occurred';
      
      navigationDebugger.markFailure('login', errorMsg);
      setError(errorMsg);
      
      console.error('🚨 LOGIN ERROR:', err);
      console.error(`Duration: ${duration}ms`);
      console.error(navigationDebugger.generateReport());
      
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to CarDrop</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}
        
        {loadingTimeout ? (
          <View style={styles.warningContainer}>
            <Text style={styles.warning}>⚠️ Request taking longer than expected</Text>
            <Text style={styles.warningSubtext}>
              This might indicate a network issue or backend problem
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
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          autoCorrect={false}
        />

        <LoadingButton
          title="Log In"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        />

        <TouchableOpacity
          onPress={() => {
            navigationDebugger.logAttempt('navigate_to_signup', '/(auth)/login', '/(auth)/signup');
            router.push('/(auth)/signup');
          }}
          disabled={loading}
        >
          <Text style={styles.link}>Don&apos;t have an account? Sign up</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => {
              const report = navigationDebugger.generateReport();
              console.log(report);
              Alert.alert('Navigation Debug Report', report);
            }}
          >
            <Text style={styles.debugButtonText}>📊 View Debug Report</Text>
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
  warningContainer: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  warning: {
    color: '#ff9500',
    fontSize: 14,
    fontWeight: '600',
  },
  warningSubtext: {
    color: '#ff9500',
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
