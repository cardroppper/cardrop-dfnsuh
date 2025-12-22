
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
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/discover');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
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
          <IconSymbol
            ios_icon_name="car.fill"
            android_material_icon_name="directions-car"
            size={80}
            color={colors.primary}
          />
          <Text style={styles.title}>CarDrop</Text>
          <Text style={styles.subtitle}>Real Cars. Real Owners.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={commonStyles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <TextInput
            style={commonStyles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity
            style={[buttonStyles.primary, styles.loginButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={buttonStyles.text}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.outline, styles.signupButton]}
            onPress={() => router.push('/(auth)/signup')}
            disabled={isLoading}
          >
            <Text style={[buttonStyles.text, { color: colors.primary }]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Join the automotive community
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
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    marginTop: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  loginButton: {
    marginBottom: 16,
  },
  signupButton: {
    marginBottom: 0,
  },
  footerText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
  },
});
