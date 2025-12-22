
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  }, []);

  const initializeAuth = async () => {
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
  };

  const loadProfile = async (userId: string) => {
    try {
      console.log('[Auth] Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Error loading profile:', error);
        throw error;
      }

      if (data) {
        console.log('[Auth] Profile loaded:', data.username);
        setProfile(data);
      } else {
        console.warn('[Auth] No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('[Auth] Error loading profile:', error);
      setProfile(null);
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('[Auth] Error checking username:', error);
        return false;
      }

      return !data;
    } catch (error) {
      console.error('[Auth] Error checking username availability:', error);
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

      const isAvailable = await checkUsernameAvailability(normalizedUsername);
      if (!isAvailable) {
        return { success: false, error: 'Username is already taken' };
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

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: normalizedUsername,
          display_name: displayName.trim(),
          bio: null,
          avatar_url: null,
          is_private: false,
        });

      if (profileError) {
        console.error('[Auth] Profile creation error:', profileError);
        await supabase.auth.signOut();
        return { success: false, error: 'Failed to create profile. Please try again.' };
      }

      console.log('[Auth] Profile created successfully');
      await loadProfile(data.user.id);

      return { success: true };
    } catch (error) {
      console.error('[Auth] Unexpected signup error:', error);
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

      if (!profile) {
        console.warn('[Auth] User logged in but no profile found');
        return { success: false, error: 'Account profile not found. Please contact support.' };
      }

      return { success: true };
    } catch (error) {
      console.error('[Auth] Unexpected login error:', error);
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
          const isAvailable = await checkUsernameAvailability(normalizedUsername);
          if (!isAvailable) {
            return { success: false, error: 'Username is already taken' };
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
        return { success: false, error: error.message };
      }

      await loadProfile(user.id);
      console.log('[Auth] Profile updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('[Auth] Unexpected profile update error:', error);
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
