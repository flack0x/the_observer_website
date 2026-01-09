'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getClient } from '@/lib/supabase/client';
import { UserProfile, UserRole } from '@/lib/admin/types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const supabase = getClient();

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as UserProfile;
  }, [supabase]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!state.user) return;

    const profile = await fetchProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
  }, [state.user, fetchProfile]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Profile will be fetched by the auth state change listener
    return { error: null };
  }, [supabase]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email,
        },
      },
    });

    if (error) {
      return { error };
    }

    // Profile will be created by the database trigger
    return { error: null };
  }, [supabase]);

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, [supabase]);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
