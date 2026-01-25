import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

console.log('[AuthContext] Module loaded');

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, username: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('[AuthProvider] Initializing...');
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      console.log('[AuthContext] Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Error fetching profile:', error);
        throw error;
      }

      console.log('[AuthContext] Profile fetched successfully');
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('[AuthContext] Failed to fetch profile:', err);
      setError(err.message);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log('[AuthContext] Setting up auth state');
    
    let subscription: any = null;
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('[AuthContext] Getting initial session...');
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log('[AuthContext] Component unmounted, aborting');
          return;
        }
        
        if (sessionError) {
          console.error('[AuthContext] Error getting session:', sessionError);
          setError(sessionError.message);
        }

        console.log('[AuthContext] Initial session:', session ? 'Found' : 'None');
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('[AuthContext] Fetching user profile...');
          await fetchProfile(session.user.id);
        }
        
        if (!mounted) return;
        
        console.log('[AuthContext] Setting up auth listener...');
        setIsLoading(false);

        // Listen for auth changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[AuthContext] Auth state changed:', event);
            if (!mounted) return;
            
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              await fetchProfile(session.user.id);
            } else {
              setProfile(null);
            }
          }
        );

        subscription = authSubscription;
        console.log('[AuthContext] Initialization complete');
      } catch (err: any) {
        console.error('[AuthContext] Initialization error:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize authentication');
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      console.log('[AuthContext] Cleaning up...');
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting login for:', email);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      console.log('[AuthContext] Login successful');
      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] Login exception:', err);
      return { success: false, error: err.message };
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string, displayName: string) => {
    try {
      console.log('[AuthContext] Attempting signup for:', email);
      setError(null);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('[AuthContext] Signup error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          username,
          display_name: displayName,
        });

      if (profileError) {
        console.error('[AuthContext] Profile creation error:', profileError);
        return { success: false, error: 'Failed to create user profile' };
      }

      await fetchProfile(authData.user.id);

      console.log('[AuthContext] Signup successful');
      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] Signup exception:', err);
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err: any) {
      console.error('[AuthContext] Logout error:', err);
      setError(err.message);
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
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
  };

  console.log('[AuthProvider] Rendering with state:', { isLoading, isAuthenticated: value.isAuthenticated });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
