
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (emailOrUsername: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  userProfile: ProfileType | null;
  isAdmin: boolean;
  updateUsername: (username: string) => Promise<boolean>;
};

export type ProfileType = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  theme: 'light' | 'dark';
  is_admin: boolean | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<ProfileType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              await fetchUserProfile(session.user.id);
            } else {
              setUserProfile(null);
              setIsAdmin(false);
            }
          }
        );

        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }

        setLoading(false);
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error setting up auth:', error);
        setLoading(false);
      }
    };

    setupAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUserProfile(data as ProfileType);
        setIsAdmin(!!data.is_admin);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@');
      
      if (isEmail) {
        // Sign in with email
        const { error } = await supabase.auth.signInWithPassword({
          email: emailOrUsername,
          password,
        });

        if (error) throw error;
      } else {
        // Sign in with username
        // First get the email associated with the username
        const { data, error: usernameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', emailOrUsername)
          .single();
          
        if (usernameError || !data) {
          throw new Error('Username not found. Please check your credentials.');
        }
          
        // Get user email from auth.users using the id
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.id);
        
        if (userError || !userData) {
          throw new Error('User not found. Please check your credentials.');
        }
          
        // Sign in with the retrieved email
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.user.email!,
          password,
        });
          
        if (signInError) throw signInError;
      }

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Check if username exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
        
      if (existingUser) {
        throw new Error('Username already taken. Please choose another one.');
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: window.location.origin + '/auth/confirm',
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Account created!',
        description: 'Please check your email to confirm your registration.',
      });
    } catch (error: any) {
      toast({
        title: 'Error signing up',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateUsername = async (username: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if username exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .neq('id', user.id)
        .single();
        
      if (existingUser) {
        toast({
          title: 'Username unavailable',
          description: 'This username is already taken. Please choose another one.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Update the username
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Refresh the profile
      await fetchUserProfile(user.id);
      
      toast({
        title: 'Username updated',
        description: 'Your username has been successfully updated.',
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Error updating username',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        userProfile,
        isAdmin,
        updateUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
