
import { Session, User, AuthError } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Profile } from '@/app/integrations/supabase/types';
import { Alert } from 'react-native';
import * as Network from 'expo-network';
import { autoDebugger } from '@/utils/autoDebugger';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, username: string, displayName: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!session && !!profile;

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    const operationId = autoDebugger.registerOperation('initialize_auth');
    console.log('[AuthContext] Initializing auth...');
    
    try {
      // Check network connectivity first
      const networkState = await Network.getNetworkStateAsync();
      console.log('[AuthContext] Network state:', networkState);
      
      if (!networkState.isConnected) {
        console.warn('[AuthContext] No network connection, skipping session check');
        setIsLoading(false);
        autoDebugger.markSuccess(operationId);
        return;
      }

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[AuthContext] Session error:', sessionError);
        autoDebugger.markFailure(operationId, sessionError.message);
        
        // Don't throw on network errors, just log and continue
        if (sessionError.message?.includes('network') || sessionError.message?.includes('fetch')) {
          console.warn('[AuthContext] Network error during session check, continuing...');
          setIsLoading(false);
          return;
        }
        
        throw sessionError;
      }

      console.log('[AuthContext] Current session:', currentSession ? 'exists' : 'none');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id);
      }
      
      autoDebugger.markSuccess(operationId);
    } catch (err: any) {
      console.error('[AuthContext] Initialize error:', err);
      autoDebugger.markFailure(operationId, err.message);
      
      // Don't set error for network issues, just log
      if (err.message?.includes('Network request failed') || err.message?.includes('fetch')) {
        console.warn('[AuthContext] Network error, continuing without session');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user profile with enhanced retry logic and better error handling
  const loadProfile = useCallback(async (userId: string, retryCount = 0) => {
    const operationId = autoDebugger.registerOperation('load_profile');
    console.log('[AuthContext] Loading profile for user:', userId, 'retry:', retryCount);
    
    try {
      // Wait a bit on first load to give the trigger time to create the profile
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        // If profile doesn't exist yet and we haven't retried too many times, wait and retry
        if (profileError.code === 'PGRST116' && retryCount < 8) {
          console.log('[AuthContext] Profile not found yet, retrying in 1s... (attempt', retryCount + 1, 'of 8)');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadProfile(userId, retryCount + 1);
        }
        
        console.error('[AuthContext] Profile load error:', profileError);
        autoDebugger.markFailure(operationId, `Profile not found after ${retryCount} retries: ${profileError.message}`);
        
        // If profile still doesn't exist after retries, there's a problem with the trigger
        if (profileError.code === 'PGRST116') {
          throw new Error('Profile creation failed. Please contact support.');
        }
        
        throw profileError;
      }

      console.log('[AuthContext] Profile loaded:', data?.username);
      setProfile(data);
      autoDebugger.markSuccess(operationId);
    } catch (err: any) {
      console.error('[AuthContext] Load profile error:', err);
      autoDebugger.markFailure(operationId, err.message);
      setError(err.message);
      throw err;
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    console.log('[AuthContext] Setting up auth listener...');
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('[AuthContext] Auth state changed:', event);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [initializeAuth, loadProfile]);

  // Check username availability
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const operationId = autoDebugger.registerOperation('check_username');
    console.log('[AuthContext] Checking username availability:', username);
    
    try {
      // Check network connectivity first
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        console.warn('[AuthContext] No network connection, skipping username check');
        autoDebugger.markSuccess(operationId);
        // Return true to allow signup to proceed - database will handle duplicate validation
        return true;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Username check error:', error);
        // If there's a network error, allow signup to proceed
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          console.warn('[AuthContext] Network error during username check, allowing signup to proceed');
          autoDebugger.markSuccess(operationId);
          return true;
        }
        autoDebugger.markFailure(operationId, error.message);
        throw error;
      }

      const isAvailable = !data;
      console.log('[AuthContext] Username available:', isAvailable);
      autoDebugger.markSuccess(operationId);
      return isAvailable;
    } catch (err: any) {
      console.error('[AuthContext] Username availability check failed:', err);
      autoDebugger.markFailure(operationId, err.message);
      
      // Handle network errors gracefully
      if (err.message?.includes('Network request failed') || err.message?.includes('fetch')) {
        console.warn('[AuthContext] Network error, allowing signup to proceed');
        return true;
      }
      
      throw err;
    }
  };

  // Signup function with auto-retry
  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    console.log('[AuthContext] Starting signup process...');
    setError(null);

    try {
      // Use auto-retry for the entire signup operation
      const result = await autoDebugger.executeWithRetry(
        'signup',
        async () => {
          // Check network connectivity
          const networkState = await Network.getNetworkStateAsync();
          if (!networkState.isConnected) {
            throw new Error('No internet connection. Please check your network and try again.');
          }

          // Normalize username
          const normalizedUsername = username.toLowerCase().trim();
          console.log('[AuthContext] Normalized username:', normalizedUsername);

          // Check username availability
          console.log('[AuthContext] Checking username availability...');
          const isUsernameAvailable = await checkUsernameAvailability(normalizedUsername);
          
          if (!isUsernameAvailable) {
            throw new Error('This username is already taken. Please choose a different username.');
          }

          // Create auth user - the database trigger will automatically create the profile
          console.log('[AuthContext] Creating auth user...');
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                username: normalizedUsername,
                display_name: displayName.trim(),
              },
            },
          });

          if (authError) {
            console.error('[AuthContext] Auth signup error:', authError);
            
            // Provide user-friendly error messages
            if (authError.message?.includes('already registered')) {
              throw new Error('An account with this email already exists. Please try logging in instead.');
            }
            
            throw new Error(authError.message || 'Failed to create account. Please try again.');
          }

          if (!authData.user) {
            throw new Error('Failed to create account. Please try again.');
          }

          console.log('[AuthContext] Auth user created:', authData.user.id);
          console.log('[AuthContext] Waiting for profile to be created by database trigger...');

          // Check if email verification is required
          const needsVerification = !authData.session;
          console.log('[AuthContext] Needs verification:', needsVerification);

          if (!needsVerification && authData.session) {
            console.log('[AuthContext] Session created, updating state and loading profile');
            setSession(authData.session);
            setUser(authData.user);
            
            // Wait for the profile to be created by the trigger and then load it
            await loadProfile(authData.user.id);
          }

          return {
            success: true,
            needsVerification,
          };
        }
      );

      return result;
    } catch (err: any) {
      console.error('[AuthContext] Signup error:', err);
      
      // Handle network errors
      if (err.message?.includes('Network request failed') || err.message?.includes('fetch failed')) {
        return {
          success: false,
          error: 'Network connection error. Please check your internet connection and try again.',
        };
      }
      
      return {
        success: false,
        error: err.message || 'An unexpected error occurred. Please try again.',
      };
    }
  };

  // Login function with auto-retry
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('[AuthContext] Starting login process...');
    setError(null);

    try {
      // Use auto-retry for the entire login operation
      const result = await autoDebugger.executeWithRetry(
        'login',
        async () => {
          // Check network connectivity
          const networkState = await Network.getNetworkStateAsync();
          if (!networkState.isConnected) {
            throw new Error('No internet connection. Please check your network and try again.');
          }

          const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (loginError) {
            console.error('[AuthContext] Login error:', loginError);
            
            // Provide user-friendly error messages
            if (loginError.message?.includes('Invalid login credentials')) {
              throw new Error('Invalid email or password. Please try again.');
            }
            
            if (loginError.message?.includes('Email not confirmed')) {
              throw new Error('Please verify your email address before logging in.');
            }
            
            throw new Error(loginError.message || 'Login failed. Please try again.');
          }

          if (!data.session || !data.user) {
            throw new Error('Login failed. Please try again.');
          }

          console.log('[AuthContext] Login successful, updating state');
          setSession(data.session);
          setUser(data.user);
          await loadProfile(data.user.id);

          return { success: true };
        }
      );

      return result;
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err);
      
      // Handle network errors
      if (err.message?.includes('Network request failed') || err.message?.includes('fetch failed')) {
        return {
          success: false,
          error: 'Network connection error. Please check your internet connection and try again.',
        };
      }
      
      return {
        success: false,
        error: err.message || 'An unexpected error occurred. Please try again.',
      };
    }
  };

  // Logout function
  const logout = async () => {
    const operationId = autoDebugger.registerOperation('logout');
    console.log('[AuthContext] Logging out...');
    
    try {
      const { error: logoutError } = await supabase.auth.signOut();
      
      if (logoutError) {
        console.error('[AuthContext] Logout error:', logoutError);
        autoDebugger.markFailure(operationId, logoutError.message);
        throw logoutError;
      }

      setUser(null);
      setProfile(null);
      setSession(null);
      console.log('[AuthContext] Logout successful');
      autoDebugger.markSuccess(operationId);
    } catch (err: any) {
      console.error('[AuthContext] Logout error:', err);
      autoDebugger.markFailure(operationId, err.message);
      setError(err.message);
      throw err;
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    console.log('[AuthContext] Refreshing profile...');
    if (user) {
      await loadProfile(user.id);
    }
  };

  // Update profile
  const updateProfile = async (
    updates: Partial<Profile>
  ): Promise<{ success: boolean; error?: string }> => {
    const operationId = autoDebugger.registerOperation('update_profile');
    console.log('[AuthContext] Updating profile...');
    
    if (!user) {
      autoDebugger.markFailure(operationId, 'Not authenticated');
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        console.error('[AuthContext] Profile update error:', updateError);
        autoDebugger.markFailure(operationId, updateError.message);
        return {
          success: false,
          error: updateError.message,
        };
      }

      console.log('[AuthContext] Profile updated successfully');
      await loadProfile(user.id);
      autoDebugger.markSuccess(operationId);
      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] Profile update error:', err);
      autoDebugger.markFailure(operationId, err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated,
        error,
        login,
        signup,
        logout,
        refreshProfile,
        updateProfile,
        checkUsernameAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
