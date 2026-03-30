import React, { useEffect, useState } from 'react';
import { CreditCard, Zap, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

interface BillingLog {
    id: string;
    transaction_date: string;
    tokens_used: number;
    cost_brl: number;
    description?: string;
}

const Billing: React.FC = () => {
  const [logs, setLogs] = useState<BillingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
        fetchBillingLogs();
    }
  }, [user]);

  const fetchBillingLogs = async () => {
    try {
        const { data, error } = await supabase
            .schema('droweder_ia')
            .from('billing_logs')
            .select('*')
            .order('transaction_date', { ascending: false });

        if (error) {
          console.warn("billing_logs table might not exist or no access:", error);
        }
        setLogs(data || []);
    } catch (error) {
        console.error('Error fetching billing logs:', error);
    } finally {
        setLoading(false);
    }
  };

  const totalTokens = logs.reduce((acc, log) => acc + log.tokens_used, 0);
  const totalCost = logs.reduce((acc, log) => acc + log.cost_brl, 0);

  if (loading) {
      return <div className="p-8 flex items-center justify-center h-full bg-transparent"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto bg-transparent transition-colors duration-200 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Extrato de Faturamento</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe o consumo de tokens e custos da IA em tempo real.</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-100 dark:border-emerald-800 flex items-center gap-2 shadow-sm">
            <Zap size={16} className="fill-current" />
            Plano Pay-as-you-go Ativo
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Zap size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Tokens</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalTokens.toLocaleString()}</h3>
                </div>
            </div>
        </div>
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                    <CreditCard size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Custo Total</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">R$ {totalCost.toFixed(2)}</h3>
                </div>
            </div>
        </div>
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Média por Transação</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">R$ {logs.length > 0 ? (totalCost / logs.length).toFixed(2) : '0.00'}</h3>
                </div>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-black/60">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Histórico de Transações</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center gap-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors">
                <Calendar size={16} />
                Filtrar por Data
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-white/50 dark:bg-black/60 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/10">
                    <tr>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Data/Hora</th>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Descrição</th>
                        <th className="px-6 py-3 text-right font-semibold uppercase text-xs tracking-wider">Tokens</th>
                        <th className="px-6 py-3 text-right font-semibold uppercase text-xs tracking-wider">Custo (BRL)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {logs.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Nenhum registro de faturamento encontrado.</td>
                        </tr>
                    ) : (
                        logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors group">
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{new Date(log.transaction_date).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{log.description || 'Consumo de IA'}</td>
                                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 font-mono bg-white/40 dark:bg-white/5 rounded-lg m-1">{log.tokens_used.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">R$ {log.cost_brl.toFixed(2)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
