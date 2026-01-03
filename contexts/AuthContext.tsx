
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { Profile } from '@/app/integrations/supabase/types';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string, retryCount = 0) => {
    try {
      console.log('[Auth] Loading profile for user:', userId, 'retry:', retryCount);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Auth] Error loading profile:', error);
        throw error;
      }

      if (data) {
        console.log('[Auth] Profile loaded:', data.username);
        setProfile(data);
      } else {
        console.warn('[Auth] No profile found for user:', userId);
        
        if (retryCount < 3) {
          console.log('[Auth] Retrying profile load in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadProfile(userId, retryCount + 1);
        }
        
        setProfile(null);
      }
    } catch (error) {
      console.error('[Auth] Error loading profile:', error);
      
      if (retryCount < 3) {
        console.log('[Auth] Retrying profile load after error in 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadProfile(userId, retryCount + 1);
      }
      
      setProfile(null);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      console.log('[Auth] Checking for existing session');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Auth] Error getting session:', error);
        throw error;
      }

      if (session) {
        console.log('[Auth] Found existing session for user:', session.user.id);
        setSession(session);
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        console.log('[Auth] No existing session found');
      }
    } catch (error) {
      console.error('[Auth] Error initializing auth:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    console.log('[Auth] Initializing auth context');
    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        setSession(session);
        setUser(session.user);
        await loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session);
        setUser(session.user);
      } else if (event === 'USER_UPDATED' && session) {
        setUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [initializeAuth, loadProfile]);

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      console.log('[Auth] Checking username availability:', username);
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('[Auth] Error checking username:', error);
        
        // If it's a network error, we'll allow the signup to proceed
        // The database trigger will handle duplicate username validation
        if (error.message?.includes('Failed to fetch') || 
            error.message?.includes('Network request failed') ||
            error.message?.includes('fetch failed')) {
          console.warn('[Auth] Network error during username check, allowing signup to proceed');
          return true;
        }
        
        return false;
      }

      const isAvailable = !data;
      console.log('[Auth] Username available:', isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('[Auth] Error checking username availability:', error);
      
      // If there's a network error, allow signup to proceed
      // The database will handle validation
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.warn('[Auth] Network error during username check, allowing signup to proceed');
        return true;
      }
      
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
      console.log('[Auth] Starting signup for:', email, username);
      setError(null);

      const normalizedUsername = username.toLowerCase().trim();

      if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
        return { success: false, error: 'Username must be between 3 and 30 characters' };
      }

      if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
        return { success: false, error: 'Username can only contain lowercase letters, numbers, and underscores' };
      }

      // Check username availability (with network error handling)
      try {
        const isAvailable = await checkUsernameAvailability(normalizedUsername);
        if (!isAvailable) {
          return { success: false, error: 'Username is already taken' };
        }
      } catch (error) {
        console.warn('[Auth] Username check failed, proceeding with signup:', error);
        // Continue with signup - database trigger will handle duplicate validation
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            username: normalizedUsername,
            display_name: displayName.trim(),
          }
        }
      });

      if (error) {
        console.error('[Auth] Signup error:', error);
        
        // Provide user-friendly error messages
        if (error.message?.includes('Failed to fetch') || 
            error.message?.includes('Network request failed') ||
            error.message?.includes('fetch failed')) {
          return { 
            success: false, 
            error: 'Network connection error. Please check your internet connection and try again.' 
          };
        }
        
        if (error.message?.includes('User already registered')) {
          return { success: false, error: 'An account with this email already exists' };
        }
        
        if (error.message?.includes('duplicate key value violates unique constraint')) {
          return { success: false, error: 'Username is already taken' };
        }
        
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Failed to create account' };
      }

      console.log('[Auth] User created:', data.user.id);

      if (!data.session) {
        console.log('[Auth] Email verification required');
        return { 
          success: true, 
          needsVerification: true,
          error: 'Please check your email to verify your account before logging in'
        };
      }

      console.log('[Auth] User created with session, profile should be auto-created by trigger');
      
      await loadProfile(data.user.id);

      return { success: true };
    } catch (error) {
      console.error('[Auth] Unexpected signup error:', error);
      
      // Handle network errors specifically
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return { 
          success: false, 
          error: 'Network connection error. Please check your internet connection and try again.' 
        };
      }
      
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      return { success: false, error: message };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('[Auth] Starting login for:', email);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Login error:', error);
        
        // Handle network errors
        if (error.message?.includes('Failed to fetch') || 
            error.message?.includes('Network request failed') ||
            error.message?.includes('fetch failed')) {
          return { 
            success: false, 
            error: 'Network connection error. Please check your internet connection and try again.' 
          };
        }
        
        let errorMessage = error.message;
        
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        }
        
        return { success: false, error: errorMessage };
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'Login failed. Please try again.' };
      }

      console.log('[Auth] Login successful for user:', data.user.id);
      
      setSession(data.session);
      setUser(data.user);
      await loadProfile(data.user.id);

      return { success: true };
    } catch (error) {
      console.error('[Auth] Unexpected login error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return { 
          success: false, 
          error: 'Network connection error. Please check your internet connection and try again.' 
        };
      }
      
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth] Logging out');
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[Auth] Logout error:', error);
        throw error;
      }

      setSession(null);
      setUser(null);
      setProfile(null);
      console.log('[Auth] Logout successful');
    } catch (error) {
      console.error('[Auth] Error during logout:', error);
      setError(error instanceof Error ? error.message : 'Failed to logout');
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
    try {
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      console.log('[Auth] Updating profile:', updates);

      if (updates.username) {
        const normalizedUsername = updates.username.toLowerCase().trim();
        
        if (normalizedUsername !== profile?.username) {
          try {
            const isAvailable = await checkUsernameAvailability(normalizedUsername);
            if (!isAvailable) {
              return { success: false, error: 'Username is already taken' };
            }
          } catch (error) {
            console.warn('[Auth] Username check failed during update:', error);
            // Continue with update - database will handle validation
          }
        }
        
        updates.username = normalizedUsername;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('[Auth] Profile update error:', error);
        
        // Handle network errors
        if (error.message?.includes('Failed to fetch') || 
            error.message?.includes('Network request failed') ||
            error.message?.includes('fetch failed')) {
          return { 
            success: false, 
            error: 'Network connection error. Please check your internet connection and try again.' 
          };
        }
        
        if (error.message?.includes('duplicate key value violates unique constraint')) {
          return { success: false, error: 'Username is already taken' };
        }
        
        return { success: false, error: error.message };
      }

      await loadProfile(user.id);
      console.log('[Auth] Profile updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('[Auth] Unexpected profile update error:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return { 
          success: false, 
          error: 'Network connection error. Please check your internet connection and try again.' 
        };
      }
      
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
