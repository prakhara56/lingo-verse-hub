import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateSignUpInput, isEmail } from '@/utils/authValidation';

export const useSignUp = () => {
  const { toast }    = useToast();
  const [isLoading, setLoading] = useState(false);

  /**
   * Attempts to sign the user up.
   * @returns true if sign‑up was initiated OK (check email), false otherwise
   */
  const signUp = async (
    email: string,
    password: string,
    username: string,
    name?: string
  ): Promise<boolean> => {
    // 0️⃣  Basic client‑side validation
    const validationError = validateSignUpInput(email, password, username);
    if (validationError) {
      toast({ title: 'Validation Error', description: validationError, variant: 'destructive' });
      return false;
    }

    // 1️⃣  Ensure email looks legit
    if (!isEmail(email)) {
      toast({ title: 'Invalid Email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return false;
    }

    setLoading(true);
    try {
      // 2️⃣  Check username availability
      const { data: existing, error: checkErr } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (checkErr) {
        console.error('Username check failed:', checkErr);
        throw new Error('Could not verify username—please try again.');
      }
      if (existing) {
        throw new Error('Username is already taken. Please choose another.');
      }

      // 3️⃣  Call Supabase signUp
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            name: name?.trim() || username,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (signUpErr) {
        const msg = signUpErr.message;
        // Map known GoTrue messages to friendlier text
        if (msg.includes('User already registered')) {
          throw new Error('This email is already registered. Try signing in instead.');
        }
        if (msg.includes('Password should be at least')) {
          throw new Error('Password too weak—please choose at least 6 characters.');
        }
        if (msg.includes('Invalid email address')) {
          throw new Error('That email address looks invalid. Please check and try again.');
        }
        throw new Error(msg);
      }

      // 4️⃣  Sanity‑check that a user object came back
      if (!signUpData?.user) {
        throw new Error('Sign‑up succeeded but no user was returned. Please contact support.');
      }

      // ✅  Success!
      toast({
        title: 'Account Created',
        description: 'Check your email for a confirmation link before signing in.',
      });
      return true;

    } catch (err: any) {
      console.error('Sign up error:', err);
      // Detect network failure
      const description = err.message.includes('Failed to fetch')
        ? 'Network error—please check your connection and try again.'
        : err.message;
      toast({ title: 'Error signing up', description, variant: 'destructive' });
      return false;

    } finally {
      setLoading(false);
    }
  };

  return { signUp, isLoading };
};
