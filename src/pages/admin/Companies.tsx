import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Plus, Search, Building2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Company {
    id: string;
    name: string;
    cnpj?: string;
    created_at: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
        // This assumes the logged in user has permission to see planintex.empresas
        // In a real scenario, this might need a specific RPC or Admin API if RLS is strict
        const { data, error } = await supabase
            .schema('planintex')
            .from('empresas')
            .select('*', { head: false, count: 'exact' });

        if (error) {
             console.error('Error fetching companies:', error);
             // Fallback to empty if permission denied or error
             setCompanies([]);
        } else {
            setCompanies(data || []);
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
      return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Inquilinos (Tenants)</h1>
          <p className="text-gray-500 mt-1">Super-Admin: Controle central das empresas conectadas.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          <Plus size={18} />
          Nova Empresa
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar empresas..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Empresa</th>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">CNPJ</th>
                        <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Data Criação</th>
                        <th className="px-6 py-3 text-center font-semibold uppercase text-xs tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {companies.length === 0 ? (
                         <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhuma empresa encontrada ou acesso negado.</td>
                        </tr>
                    ) : (
                        companies.map((company) => (
                            <tr key={company.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                                        <Building2 size={16} />
                                    </div>
                                    {company.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                    {company.cnpj || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-xs">
                                    {new Date(company.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
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
