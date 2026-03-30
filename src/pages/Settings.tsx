import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, Globe, Database } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent transition-colors duration-200">
      <div className="h-14 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-white/5 backdrop-blur-md px-6 shadow-sm z-10 shrink-0">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
          <SettingsIcon size={24} className="text-blue-500" />
          Configurações
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-blue-800">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="col-span-1 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium rounded-lg text-left transition-colors">
                    <Globe size={20} /> Geral
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-medium rounded-lg text-left transition-colors">
                    <Bell size={20} /> Notificações
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-medium rounded-lg text-left transition-colors">
                    <Lock size={20} /> Segurança e Privacidade
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 font-medium rounded-lg text-left transition-colors">
                    <Database size={20} /> Dados
                </button>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Geral</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Idioma do Sistema</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Defina o idioma principal da interface.</p>
                            </div>
                            <select className="bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50">
                                <option value="pt-br">Português (Brasil)</option>
                                <option value="en" disabled>English</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/10">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Fuso Horário</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Usado para timestamps de mensagens.</p>
                            </div>
                            <select className="bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50">
                                <option value="America/Sao_Paulo">Brasília (BRT)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
