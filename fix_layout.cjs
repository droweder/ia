const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// The file got messed up due to overlapping replacements in bash.
// I will just wipe out the duplicated projects buttons and fix the Arquivos button

content = content.replace(
`                <FileText size={20} className={isActive('/files') ? 'text-slate-900 dark:text-white' : ''} />
                {!isSidebarCollapsed && <span>Arquivos</span>}
              <button
                onClick={() => navigate('/projects')}
                className={\`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium \${isActive('/projects') ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border-r-2 border-slate-400 dark:border-white/50' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}\`}
                title="Projetos"
              >
                <Folder size={20} className={isActive('/projects') ? 'text-slate-900 dark:text-white' : ''} />
                {!isSidebarCollapsed && <span>Projetos</span>}
              </button>
              <button
                onClick={() => navigate('/projects')}
                className={\`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium \${isActive('/projects') ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border-r-2 border-slate-400 dark:border-white/50' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}\`}
                title="Projetos"
              >
                <Folder size={20} className={isActive('/projects') ? 'text-slate-900 dark:text-white' : ''} />
                {!isSidebarCollapsed && <span>Projetos</span>}
              </button>
              </button>`,
`                <FileText size={20} className={isActive('/files') ? 'text-slate-900 dark:text-white' : ''} />
                {!isSidebarCollapsed && <span>Arquivos</span>}
              </button>
              <button
                onClick={() => navigate('/projects')}
                className={\`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium \${isActive('/projects') ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border-r-2 border-slate-400 dark:border-white/50' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}\`}
                title="Projetos"
              >
                <Folder size={20} className={isActive('/projects') ? 'text-slate-900 dark:text-white' : ''} />
                {!isSidebarCollapsed && <span>Projetos</span>}
              </button>`
);

fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
