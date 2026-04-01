import { AuroraModalBackground } from './AuroraModalBackground';
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Sun, Moon, LogOut, CreditCard, Building2, User, Settings as SettingsIcon, HelpCircle, Palette, ChevronDown, Plus, Sidebar, Search, FileText, Bot, MoreVertical, Share, UserPlus, Pencil, Folder, Pin, Archive, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { CreateProjectModal } from './CreateProjectModal';
import { CreateAssistantModal } from './CreateAssistantModal';
import { NoProjectsWarningModal } from './NoProjectsWarningModal';
import { SelectProjectModal } from './SelectProjectModal';
import { RenameChatModal } from './RenameChatModal';
import { ShareChatModal } from './ShareChatModal';
import { GroupChatModal } from './GroupChatModal';
import { DeleteAssistantModal } from './DeleteAssistantModal';
import ProfileModal from './ProfileModal';
import { DeleteChatModal } from './DeleteChatModal';


import { Toast } from './Toast';
import type { ToastType } from './Toast';

export interface LayoutContextType {
    conversations: any[];
    setConversations: React.Dispatch<React.SetStateAction<any[]>>;
    activeConversationId: string | null;
    setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
    activeAssistantId: string | null;
    setActiveAssistantId: React.Dispatch<React.SetStateAction<string | null>>;
    assistants: any[];
}

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const isEffectivelyExpanded = !isSidebarCollapsed || isSidebarHovered;

  const [isRecentChatsOpen, setIsRecentChatsOpen] = useState(true);
  const [openChatMenuId, setOpenChatMenuId] = useState<string | null>(null);
  const [chatMenuPosition, setChatMenuPosition] = useState({ top: 0, left: 0 });
  const chatMenuRef = useRef<HTMLDivElement>(null);

  const [openProjectMenuId, setOpenProjectMenuId] = useState<string | null>(null);

  const projectMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Close user menu
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      // Close chat menu if clicking outside
      if (openChatMenuId && chatMenuRef.current && !chatMenuRef.current.contains(e.target as Node)) {
        setOpenChatMenuId(null);
      }
      // Close project menu if clicking outside
      if (openProjectMenuId && projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setOpenProjectMenuId(null);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [openChatMenuId, openProjectMenuId, showUserMenu]);

  useEffect(() => {
    const handleScroll = () => {
        if (openChatMenuId) {
            setOpenChatMenuId(null);
        }
        if (openProjectMenuId) {
            setOpenProjectMenuId(null);
        }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [openChatMenuId, openProjectMenuId]);

  // Project state
  const [projects, setProjects] = useState<any[]>([]);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isNoProjectsWarningOpen, setIsNoProjectsWarningOpen] = useState(false);
  const [isSelectProjectModalOpen, setIsSelectProjectModalOpen] = useState(false);
  const [chatToTransferId, setChatToTransferId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);








  // Search Modal

  // Assistant state
  const [assistants, setAssistants] = useState<any[]>([]);
  const [isCreateAssistantModalOpen, setIsCreateAssistantModalOpen] = useState(false);
    const [assistantToEdit, setAssistantToEdit] = useState<any>(null);
  const [assistantToDelete, setAssistantToDelete] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const loadAssistants = async () => {
    try {
      const { data, error } = await supabase.schema('droweder_ia').from('assistants').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error loading assistants:', error);
      } else {
        setAssistants(data || []);
      }
    } catch (err) {
      console.error('Exception loading assistants:', err);
    }
  };

  const handleCreateAssistant = async (name: string, description?: string, instructions?: string) => {
    if (assistantToEdit) {
      try {
        const { data, error } = await supabase
          .schema('droweder_ia')
          .from('assistants')
          .update({ name, description, instructions })
          .eq('id', assistantToEdit.id)
          .select();

        if (error) {
          console.error('Error updating assistant:', error);
          setToastMessage('Erro ao atualizar assistente: ' + error.message);
        } else if (data) {
          setAssistants(assistants.map(a => a.id === data[0].id ? data[0] : a));
          setToastMessage('Assistente atualizado com sucesso!');
        }
      } catch (err: any) {
        console.error('Exception updating assistant:', err);
        setToastMessage('Erro ao atualizar assistente.');
      } finally {
        setAssistantToEdit(null);
      }
    } else {
      try {
        const { data, error } = await supabase
          .schema('droweder_ia')
          .from('assistants')
          .insert([{ name, description, instructions, created_by: user?.id }])
          .select();

        if (error) {
          console.error('Error creating assistant:', error);
          setToastMessage('Erro ao criar assistente: ' + error.message);
        } else if (data) {
          setAssistants([data[0], ...assistants]);
          setToastMessage('Assistente criado com sucesso!');
        }
      } catch (err: any) {
        console.error('Exception creating assistant:', err);
        setToastMessage('Erro ao criar assistente.');
      }
    }
  };

  const handleDeleteAssistant = async () => {
    if (!assistantToDelete) return;
    try {
      const { error } = await supabase
        .schema('droweder_ia')
        .from('assistants')
        .delete()
        .eq('id', assistantToDelete.id);

      if (error) {
        console.error('Error deleting assistant:', error);
        setToastMessage('Erro ao excluir assistente: ' + error.message);
      } else {
        setAssistants(assistants.filter(a => a.id !== assistantToDelete.id));
        if (activeAssistantId === assistantToDelete.id) {
            setActiveAssistantId(null);
        }
        setToastMessage('Assistente excluído com sucesso!');
      }
    } catch (err) {
      console.error('Exception deleting assistant:', err);
      setToastMessage('Erro ao excluir assistente.');
    } finally {
      setAssistantToDelete(null);
    }
  };

  useEffect(() => {
    void loadAssistants();

  }, []);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [chatToRenameId, setChatToRenameId] = useState<string | null>(null);
  const [chatToRenameCurrentName, setChatToRenameCurrentName] = useState('');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [chatToShareId, setChatToShareId] = useState<string | null>(null);
  const [chatToShareTitle, setChatToShareTitle] = useState('');

  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDeleteId, setChatToDeleteId] = useState<string | null>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeAssistantId, setActiveAssistantId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('info');

  const showToast = (message: string, type: ToastType = 'info') => {
      setToastMessage(message);
      setToastType(type);
  };

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: userRecord, error: userError } = await supabase
        .schema('planintex')
        .from('profiles')
        .select('empresa_id, role, is_superadmin')
        .eq('id', user.id)
        .single();

      if (userRecord && !userError) {
        setUserProfile(userRecord);
          setCompanyId(userRecord.empresa_id);
      }

      // Fetch conversations
      const { data: convData, error: convError } = await supabase
          .schema('droweder_ia')
          .from('conversations')
          .select('*')
          .eq('is_archived', false)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

      if (convError) console.error('Error fetching conversations:', convError);
      if (convData) {
          setConversations(convData);
          if (convData.length > 0 && !activeConversationId) {
              setActiveConversationId(convData[0].id);
          }
      }

      // Fetch projects
      const { data: projData, error: projError } = await supabase
          .schema('droweder_ia')
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

      if (projError) {
        console.log('Could not fetch projects, possibly table does not exist yet:', projError.message);
      } else if (projData) {
        setProjects(projData);
      }
    };

    fetchData();
  }, [user]);

  const handleCreateProject = async (name: string, category?: string) => {
    if (!user || !companyId) {
        showToast("Erro: Usuário ou empresa não identificados.", "error");
        return;
    }

    try {
        const newProject = {
           created_by: user.id,
           company_id: companyId,
           name: name,
           description: category || '',
        };

        const { data, error } = await supabase
           .schema('droweder_ia')
           .from('projects')
           .insert([newProject])
           .select();

        if (error) {
           console.error("Failed to create project in DB:", error);
           showToast(`Erro ao criar projeto: ${error.message}`, "error");
        } else if (data) {
           setProjects(prev => [...data, ...prev]);
           showToast("Projeto criado com sucesso!", "success");
        }
    } catch (e: any) {
         console.error("Exception creating project", e);
         showToast(`Erro inesperado: ${e.message}`, "error");
    }
  };

  const handleTransferToProjectClick = (chatId: string) => {
      setOpenChatMenuId(null);
      if (projects.length === 0) {
          setIsNoProjectsWarningOpen(true);
      } else {
          setChatToTransferId(chatId);
          setIsSelectProjectModalOpen(true);
      }
  };

  const executeTransferChat = async (projectId: string) => {
      if (!chatToTransferId) return;

      const { error } = await supabase
          .schema('droweder_ia')
          .from('conversations')
          .update({ project_id: projectId })
          .eq('id', chatToTransferId);

      if (error) {
          console.error('Error transferring chat:', error);
          showToast('Erro ao transferir chat para o projeto.', 'error');
      } else {
          // Remover da lista geral, pois o chat foi movido para o projeto
          setConversations(prev => prev.filter(c => c.id !== chatToTransferId));
          if (activeConversationId === chatToTransferId) {
              setActiveConversationId(null);
              navigate('/chat');
          }
      }

      setIsSelectProjectModalOpen(false);
      setChatToTransferId(null);
  };

  const handleNewChat = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveConversationId(null);
    setActiveAssistantId(null);
    navigate('/chat');
  };

  const handleDeleteChat = async (id: string) => {
    // Optimistically update UI
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
        setActiveConversationId(null);
        navigate('/chat');
    }

    const { error } = await supabase
        .schema('droweder_ia')
        .from('conversations')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting chat:', error);
        // Optionally refetch conversations here if delete fails to restore state
    }
  };

  // Derive display name from user metadata or email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const companyName = user?.user_metadata?.company_name || 'Minha Empresa'; // In a real app, fetch from relation

  return (
    <div className="relative flex h-screen font-sans bg-slate-50 dark:bg-[#0B0F19] selection:bg-blue-500/30 overflow-hidden">
      <AuroraModalBackground />
      {/* Sidebar - Multiplier AI Style */}
      <aside
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
      className={`${!isEffectivelyExpanded ? 'w-20' : 'w-72'} border-r border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 backdrop-blur-xl border-slate-200 dark:border-white/10 hidden md:flex flex-col z-10 transition-all duration-300 shrink-0`}>

        {/* Header da Sidebar */}
        <div className={`h-12 flex items-center px-4 border-b border-slate-200 dark:border-slate-200 dark:border-white/10 ${!isEffectivelyExpanded ? 'justify-center' : 'justify-between'}`}>
             {isEffectivelyExpanded && (
                <>
                  <div className="flex items-center">
                      <img src="https://phofwpyxbeulodrzfdjq.supabase.co/storage/v1/object/public/imagens_app/logo_droweder_IA.png" alt="DRoweder IA" className="h-6 object-contain" />
                  </div>
                </>
             )}
             <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg hover: dark: dark:hover: transition-colors"
                title={isSidebarCollapsed ? "Fixar Sidebar" : "Desafixar Sidebar"}
             >
                <Sidebar size={18} className={!isEffectivelyExpanded ? "rotate-180" : ""} />
             </button>
        </div>

        {/* Menu Principal */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700">

          {/* Menu Principal */}
          <div className="p-3 space-y-1">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 h-10 px-3 mb-2 rounded-xl bg-blue-600 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all text-sm font-medium"
              >
                <Plus size={20} />
                {isEffectivelyExpanded && <span>Novo Chat</span>}
              </button>
              <button
                onClick={() => navigate("/search")}
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium ${isActive("/search") ? "bg-slate-100 text-blue-600 border-r-2 border-blue-500 dark:bg-white/10 dark:text-white dark:border-white/50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
                title="Buscar em chats"
              >
                <Search size={20} />
                {isEffectivelyExpanded && <span>Buscar em chats</span>}
              </button>
              <button
                onClick={() => navigate('/files')}
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium ${isActive('/files') ? 'bg-slate-100 text-blue-600 border-r-2 border-blue-500 dark:bg-white/10 dark:text-white dark:border-white/50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'}`}
                title="Arquivos"
              >
                <FileText size={20} className={isActive('/files') ? 'text-blue-600 dark:text-white' : ''} />
                {isEffectivelyExpanded && <span>Arquivos</span>}
              </button>
              <button
                onClick={() => navigate('/projects')}
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium ${isActive('/projects') ? 'bg-slate-100 text-blue-600 border-r-2 border-blue-500 dark:bg-white/10 dark:text-white dark:border-white/50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'}`}
                title="Projetos"
              >
                <Folder size={20} className={isActive('/projects') ? 'text-blue-600 dark:text-white' : ''} />
                {isEffectivelyExpanded && <span>Projetos</span>}
              </button>
              <button
                onClick={() => navigate("/assistants")}
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium ${isActive("/assistants") ? "bg-slate-100 text-blue-600 border-r-2 border-blue-500 dark:bg-white/10 dark:text-white dark:border-white/50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
                title="Assistentes"
              >
                <Bot size={20} />
                {isEffectivelyExpanded && <span>Assistentes</span>}
              </button>
              <button
                onClick={() => navigate("/archived")}
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white`}
                title="Chats Arquivados"
              >
                <Archive size={20} />
                {isEffectivelyExpanded && <span>Chats Arquivados</span>}
              </button>
          </div>

          {/* Collapsible Sections */}
          {isEffectivelyExpanded && (
            <>
              {/* Conversas Recentes */}
              <div className="pt-2">
                 <button
                    onClick={() => setIsRecentChatsOpen(!isRecentChatsOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold dark: uppercase tracking-wider hover: dark:hover: transition-colors group"
                 >
                    CONVERSAS RECENTES
                    <ChevronDown size={14} className={`transition-transform duration-200 opacity-0 group-hover:opacity-100 ${isRecentChatsOpen ? '' : '-rotate-90'}`} />
                 </button>
                 {isRecentChatsOpen && (
                     <div className="mt-1 space-y-1">
                        {conversations.map(chat => (
                            <div key={chat.id} className="relative">
                                <div
                                    onClick={() => {
                                        setActiveConversationId(chat.id);
                                        if (!isActive('/chat')) navigate('/chat');
                                    }}
                                    className={`group relative flex items-center justify-between h-8 px-3 rounded-md cursor-pointer transition-colors ${activeConversationId === chat.id ? 'bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    <span className="text-sm truncate pr-6">{chat.title}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (openChatMenuId === chat.id) {
                                                setOpenChatMenuId(null);
                                            } else {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setChatMenuPosition({
                                                    top: rect.bottom,
                                                    left: rect.right
                                                });
                                                setOpenChatMenuId(chat.id);
                                            }
                                        }}
                                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover: dark:hover: rounded dark: hover: hover:text-white transition-all"
                                    >
                                        <MoreVertical size={14} />
                                    </button>
                                </div>
                                {openChatMenuId === chat.id && createPortal(
                                    <div
                                        ref={chatMenuRef}
                                        style={{
                                            position: 'fixed',
                                            top: `${chatMenuPosition.top + 4}px`,
                                            left: `${Math.min(chatMenuPosition.left - 240, window.innerWidth - 250)}px`,
                                            zIndex: 9999
                                        }}
                                        className="w-60 dark: backdrop-blur-xl border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-2"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenChatMenuId(null);
                                                setChatToShareId(chat.id);
                                                setChatToShareTitle(chat.title || 'Chat');
                                                setIsShareModalOpen(true);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm dark: hover: dark:hover: transition-colors"
                                        >
                                            <Share size={16} />
                                            Compartilhar
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenChatMenuId(null);
                                                setIsGroupChatModalOpen(true);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm dark: hover: dark:hover: transition-colors"
                                        >
                                            <UserPlus size={16} />
                                            Iniciar um chat em grupo
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenChatMenuId(null);
                                                setChatToRenameId(chat.id);
                                                setChatToRenameCurrentName(chat.title || 'Novo Chat');
                                                setIsRenameModalOpen(true);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm dark: hover: dark:hover: transition-colors"
                                        >
                                            <Pencil size={16} />
                                            Renomear
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTransferToProjectClick(chat.id);
                                            }}
                                            className="w-full flex items-center justify-between px-4 py-2 text-sm dark: hover: dark:hover: transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Folder size={16} />
                                                Mover para o projeto
                                            </div>
                                            <ChevronRight size={16} />
                                        </button>

                                        <div className="h-px dark: my-1 mx-4"></div>

                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                setOpenChatMenuId(null);

                                                const newPinnedStatus = !chat.is_pinned;
                                                setConversations(prev => {
                                                    const updated = prev.map(c => c.id === chat.id ? { ...c, is_pinned: newPinnedStatus } : c);
                                                    return updated.sort((a, b) => {
                                                        if (a.is_pinned === b.is_pinned) {
                                                            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                                        }
                                                        return a.is_pinned ? -1 : 1;
                                                    });
                                                });

                                                const { error } = await supabase.schema('droweder_ia').from('conversations').update({ is_pinned: newPinnedStatus }).eq('id', chat.id);

                                                if (error) {
                                                    setConversations(prev => {
                                                        const reverted = prev.map(c => c.id === chat.id ? { ...c, is_pinned: !newPinnedStatus } : c);
                                                        return reverted.sort((a, b) => {
                                                            if (a.is_pinned === b.is_pinned) {
                                                                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                                                            }
                                                            return a.is_pinned ? -1 : 1;
                                                        });
                                                    });
                                                    showToast("Erro ao fixar o chat.", "error");
                                                } else {
                                                    showToast(newPinnedStatus ? "Chat fixado com sucesso." : "Chat desfixado com sucesso.", "success");
                                                }
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm dark: hover: dark:hover: transition-colors"
                                        >
                                            <Pin size={16} className={chat.is_pinned ? "text-blue-500" : ""} />
                                            {chat.is_pinned ? 'Desfixar chat' : 'Fixar chat'}
                                        </button>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                setOpenChatMenuId(null);

                                                setConversations(prev => prev.filter(c => c.id !== chat.id));
                                                const { error } = await supabase.schema('droweder_ia').from('conversations').update({ is_archived: true }).eq('id', chat.id);

                                                if (error) {
                                                    setConversations(prev => [...prev, chat]);
                                                    showToast("Erro ao arquivar o chat.", "error");
                                                } else {
                                                    showToast("Chat arquivado.", "info");
                                                    if (activeConversationId === chat.id) {
                                                        setActiveConversationId(null);
                                                        navigate('/');
                                                    }
                                                }
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm dark: hover: dark:hover: transition-colors"
                                        >
                                            <Archive size={16} />
                                            Arquivar
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setChatToDeleteId(chat.id);
                                                setIsDeleteModalOpen(true);
                                                setOpenChatMenuId(null);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 text-[#f87171] hover: dark:hover: transition-colors"
                                        >
                                            <Trash2 size={16} />
                                            Excluir
                                        </button>
                                    </div>,
                                    document.body
                                )}
                            </div>
                        ))}
                     </div>
                 )}
              </div>
            </>
          )}

        </div>


        {/* Admin Links */}
        <div className="px-3 pt-3 pb-2 space-y-1 border-t border-slate-200 dark:border-slate-200 dark:border-white/10 mt-auto">
            {(userProfile?.role === 'Admin' || userProfile?.is_superadmin) && (
                <button
                onClick={() => navigate('/super-admin/companies')}
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium ${isActive('/super-admin/companies') ? 'bg-slate-100 text-blue-600 border-r-2 border-blue-500 dark:bg-white/10 dark:text-white dark:border-white/50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'}`}
                title="Empresas (Admin)"
                >
                <Building2 size={20} className={isActive('/super-admin/companies') ? 'text-blue-600 dark:text-white' : ''} />
                {isEffectivelyExpanded && <span>Empresas</span>}
                </button>
            )}
        </div>

        {/* User Menu (Bottom) */}
        <div className="p-3">
          <div className="relative" ref={userMenuRef}>
             <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center ${!isEffectivelyExpanded ? 'justify-center' : 'gap-3'} hover:bg-white/10 p-2 rounded-md transition-colors text-left group`}
             >
                <div className="w-8 h-8 bg-blue-600 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium uppercase flex-shrink-0">
                    {displayName.substring(0, 2)}
                </div>
                {isEffectivelyExpanded && (
                    <>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium dark: truncate group-hover: dark:group-hover:text-white">{displayName}</p>
                            <p className="text-xs dark: truncate">{companyName}</p>
                        </div>
                        <ChevronDown size={14} className="dark: group-hover: dark:group-hover:" />
                    </>
                )}
             </button>

                          {/* User Menu Dropdown */}
             {showUserMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 text-slate-700 dark:text-gray-200">
                    <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100 dark:border-[#2C2C2E] mb-1">
                         <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm text-white font-medium uppercase flex-shrink-0">
                             {displayName.substring(0, 2)}
                         </div>
                         <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{displayName}</p>
                             <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user?.email}</p>
                         </div>
                    </div>

                    <button
                        onClick={() => { navigate('/customization'); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                        <Palette size={16} className="text-slate-400 dark:text-gray-400" />
                        <span>Personalização</span>
                    </button>

                    <button
                        onClick={() => { setIsProfileOpen(true); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                        <User size={16} className="text-slate-400 dark:text-gray-400" />
                        <span>Perfil</span>
                    </button>

                    <button
                        onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                        <SettingsIcon size={16} className="text-slate-400 dark:text-gray-400" />
                        <span>Configurações</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-[#2C2C2E] my-1"></div>

                    <button
                        onClick={() => { navigate('/dashboard/billing'); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                        <CreditCard size={16} className="text-slate-400 dark:text-gray-400" />
                        <span>Faturamento</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-[#2C2C2E] my-1"></div>

                    <button
                        onClick={() => { toggleTheme(); setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between transition-colors"
                    >
                        <div className="flex items-center gap-3">
                           {theme === 'light' ? <Moon size={16} className="text-slate-400 dark:text-gray-400" /> : <Sun size={16} className="text-slate-400 dark:text-gray-400" />}
                           <span>{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
                        </div>
                    </button>

                    <button
                        onClick={() => { setShowUserMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                        <HelpCircle size={16} className="text-slate-400 dark:text-gray-400" />
                        <span>Ajuda</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-[#2C2C2E] my-1"></div>

                    <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                        <LogOut size={16} className="text-slate-400 dark:text-gray-400" />
                        <span>Sair</span>
                    </button>
                </div>
             )}
          </div>
        </div>
      </aside>

      {/* Modals */}
      <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          onCreate={handleCreateProject}
      />

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <CreateAssistantModal
        isOpen={isCreateAssistantModalOpen}
        onClose={() => {
          setIsCreateAssistantModalOpen(false);
          setAssistantToEdit(null);
        }}
        onCreate={(name, description, instructions) => {
          void handleCreateAssistant(name, description, instructions);
        }}
        assistantToEdit={assistantToEdit}
      />

      <NoProjectsWarningModal
          isOpen={isNoProjectsWarningOpen}
          onClose={() => setIsNoProjectsWarningOpen(false)}
          onConfirm={() => setIsCreateProjectModalOpen(true)}
      />

      <SelectProjectModal
        isOpen={isSelectProjectModalOpen}
        onClose={() => {
            setIsSelectProjectModalOpen(false);
            setChatToTransferId(null);
        }}
        projects={projects}
        onSelectProject={executeTransferChat}
      />

      <RenameChatModal
        isOpen={isRenameModalOpen}
        onClose={() => {
            setIsRenameModalOpen(false);
            setChatToRenameId(null);
        }}
        currentName={chatToRenameCurrentName}
        onRename={async (newName: string) => {
            if (!chatToRenameId) return;
            // Optimistic update
            setConversations(prev => prev.map(c => c.id === chatToRenameId ? { ...c, title: newName } : c));
            const { error } = await supabase.schema('droweder_ia').from('conversations').update({ title: newName }).eq('id', chatToRenameId);
            if (error) {
                console.error("Error renaming chat:", error);
                showToast("Erro ao renomear o chat.", "error");
            } else {
                showToast("Chat renomeado com sucesso.", "success");
            }
        }}
      />

      <ShareChatModal
        isOpen={isShareModalOpen}
        onClose={() => {
            setIsShareModalOpen(false);
            setChatToShareId(null);
        }}
        chatId={chatToShareId}
        chatTitle={chatToShareTitle}
      />

      <GroupChatModal
        isOpen={isGroupChatModalOpen}
        onClose={() => setIsGroupChatModalOpen(false)}
        onConfirm={() => {
            setIsGroupChatModalOpen(false);
            showToast("Chat em grupo criado com sucesso.", "success");
        }}
      />

      <DeleteChatModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
            setIsDeleteModalOpen(false);
            setChatToDeleteId(null);
        }}
        onConfirm={() => {
            if (chatToDeleteId) {
                handleDeleteChat(chatToDeleteId);
                setChatToDeleteId(null);
            }
        }}
      />







      {assistantToDelete && (
        <DeleteAssistantModal
            isOpen={!!assistantToDelete}
            onClose={() => setAssistantToDelete(null)}
            onConfirm={handleDeleteAssistant}
            assistantName={assistantToDelete.name}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col bg-transparent">
        <Outlet context={{ conversations, setConversations, activeConversationId, setActiveConversationId, activeAssistantId, setActiveAssistantId, assistants } satisfies LayoutContextType} />
      </main>
    </div>
  );
};

export default Layout;
