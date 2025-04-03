
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
