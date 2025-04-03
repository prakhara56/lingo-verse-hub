
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, ProfileType } from '@/types/auth';
import { fetchUserProfile } from '@/utils/profileUtils';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useAuthOperations } from '@/hooks/useAuthOperations';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<ProfileType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  const { signIn, signUp, signOut } = useAuthOperations();
  const { updateUsername, updateName } = useProfileManagement(user, setUserProfile);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event);
            
            if (mounted) {
              setSession(newSession);
              setUser(newSession?.user ?? null);
              
              if (newSession?.user) {
                // Use setTimeout to prevent potential deadlocks with Supabase client
                setTimeout(async () => {
                  if (mounted) {
                    const profile = await fetchUserProfile(newSession.user.id);
                    if (profile && mounted) {
                      setUserProfile(profile);
                      setIsAdmin(!!profile.is_admin);
                    }
                  }
                }, 0);
              } else {
                setUserProfile(null);
                setIsAdmin(false);
              }
            }
          }
        );

        // Then check for existing session
        const { data: { session: currentSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            const profile = await fetchUserProfile(currentSession.user.id);
            if (profile && mounted) {
              setUserProfile(profile);
              setIsAdmin(!!profile.is_admin);
            }
          }
        }
        
        // Always set loading to false, even if there were errors
        if (mounted) setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        userProfile,
        isAdmin,
        updateUsername,
        updateName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
