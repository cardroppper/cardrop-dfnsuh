import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

console.log('[AuthContext] Module loading...');

import { supabase } from '@/app/integrations/supabase/client';

console.log('[AuthContext] Supabase client imported');

import type { User, Session } from '@supabase/supabase-js';

console.log('[AuthContext] Types imported');

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
  console.log('[AuthContext] AuthProvider rendering...');
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('[AuthContext] State initialized');

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let subscription: any = null;
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('[AuthContext] Initializing authentication...');
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
        );
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (!mounted) {
          console.log('[AuthContext] Component unmounted during session fetch');
          return;
        }
        
        if (sessionError) {
          console.log('[AuthContext] Session error:', sessionError.message);
          setError(sessionError.message);
          // Continue anyway - user can still use the app
        }

        console.log('[AuthContext] Session loaded:', session ? 'authenticated' : 'not authenticated');
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('[AuthContext] Fetching user profile...');
          try {
            await fetchProfile(session.user.id);
          } catch (profileErr: any) {
            console.error('[AuthContext] Profile fetch error:', profileErr);
            // Don't block app initialization for profile errors
          }
        }
        
        if (!mounted) {
          console.log('[AuthContext] Component unmounted after profile fetch');
          return;
        }
        
        setIsLoading(false);
        console.log('[AuthContext] Initialization complete');

        // Listen for auth changes
        try {
          const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('[AuthContext] Auth state changed:', event);
              
              if (!mounted) return;
              
              setSession(session);
              setUser(session?.user ?? null);

              if (session?.user) {
                try {
                  await fetchProfile(session.user.id);
                } catch (err: any) {
                  console.error('[AuthContext] Profile fetch error on auth change:', err);
                }
              } else {
                setProfile(null);
              }
            }
          );

          subscription = authSubscription;
        } catch (subscriptionErr: any) {
          console.error('[AuthContext] Failed to set up auth subscription:', subscriptionErr);
          // Continue anyway - app can still work without real-time updates
        }
      } catch (err: any) {
        console.error('[AuthContext] Initialization error:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize authentication');
          setIsLoading(false);
          // Don't throw - let the app continue
        }
      }
    };

    initAuth();

    return () => {
      console.log('[AuthContext] Cleaning up...');
      mounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error('[AuthContext] Error unsubscribing:', err);
        }
      }
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string, displayName: string) => {
    try {
      setError(null);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
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
        return { success: false, error: 'Failed to create user profile' };
      }

      await fetchProfile(authData.user.id);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err: any) {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
