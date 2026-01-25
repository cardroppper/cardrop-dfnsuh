
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      console.log('AuthContext: Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('AuthContext: Profile fetch error:', error);
        throw error;
      }

      console.log('AuthContext: Profile fetched successfully');
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('AuthContext: Failed to fetch profile:', err);
      setError(err.message);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log('AuthContext: Initializing authentication...');
    let subscription: any = null;
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('AuthContext: Checking for existing session...');
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 1500)
        );

        const result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]).catch((err) => {
          console.warn('AuthContext: Session fetch failed or timed out:', err.message);
          return { data: { session: null }, error: err };
        });
        
        if (!mounted) {
          console.log('AuthContext: Component unmounted during session check');
          return;
        }

        const { data: { session } = { session: null }, error: sessionError } = result;
        
        if (sessionError) {
          console.warn('AuthContext: Session error:', sessionError.message);
        }

        if (session) {
          console.log('AuthContext: Active session found');
          setSession(session);
          setUser(session.user);

          // Fetch profile in background
          fetchProfile(session.user.id).catch((err) => {
            console.warn('AuthContext: Profile fetch failed:', err);
          });
        } else {
          console.log('AuthContext: No active session');
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        if (!mounted) return;
        
        console.log('AuthContext: Setting isLoading to false');
        setIsLoading(false);

        // Listen for auth changes
        console.log('AuthContext: Setting up auth state listener...');
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            console.log('AuthContext: Auth state changed:', event);
            
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              await fetchProfile(session.user.id).catch((err) => {
                console.warn('AuthContext: Profile fetch failed on auth change:', err);
              });
            } else {
              setProfile(null);
            }
          }
        );

        subscription = authSubscription;
        console.log('AuthContext: Auth state listener active');
      } catch (err: any) {
        console.error('AuthContext: Initialization error:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize authentication');
          setIsLoading(false);
        }
      }
    };

    // Start initialization
    initAuth();

    // Failsafe: Always stop loading after 2 seconds
    const failsafeTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('AuthContext: Failsafe timeout - forcing isLoading to false');
        setIsLoading(false);
      }
    }, 2000);

    return () => {
      console.log('AuthContext: Cleaning up...');
      mounted = false;
      clearTimeout(failsafeTimer);
      if (subscription?.unsubscribe) {
        try {
          subscription.unsubscribe();
          console.log('AuthContext: Unsubscribed from auth changes');
        } catch (err) {
          console.warn('AuthContext: Failed to unsubscribe:', err);
        }
      }
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting login...');
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthContext: Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('AuthContext: Login successful');
        await fetchProfile(data.user.id);
      }

      return { success: true };
    } catch (err: any) {
      console.error('AuthContext: Login exception:', err);
      return { success: false, error: err.message };
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string, displayName: string) => {
    try {
      console.log('AuthContext: Attempting signup...');
      setError(null);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('AuthContext: Signup error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      console.log('AuthContext: User created, creating profile...');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          username,
          display_name: displayName,
        });

      if (profileError) {
        console.error('AuthContext: Profile creation error:', profileError);
        return { success: false, error: 'Failed to create user profile' };
      }

      console.log('AuthContext: Signup successful');
      await fetchProfile(authData.user.id);

      return { success: true };
    } catch (err: any) {
      console.error('AuthContext: Signup exception:', err);
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('AuthContext: Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      console.log('AuthContext: Logout successful');
    } catch (err: any) {
      console.error('AuthContext: Logout error:', err);
      setError(err.message);
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      console.log('AuthContext: Refreshing profile...');
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
