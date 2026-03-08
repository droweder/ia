import sys

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

# I want to add mapping for projects under the Novo Projeto button.
target = """                        <button
                           onClick={() => setIsCreateProjectModalOpen(true)}
                           className="w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white">
                            <FolderKanban size={20} />
                            <span>Novo Projeto</span>
                        </button>"""

replacement = """                        <button
                           onClick={() => setIsCreateProjectModalOpen(true)}
                           className="w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white">
                            <Plus size={20} />
                            <span>Novo Projeto</span>
                        </button>
                        {projects.map((project) => (
                           <button
                             key={project.id}
                             onClick={() => {/* Implement project navigation later if needed, or filter chats */}}
                             className="w-full flex items-center gap-3 h-8 px-3 rounded-md transition-all duration-200 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white group"
                           >
                             <Folder size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                             <span className="truncate flex-1 text-left">{project.name}</span>
                           </button>
                        ))}"""

if target in content:
    content = content.replace(target, replacement)
    with open("src/components/Layout.tsx", "w") as f:
        f.write(content)
    print("Patched Layout.tsx successfully")
else:
    print("Could not find target string in Layout.tsx")
