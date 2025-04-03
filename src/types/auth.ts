
import { Session, User } from '@supabase/supabase-js';

export type ProfileType = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  theme: 'light' | 'dark';
  is_admin: boolean | null;
  name: string | null;
};

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (emailOrUsername: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  userProfile: ProfileType | null;
  isAdmin: boolean;
  updateUsername: (username: string) => Promise<boolean>;
  updateName: (name: string) => Promise<boolean>;
};
