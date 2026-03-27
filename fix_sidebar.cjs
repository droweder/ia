const fs = require('fs');

// We see that `Buscar em chats` got injected weirdly into the header of the sidebar next to the logo. Let's fix this block entirely.
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const badBlockRegex = /<div className=\{\`h-12 flex items-center px-4 border-b border-slate-200 dark:border-white\/10 \$\{isSidebarCollapsed \? 'justify-center' : 'justify-between'\}\`\}>[\s\S]*?{!\isSidebarCollapsed && <span>Chats Arquivados<\/span>}\s*<\/button>\s*<\/div>/m;

const correctBlock = `<div className={\`h-12 flex items-center px-4 border-b border-slate-200 dark:border-white/10 \${isSidebarCollapsed ? 'justify-center' : 'justify-between'}\`}>
             {!isSidebarCollapsed && (
                <>
                  <div className="flex items-center">
                      <img src="https://phofwpyxbeulodrzfdjq.supabase.co/storage/v1/object/public/imagens_app/logo_droweder_IA.png" alt="DRoweder IA" className="h-6 object-contain" />
                  </div>
                </>
             )}
             <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
                title={isSidebarCollapsed ? "Expandir Sidebar" : "Recolher Sidebar"}
             >
                <Sidebar size={18} className={isSidebarCollapsed ? "rotate-180" : ""} />
             </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700">

          {/* Menu Principal */}
          <div className="p-3 space-y-1">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 h-10 px-3 mb-2 rounded-xl bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all text-sm font-medium"
              >
                <Plus size={20} />
                {!isSidebarCollapsed && <span>Novo Chat</span>}
              </button>

              <button
                onClick={() => setIsSearchModalOpen(true)}
                className={\`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white\`}
                title="Buscar em chats"
              >
                <Search size={20} />
                {!isSidebarCollapsed && <span>Buscar em chats</span>}
              </button>

              <button
                onClick={() => navigate('/files')}
                className={\`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium \${isActive('/files') ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border-r-2 border-slate-400 dark:border-white/50' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}\`}
                title="Arquivos"
              >
                <FileText size={20} className={isActive('/files') ? 'text-slate-900 dark:text-white' : ''} />
                {!isSidebarCollapsed && <span>Arquivos</span>}
              </button>

              <button
                onClick={() => navigate('/projects')}
                className={\`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium \${isActive('/projects') ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border-r-2 border-slate-400 dark:border-white/50' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}\`}
                title="Projetos"
              >
                <Folder size={20} className={isActive('/projects') ? 'text-slate-900 dark:text-white' : ''} />
                {!isSidebarCollapsed && <span>Projetos</span>}
              </button>

              <button
                onClick={() => setIsExploreAssistantsModalOpen(true)}
                className={\`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white\`}
                title="Assistentes"
              >
                <Bot size={20} />
                {!isSidebarCollapsed && <span>Assistentes</span>}
              </button>

              <button
                onClick={() => setIsArchivedChatsModalOpen(true)}
                className={\`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white\`}
                title="Chats Arquivados"
              >
                <Archive size={20} />
                {!isSidebarCollapsed && <span>Chats Arquivados</span>}
              </button>
          </div>`;

if(content.match(badBlockRegex)) {
    content = content.replace(badBlockRegex, correctBlock);
    fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
    console.log("Replaced successfully!");
} else {
    console.log("Could not find the bad block to replace");
}
