
import { Session, User, AuthError } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Profile } from '@/app/integrations/supabase/types';
import { Alert } from 'react-native';
import * as Network from 'expo-network';

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
    console.log('[AuthContext] Initializing auth...');
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[AuthContext] Session error:', sessionError);
        throw sessionError;
      }

      console.log('[AuthContext] Current session:', currentSession ? 'exists' : 'none');
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id);
      }
    } catch (err: any) {
      console.error('[AuthContext] Initialize error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user profile
  const loadProfile = useCallback(async (userId: string) => {
    console.log('[AuthContext] Loading profile for user:', userId);
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('[AuthContext] Profile load error:', profileError);
        throw profileError;
      }

      console.log('[AuthContext] Profile loaded:', data?.username);
      setProfile(data);
    } catch (err: any) {
      console.error('[AuthContext] Load profile error:', err);
      setError(err.message);
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
    console.log('[AuthContext] Checking username availability:', username);
    
    try {
      // Check network connectivity first
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        console.warn('[AuthContext] No network connection, skipping username check');
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
          return true;
        }
        throw error;
      }

      const isAvailable = !data;
      console.log('[AuthContext] Username available:', isAvailable);
      return isAvailable;
    } catch (err: any) {
      console.error('[AuthContext] Username availability check failed:', err);
      
      // Handle network errors gracefully
      if (err.message?.includes('Network request failed') || err.message?.includes('fetch')) {
        console.warn('[AuthContext] Network error, allowing signup to proceed');
        return true;
      }
      
      throw err;
    }
  };

  // Signup function
  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    console.log('[AuthContext] Starting signup process...');
    setError(null);

    try {
      // Check network connectivity
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        console.error('[AuthContext] No network connection');
        return {
          success: false,
          error: 'No internet connection. Please check your network and try again.',
        };
      }

      // Normalize username
      const normalizedUsername = username.toLowerCase().trim();
      console.log('[AuthContext] Normalized username:', normalizedUsername);

      // Check username availability
      console.log('[AuthContext] Checking username availability...');
      const isUsernameAvailable = await checkUsernameAvailability(normalizedUsername);
      
      if (!isUsernameAvailable) {
        console.log('[AuthContext] Username already taken');
        return {
          success: false,
          error: 'This username is already taken. Please choose a different username.',
        };
      }

      // Create auth user
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
          return {
            success: false,
            error: 'An account with this email already exists. Please try logging in instead.',
          };
        }
        
        return {
          success: false,
          error: authError.message || 'Failed to create account. Please try again.',
        };
      }

      if (!authData.user) {
        console.error('[AuthContext] No user returned from signup');
        return {
          success: false,
          error: 'Failed to create account. Please try again.',
        };
      }

      console.log('[AuthContext] Auth user created:', authData.user.id);

      // Create profile
      console.log('[AuthContext] Creating profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: normalizedUsername,
          display_name: displayName.trim(),
          bio: null,
          avatar_url: null,
          is_private: false,
          ghost_mode: false,
          free_premium: false,
          always_searching_enabled: false,
          attendance_mode: 'manual',
          notification_preferences: {
            detection_type: 'vibration',
            vibration: true,
            sound: 'default',
          },
        });

      if (profileError) {
        console.error('[AuthContext] Profile creation error:', profileError);
        
        // If profile creation fails due to duplicate username, provide helpful message
        if (profileError.message?.includes('duplicate') || profileError.message?.includes('unique')) {
          return {
            success: false,
            error: 'This username is already taken. Please choose a different username.',
          };
        }
        
        return {
          success: false,
          error: profileError.message || 'Failed to create profile. Please try again.',
        };
      }

      console.log('[AuthContext] Profile created successfully');

      // Check if email verification is required
      const needsVerification = !authData.session;
      console.log('[AuthContext] Needs verification:', needsVerification);

      if (!needsVerification && authData.session) {
        console.log('[AuthContext] Session created, updating state');
        setSession(authData.session);
        setUser(authData.user);
        await loadProfile(authData.user.id);
      }

      return {
        success: true,
        needsVerification,
      };
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

  // Login function
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('[AuthContext] Starting login process...');
    setError(null);

    try {
      // Check network connectivity
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        console.error('[AuthContext] No network connection');
        return {
          success: false,
          error: 'No internet connection. Please check your network and try again.',
        };
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        console.error('[AuthContext] Login error:', loginError);
        
        // Provide user-friendly error messages
        if (loginError.message?.includes('Invalid login credentials')) {
          return {
            success: false,
            error: 'Invalid email or password. Please try again.',
          };
        }
        
        if (loginError.message?.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Please verify your email address before logging in.',
          };
        }
        
        return {
          success: false,
          error: loginError.message || 'Login failed. Please try again.',
        };
      }

      if (!data.session || !data.user) {
        console.error('[AuthContext] No session returned from login');
        return {
          success: false,
          error: 'Login failed. Please try again.',
        };
      }

      console.log('[AuthContext] Login successful, updating state');
      setSession(data.session);
      setUser(data.user);
      await loadProfile(data.user.id);

      return { success: true };
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
    console.log('[AuthContext] Logging out...');
    try {
      const { error: logoutError } = await supabase.auth.signOut();
      
      if (logoutError) {
        console.error('[AuthContext] Logout error:', logoutError);
        throw logoutError;
      }

      setUser(null);
      setProfile(null);
      setSession(null);
      console.log('[AuthContext] Logout successful');
    } catch (err: any) {
      console.error('[AuthContext] Logout error:', err);
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
    console.log('[AuthContext] Updating profile...');
    
    if (!user) {
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
        return {
          success: false,
          error: updateError.message,
        };
      }

      console.log('[AuthContext] Profile updated successfully');
      await loadProfile(user.id);
      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] Profile update error:', err);
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
