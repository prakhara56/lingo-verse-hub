
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthOperations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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

  return { signIn, signUp, signOut };
};
