import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Plus, Search, Building2, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Company {
    id: string;
    name: string;
    cnpj?: string;
    created_at: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthorization();
  }, [user]);

  const checkAuthorization = async () => {
    if (!user) return;
    try {
        const { data, error } = await supabase
            .schema('planintex')
            .from('profiles')
            .select('role, is_superadmin')
            .eq('id', user.id)
            .single();

        if (error || !data || (data.role !== 'Admin' && data.is_superadmin !== true)) {
             console.warn("User unauthorized for admin page:", data?.role);
             setIsAuthorized(false);
             // In a real app, maybe redirect immediately. For UX, we show a message first.
             // setTimeout(() => navigate('/chat'), 3000);
        } else {
            setIsAuthorized(true);
            fetchCompanies();
        }
    } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthorized(false);
    } finally {
        setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
        const { data, error } = await supabase
            .schema('planintex')
            .from('empresas')
            .select('*', { head: false, count: 'exact' });

        if (error) {
             console.error('Error fetching companies:', error);
             setCompanies([]);
        } else {
            setCompanies(data || []);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
  };

  if (loading) {
      return <div className="p-8 flex items-center justify-center h-full dark:bg-gray-900"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  if (!isAuthorized) {
      return (
          <div className="flex flex-col items-center justify-center h-full dark:bg-gray-900 text-gray-600 dark:text-gray-400 p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                  <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Acesso Negado</h2>
              <p className="max-w-md">Você não tem permissão para acessar o painel de Gestão de Empresas. Esta área é restrita a administradores.</p>
              <button
                onClick={() => navigate('/chat')}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                  Voltar para o Chat
              </button>
          </div>
      );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Gestão de Inquilinos (Tenants)</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Super-Admin: Controle central das empresas conectadas.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          <Plus size={18} />
          Nova Empresa
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar empresas..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Empresa</th>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">CNPJ</th>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Data Criação</th>
                        <th className="px-6 py-3 text-center font-semibold uppercase text-xs tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {companies.length === 0 ? (
                         <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Nenhuma empresa encontrada ou acesso negado.</td>
                        </tr>
                    ) : (
                        companies.map((company) => (
                            <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                                        <Building2 size={16} />
                                    </div>
                                    {company.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">
                                    {company.cnpj || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                                    {new Date(company.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
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

export default Companies;
