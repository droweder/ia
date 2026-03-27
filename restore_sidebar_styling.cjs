const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// The main changes I saw in the blob that we missed:
// 1. The toggle button uses `Sidebar` instead of `PanelLeft` and is a `rounded-lg` p-1.5 element, not a `w-8 h-8` square.
// 2. The `Novo Chat` button is `bg-blue-600` and `rounded-xl`.
// 3. The wrapping `nav` was changed to `div` with `p-3 space-y-1`.

// Let's replace the `novo chat` button styling
const oldChatBtn = `              <button
                onClick={handleNewChat}
                className={\`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium \${isActive('/chat') && !activeConversationId ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border-r-2 border-slate-400 dark:border-white/50' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}\`}
                title="Novo Chat"
              >
                <Plus size={20} className={isActive('/chat') && !activeConversationId ? 'text-slate-900 dark:text-white' : ''} />
                {isEffectivelyExpanded && <span>Novo Chat</span>}
              </button>`;
const newChatBtn = `              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 h-10 px-3 mb-2 rounded-xl bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all text-sm font-medium"
              >
                <Plus size={20} />
                {isEffectivelyExpanded && <span>Novo Chat</span>}
              </button>`;
content = content.replace(oldChatBtn, newChatBtn);

// Also replace the layout wrapper from <nav> to <div> since that was part of the earlier fix
const oldNavStart = `<nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700 scrollbar-track-transparent">

          <div className="space-y-1">`;
const newNavStart = `<div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700">

          {/* Menu Principal */}
          <div className="p-3 space-y-1">`;
content = content.replace(oldNavStart, newNavStart);
content = content.replace("</nav>", "</div>");

// And fix the Sidebar toggle icon
const oldToggleIcon1 = `<button
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 dark:text-gray-400 dark:hover:bg-white/10 rounded-md transition-colors"
                  >
                      <PanelLeft size={18} />
                  </button>`;
const newToggleIcon1 = `<button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
                title={isSidebarCollapsed ? "Expandir Sidebar" : "Recolher Sidebar"}
             >
                <Sidebar size={18} className={isSidebarCollapsed ? "rotate-180" : ""} />
             </button>`;
content = content.replace(oldToggleIcon1, newToggleIcon1);

// We had two toggle buttons, one when expanded and one when collapsed. I'll just use the one unconditionally.
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
             )}`;

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
             </button>`;

content = content.replace(oldHeader, newHeader);

// Add missing Sidebar import if needed
if (!content.includes('Sidebar,')) {
    content = content.replace("import { PanelLeft", "import { PanelLeft, Sidebar");
}

fs.writeFileSync('src/components/Layout.tsx', content);
