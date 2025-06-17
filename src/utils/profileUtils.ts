
import { supabase } from '@/integrations/supabase/client';
import { ProfileType } from '@/types/auth';

export const fetchUserProfile = async (userId: string): Promise<ProfileType | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const createUserProfile = async (userId: string, userData: any): Promise<ProfileType | null> => {
  try {
    const profileData = {
      id: userId,
      username: userData.username || null,
      name: userData.name || userData.username || null,
      avatar_url: null,
      theme: 'light' as const,
      is_admin: false
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
};
