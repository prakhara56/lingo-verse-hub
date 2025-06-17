
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthOperations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const signIn = async (emailOrUsername: string, password: string) => {
    // Input validation
    if (!emailOrUsername.trim()) {
      toast({
        title: 'Error signing in',
        description: 'Email or username is required',
        variant: 'destructive',
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: 'Error signing in',
        description: 'Password is required',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error signing in',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@') && emailOrUsername.includes('.');
      
      if (isEmail) {
        // Sign in with email
        const { error } = await supabase.auth.signInWithPassword({
          email: emailOrUsername,
          password,
        });

        if (error) {
          // Handle specific auth errors
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and click the confirmation link before signing in.');
          } else if (error.message.includes('Too many requests')) {
            throw new Error('Too many login attempts. Please wait a moment before trying again.');
          }
          throw error;
        }
      } else {
        // Sign in with username - get the email from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', emailOrUsername)
          .single();
          
        if (profileError || !profileData) {
          throw new Error('Username not found. Please check your credentials or try signing in with your email.');
        }
        
        // Get the user's email from the auth system using the profile id
        // We need to use the auth admin functions or find another approach
        // For now, let's try a different approach - store email in metadata during signup
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
          // Fallback: try to get email from user metadata stored during signup
          throw new Error('Unable to authenticate with username. Please try signing in with your email address.');
        }
        
        const user = users.users.find(u => u.id === profileData.id);
        if (!user?.email) {
          throw new Error('Unable to find account associated with this username. Please try signing in with your email.');
        }
        
        // Now sign in with the email
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });
        
        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid username or password. Please check your credentials and try again.');
          }
          throw signInError;
        }
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
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const signUp = async (email: string, password: string, username: string, name: string) => {
    // Enhanced input validation
    if (!email.trim()) {
      toast({
        title: 'Error signing up',
        description: 'Email is required',
        variant: 'destructive',
      });
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast({
        title: 'Error signing up',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: 'Error signing up',
        description: 'Password is required',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Error signing up',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (!username || username.trim() === '') {
      toast({
        title: 'Error signing up',
        description: 'Username is required',
        variant: 'destructive',
      });
      return;
    }

    if (username.length < 3) {
      toast({
        title: 'Error signing up',
        description: 'Username must be at least 3 characters long',
        variant: 'destructive',
      });
      return;
    }

    // Check for valid username format (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast({
        title: 'Error signing up',
        description: 'Username can only contain letters, numbers, and underscores',
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
            name: name || username,
            email, // Store email in metadata for username-based login
          },
          emailRedirectTo: window.location.origin + '/auth/confirm',
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password is too weak. Please use a stronger password.');
        } else if (error.message.includes('Unable to validate email address')) {
          throw new Error('Invalid email address. Please check and try again.');
        }
        throw error;
      }

      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to confirm your registration before signing in.',
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: 'Error signing up',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      navigate('/auth');
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: 'Error signing out',
        description: error.message || 'An error occurred while signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return { signIn, signUp, signOut };
};
