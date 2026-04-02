import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, Globe, Database, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('geral');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6   animate-in fade-in duration-200 bg-[#0B0F19]/80 backdrop-blur-sm">
      <div className="bg-[#0B0F19] w-full max-w-5xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] relative">
        {/* Removed Aurora background */}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-10 shrink-0">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <SettingsIcon size={24} className="text-blue-500" />
            Configurações
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-blue-800 relative z-10">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-full">

                <div className="col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('geral')}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg text-left transition-colors ${activeTab === 'geral' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        <Globe size={20} /> Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('notificacoes')}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg text-left transition-colors ${activeTab === 'notificacoes' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        <Bell size={20} /> Notificações
                    </button>
                    <button
                        onClick={() => setActiveTab('seguranca')}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg text-left transition-colors ${activeTab === 'seguranca' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        <Lock size={20} /> Segurança e Privacidade
                    </button>
                    <button
                        onClick={() => setActiveTab('dados')}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-lg text-left transition-colors ${activeTab === 'dados' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        <Database size={20} /> Dados
                    </button>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-6">
                    {activeTab === 'geral' && (
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-white/10 shadow-sm animate-in fade-in duration-300">
                            <h3 className="text-lg font-semibold text-white mb-4">Geral</h3>

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-white/10 gap-4">
                                    <div>
                                        <p className="font-medium text-white">Idioma do Sistema</p>
                                        <p className="text-sm text-slate-400">Defina o idioma principal da interface.</p>
                                    </div>
                                    <select className="bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50">
                                        <option value="pt-br" className="bg-slate-900">Português (Brasil)</option>
                                        <option value="en" className="bg-slate-900" disabled>English</option>
                                    </select>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-white/10 gap-4">
                                    <div>
                                        <p className="font-medium text-white">Fuso Horário</p>
                                        <p className="text-sm text-slate-400">Usado para timestamps de mensagens.</p>
                                    </div>
                                    <select className="bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50">
                                        <option value="America/Sao_Paulo" className="bg-slate-900">Brasília (BRT)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'geral' && (
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-white/10 shadow-sm animate-in fade-in duration-300 flex items-center justify-center min-h-[300px]">
                            <p className="text-slate-500">Configurações para esta seção ainda não estão disponíveis.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
