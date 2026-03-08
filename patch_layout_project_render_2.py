import sys

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

target = """                        {projects.map((project) => (
                           <button
                             key={project.id}
                             onClick={() => {/* Implement project navigation later if needed, or filter chats */}}
                             className="w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white group"
                           >
                             <Folder size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                             <span className="truncate flex-1 text-left">{project.name}</span>
                           </button>
                        ))}"""

replacement = """                        {projects.map((project) => (
                           <div key={project.id} className="relative group flex items-center">
                             <button
                               onClick={() => {/* Implement project navigation later if needed, or filter chats */}}
                               className="w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                             >
                               <Folder size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                               <span className="truncate flex-1 text-left pr-6">{project.name}</span>
                             </button>
                             <button
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     if (openProjectMenuId === project.id) {
                                         setOpenProjectMenuId(null);
                                     } else {
                                         const rect = e.currentTarget.getBoundingClientRect();
                                         setProjectMenuPosition({
                                             top: rect.bottom,
                                             left: rect.right
                                         });
                                         setOpenProjectMenuId(project.id);
                                     }
                                 }}
                                 className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-300 dark:hover:bg-white/20 rounded text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all"
                             >
                                 <MoreVertical size={14} />
                             </button>
                             {openProjectMenuId === project.id && createPortal(
                                 <div
                                     ref={projectMenuRef}
                                     style={{
                                         position: 'fixed',
                                         top: `${projectMenuPosition.top + 4}px`,
                                         left: `${projectMenuPosition.left}px`,
                                         transform: 'translateX(-100%)',
                                         zIndex: 9999
                                     }}
                                     className="w-48 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                                 >
                                     <button
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             setOpenProjectMenuId(null);
                                             setProjectToRenameId(project.id);
                                             setProjectToRenameCurrentName(project.name || 'Projeto');
                                             setIsRenameProjectModalOpen(true);
                                         }}
                                         className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                     >
                                         <Pencil size={16} />
                                         Renomear
                                     </button>

                                     <div className="h-px bg-slate-200 dark:bg-white/10 my-1 mx-4"></div>

                                     <button
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             setProjectToDeleteId(project.id);
                                             setIsDeleteProjectModalOpen(true);
                                             setOpenProjectMenuId(null);
                                         }}
                                         className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-[#f87171] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                     >
                                         <Trash2 size={16} />
                                         Excluir
                                     </button>
                                 </div>,
                                 document.body
                             )}
                           </div>
                        ))}"""

if target in content and "setProjectToRenameId" not in content:
    content = content.replace(target, replacement)
    with open("src/components/Layout.tsx", "w") as f:
        f.write(content)
    print("Patched project render loop")
else:
    print("Already patched or target not found")
