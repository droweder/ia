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
    <div className="fixed inset-0 z-50 flex items-center justify-center  dark:  p-4 bg-[#0B0F19]/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200 p-6 text-gray-200">
        {/* Removed Aurora background */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Transferir para Projeto</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:text-slate-800 dark:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSelect}>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-gray-300">
              Selecione o projeto de destino
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-xl border bg-transparent px-4 py-2 focus:border-blue-500 focus:outline-none border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
              required
            >
              <option value="" disabled className="bg-white dark:bg-[#151B2B]">
                Escolha um projeto...
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id} className="bg-white dark:bg-[#151B2B]">
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedProjectId}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-slate-800 dark:text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Transferir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
