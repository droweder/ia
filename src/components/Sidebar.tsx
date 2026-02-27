import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Shield,
  Sun,
  Moon,
  LogOut,
  Plus,
  Search,
  Folder,
  FileText,
  Tag,
  Compass,
  MoreHorizontal,
  PanelLeftClose,
  PenSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useChat, type Conversation } from '../contexts/ChatContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { conversations, loading: loadingHistory } = useChat();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive display name from user metadata or email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const companyName = user?.user_metadata?.company_name || 'Minha Empresa';

  const isActive = (path: string) => location.pathname === path;

  const groupConversations = (conversations: Conversation[]) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const groups: { [key: string]: Conversation[] } = {
          'Hoje': [],
          'Ontem': [],
          '7 dias anteriores': [],
          '30 dias anteriores': [],
      };

      conversations.forEach(conv => {
          const date = new Date(conv.created_at);
          if (date.toDateString() === today.toDateString()) {
              groups['Hoje'].push(conv);
          } else if (date.toDateString() === yesterday.toDateString()) {
              groups['Ontem'].push(conv);
          } else if (date > sevenDaysAgo) {
              groups['7 dias anteriores'].push(conv);
          } else if (date > thirtyDaysAgo) {
              groups['30 dias anteriores'].push(conv);
          }
      });

      return groups;
  };

  const groupedConversations = groupConversations(conversations);

  return (
    <aside className="w-[280px] bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col h-screen transition-colors duration-200 z-20">

        {/* Header: Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-5 pt-2">
            <div className="flex items-center gap-1.5 font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                <span>DRoweder</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="text-gray-400 dark:text-gray-500">AI</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <PanelLeftClose size={18} />
            </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 pb-4">
             <button
                onClick={() => navigate('/chat')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30 transition-colors text-sm font-medium text-left shadow-sm border border-purple-100 dark:border-purple-900/30"
             >
                <PenSquare size={18} />
                <span>Novo chat</span>
             </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">

            {/* Main Menu */}
            <div className="space-y-1">
                <button
                    onClick={() => navigate('/chat')}
                    className={`w-full flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/chat') && !location.pathname.startsWith('/chat/') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    <Search size={18} />
                    <span>Buscar em chats</span>
                </button>
                <Link
                    to="/files"
                    className={`w-full flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/files') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    <Folder size={18} />
                    <span>Arquivos</span>
                </Link>
                 <Link
                    to="/files"
                    className="w-full flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                    <FileText size={18} />
                    <span>Documentos</span>
                </Link>
                 <button className="w-full flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                    <Tag size={18} />
                    <span>Categorias</span>
                </button>
            </div>

            {/* Assistentes */}
            <div>
                <div className="px-2 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assistentes</div>
                 <Link
                    to="/assistants"
                    className={`w-full flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/assistants') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    <Compass size={18} />
                    <span>Explorar</span>
                </Link>
            </div>

             {/* Projetos (Mapping Legacy Apps here) */}
            <div>
                <div className="px-2 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Projetos</div>
                <Link
                    to="/projects"
                    className={`w-full flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${isActive('/projects') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    <Plus size={16} />
                    <span>Novo projeto</span>
                </Link>

                 <Link
                    to="/dashboard/billing"
                    className={`flex items-center gap-3 px-2 py-2 rounded-md transition-all duration-200 text-sm font-medium ${isActive('/dashboard/billing') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <CreditCard size={18} />
                    <span>Faturamento</span>
                  </Link>
                   <Link
                    to="/super-admin/companies"
                    className={`flex items-center gap-3 px-2 py-2 rounded-md transition-all duration-200 text-sm font-medium ${isActive('/super-admin/companies') ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                 >
                    <Shield size={18} />
                    <span>Gestão Empresas</span>
                 </Link>
            </div>

            {/* History Section */}
            <div>
                <div className="px-2 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Conversas Recentes</div>
                {loadingHistory ? (
                  <div className="px-2 py-2 text-xs text-gray-500">Carregando...</div>
                ) : (
                  Object.entries(groupedConversations).map(([group, convs]) => (
                      convs.length > 0 && (
                          <div key={group} className="mb-4">
                              <div className="px-2 py-1 text-[10px] font-semibold text-gray-300 uppercase tracking-wider">{group}</div>
                              {convs.map(conv => (
                                  <Link
                                      key={conv.id}
                                      to={`/chat/${conv.id}`}
                                      className={`block px-2 py-1.5 rounded-md text-sm truncate transition-colors font-medium ${isActive(`/chat/${conv.id}`) ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                  >
                                      {conv.title}
                                  </Link>
                              ))}
                          </div>
                      )
                  ))
                )}
                 {conversations.length === 0 && !loadingHistory && (
                  <div className="px-2 py-2 text-xs text-gray-500">Nenhuma conversa recente.</div>
              )}
            </div>

        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="relative">
             <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-xl transition-colors text-left group"
             >
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 font-medium uppercase border border-white dark:border-gray-600 ring-2 ring-gray-50 dark:ring-gray-900">
                    {displayName.substring(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
                    <p className="text-[10px] text-gray-500 truncate">{companyName}</p>
                </div>
                <MoreHorizontal size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
             </button>

             {/* User Menu Dropdown */}
             {showUserMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                    <button
                        onClick={toggleTheme}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        <span>{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        <span>Sair</span>
                    </button>
                </div>
             )}
          </div>
        </div>
      </aside>
  );
};

export default Sidebar;
