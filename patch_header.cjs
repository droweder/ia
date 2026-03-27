const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const oldHeader = `<div className={\`h-12 flex items-center px-4 border-b border-slate-200 dark:border-white/10 \${!isEffectivelyExpanded ? 'justify-center' : 'justify-between'}\`}>
             {isEffectivelyExpanded && (
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
        </div>`;

const newHeader = `<div className={\`h-12 flex items-center px-4 border-b border-slate-200 dark:border-white/10 \${!isEffectivelyExpanded ? 'justify-center' : 'justify-between'}\`}>
             {isEffectivelyExpanded && (
                <>
                  <div className="flex items-center">
                      <img src="https://phofwpyxbeulodrzfdjq.supabase.co/storage/v1/object/public/imagens_app/logo_droweder_IA.png" alt="DRoweder IA" className="h-6 object-contain" />
                  </div>
                </>
             )}
             <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
                title={isSidebarCollapsed ? "Fixar Sidebar" : "Desafixar Sidebar"}
             >
                <Sidebar size={18} className={!isEffectivelyExpanded ? "rotate-180" : ""} />
             </button>
        </div>`;

content = content.replace(oldHeader, newHeader);

// Wait, the regex missed earlier because the content had already been modified slightly or whitespace didn't match perfectly.
// Let's do a substring replace between `{/* Header da Sidebar */}` and `{/* Menu Principal */}`
const startIdx = content.indexOf('{/* Header da Sidebar */}');
const endIdx = content.indexOf('{/* Menu Principal */}');
if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx + 25) + `\n        <div className={\`h-12 flex items-center px-4 border-b border-slate-200 dark:border-white/10 \${!isEffectivelyExpanded ? 'justify-center' : 'justify-between'}\`}>
             {isEffectivelyExpanded && (
                <>
                  <div className="flex items-center">
                      <img src="https://phofwpyxbeulodrzfdjq.supabase.co/storage/v1/object/public/imagens_app/logo_droweder_IA.png" alt="DRoweder IA" className="h-6 object-contain" />
                  </div>
                </>
             )}
             <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
                title={isSidebarCollapsed ? "Fixar Sidebar" : "Desafixar Sidebar"}
             >
                <Sidebar size={18} className={!isEffectivelyExpanded ? "rotate-180" : ""} />
             </button>
        </div>\n\n        ` + content.substring(endIdx);
}

fs.writeFileSync('src/components/Layout.tsx', content);
