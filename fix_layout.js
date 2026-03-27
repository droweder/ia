const fs = require('fs');

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// The awk script kept getting tripped up by my manual retries. Let's do this cleaner.
const targetPattern = `                title="Arquivos"
              >
                <FileText size={20} className={isActive('/files') ? 'text-slate-900 dark:text-white' : ''} />
                {!isSidebarCollapsed && <span>Arquivos</span>}
              </button>`;

const replacement = `                title="Arquivos"
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
              </button>`;

// Reset to a clean slate using git
const { execSync } = require('child_process');
execSync('git checkout src/components/Layout.tsx');

// Read clean file
layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (layout.includes(targetPattern)) {
    layout = layout.replace(targetPattern, replacement);
    fs.writeFileSync('src/components/Layout.tsx', layout, 'utf8');
    console.log("Success");
} else {
    console.log("Target pattern not found.");
}
