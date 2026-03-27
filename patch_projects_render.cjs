const fs = require('fs');

let content = fs.readFileSync('src/pages/Projects.tsx', 'utf8');

const detailView = `
      {activeProject ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveProject(null)}
                className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-white flex items-center gap-3">
                  <Folder className="text-blue-500" size={28} />
                  {activeProject.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                  Conversas e arquivos do projeto
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                navigate('/chat');
                // The new chat logic in Layout will need to know to assign to this project.
                // For now, they can create a new chat and move it, or we can use local storage.
                localStorage.setItem('droweder_ia_new_chat_project', activeProject.id);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
            >
              <Plus size={18} />
              Nova Conversa
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700">
            {isChatsLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : projectConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[40vh] text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare size={32} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Nenhuma conversa neste projeto</h3>
                <p className="text-slate-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                  Crie uma nova conversa para começar a trabalhar neste projeto.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projectConversations.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => handleOpenChat(chat.id)}
                    className="group flex flex-col p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/50 cursor-pointer transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                        <MessageSquare size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1 truncate">{chat.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1 mt-auto">
                      <Clock size={12} />
                      {new Date(chat.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
`;

if (!content.includes('activeProject ?')) {
    content = content.replace(
      "return (\n    <div className=\"flex-1 flex flex-col min-w-0 min-h-0 bg-transparent overflow-hidden\">\n      \n      {/* Header */}",
      "return (\n    <div className=\"flex-1 flex flex-col min-w-0 min-h-0 bg-transparent overflow-hidden\">\n" + detailView + "\n      {/* Header */}"
    );

    // Add closing tag for activeProject ternary
    content = content.replace(
      "        <DeleteProjectModal\n        isOpen={isDeleteOpen}",
      "      )} \n\n      <DeleteProjectModal\n        isOpen={isDeleteOpen}"
    );

    fs.writeFileSync('src/pages/Projects.tsx', content);
}
