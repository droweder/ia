import React from 'react';
import { Palette, Wand2, Type } from 'lucide-react';

const Customization: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent transition-colors duration-200">
      <div className="h-14 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-white/5 backdrop-blur-md px-6 shadow-sm z-10 shrink-0">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
          <Wand2 size={24} className="text-purple-500" />
          Personalização
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-blue-800">
        <div className="max-w-4xl mx-auto space-y-8">
            <p className="text-slate-600 dark:text-slate-400">Personalize a aparência do sistema de acordo com as preferências da sua empresa.</p>

            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-shadow grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Palette size={20} className="text-blue-500" />
                        Esquema de Cores
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Escolha entre temas claros, escuros ou sincronize com o sistema operacional para reduzir o cansaço visual e melhorar a legibilidade.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:ring-2 ring-blue-500 shadow-inner"></div>
                            <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Claro</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-500/10 transition-colors shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-slate-900 shadow-inner"></div>
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Escuro</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-900 group-hover:ring-2 ring-blue-500 shadow-inner"></div>
                            <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Sistema</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Type size={20} className="text-emerald-500" />
                        Tamanho da Fonte
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        Ajuste o tamanho base do texto para melhor leitura durante os bate-papos e leitura de relatórios.
                    </p>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-400">A</span>
                        <input type="range" min="1" max="3" defaultValue="2" className="flex-1 accent-blue-600" disabled />
                        <span className="text-lg font-medium text-slate-700 dark:text-slate-200">A</span>
                    </div>
                    <div className="pt-2 text-right">
                         <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors opacity-50 cursor-not-allowed">
                             Aplicar Alterações
                         </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default Customization;
