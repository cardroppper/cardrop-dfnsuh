
import { Profile } from '@/app/integrations/supabase/types';
import * as Network from 'expo-network';
import { Alert } from 'react-native';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import {
  rateLimiter,
  RATE_LIMITS,
  logSecurityEvent,
  SecurityEventType,
  generateDeviceId,
  validatePasswordStrength,
} from '@/utils/security';

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

  const loadProfile = useCallback(async (userId: string) => {
    try {
      console.log('[Auth] Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Error loading profile:', error);
        setError('Failed to load profile');
        return;
      }

      if (data) {
        console.log('[Auth] Profile loaded successfully:', data.username);
        setProfile(data);
        setError(null);
      }
    } catch (err) {
      console.error('[Auth] Exception loading profile:', err);
      setError('Failed to load profile');
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      console.log('[Auth] Initializing authentication...');
      setIsLoading(true);

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[Auth] Session error:', sessionError);
        setError(sessionError.message);
        setIsLoading(false);
        return;
      }

      if (currentSession) {
        console.log('[Auth] Session found, loading user data...');
        setSession(currentSession);
        setUser(currentSession.user);
        await loadProfile(currentSession.user.id);
      } else {
        console.log('[Auth] No active session found');
      }
    } catch (err) {
      console.error('[Auth] Error initializing auth:', err);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('[Auth] Auth state changed:', event);

      if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession);
        setUser(newSession.user);
        await loadProfile(newSession.user.id);
        
        // Log successful login
        await logSecurityEvent({
          type: SecurityEventType.LOGIN_SUCCESS,
          userId: newSession.user.id,
          metadata: { method: 'email' },
        });
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        
        // Log logout
        await logSecurityEvent({
          type: SecurityEventType.LOGOUT,
        });
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
        console.error('[Auth] Error checking username:', error);
        return false;
      }

      return !data;
    } catch (err) {
      console.error('[Auth] Exception checking username:', err);
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

      // Check network connectivity
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        return {
          success: false,
          error: 'No internet connection. Please check your network and try again.',
        };
      }

      // Rate limiting
      const rateLimitCheck = rateLimiter.check(`signup:${email}`, RATE_LIMITS.signup);
      if (!rateLimitCheck.allowed) {
        await logSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_ACTIVITY,
          metadata: {
            reason: 'signup_rate_limit_exceeded',
            email,
            retryAfter: rateLimitCheck.retryAfter,
          },
        });
        return {
          success: false,
          error: `Too many signup attempts. Please try again in ${rateLimitCheck.retryAfter} seconds.`,
        };
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password, {
        email,
        username,
        name: displayName,
      });

      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors[0] || 'Password does not meet security requirements',
        };
      }

      // Check username availability
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        return {
          success: false,
          error: 'Username is already taken. Please choose another one.',
        };
      }

      // Attempt signup
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
        console.error('[Auth] Signup error:', signUpError);
        
        // Log failed signup
        await logSecurityEvent({
          type: SecurityEventType.SUSPICIOUS_ACTIVITY,
          metadata: {
            reason: 'signup_failed',
            email,
            error: signUpError.message,
          },
        });
        
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
        
        // Reset rate limiter on success
        rateLimiter.reset(`signup:${email}`);
      }

      return { success: true };
    } catch (err) {
      console.error('[Auth] Exception during signup:', err);
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

      // Check network connectivity
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        return {
          success: false,
          error: 'No internet connection. Please check your network and try again.',
        };
      }

      // Rate limiting
      const rateLimitCheck = rateLimiter.check(`login:${email}`, RATE_LIMITS.login);
      if (!rateLimitCheck.allowed) {
        await logSecurityEvent({
          type: SecurityEventType.ACCOUNT_LOCKED,
          metadata: {
            reason: 'login_rate_limit_exceeded',
            email,
            retryAfter: rateLimitCheck.retryAfter,
          },
        });
        return {
          success: false,
          error: `Too many login attempts. Please try again in ${rateLimitCheck.retryAfter} seconds.`,
        };
      }

      // Attempt login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[Auth] Login error:', signInError);
        
        // Log failed login
        await logSecurityEvent({
          type: SecurityEventType.LOGIN_FAILURE,
          metadata: {
            reason: 'invalid_credentials',
            email,
            error: signInError.message,
          },
        });
        
        return {
          success: false,
          error: 'Invalid email or password. Please try again.',
        };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await loadProfile(data.user.id);
        
        // Reset rate limiter on success
        rateLimiter.reset(`login:${email}`);
      }

      return { success: true };
    } catch (err) {
      console.error('[Auth] Exception during login:', err);
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
      
      const userId = user?.id;
      
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setError(null);
      
      // Log logout
      if (userId) {
        await logSecurityEvent({
          type: SecurityEventType.LOGOUT,
          userId,
        });
      }
    } catch (err) {
      console.error('[Auth] Error during logout:', err);
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
        console.error('[Auth] Error updating profile:', updateError);
        return {
          success: false,
          error: updateError.message || 'Failed to update profile',
        };
      }

      await loadProfile(user.id);
      
      // Log profile update
      await logSecurityEvent({
        type: SecurityEventType.DATA_ACCESS,
        userId: user.id,
        metadata: {
          action: 'profile_update',
          fields: Object.keys(updates),
        },
      });
      
      return { success: true };
    } catch (err) {
      console.error('[Auth] Exception updating profile:', err);
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
