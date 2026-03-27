import { useState, useEffect } from 'react';
import { X, Archive, RotateCcw, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ArchivedChatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnarchive: (chatId: string) => void;
}

export function ArchivedChatsModal({ isOpen, onClose, onUnarchive }: ArchivedChatsModalProps) {
  const [archivedChats, setArchivedChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadArchivedChats();
    }
  }, [isOpen]);

  const loadArchivedChats = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .schema('droweder_ia')
        .from('conversations')
        .select('*')
        .eq('is_archived', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching archived chats:', error);
      } else {
        setArchivedChats(data || []);
      }
    } catch (err) {
      console.error('Exception fetching archived chats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnarchive = async (chatId: string) => {
    try {
      const { error } = await supabase
        .schema('droweder_ia')
        .from('conversations')
        .update({ is_archived: false })
        .eq('id', chatId);

      if (!error) {
        setArchivedChats(prev => prev.filter(c => c.id !== chatId));
        onUnarchive(chatId); // Callback to refresh main list
      }
    } catch (err) {
      console.error('Exception unarchiving chat:', err);
    }
  };

  const handleDelete = async (chatId: string) => {
    try {
      const { error } = await supabase
        .schema('droweder_ia')
        .from('conversations')
        .delete()
        .eq('id', chatId);

      if (!error) {
        setArchivedChats(prev => prev.filter(c => c.id !== chatId));
      }
    } catch (err) {
      console.error('Exception deleting archived chat:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white/90 dark:bg-black/60 dark:backdrop-blur-xl/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 w-full max-w-[600px] h-[70vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Archive size={24} className="text-blue-500" />
            Chats Arquivados
          </h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-500">
               Carregando...
            </div>
          ) : archivedChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-gray-400">
               <Archive size={48} className="mb-4 opacity-50" />
               <p>Nenhum chat arquivado encontrado.</p>
            </div>
          ) : (
            archivedChats.map(chat => (
              <div key={chat.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors group">
                <div className="flex flex-col truncate pr-4">
                   <h3 className="font-medium text-slate-800 dark:text-white truncate">{chat.title}</h3>
                   <span className="text-xs text-slate-500">{new Date(chat.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button
                     onClick={() => handleUnarchive(chat.id)}
                     className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                     title="Desarquivar"
                   >
                     <RotateCcw size={18} />
                   </button>
                   <button
                     onClick={() => handleDelete(chat.id)}
                     className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                     title="Excluir permanentemente"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
