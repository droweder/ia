import React, { useState } from 'react';
import { Activity, CheckCircle2, ClipboardCopy, Loader2, Play, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { prepareAiSqlForRpc } from '../lib/extractAiSql';
import { runDbConnectionDiagnostics, type DbConnectionReport } from '../lib/testDbConnection';

const DEFAULT_MANUAL_SQL = `SELECT 1 AS ok,
  current_schema()::text AS current_schema,
  current_user::text AS db_role`;

const PRESET_TABLES = `SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'planintex'
  AND table_type = 'BASE TABLE'
ORDER BY table_name
LIMIT 30`;

export const DbConnectionTestPanel: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<DbConnectionReport | null>(null);

  const [manualSql, setManualSql] = useState(DEFAULT_MANUAL_SQL);
  const [manualRunning, setManualRunning] = useState(false);
  const [manualMs, setManualMs] = useState<number | null>(null);
  const [manualOk, setManualOk] = useState<boolean | null>(null);
  const [manualOutput, setManualOutput] = useState<string>('');

  const run = async () => {
    setRunning(true);
    setReport(null);
    try {
      const r = await runDbConnectionDiagnostics();
      setReport(r);
    } finally {
      setRunning(false);
    }
  };

  const copyReport = () => {
    if (!report) return;
    const lines = [
      `Resumo: ${report.summary}`,
      `OK geral: ${report.ok}`,
      '',
      ...report.steps.map(
        (s) =>
          `[${s.ok ? 'OK' : 'FALHA'}] ${s.label}${s.durationMs != null ? ` (${s.durationMs}ms)` : ''}${s.detail ? `\n  ${s.detail}` : ''}`
      ),
    ];
    void navigator.clipboard.writeText(lines.join('\n'));
  };

  const runManualRpc = async () => {
    const normalized = prepareAiSqlForRpc(manualSql);
    if (!normalized.trim()) {
      setManualOk(false);
      setManualOutput('Digite um SELECT válido.');
      setManualMs(null);
      return;
    }

    setManualRunning(true);
    setManualOk(null);
    setManualOutput('');
    setManualMs(null);

    const t0 = performance.now();
    try {
      const { data, error } = await supabase.rpc('execute_ai_sql', { query: normalized });
      const ms = Math.round(performance.now() - t0);
      setManualMs(ms);

      const innerErr =
        data && typeof data === 'object' && data !== null && 'error' in data
          ? String((data as { error: unknown }).error)
          : null;

      if (error) {
        setManualOk(false);
        setManualOutput(
          JSON.stringify(
            { postgrest_error: { message: error.message, code: error.code, details: error.details } },
            null,
            2
          )
        );
        return;
      }

      if (innerErr) {
        setManualOk(false);
        setManualOutput(JSON.stringify({ rpc_payload_error: innerErr, raw: data }, null, 2));
        return;
      }

      setManualOk(true);
      setManualOutput(JSON.stringify(data, null, 2));
    } catch (e) {
      setManualOk(false);
      setManualMs(Math.round(performance.now() - t0));
      setManualOutput(e instanceof Error ? e.message : String(e));
    } finally {
      setManualRunning(false);
    }
  };

  return (
    <div className="space-y-6">
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-white/10 shadow-sm animate-in fade-in duration-300 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Activity size={22} className="text-emerald-400" />
          Diagnóstico de banco (sem IA)
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Testa sessão, leitura em <span className="text-slate-300">planintex.profiles</span>, a RPC{' '}
          <code className="text-xs bg-white/10 px-1 rounded">execute_ai_sql</code> (caminho{' '}
          <code className="text-xs bg-white/10 px-1 rounded">public</code> e{' '}
          <code className="text-xs bg-white/10 px-1 rounded">planintex</code>) e uma leitura em{' '}
          <span className="text-slate-300">droweder_ia</span>. Use os detalhes para alinhar com o SQL Editor do
          Supabase.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void run()}
          disabled={running}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-colors"
        >
          {running ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
          {running ? 'Executando…' : 'Executar diagnóstico'}
        </button>
        {report && (
          <button
            type="button"
            onClick={copyReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 text-slate-200 transition-colors border border-white/10"
          >
            <ClipboardCopy size={18} />
            Copiar relatório
          </button>
        )}
      </div>

      {report && (
        <div className="space-y-4">
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              report.ok
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-100'
            }`}
          >
            {report.summary}
          </div>

          <ul className="space-y-3">
            {report.steps.map((s) => (
              <li
                key={s.id}
                className="flex gap-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm"
              >
                <div className="pt-0.5 shrink-0">
                  {s.ok ? (
                    <CheckCircle2 className="text-emerald-400" size={20} aria-hidden />
                  ) : (
                    <XCircle className="text-red-400" size={20} aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white flex flex-wrap items-baseline gap-x-2 gap-y-0">
                    <span>{s.label}</span>
                    {s.durationMs != null && (
                      <span className="text-xs font-normal text-slate-500">{s.durationMs} ms</span>
                    )}
                  </div>
                  {s.detail && (
                    <pre className="mt-2 text-xs text-slate-400 whitespace-pre-wrap break-words font-mono">
                      {s.detail}
                    </pre>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>

    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-white/10 shadow-sm animate-in fade-in duration-300 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Play size={22} className="text-sky-400" />
          Teste manual da RPC <code className="text-sm font-mono text-sky-300">execute_ai_sql</code>
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Mesmo caminho do chat da IA: <code className="text-xs bg-white/10 px-1 rounded">supabase.rpc(&apos;execute_ai_sql&apos;)</code> com normalização de <code className="text-xs bg-white/10 px-1 rounded">;</code> final.
          Apenas <span className="text-slate-300">SELECT</span> (regras da função no Postgres).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setManualSql(DEFAULT_MANUAL_SQL)}
          className="text-xs px-2.5 py-1.5 rounded-md bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10"
        >
          Preset: consulta mínima
        </button>
        <button
          type="button"
          onClick={() => setManualSql(PRESET_TABLES)}
          className="text-xs px-2.5 py-1.5 rounded-md bg-white/10 text-slate-300 hover:bg-white/15 border border-white/10"
        >
          Preset: tabelas planintex (information_schema)
        </button>
      </div>

      <textarea
        value={manualSql}
        onChange={(e) => setManualSql(e.target.value)}
        spellCheck={false}
        rows={8}
        className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-y min-h-[140px]"
        placeholder="SELECT ..."
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void runManualRpc()}
          disabled={manualRunning}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition-colors"
        >
          {manualRunning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
          {manualRunning ? 'Executando…' : 'Executar via RPC'}
        </button>
        {manualOutput && (
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(manualOutput)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10"
          >
            <ClipboardCopy size={18} />
            Copiar resultado
          </button>
        )}
      </div>

      {manualMs != null && (
        <p className="text-xs text-slate-500">
          Tempo: <span className="text-slate-400">{manualMs} ms</span>
          {manualOk === true && (
            <span className="text-emerald-400 ml-2">— execução concluída sem erro no payload</span>
          )}
          {manualOk === false && <span className="text-red-400 ml-2">— falhou (veja JSON abaixo)</span>}
        </p>
      )}

      {manualOutput && (
        <pre
          className={`rounded-lg border p-4 text-xs font-mono whitespace-pre-wrap break-words max-h-[320px] overflow-y-auto ${
            manualOk
              ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-100'
              : 'border-red-500/25 bg-red-500/5 text-red-100'
          }`}
        >
          {manualOutput}
        </pre>
      )}
    </div>
    </div>
  );
};
