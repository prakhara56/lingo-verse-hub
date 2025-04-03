
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export type ConversationType = 'chat' | 'stock' | 'blog' | 'notes';

export type ConversationHistory = {
  id: string;
  title: string;
  content: any;
  feature_type: ConversationType;
  created_at: string;
};

export const useConversationHistory = (type: ConversationType) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [histories, setHistories] = useState<ConversationHistory[]>([]);
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_type', type)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setHistories(data as ConversationHistory[]);
    } catch (error: any) {
      toast({
        title: 'Error fetching history',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const saveHistory = async (title: string, content: any) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .insert({
          user_id: user.id,
          feature_type: type,
          title,
          content
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'History saved',
        description: 'Your conversation has been saved successfully.',
      });
      
      // Refresh the history list
      fetchHistory();
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Error saving history',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };
  
  const deleteHistory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversation_history')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'History deleted',
        description: 'The conversation has been deleted.',
      });
      
      // Update the local state
      setHistories(histories.filter(h => h.id !== id));
    } catch (error: any) {
      toast({
        title: 'Error deleting history',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    histories,
    loading,
    fetchHistory,
    saveHistory,
    deleteHistory
  };
};
