
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProfileType } from '@/types/auth';
import { fetchUserProfile } from '@/utils/profileUtils';

export const useProfileManagement = (user: User | null, setUserProfile: (profile: ProfileType | null) => void) => {
  const { toast } = useToast();

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
  
  return { updateUsername, updateName };
};
