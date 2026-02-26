import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at?: string;
  company_id: string;
  user_id: string;
}

interface ChatContextType {
  conversations: Conversation[];
  companyId: string | null;
  loading: boolean;
  error: string | null;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyId = useCallback(async () => {
    if (!user) return null;
    try {
        const { data, error } = await supabase
            .schema('planintex')
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            console.warn('Company not found for user, attempting auto-fix...');
            // Attempt to auto-create user/company linkage if missing
            try {
                const { error: funcError } = await supabase.rpc('ensure_company_exists_for_user');
                if (!funcError) {
                    // Retry fetch
                     const { data: retryData } = await supabase
                        .schema('planintex')
                        .from('users')
                        .select('company_id')
                        .eq('id', user.id)
                        .single();
                     if (retryData) {
                         return retryData.company_id;
                     }
                } else {
                     console.error('Auto-fix failed:', funcError);
                }
            } catch (rpcErr) {
                console.error('RPC failed:', rpcErr);
            }
            return null;
        } else {
            return data.company_id;
        }
    } catch (err) {
        console.error("Unexpected error fetching company:", err);
        return null;
    }
  }, [user]);

  const fetchConversations = useCallback(async (compId: string) => {
    setLoading(true);
    try {
        const { data, error } = await supabase
            .schema('droweder_ia')
            .from('conversations')
            .select('*')
            .eq('company_id', compId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching conversations:', error);
            setError("Falha ao carregar histórico.");
        } else {
            setConversations(data as Conversation[]);
            setError(null);
        }
    } catch (err) {
        console.error("Unexpected error in fetchConversations:", err);
        setError("Erro inesperado.");
    } finally {
        setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let mounted = true;

    const init = async () => {
        if (!user) {
            setConversations([]);
            setCompanyId(null);
            return;
        }

        const cId = await fetchCompanyId();
        if (mounted) {
            setCompanyId(cId);
            if (cId) {
                await fetchConversations(cId);
            } else {
                setError("Empresa não encontrada.");
            }
        }
    };

    init();

    return () => {
        mounted = false;
    };
  }, [user, fetchCompanyId, fetchConversations]);

  const addConversation = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev]);
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteConversation = async (id: string) => {
      // Optimistic update
      const oldConversations = [...conversations];
      setConversations(prev => prev.filter(c => c.id !== id));

      try {
          const { error } = await supabase
            .schema('droweder_ia')
            .from('conversations')
            .delete()
            .eq('id', id);

          if (error) throw error;
      } catch (err) {
          console.error("Error deleting conversation:", err);
          // Revert
          setConversations(oldConversations);
          alert("Erro ao excluir conversa.");
      }
  };

  const refreshConversations = async () => {
      if (companyId) {
          await fetchConversations(companyId);
      }
  };

  return (
    <ChatContext.Provider value={{
        conversations,
        companyId,
        loading,
        error,
        addConversation,
        updateConversation,
        deleteConversation,
        refreshConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
