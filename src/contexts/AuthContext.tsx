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
  signUp: (email: string, password: string, username: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  userProfile: ProfileType | null;
  isAdmin: boolean;
  updateUsername: (username: string) => Promise<boolean>;
  updateName: (name: string) => Promise<boolean>;
};

export type ProfileType = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  theme: 'light' | 'dark';
  is_admin: boolean | null;
  name: string | null;
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

  // Separate function to fetch user profile to avoid nesting async calls
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Ensure we're returning a ProfileType object with all required fields
      return {
        id: data.id,
        username: data.username,
        avatar_url: data.avatar_url,
        theme: data.theme || 'light',
        is_admin: !!data.is_admin,
        name: data.name
      } as ProfileType;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event);
            
            if (mounted) {
              setSession(newSession);
              setUser(newSession?.user ?? null);
              
              if (newSession?.user) {
                // Use setTimeout to prevent potential deadlocks with Supabase client
                setTimeout(async () => {
                  if (mounted) {
                    const profile = await fetchUserProfile(newSession.user.id);
                    if (profile && mounted) {
                      setUserProfile(profile);
                      setIsAdmin(!!profile.is_admin);
                    }
                  }
                }, 0);
              } else {
                setUserProfile(null);
                setIsAdmin(false);
              }
            }
          }
        );

        // Then check for existing session
        const { data: { session: currentSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            const profile = await fetchUserProfile(currentSession.user.id);
            if (profile && mounted) {
              setUserProfile(profile);
              setIsAdmin(!!profile.is_admin);
            }
          }
        }
        
        // Always set loading to false, even if there were errors
        if (mounted) setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

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
        
        // Get the user's email from auth.users using the id
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.id);
        
        if (userError || !userData?.user?.email) {
          throw new Error('User not found. Please check your credentials.');
        }
        
        // Now sign in with the email
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.user.email,
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
      console.error("Sign in error:", error);
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signUp = async (email: string, password: string, username: string, name: string) => {
    if (!username || username.trim() === '') {
      toast({
        title: 'Error signing up',
        description: 'Username is required',
        variant: 'destructive',
      });
      return;
    }

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
            name,
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
    
    if (!username || username.trim() === '') {
      toast({
        title: 'Error updating username',
        description: 'Username cannot be empty',
        variant: 'destructive',
      });
      return false;
    }
    
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
      
      // Fetch the updated profile
      const updatedProfile = await fetchUserProfile(user.id);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
      
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

  const updateName = async (name: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Update the name
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Fetch the updated profile
      const updatedProfile = await fetchUserProfile(user.id);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
      
      toast({
        title: 'Name updated',
        description: 'Your name has been successfully updated.',
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Error updating name',
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
        updateName,
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
