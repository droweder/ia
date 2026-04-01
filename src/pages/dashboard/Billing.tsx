import React, { useEffect, useState, useRef } from 'react';
import { CreditCard, Zap, TrendingUp, Loader2, Download, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface BillingLog {
    id: string;
    transaction_date: string;
    tokens_used: number;
    cost_brl: number;
    description?: string;
}

interface ChartData {
    date: string;
    cost: number;
    tokens: number;
}

const Billing: React.FC = () => {
  const [logs, setLogs] = useState<BillingLog[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { user } = useAuth();
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
        checkAccessAndFetchData();
    }
  }, [user]);

  const checkAccessAndFetchData = async () => {
    try {
        setLoading(true);
        // Verificar permissão
        const { data: userProfile, error: profileError } = await supabase
            .schema('planintex')
            .from('profiles')
            .select('empresa_id, role, is_superadmin')
            .eq('id', user?.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
             console.error('Error fetching profile:', profileError);
             return;
        }

        // Se não tem empresa_id (independente) OU tem empresa_id e é Admin/Superadmin -> Permitido
        const isIndependent = !userProfile?.empresa_id;
        const isAdmin = userProfile?.role === 'Admin' || userProfile?.is_superadmin === true;

        if (isIndependent || isAdmin) {
            setHasAccess(true);
            await fetchBillingLogs(userProfile?.empresa_id);
        } else {
            setHasAccess(false);
        }

    } catch (error) {
        console.error('Error checking access:', error);
    } finally {
        setLoading(false);
    }
  };

  const fetchBillingLogs = async (companyId?: string | null) => {
    try {
        let query = supabase
            .schema('droweder_ia')
            .from('billing_logs')
            .select('*')
            .order('transaction_date', { ascending: true }); // Ascending for chart

        if (companyId) {
             // For safety, even though RLS should handle it.
             query = query.eq('company_id', companyId);
        } else {
             query = query.eq('user_id', user?.id);
        }

        const { data, error } = await query;

        if (error) {
          console.warn("billing_logs fetch error:", error);
        }

        const formattedLogs = data || [];
        setLogs([...formattedLogs].reverse()); // Reverse for table (newest first)

        // Prepare Chart Data
        const aggregatedData: Record<string, { cost: number, tokens: number }> = {};
        formattedLogs.forEach(log => {
             const date = new Date(log.transaction_date).toLocaleDateString('pt-BR');
             if (!aggregatedData[date]) {
                 aggregatedData[date] = { cost: 0, tokens: 0 };
             }
             aggregatedData[date].cost += Number(log.cost_brl);
             aggregatedData[date].tokens += Number(log.tokens_used);
        });

        const cData: ChartData[] = Object.keys(aggregatedData).map(date => ({
             date,
             cost: Number(aggregatedData[date].cost.toFixed(2)),
             tokens: aggregatedData[date].tokens
        }));
        setChartData(cData);

    } catch (error) {
        console.error('Error fetching billing logs:', error);
    }
  };

  const totalTokens = logs.reduce((acc, log) => acc + Number(log.tokens_used), 0);
  const totalCost = logs.reduce((acc, log) => acc + Number(log.cost_brl), 0);

  const exportCSV = () => {
      const headers = ['Data/Hora', 'Descrição', 'Tokens Usados', 'Custo (BRL)'];
      const csvContent = [
          headers.join(','),
          ...logs.map(log =>
              `"${new Date(log.transaction_date).toLocaleString('pt-BR')}","${log.description || 'Consumo de IA'}","${log.tokens_used}","${log.cost_brl.toFixed(2)}"`
          )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `faturamento_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const exportPDF = async () => {
      if (!pdfRef.current) return;
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#0B0F19', // Match dark theme background
          ignoreElements: (el) => el.classList.contains('no-print')
      });
      const data = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`faturamento_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
      return <div className="p-8 flex items-center justify-center h-full bg-transparent"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  if (!hasAccess) {
      return (
          <div className="p-8 flex flex-col items-center justify-center h-full bg-transparent text-center">
             <AlertCircle size={48} className="text-red-500 mb-4" />
             <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Acesso Restrito</h2>
             <p className="text-slate-500 dark:text-slate-400 max-w-md">
                 Você não tem permissão para visualizar o painel de faturamento desta empresa. Entre em contato com o administrador.
             </p>
          </div>
      );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto bg-transparent transition-colors duration-200 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800" ref={pdfRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Extrato de Faturamento</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe o consumo de tokens e custos da IA em tempo real.</p>
        </div>
        <div className="flex items-center gap-3 no-print">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium text-white transition-colors">
                <FileText size={16} />
                Exportar CSV
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors">
                <Download size={16} />
                Baixar PDF
            </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Zap size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Tokens</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalTokens.toLocaleString('pt-BR')}</h3>
                </div>
            </div>
        </div>
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                    <CreditCard size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Custo Total</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">R$ {totalCost.toFixed(2).replace('.', ',')}</h3>
                </div>
            </div>
        </div>
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Média por Transação</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">R$ {logs.length > 0 ? (totalCost / logs.length).toFixed(2).replace('.', ',') : '0,00'}</h3>
                </div>
            </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-6">Evolução de Custos (R$)</h3>
          <div className="h-64 w-full">
              {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                            itemStyle={{ color: '#3b82f6' }}
                            formatter={(value: any) => [`R$ ${Number(value).toFixed(2).replace('.', ',')}`, 'Custo']}
                        />
                        <Area type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                      Sem dados suficientes para o gráfico.
                  </div>
              )}
          </div>
      </div>

      {/* Table */}
      <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-black/60">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Histórico de Transações</h3>
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
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{new Date(log.transaction_date).toLocaleString('pt-BR')}</td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{log.description || 'Consumo de IA'}</td>
                                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 font-mono bg-white/40 dark:bg-white/5 rounded-lg m-1">{log.tokens_used.toLocaleString('pt-BR')}</td>
                                <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">R$ {Number(log.cost_brl).toFixed(2).replace('.', ',')}</td>
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
