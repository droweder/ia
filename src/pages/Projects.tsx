import React, { useEffect, useState } from 'react';
import { Briefcase, MoreHorizontal, Plus, Users, Clock, Loader2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  member_count?: number; // Simulated or fetched
}

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { companyId } = useChat();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchProjects();
    }
  }, [companyId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .schema('droweder_ia')
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError('Erro ao carregar projetos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !companyId || !user) return;

    setCreating(true);
    try {
      const { data: newProject, error } = await supabase
        .schema('droweder_ia')
        .from('projects')
        .insert({
          company_id: companyId,
          name: newProjectName,
          description: newProjectDesc,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => [newProject, ...prev]);
      setShowModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (err: any) {
      console.error('Create project error:', err);
      alert('Erro ao criar projeto.');
    } finally {
      setCreating(false);
    }
  };

  // Helper for consistent colors (hashed by ID)
  const getProjectColor = (id: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Projetos</h1>
           <p className="text-sm text-gray-500 mt-1">Organize suas conversas e arquivos por contexto.</p>
        </div>
        <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
            <Plus size={16} />
            Novo Projeto
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-200">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        )}

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800 h-40 rounded-2xl animate-pulse"></div>
                ))}
             </div>
        ) : projects.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
                <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhum projeto encontrado. Crie o primeiro!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-900/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 flex flex-col gap-4 cursor-pointer h-full">
                        <div className="flex justify-between items-start">
                            <div className={`w-10 h-10 rounded-lg ${getProjectColor(project.id)} bg-opacity-10 flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                                <Briefcase size={20} className="text-white opacity-90" />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 transition-colors line-clamp-1">{project.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-3">{project.description || "Sem descrição."}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50 dark:border-gray-700/50 mt-auto">
                            <div className="flex items-center gap-1">
                                <Users size={14} />
                                <span>{project.member_count || 1} membros</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Novo Projeto</h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Projeto</label>
                        <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Ex: Expansão Q4"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                        <textarea
                            value={newProjectDesc}
                            onChange={(e) => setNewProjectDesc(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white h-24 resize-none"
                            placeholder="Objetivos e escopo..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={creating || !newProjectName.trim()}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {creating && <Loader2 size={16} className="animate-spin" />}
                            Criar Projeto
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Projects;
