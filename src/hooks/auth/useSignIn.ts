import { useNavigate } from 'react-router-dom';
import { useToast }   from '@/hooks/use-toast';
import { supabase }   from '@/integrations/supabase/client';
import { validateSignInInput, isEmail } from '@/utils/authValidation';

export const useSignIn = () => {
  const { toast } = useToast();
  const navigate   = useNavigate();

  const signIn = async (emailOrUsername: string, password: string) => {
    // 0️⃣  Validate inputs
    const validationError = validateSignInInput(emailOrUsername, password);
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    try {
      let emailToUse = emailOrUsername;

      // 1️⃣ If it’s a username, resolve the real email via your RPC
      if (!isEmail(emailOrUsername)) {
        const { data: email, error: rpcError } = await supabase
          .rpc('get_email_by_username', { p_username: emailOrUsername });

        if (rpcError) {
          console.error('Username lookup failed:', rpcError);
          throw new Error('Could not look up that username. Please try again later.');
        }
        if (!email) {
          throw new Error('Username not found. Please check your username and try again.');
        }
        emailToUse = email;
      }

      // 2️⃣ Attempt to sign in with email + password
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email:    emailToUse,
        password,
      });

      if (authError) {
        const msg = authError.message;
        if (msg.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check and try again.');
        }
        if (msg.includes('Email not confirmed')) {
          throw new Error('Email not confirmed. Please check your inbox for the verification link.');
        }
        if (msg.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        }
        // Fallback for any other GoTrue error
        throw new Error(msg);
      }

      // 3️⃣ Make sure we actually got a session
      if (!data.session) {
        throw new Error('No session was created. Please try signing in again.');
      }

      // ✅ Success
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      navigate('/');
    } catch (err: any) {
      console.error('Sign in error:', err);

      // 4️⃣ Detect network issues vs other errors
      const description = err.message?.includes('Failed to fetch')
        ? 'Network error. Please check your connection and try again.'
        : err.message || 'An unexpected error occurred. Please try again.';

      toast({
        title: 'Error signing in',
        description,
        variant: 'destructive',
      });
    }
  };

  return { signIn };
};
