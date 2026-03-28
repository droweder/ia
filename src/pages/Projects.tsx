import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Folder, Plus, MoreVertical, Pencil, Trash2, Calendar, MessageSquare, ChevronLeft, Clock } from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { RenameProjectModal } from '../components/RenameProjectModal';
import { DeleteProjectModal } from '../components/DeleteProjectModal';
import { Toast } from '../components/Toast';
import type { ToastType } from '../components/Toast';
import { createPortal } from 'react-dom';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected project state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { setActiveConversationId } = useOutletContext<any>();
  const [activeProject, setActiveProject] = useState<any>(null);
  const [projectConversations, setProjectConversations] = useState<any[]>([]);
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedProjectName, setSelectedProjectName] = useState<string>('');

  // Dropdown menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');

  const showToast = (message: string, type: ToastType = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const loadProjectChats = async (project: any) => {
    setActiveProject(project);
    setIsChatsLoading(true);
    try {
      const { data, error } = await supabase
        .schema('droweder_ia')
        .from('conversations')
        .select('*')
        .eq('project_id', project.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjectConversations(data || []);
    } catch (err) {
      console.error('Error loading project chats:', err);
      showToast('Erro ao carregar chats do projeto.', 'error');
    } finally {
      setIsChatsLoading(false);
    }
  };

  const handleOpenChat = (chatId: string) => {
    setActiveConversationId(chatId);
    navigate('/chat');
  };


  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .schema('droweder_ia')
        .from('projects')
        .select(`
          id,
          name,
          created_at,
          conversations (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      showToast('Erro ao carregar projetos.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (name: string) => {
    try {
      const { data, error } = await supabase
        .schema('droweder_ia')
        .from('projects')
        .insert([{ name, created_by: user?.id }])
        .select(`id, name, created_at, conversations(count)`)
        .single();

      if (error) throw error;
      if (data) {
        setProjects([data, ...projects]);
        showToast('Projeto criado com sucesso.');
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      showToast(error.message || 'Erro ao criar projeto.', 'error');
    }
  };

  const handleRename = async (newName: string) => {
    if (!selectedProjectId) return;
    try {
      const { error } = await supabase
        .schema('droweder_ia')
        .from('projects')
        .update({ name: newName })
        .eq('id', selectedProjectId);

      if (error) throw error;

      setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, name: newName } : p));
      showToast('Projeto renomeado com sucesso.');
    } catch (error: any) {
      console.error('Error renaming project:', error);
      showToast(error.message || 'Erro ao renomear projeto.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedProjectId) return;
    try {
      const { error } = await supabase
        .schema('droweder_ia')
        .from('projects')
        .delete()
        .eq('id', selectedProjectId);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== selectedProjectId));
      showToast('Projeto excluído com sucesso.');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      showToast(error.message || 'Erro ao excluir projeto.', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent overflow-hidden">

      {activeProject ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveProject(null)}
                className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-white flex items-center gap-3">
                  <Folder className="text-blue-500" size={28} />
                  {activeProject.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                  Conversas e arquivos do projeto
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                navigate('/chat');
                // The new chat logic in Layout will need to know to assign to this project.
                // For now, they can create a new chat and move it, or we can use local storage.
                localStorage.setItem('droweder_ia_new_chat_project', activeProject.id);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
            >
              <Plus size={18} />
              Nova Conversa
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700">
            {isChatsLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : projectConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[40vh] text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare size={32} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Nenhuma conversa neste projeto</h3>
                <p className="text-slate-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                  Crie uma nova conversa para começar a trabalhar neste projeto.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projectConversations.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => handleOpenChat(chat.id)}
                    className="group flex flex-col p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                        <MessageSquare size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1 truncate">{chat.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1 mt-auto">
                      <Clock size={12} />
                      {new Date(chat.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
      <>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white flex items-center gap-3">
            <Folder className="text-blue-500" size={28} />
            Meus Projetos
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Organize seus chats, arquivos e instruções em espaços de trabalho dedicados.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          Novo Projeto
        </button>
      </div>

      {/* Main Content (Grid) */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700">

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
               <Folder size={32} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Nenhum projeto ainda</h3>
            <p className="text-slate-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
              Projetos ajudam você a organizar conversas específicas em um só lugar. Crie seu primeiro projeto para começar.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md"
            >
              <Plus size={18} />
              Criar Projeto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

            {/* Create New Card */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="group flex flex-col items-center justify-center min-h-[160px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={20} className="text-slate-600 dark:text-gray-300" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-gray-300">Novo Projeto</span>
            </button>

            {/* Project Cards */}
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => loadProjectChats(project)}
                className="group relative flex flex-col p-5 cursor-pointer min-h-[160px] rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Folder size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (openMenuId === project.id) {
                        setOpenMenuId(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPosition({ top: rect.bottom, left: rect.right });
                        setOpenMenuId(project.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="flex-1 min-h-0">
                  <h3 className="text-base font-semibold text-slate-800 dark:text-white truncate mb-1" title={project.name}>
                    {project.name}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400 mt-auto pt-4">
                    <div className="flex items-center gap-1.5" title="Data de criação">
                      <Calendar size={14} />
                      <span>{new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Chats neste projeto">
                      <MessageSquare size={14} />
                      <span>{project.conversations?.[0]?.count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Dropdown Menu via Portal */}
                {openMenuId === project.id && createPortal(
                  <div
                    ref={menuRef}
                    style={{
                      position: 'fixed',
                      top: `${menuPosition.top + 4}px`,
                      left: `${menuPosition.left}px`,
                      transform: 'translateX(-100%)',
                      zIndex: 9999
                    }}
                    className="w-48 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        setSelectedProjectId(project.id);
                        setSelectedProjectName(project.name);
                        setIsRenameOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <Pencil size={16} />
                      Renomear
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-white/10 my-1 mx-4"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        setSelectedProjectId(project.id);
                        setIsDeleteOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
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

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />

      <RenameProjectModal
        isOpen={isRenameOpen}
        onClose={() => {
          setIsRenameOpen(false);
          setSelectedProjectId(null);
          setSelectedProjectName('');
        }}
        currentName={selectedProjectName}
        onRename={handleRename}
      />

      <DeleteProjectModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProjectId(null);
        }}
        onConfirm={handleDelete}
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
