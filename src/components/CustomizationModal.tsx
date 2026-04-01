import React, { useState } from 'react';
import { Palette, Wand2, Type, X } from 'lucide-react';
import { AuroraModalBackground } from './AuroraModalBackground';
import { useTheme } from '../contexts/ThemeContext';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const [fontSize, setFontSize] = useState("2");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] w-full max-w-4xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] relative">
        <AuroraModalBackground />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-10">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <Wand2 size={24} className="text-purple-500" />
            Personalização
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 relative z-10 flex-1">
            <div className="space-y-8">
                <p className="text-slate-400">Personalize a aparência do sistema de acordo com as preferências da sua empresa.</p>

                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-sm transition-shadow grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Palette size={20} className="text-blue-500" />
                            Esquema de Cores
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Escolha entre temas claros, escuros ou sincronize com o sistema operacional para reduzir o cansaço visual e melhorar a legibilidade.
                            <br/><span className="text-xs text-blue-400 mt-1 block">* Apenas o modo escuro Aurora é suportado nativamente no momento.</span>
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={theme === 'dark' ? toggleTheme : undefined}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-colors group ${theme === 'light' ? 'border-blue-500 bg-white/10' : 'border-white/10 hover:bg-white/5'}`}
                            >
                                <div className={`w-10 h-10 rounded-full bg-slate-100 shadow-inner ${theme === 'light' ? 'ring-2 ring-blue-500' : 'group-hover:ring-2 ring-blue-500'}`}></div>
                                <span className={`text-xs font-medium ${theme === 'light' ? 'text-blue-400' : 'text-gray-300'}`}>Claro</span>
                            </button>
                            <button
                                onClick={theme === 'light' ? toggleTheme : undefined}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-colors group ${theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/5'}`}
                            >
                                <div className={`w-10 h-10 rounded-full bg-slate-900 shadow-inner ${theme === 'dark' ? 'ring-2 ring-blue-500' : 'group-hover:ring-2 ring-blue-500'}`}></div>
                                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-gray-300'}`}>Escuro</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-900 group-hover:ring-2 ring-blue-500 shadow-inner"></div>
                                <span className="text-xs font-medium text-gray-300">Sistema</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Type size={20} className="text-emerald-500" />
                            Tamanho da Fonte
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Ajuste o tamanho base do texto para melhor leitura durante os bate-papos e leitura de relatórios.
                        </p>
                        <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/10">
                            <span className="text-sm font-medium text-slate-400">A</span>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                value={fontSize}
                                onChange={(e) => setFontSize(e.target.value)}
                                className="flex-1 accent-blue-600"
                            />
                            <span className="text-lg font-medium text-slate-200">A</span>
                        </div>
                        <div className="pt-2 text-right">
                             <button
                                onClick={onClose}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                             >
                                 Aplicar Alterações
                             </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
