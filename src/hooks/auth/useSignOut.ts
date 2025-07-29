import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSignOut = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      localStorage.removeItem('auth_token');

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

  return { signOut };
};