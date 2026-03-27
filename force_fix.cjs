const fs = require('fs');

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const target = `              <button
                onClick={() => setIsExploreAssistantsModalOpen(true)}
                className={\`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white\`}
                title="Assistentes"
              >`;

const replacement = `              <button
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
              >`;

if(layout.includes(target)) {
    layout = layout.replace(target, replacement);
    fs.writeFileSync('src/components/Layout.tsx', layout, 'utf8');
} else {
    console.log("Still failed to find target");
}
