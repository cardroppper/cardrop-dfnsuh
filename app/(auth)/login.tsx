
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

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    console.log('[Login] Button pressed');
    
    if (!email || !password) {
      console.log('[Login] Missing fields');
      Alert.alert('Missing Information', 'Please enter your email and password');
      return;
    }

    console.log('[Login] Starting login process...');
    setIsLoading(true);
    
    try {
      console.log('[Login] Calling login function');
      const result = await login(email, password);
      console.log('[Login] Login result:', result);
      
      if (result.success) {
        console.log('[Login] Login successful, navigating to app');
        // Add a small delay to ensure auth state is updated
        setTimeout(() => {
          router.replace('/(tabs)/discover');
        }, 100);
      } else {
        console.error('[Login] Login failed with error:', result.error);
        
        // Provide helpful error messages
        let errorTitle = 'Login Failed';
        let errorMessage = result.error || 'Invalid credentials';
        
        if (errorMessage.includes('Network connection error') || errorMessage.includes('Network request failed')) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (errorMessage.includes('Invalid email or password')) {
          errorTitle = 'Invalid Credentials';
          errorMessage = 'The email or password you entered is incorrect. Please try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorTitle = 'Email Not Verified';
          errorMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.';
        }
        
        console.log('[Login] Showing error alert:', errorTitle, errorMessage);
        Alert.alert(errorTitle, errorMessage);
      }
    } catch (error: any) {
      console.error('[Login] Unexpected error:', error);
      console.error('[Login] Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
      
      Alert.alert('Error', error?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      console.log('[Login] Login process complete, setting loading to false');
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
          <Text style={styles.title}>CARDROP</Text>
          <Text style={styles.slogan}>BE PROUD. DROP IT.</Text>
        </View>

        <View style={styles.form}>
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
              placeholder="Your password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[buttonStyles.primary, styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#000000" />
                <Text style={[buttonStyles.text, styles.loadingText]}>Logging In...</Text>
              </View>
            ) : (
              <Text style={buttonStyles.text}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.outline, styles.signupButton]}
            onPress={() => router.push('/(auth)/signup')}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={buttonStyles.textOutline}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Real Cars. Real Owners. Real Presence.
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
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    marginTop: 8,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  slogan: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  form: {
    width: '100%',
    marginBottom: 32,
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
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  signupButton: {
    marginBottom: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
  footerText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
  },
});
