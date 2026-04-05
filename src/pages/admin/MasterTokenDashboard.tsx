import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, KeyRound, Loader2, Save, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const MASTER_ADMIN_EMAIL = 'admin@droweder.com.br';

type TokenUsageEvent = {
  id: string;
  company_id: string;
  user_id: string;
  model_used?: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_brl: number;
  created_at: string;
};

type TokenQuota = {
  id: string;
  company_id: string | null;
  user_id: string | null;
  period: string;
  token_limit: number;
  created_at: string;
  created_by: string | null;
  updated_at: string;
};

type ChartPoint = {
  date: string;
  tokens: number;
};

export default function MasterTokenDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usageEvents, setUsageEvents] = useState<TokenUsageEvent[]>([]);
  const [quotas, setQuotas] = useState<TokenQuota[]>([]);
  const [companiesById, setCompaniesById] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const [mfaStatusLoading, setMfaStatusLoading] = useState(true);
  const [mfaHasFactor, setMfaHasFactor] = useState<boolean>(false);
  const [mfaEnrollUri, setMfaEnrollUri] = useState<string | null>(null);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);

  const isMasterAdmin = (user?.email || '').toLowerCase() === MASTER_ADMIN_EMAIL;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!user) return;
      if (!isMasterAdmin) {
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [{ data: usageData, error: usageError }, { data: quotaData, error: quotaError }] = await Promise.all([
          supabase
            .schema('droweder_ia')
            .from('token_usage_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(2000),
          supabase
            .schema('droweder_ia')
            .from('token_quotas')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(2000),
        ]);

        if (usageError) throw usageError;
        if (quotaError) throw quotaError;

        const events = (usageData || []) as TokenUsageEvent[];
        const q = (quotaData || []) as TokenQuota[];

        if (isMounted) {
          setUsageEvents(events);
          setQuotas(q);
        }

        const companyIds = Array.from(new Set(events.map((e) => e.company_id))).slice(0, 2000);
        if (companyIds.length > 0) {
          const { data: companyData, error: companyError } = await supabase
            .schema('planintex')
            .from('empresas')
            .select('id,name')
            .in('id', companyIds);

          if (!companyError && companyData) {
            const map: Record<string, string> = {};
            for (const row of companyData as any[]) {
              if (row?.id) map[row.id] = row.name || row.id;
            }
            if (isMounted) setCompaniesById(map);
          }
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Falha ao carregar dados de tokens');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [user, isMasterAdmin]);

  useEffect(() => {
    let isMounted = true;

    const loadMfa = async () => {
      if (!user) return;
      if (!isMasterAdmin) return;

      setMfaStatusLoading(true);
      try {
        const { data, error: mfaError } = await (supabase.auth as any).mfa.listFactors();
        if (mfaError) throw mfaError;

        const hasFactor = Boolean((data?.totp && data.totp.length > 0) || (data?.all && data.all.length > 0));
        if (isMounted) setMfaHasFactor(hasFactor);
      } catch {
        if (isMounted) setMfaHasFactor(false);
      } finally {
        if (isMounted) setMfaStatusLoading(false);
      }
    };

    void loadMfa();
    return () => {
      isMounted = false;
    };
  }, [user, isMasterAdmin]);

  const chartData: ChartPoint[] = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const e of usageEvents) {
      const day = new Date(e.created_at).toLocaleDateString('pt-BR');
      byDay[day] = (byDay[day] || 0) + Number(e.total_tokens || 0);
    }
    return Object.keys(byDay)
      .sort((a, b) => {
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
      })
      .map((date) => ({ date, tokens: byDay[date] }));
  }, [usageEvents]);

  const totals = useMemo(() => {
    const totalTokens = usageEvents.reduce((acc, e) => acc + Number(e.total_tokens || 0), 0);
    const totalCost = usageEvents.reduce((acc, e) => acc + Number(e.cost_brl || 0), 0);
    return { totalTokens, totalCost };
  }, [usageEvents]);

  const [newQuotaCompanyId, setNewQuotaCompanyId] = useState('');
  const [newQuotaUserId, setNewQuotaUserId] = useState('');
  const [newQuotaPeriod, setNewQuotaPeriod] = useState('monthly');
  const [newQuotaLimit, setNewQuotaLimit] = useState<number>(0);
  const [savingQuota, setSavingQuota] = useState(false);

  const createQuota = async () => {
    if (!isMasterAdmin) return;
    setSavingQuota(true);
    setError(null);
    try {
      const payload = {
        company_id: newQuotaCompanyId.trim() || null,
        user_id: newQuotaUserId.trim() || null,
        period: newQuotaPeriod,
        token_limit: Number(newQuotaLimit || 0),
        created_by: user?.id ?? null,
      };

      const { data, error: insertError } = await supabase
        .schema('droweder_ia')
        .from('token_quotas')
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) {
        setQuotas((prev) => [data as TokenQuota, ...prev]);
        setNewQuotaCompanyId('');
        setNewQuotaUserId('');
        setNewQuotaPeriod('monthly');
        setNewQuotaLimit(0);
      }
    } catch (e: any) {
      setError(e?.message || 'Falha ao criar quota');
    } finally {
      setSavingQuota(false);
    }
  };

  const startMfaEnrollment = async () => {
    if (!isMasterAdmin) return;
    setMfaBusy(true);
    setError(null);
    try {
      const { data, error: enrollError } = await (supabase.auth as any).mfa.enroll({
        factorType: 'totp',
        issuer: 'DRoweder IA',
        friendlyName: 'Master Admin',
      });
      if (enrollError) throw enrollError;

      setMfaFactorId(data?.id ?? null);
      setMfaEnrollUri(data?.totp?.uri ?? null);
    } catch (e: any) {
      setError(e?.message || 'Falha ao iniciar MFA');
    } finally {
      setMfaBusy(false);
    }
  };

  const verifyMfa = async () => {
    if (!isMasterAdmin) return;
    if (!mfaFactorId) return;
    setMfaBusy(true);
    setError(null);
    try {
      const { error: verifyError } = await (supabase.auth as any).mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: mfaCode,
      });
      if (verifyError) throw verifyError;

      setMfaHasFactor(true);
      setMfaEnrollUri(null);
      setMfaFactorId(null);
      setMfaCode('');
    } catch (e: any) {
      setError(e?.message || 'Falha ao validar MFA');
    } finally {
      setMfaBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full bg-transparent">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isMasterAdmin) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full bg-transparent text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Acesso Restrito</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Apenas o master admin pode acessar o painel de gestão de tokens.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto bg-transparent transition-colors duration-200 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800">
      <PageHeader
        title="Gestão de Tokens"
        description="Visão consolidada de consumo e configuração de quotas (master admin)."
        icon={KeyRound}
      />

      {error && (
        <div className="rounded-md bg-red-100 dark:bg-red-900/40 p-4 border border-red-500/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            <div className="text-sm font-medium text-red-800 dark:text-red-200">{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Tokens</p>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{totals.totalTokens.toLocaleString('pt-BR')}</div>
        </div>
        <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Custo Total (BRL)</p>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">R$ {totals.totalCost.toFixed(2).replace('.', ',')}</div>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-6">Uso de Tokens por Dia</h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString('pt-BR')}`, 'Tokens']}
                />
                <Area type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">Sem dados suficientes para o gráfico.</div>
          )}
        </div>
      </div>

      <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-white/5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Quotas</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            value={newQuotaCompanyId}
            onChange={(e) => setNewQuotaCompanyId(e.target.value)}
            placeholder="company_id (uuid)"
            className="w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
          />
          <input
            value={newQuotaUserId}
            onChange={(e) => setNewQuotaUserId(e.target.value)}
            placeholder="user_id (uuid)"
            className="w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
          />
          <select
            value={newQuotaPeriod}
            onChange={(e) => setNewQuotaPeriod(e.target.value)}
            className="w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
          >
            <option value="monthly">monthly</option>
            <option value="weekly">weekly</option>
            <option value="daily">daily</option>
          </select>
          <input
            value={newQuotaLimit}
            onChange={(e) => setNewQuotaLimit(Number(e.target.value))}
            placeholder="token_limit"
            type="number"
            className="w-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
          />
          <button
            onClick={createQuota}
            disabled={savingQuota}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {savingQuota ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Salvar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Escopo</th>
                <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Empresa</th>
                <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-right font-semibold uppercase text-xs tracking-wider">Limite</th>
                <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Período</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {quotas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Nenhuma quota cadastrada.</td>
                </tr>
              ) : (
                quotas.map((q) => (
                  <tr key={q.id} className="hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{q.user_id ? 'Usuário' : 'Empresa'}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-100">
                      {q.company_id ? (companiesById[q.company_id] || q.company_id) : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{q.user_id || '—'}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">{Number(q.token_limit).toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{q.period}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-white/5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <ShieldCheck size={18} />
            MFA (Master Admin)
          </h3>
        </div>

        <div className="p-6">
          {mfaStatusLoading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="animate-spin" size={16} />
              Verificando MFA...
            </div>
          ) : mfaHasFactor ? (
            <div className="text-slate-600 dark:text-slate-300">MFA configurado.</div>
          ) : (
            <div className="space-y-4">
              <div className="text-slate-600 dark:text-slate-300">
                MFA não está configurado para o master admin. Ative TOTP para liberar o acesso seguro.
              </div>
              <button
                onClick={startMfaEnrollment}
                disabled={mfaBusy}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {mfaBusy ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />}
                Iniciar configuração
              </button>

              {mfaEnrollUri && (
                <div className="space-y-3">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Adicione no seu autenticador usando este URI:
                  </div>
                  <div className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs break-all text-slate-700 dark:text-slate-200">
                    {mfaEnrollUri}
                  </div>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="Código (6 dígitos)"
                      className="w-full md:w-64 bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                    />
                    <button
                      onClick={verifyMfa}
                      disabled={mfaBusy || mfaCode.trim().length < 6}
                      className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {mfaBusy ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                      Validar MFA
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
