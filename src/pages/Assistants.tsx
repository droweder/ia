import React from 'react';
import { User, BrainCircuit, Globe, LineChart, Code2 } from 'lucide-react';

const Assistants: React.FC = () => {
  // Mock data for assistants
  const assistants = [
    { id: 1, name: 'Especialista em Vendas', description: 'Analisa o funil de vendas, desempenho da equipe e previsões de receita.', icon: <LineChart className="text-emerald-500" />, category: 'Negócios' },
    { id: 2, name: 'Analista de Mercado', description: 'Monitora tendências globais, concorrência e novas oportunidades.', icon: <Globe className="text-blue-500" />, category: 'Estratégia' },
    { id: 3, name: 'Engenheiro de Dados', description: 'Auxilia na limpeza, transformação e organização de bases de dados.', icon: <Database className="text-purple-500" />, category: 'Tecnologia' },
    { id: 4, name: 'DevOps Assistente', description: 'Automatiza processos de CI/CD e monitoramento de infraestrutura.', icon: <Code2 className="text-orange-500" />, category: 'Tecnologia' },
    { id: 5, name: 'Consultor Financeiro', description: 'Otimização de fluxo de caixa e análise de demonstrativos.', icon: <BrainCircuit className="text-red-500" />, category: 'Finanças' },
    { id: 6, name: 'Suporte ao Cliente', description: 'Responde dúvidas frequentes e gerencia tickets de suporte.', icon: <User className="text-pink-500" />, category: 'Atendimento' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assistentes Especializados</h1>
           <p className="text-sm text-gray-500 mt-1">Explore e utilize agentes de IA treinados para funções específicas.</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assistants.map((assistant) => (
                <div key={assistant.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-900/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 flex flex-col items-start gap-4 cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                        {assistant.icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wide">{assistant.category}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">{assistant.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{assistant.description}</p>
                    </div>
                    <button className="w-full mt-2 py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all">
                        Iniciar Conversa
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Simple Icon Wrapper for cleaner code above
const Database: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s 9-1.34 9-3V5"></path></svg>
);

export default Assistants;
