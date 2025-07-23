import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateSignUpInput } from '@/utils/authValidation';

export const useSignUp = () => {
  const { toast } = useToast();

  const signUp = async (email: string, password: string, username: string, name: string) => {
    // Enhanced input validation
    const validationError = validateSignUpInput(email, password, username);
    if (validationError) {
      toast({
        title: 'Error signing up',
        description: validationError,
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
        .maybeSingle();
        
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

  return { signUp };
};