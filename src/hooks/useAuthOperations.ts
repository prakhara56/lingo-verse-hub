import { useSignIn } from '@/hooks/auth/useSignIn';
import { useSignUp } from '@/hooks/auth/useSignUp';
import { useSignOut } from '@/hooks/auth/useSignOut';

export const useAuthOperations = () => {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { signOut } = useSignOut();

  return { signIn, signUp, signOut };
};
