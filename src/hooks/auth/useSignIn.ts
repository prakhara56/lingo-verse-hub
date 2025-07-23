import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateSignInInput, isEmail } from '@/utils/authValidation';

export const useSignIn = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const signIn = async (emailOrUsername: string, password: string) => {
    // Input validation
    const validationError = validateSignInInput(emailOrUsername, password);
    if (validationError) {
      toast({
        title: 'Error signing in',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    try {
      // Determine if input is email or username
      if (isEmail(emailOrUsername)) {
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
        // For username login, we'll inform the user to use email instead
        // Since accessing auth.users directly is complex in this setup
        throw new Error('Please sign in using your email address instead of username.');
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

  return { signIn };
};