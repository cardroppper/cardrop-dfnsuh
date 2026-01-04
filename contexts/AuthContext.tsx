
import { Profile } from '@/app/integrations/supabase/types';
import * as Network from 'expo-network';
import { Alert } from 'react-native';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { autoDebugger } from '@/utils/autoDebugger';
import { Session, User, AuthError } from '@supabase/supabase-js';

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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FIXED: Wrap loadProfile in useCallback with proper dependencies
  const loadProfile = useCallback(async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile');
        return;
      }

      if (data) {
        console.log('Profile loaded successfully:', data.username);
        setProfile(data);
        setError(null);
      }
    } catch (err) {
      console.error('Exception loading profile:', err);
      setError('Failed to load profile');
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      console.log('Initializing auth...');
      setIsLoading(true);

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(sessionError.message);
        setIsLoading(false);
        return;
      }

      if (currentSession) {
        console.log('Session found, loading user data...');
        setSession(currentSession);
        setUser(currentSession.user);
        await loadProfile(currentSession.user.id);
      } else {
        console.log('No active session found');
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession);
        setUser(newSession.user);
        await loadProfile(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, loadProfile]);

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('Error checking username:', error);
        return false;
      }

      return !data;
    } catch (err) {
      console.error('Exception checking username:', err);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    try {
      setIsLoading(true);
      setError(null);

      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        return {
          success: false,
          error: 'No internet connection. Please check your network and try again.',
        };
      }

      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        return {
          success: false,
          error: 'Username is already taken. Please choose another one.',
        };
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
          },
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        return {
          success: false,
          error: signUpError.message || 'Failed to create account. Please try again.',
        };
      }

      if (data.user && !data.session) {
        return {
          success: true,
          needsVerification: true,
        };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await loadProfile(data.user.id);
      }

      return { success: true };
    } catch (err) {
      console.error('Exception during signup:', err);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        return {
          success: false,
          error: 'No internet connection. Please check your network and try again.',
        };
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Login error:', signInError);
        return {
          success: false,
          error: signInError.message || 'Invalid email or password. Please try again.',
        };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await loadProfile(data.user.id);
      }

      return { success: true };
    } catch (err) {
      console.error('Exception during login:', err);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setError(null);
    } catch (err) {
      console.error('Error during logout:', err);
      setError('Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const updateProfile = async (
    updates: Partial<Profile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      setIsLoading(true);

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return {
          success: false,
          error: updateError.message || 'Failed to update profile',
        };
      }

      await loadProfile(user.id);
      return { success: true };
    } catch (err) {
      console.error('Exception updating profile:', err);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user && !!profile,
    error,
    login,
    signup,
    logout,
    refreshProfile,
    updateProfile,
    checkUsernameAvailability,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
