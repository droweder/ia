import React from 'react';
import { Briefcase, MoreHorizontal, Plus, Users, Clock } from 'lucide-react';

const Projects: React.FC = () => {
  const projects = [
    { id: 1, name: 'Expansão Latam', description: 'Estratégia de mercado para expansão na América Latina.', members: 5, updated: '2h atrás', color: 'bg-blue-500' },
    { id: 2, name: 'Marketing Digital Q4', description: 'Campanhas de final de ano e SEO.', members: 3, updated: '1d atrás', color: 'bg-purple-500' },
    { id: 3, name: 'Revisão Financeira 2024', description: 'Auditoria interna e planejamento orçamentário.', members: 2, updated: '3d atrás', color: 'bg-emerald-500' },
    { id: 4, name: 'Desenvolvimento App Mobile', description: 'MVP do aplicativo para clientes finais.', members: 8, updated: '5d atrás', color: 'bg-orange-500' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Projetos</h1>
           <p className="text-sm text-gray-500 mt-1">Organize suas conversas e arquivos por contexto.</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
            <Plus size={16} />
            Novo Projeto
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
                <div key={project.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-900/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 flex flex-col gap-4 cursor-pointer">
                    <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-lg ${project.color} bg-opacity-10 flex items-center justify-center text-white font-bold text-lg`}>
                            <Briefcase size={20} className="text-gray-900 dark:text-white opacity-80" />
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 transition-colors">{project.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50 dark:border-gray-700/50 mt-auto">
                        <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{project.members} membros</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{project.updated}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
