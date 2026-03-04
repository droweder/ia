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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#111111] border border-white/10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Transferir para Projeto</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
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
              className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-slate-800 focus:border-blue-500 focus:outline-none dark:border-white/10 dark:text-white"
              required
            >
              <option value="" disabled className="dark:bg-[#111111]">
                Escolha um projeto...
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id} className="dark:bg-[#111111]">
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedProjectId}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Transferir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
