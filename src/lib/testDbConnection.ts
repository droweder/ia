import { supabase } from './supabaseClient';

export type DbCheckStep = {
  id: string;
  label: string;
  ok: boolean;
  detail?: string;
  durationMs?: number;
};

export type DbConnectionReport = {
  ok: boolean;
  steps: DbCheckStep[];
  summary: string;
};

function parseRpcPayloadError(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const err = (data as { error?: unknown }).error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string') {
    return (err as { message: string }).message;
  }
  return undefined;
}

/**
 * Diagnóstico sem LLM: sessão, perfil planintex, RPC execute_ai_sql (public e planintex), droweder_ia.
 */
export async function runDbConnectionDiagnostics(): Promise<DbConnectionReport> {
  const steps: DbCheckStep[] = [];

  const t0 = performance.now();
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  const sessionMs = Math.round(performance.now() - t0);

  if (sessionErr || !sessionData?.session) {
    steps.push({
      id: 'session',
      label: 'Sessão Supabase (JWT)',
      ok: false,
      detail: sessionErr?.message || 'Nenhuma sessão ativa — faça login.',
      durationMs: sessionMs,
    });
    return {
      ok: false,
      steps,
      summary: 'Sem sessão autenticada; as demais verificações não foram executadas.',
    };
  }

  const userId = sessionData.session.user.id;
  steps.push({
    id: 'session',
    label: 'Sessão Supabase (JWT)',
    ok: true,
    detail: `Usuário ${userId.slice(0, 8)}…`,
    durationMs: sessionMs,
  });

  const t1 = performance.now();
  const { data: profile, error: profErr } = await supabase
    .schema('planintex')
    .from('profiles')
    .select('empresa_id')
    .eq('id', userId)
    .maybeSingle();
  const profMs = Math.round(performance.now() - t1);

  if (profErr) {
    steps.push({
      id: 'profile',
      label: 'planintex.profiles → empresa_id',
      ok: false,
      detail: `${profErr.message} (código ${profErr.code})`,
      durationMs: profMs,
    });
  } else if (!profile?.empresa_id) {
    steps.push({
      id: 'profile',
      label: 'planintex.profiles → empresa_id',
      ok: false,
      detail: 'Perfil sem empresa_id — o chat da IA não consegue isolar dados da empresa.',
      durationMs: profMs,
    });
  } else {
    steps.push({
      id: 'profile',
      label: 'planintex.profiles → empresa_id',
      ok: true,
      detail: String(profile.empresa_id),
      durationMs: profMs,
    });
  }

  const testQuery =
    'SELECT 1 AS ok, current_schema()::text AS current_schema, current_user::text AS db_role';

  const t2 = performance.now();
  const { data: rpcPublic, error: rpcPublicErr } = await supabase.rpc('execute_ai_sql', {
    query: testQuery,
  });
  const rpcPublicMs = Math.round(performance.now() - t2);
  const rpcPublicInner = parseRpcPayloadError(rpcPublic);

  if (rpcPublicErr) {
    steps.push({
      id: 'rpc_public',
      label: 'RPC public.execute_ai_sql',
      ok: false,
      detail: `${rpcPublicErr.message} (${rpcPublicErr.code})`,
      durationMs: rpcPublicMs,
    });
  } else if (rpcPublicInner) {
    steps.push({
      id: 'rpc_public',
      label: 'RPC public.execute_ai_sql',
      ok: false,
      detail: rpcPublicInner,
      durationMs: rpcPublicMs,
    });
  } else {
    steps.push({
      id: 'rpc_public',
      label: 'RPC public.execute_ai_sql',
      ok: true,
      detail: truncateJson(rpcPublic),
      durationMs: rpcPublicMs,
    });
  }

  const t3 = performance.now();
  const { data: rpcPlan, error: rpcPlanErr } = await supabase
    .schema('planintex')
    .rpc('execute_ai_sql', { query: testQuery });
  const rpcPlanMs = Math.round(performance.now() - t3);
  const rpcPlanInner = parseRpcPayloadError(rpcPlan);

  if (rpcPlanErr) {
    steps.push({
      id: 'rpc_planintex',
      label: 'RPC planintex.execute_ai_sql (via .schema)',
      ok: false,
      detail: `${rpcPlanErr.message} (${rpcPlanErr.code})`,
      durationMs: rpcPlanMs,
    });
  } else if (rpcPlanInner) {
    steps.push({
      id: 'rpc_planintex',
      label: 'RPC planintex.execute_ai_sql (via .schema)',
      ok: false,
      detail: rpcPlanInner,
      durationMs: rpcPlanMs,
    });
  } else {
    steps.push({
      id: 'rpc_planintex',
      label: 'RPC planintex.execute_ai_sql (via .schema)',
      ok: true,
      detail: truncateJson(rpcPlan),
      durationMs: rpcPlanMs,
    });
  }

  const t4 = performance.now();
  const { error: iaErr } = await supabase.schema('droweder_ia').from('conversations').select('id').limit(1);
  const iaMs = Math.round(performance.now() - t4);

  if (iaErr) {
    steps.push({
      id: 'droweder_ia',
      label: 'Schema droweder_ia (1 linha)',
      ok: false,
      detail: `${iaErr.message} (${iaErr.code})`,
      durationMs: iaMs,
    });
  } else {
    steps.push({
      id: 'droweder_ia',
      label: 'Schema droweder_ia (1 linha)',
      ok: true,
      detail: 'Leitura permitida.',
      durationMs: iaMs,
    });
  }

  const t5 = performance.now();
  const { data: tblData, error: tblErr } = await supabase.rpc('ai_list_planintex_tables');
  const tblMs = Math.round(performance.now() - t5);
  if (tblErr) {
    steps.push({
      id: 'catalog',
      label: 'RPC ai_list_planintex_tables (catálogo p/ IA)',
      ok: false,
      detail: `${tblErr.message} (${tblErr.code})`,
      durationMs: tblMs,
    });
  } else if (!Array.isArray(tblData) || tblData.length === 0) {
    steps.push({
      id: 'catalog',
      label: 'RPC ai_list_planintex_tables (catálogo p/ IA)',
      ok: false,
      detail: 'Resposta vazia ou não é array — confira information_schema / permissões.',
      durationMs: tblMs,
    });
  } else {
    steps.push({
      id: 'catalog',
      label: `RPC ai_list_planintex_tables (${tblData.length} tabelas)`,
      ok: true,
      detail: truncateJson(tblData, 400),
      durationMs: tblMs,
    });
  }

  const rpcOk = steps.some((s) => s.id === 'rpc_public' && s.ok) || steps.some((s) => s.id === 'rpc_planintex' && s.ok);
  const sessionOk = steps.some((s) => s.id === 'session' && s.ok);
  const ok = sessionOk && rpcOk;

  let summary: string;
  if (!sessionOk) {
    summary = 'Corrija a sessão antes de testar o banco.';
  } else if (!rpcOk) {
    summary =
      'Falha na RPC execute_ai_sql. Confira se o script sql_create_rpc.sql foi aplicado e se o PostgREST expõe as funções (public e/ou planintex).';
  } else {
    summary = 'Conexão com o Supabase e execução de SQL via RPC estão funcionando.';
    if (steps.some((s) => s.id === 'catalog' && !s.ok)) {
      summary +=
        ' O catálogo automático de tabelas (ai_list_planintex_tables) falhou — atualize sql_create_rpc.sql no Supabase para o chat saber os nomes reais das tabelas.';
    }
  }

  return { ok, steps, summary };
}

function truncateJson(value: unknown, max = 280): string {
  try {
    const s = JSON.stringify(value);
    if (s.length <= max) return s;
    return `${s.slice(0, max)}…`;
  } catch {
    return String(value);
  }
}
