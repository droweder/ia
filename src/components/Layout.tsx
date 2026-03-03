import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Sun, Moon, LogOut, ChevronDown, Plus, PanelLeft, Search, FileText, Bot, FolderKanban, MoreVertical, Layers, Share, UserPlus, Pencil, Folder, Pin, Archive, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { CreateProjectModal } from './CreateProjectModal';
import { NoProjectsWarningModal } from './NoProjectsWarningModal';
import { SelectProjectModal } from './SelectProjectModal';
import { RenameChatModal } from './RenameChatModal';
import { ShareChatModal } from './ShareChatModal';
import { GroupChatModal } from './GroupChatModal';
import { Toast } from './Toast';
import type { ToastType } from './Toast';

export interface LayoutContextType {
    conversations: any[];
    setConversations: React.Dispatch<React.SetStateAction<any[]>>;
    activeConversationId: string | null;
    setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
}

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAssistantsOpen, setIsAssistantsOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isRecentChatsOpen, setIsRecentChatsOpen] = useState(true);
  const [openChatMenuId, setOpenChatMenuId] = useState<string | null>(null);

  // Project state
  const [projects, setProjects] = useState<any[]>([]);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isNoProjectsWarningOpen, setIsNoProjectsWarningOpen] = useState(false);
  const [isSelectProjectModalOpen, setIsSelectProjectModalOpen] = useState(false);
  const [chatToTransferId, setChatToTransferId] = useState<string | null>(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [chatToRenameId, setChatToRenameId] = useState<string | null>(null);
  const [chatToRenameCurrentName, setChatToRenameCurrentName] = useState('');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [chatToShareId, setChatToShareId] = useState<string | null>(null);
  const [chatToShareTitle, setChatToShareTitle] = useState('');

  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false);

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
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
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (userRecord && !userError) {
          setCompanyId(userRecord.empresa_id);
      }

      // Fetch conversations
      const { data: convData, error: convError } = await supabase
          .schema('droweder_ia')
          .from('conversations')
          .select('*')
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
    if (!user || !companyId) return;

    try {
        const newProject = {
           created_by: user.id,
           company_id: companyId,
           name: name,
           description: category || 'General Project',
        };

        const { data, error } = await supabase
           .schema('droweder_ia')
           .from('projects')
           .insert([newProject])
           .select();

        if (error) {
           console.warn("Failed to create project in DB:", error.message);
           setProjects(prev => [{id: Date.now(), ...newProject}, ...prev]);
        } else if (data) {
           setProjects(prev => [...data, ...prev]);
        }
    } catch (e) {
         console.error("Exception creating project", e);
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
    navigate('/chat');
  };

  const handleDeleteChat = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este chat?")) return;

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
    <div className="flex h-screen font-sans text-slate-800 dark:text-gray-100 transition-colors duration-200 bg-transparent selection:bg-[#7e639f]/30">
      {/* Sidebar - Multiplier AI Style */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} border-r border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl hidden md:flex flex-col z-10 transition-all duration-300`}>

        {/* Header da Sidebar */}
        <div className={`h-12 flex items-center px-4 border-b border-slate-200 dark:border-white/10 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
             {!isSidebarCollapsed && (
                <>
                  <div className="flex items-center">
                      <img src="https://phofwpyxbeulodrzfdjq.supabase.co/storage/v1/object/public/imagens_app/logo_droweder_IA.png" alt="DRoweder IA" className="h-6 object-contain" />
                  </div>
                  <button
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 dark:text-gray-400 dark:hover:bg-white/10 rounded-md transition-colors"
                  >
                      <PanelLeft size={18} />
                  </button>
                </>
             )}
             {isSidebarCollapsed && (
                 <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="relative flex items-center justify-center group w-8 h-8 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                 >
                     <img
                        src="https://phofwpyxbeulodrzfdjq.supabase.co/storage/v1/object/public/imagens_app/favicom_droweder.png"
                        alt="DRoweder IA"
                        className="w-6 h-6 object-contain transition-opacity duration-200 group-hover:opacity-0"
                     />
                     <PanelLeft size={18} className="absolute inset-0 m-auto text-slate-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                 </button>
             )}
        </div>

        {/* Menu Principal */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/20 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-white/30 scrollbar-track-transparent">

          <div className="space-y-1">
              <button
                onClick={handleNewChat}
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium ${isActive('/chat') && !activeConversationId ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border-r-2 border-slate-400 dark:border-white/50' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}`}
                title="Novo Chat"
              >
                <Plus size={20} className={isActive('/chat') && !activeConversationId ? 'text-slate-900 dark:text-white' : ''} />
                {!isSidebarCollapsed && <span>Novo Chat</span>}
              </button>
              <button
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white`}
                title="Buscar em chats"
              >
                <Search size={20} />
                {!isSidebarCollapsed && <span>Buscar em chats</span>}
              </button>
              <button
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white`}
                title="Arquivos"
              >
                <FileText size={20} />
                {!isSidebarCollapsed && <span>Arquivos</span>}
              </button>
              <button
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white`}
                title="Documentos"
              >
                <MessageSquare size={20} />
                {!isSidebarCollapsed && <span>Documentos</span>}
              </button>
              <button
                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white`}
                title="Categorias"
              >
                <Layers size={20} />
                {!isSidebarCollapsed && <span>Categorias</span>}
              </button>
          </div>

          {/* Collapsible Sections */}
          {!isSidebarCollapsed && (
            <>
              {/* Assistentes */}
              <div className="pt-2">
                 <button
                    onClick={() => setIsAssistantsOpen(!isAssistantsOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider hover:text-slate-800 dark:hover:text-gray-200 transition-colors group"
                 >
                    ASSISTENTES
                    <ChevronDown size={14} className={`transition-transform duration-200 opacity-0 group-hover:opacity-100 ${isAssistantsOpen ? '' : '-rotate-90'}`} />
                 </button>
                 {isAssistantsOpen && (
                     <div className="mt-1 space-y-1">
                        <button className="w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white">
                            <Bot size={20} />
                            <span>Explorar</span>
                        </button>
                     </div>
                 )}
              </div>

              {/* Projetos */}
              <div className="pt-2">
                 <button
                    onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider hover:text-slate-800 dark:hover:text-gray-200 transition-colors group"
                 >
                    PROJETOS
                    <ChevronDown size={14} className={`transition-transform duration-200 opacity-0 group-hover:opacity-100 ${isProjectsOpen ? '' : '-rotate-90'}`} />
                 </button>
                 {isProjectsOpen && (
                     <div className="mt-1 space-y-1">
                        <button
                           onClick={() => setIsCreateProjectModalOpen(true)}
                           className="w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white">
                            <FolderKanban size={20} />
                            <span>Novo Projeto</span>
                        </button>
                     </div>
                 )}
              </div>

              {/* Conversas Recentes */}
              <div className="pt-2">
                 <button
                    onClick={() => setIsRecentChatsOpen(!isRecentChatsOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider hover:text-slate-800 dark:hover:text-gray-200 transition-colors group"
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
                                    className={`group relative flex items-center justify-between h-8 px-3 rounded-md cursor-pointer transition-colors ${activeConversationId === chat.id ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    <span className="text-sm truncate pr-6">{chat.title}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenChatMenuId(openChatMenuId === chat.id ? null : chat.id);
                                        }}
                                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-300 dark:hover:bg-white/20 rounded text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                    >
                                        <MoreVertical size={14} />
                                    </button>
                                </div>
                                {openChatMenuId === chat.id && (
                                    <div className="absolute left-8 top-full mt-1 w-60 bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-2 z-50">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenChatMenuId(null);
                                                setChatToShareId(chat.id);
                                                setChatToShareTitle(chat.title || 'Chat');
                                                setIsShareModalOpen(true);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
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
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
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
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <Pencil size={16} />
                                            Renomear
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTransferToProjectClick(chat.id);
                                            }}
                                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Folder size={16} />
                                                Mover para o projeto
                                            </div>
                                            <ChevronRight size={16} />
                                        </button>

                                        <div className="h-px bg-slate-200 dark:bg-white/10 my-1 mx-4"></div>

                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                setOpenChatMenuId(null);

                                                // Toggle pin status (requires boolean column 'is_pinned' on 'conversations')
                                                const newPinnedStatus = !chat.is_pinned;
                                                setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, is_pinned: newPinnedStatus } : c));

                                                const { error } = await supabase.schema('droweder_ia').from('conversations').update({ is_pinned: newPinnedStatus }).eq('id', chat.id);

                                                if (error) {
                                                    // Rollback
                                                    setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, is_pinned: !newPinnedStatus } : c));
                                                    showToast("Erro ao fixar o chat.", "error");
                                                } else {
                                                    showToast(newPinnedStatus ? "Chat fixado com sucesso." : "Chat desfixado com sucesso.", "success");
                                                }
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <Pin size={16} className={chat.is_pinned ? "text-[#7e639f]" : ""} />
                                            {chat.is_pinned ? 'Desfixar chat' : 'Fixar chat'}
                                        </button>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                setOpenChatMenuId(null);

                                                // Archive chat
                                                setConversations(prev => prev.filter(c => c.id !== chat.id));
                                                const { error } = await supabase.schema('droweder_ia').from('conversations').update({ is_archived: true }).eq('id', chat.id);

                                                if (error) {
                                                    // Rollback
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
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <Archive size={16} />
                                            Arquivar
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteChat(chat.id);
                                                setOpenChatMenuId(null);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-[#f87171] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                            Excluir
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                     </div>
                 )}
              </div>
            </>
          )}

        </nav>

        {/* User Menu (Bottom) */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10">
          <div className="relative">
             <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-md transition-colors text-left group`}
             >
                <div className="w-8 h-8 bg-[#7e639f] rounded flex items-center justify-center text-xs text-white font-medium uppercase flex-shrink-0">
                    {displayName.substring(0, 2)}
                </div>
                {!isSidebarCollapsed && (
                    <>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-gray-200 truncate group-hover:text-slate-900 dark:group-hover:text-white">{displayName}</p>
                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{companyName}</p>
                        </div>
                        <ChevronDown size={14} className="text-slate-400 dark:text-gray-400 group-hover:text-slate-600 dark:group-hover:text-gray-200" />
                    </>
                )}
             </button>

             {/* User Menu Dropdown */}
             {showUserMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-lg shadow-xl py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                    <button
                        onClick={toggleTheme}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2"
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        <span>{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
                    </button>
                    <div className="border-t border-slate-100 dark:border-white/10 my-1"></div>
                    <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-2"
                    >
                        <LogOut size={16} />
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

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col bg-transparent">
        <Outlet context={{ conversations, setConversations, activeConversationId, setActiveConversationId } satisfies LayoutContextType} />
      </main>
    </div>
  );
};

export default Layout;
