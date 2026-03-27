import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface SelectProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

export function SelectProjectModal({ isOpen, onClose, projects, onSelectProject }: SelectProjectModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  if (!isOpen) return null;

  const handleSelect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    onSelectProject(selectedProjectId);
    setSelectedProjectId(''); // Reset for next time
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-6 shadow-xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Transferir para Projeto</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSelect}>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Selecione o projeto de destino
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/40 dark:bg-white/5 backdrop-blur-sm px-4 py-3 text-sm text-slate-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none dark:border-white/10 dark:text-white shadow-sm transition-colors"
              required
            >
              <option value="" disabled className="bg-white dark:bg-slate-800 text-slate-800 dark:text-gray-200">
                Escolha um projeto...
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-gray-200">
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedProjectId}
              className="rounded-full bg-slate-900 dark:bg-white px-6 py-2.5 text-sm font-semibold text-white dark:text-black hover:opacity-90 disabled:opacity-50 disabled:bg-slate-200 disabled:dark:bg-gray-600 disabled:text-slate-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
            >
              Transferir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
