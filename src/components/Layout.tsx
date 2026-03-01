import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, CreditCard, Shield, Sun, Moon, LogOut, ChevronDown, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Derive display name from user metadata or email
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const companyName = user?.user_metadata?.company_name || 'Minha Empresa'; // In a real app, fetch from relation

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Sidebar - ChatGPT Style */}
      <aside className="w-64 bg-gray-900 dark:bg-black border-r border-gray-800 hidden md:flex flex-col shadow-sm z-10 transition-colors duration-200 text-gray-100">

        {/* New Chat Button (Top) */}
        <div className="p-3">
             <button
                onClick={() => navigate('/chat')}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-md border border-gray-700 hover:bg-gray-800 transition-colors text-sm font-medium text-white shadow-sm"
             >
                <Plus size={16} />
                <span>Nova conversa</span>
             </button>
        </div>

        {/* Navigation / History Area */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 mt-2">Apps</div>

          <Link
            to="/chat"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm ${isActive('/chat') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
          >
            <MessageSquare size={16} />
            <span>Chat IA</span>
          </Link>
          <Link
            to="/dashboard/billing"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm ${isActive('/dashboard/billing') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
          >
            <CreditCard size={16} />
            <span>Faturamento</span>
          </Link>

          <div className="pt-4 mt-2 border-t border-gray-800">
             <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</div>
             <Link
                to="/super-admin/companies"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-sm ${isActive('/super-admin/companies') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
             >
                <Shield size={16} />
                <span>Gestão Empresas</span>
             </Link>
          </div>
        </nav>

        {/* User Menu (Bottom) */}
        <div className="p-3 border-t border-gray-800">
          <div className="relative">
             <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 hover:bg-gray-800 p-2 rounded-md transition-colors text-left group"
             >
                <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-xs text-white font-medium uppercase">
                    {displayName.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{companyName}</p>
                </div>
                <ChevronDown size={14} className="text-gray-500 group-hover:text-gray-300" />
             </button>

             {/* User Menu Dropdown */}
             {showUserMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                    <button
                        onClick={toggleTheme}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        <span>{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
                    </button>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        <span>Sair</span>
                    </button>
                </div>
             )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col bg-white dark:bg-gray-800 transition-colors duration-200">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
