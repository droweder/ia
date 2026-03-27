#!/bin/bash
awk '
/title="Arquivos"/ {
    print $0
    getline
    print $0
    getline
    print $0
    getline
    print $0
    print "              <button"
    print "                onClick={() => navigate(\x27/projects\x27)}"
    print "                className={`w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium ${isActive(\x27/projects\x27) ? \x27bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border-r-2 border-slate-400 dark:border-white/50\x27 : \x27text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white\x27}`}"
    print "                title=\"Projetos\""
    print "              >"
    print "                <Folder size={20} className={isActive(\x27/projects\x27) ? \x27text-slate-900 dark:text-white\x27 : \x27\x27} />"
    print "                {!isSidebarCollapsed && <span>Projetos</span>}"
    print "              </button>"
    next
}
{ print $0 }
' src/components/Layout.tsx > temp_layout.tsx
mv temp_layout.tsx src/components/Layout.tsx
