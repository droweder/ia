import { applyPlanintexTableNameCorrections } from './planintexSqlCorrections';

/**
 * Remove ; no fim do SQL. A RPC monta `SELECT json_agg(t) FROM (<sua query>) t`; um ; dentro
 * dos parênteses quebra o Postgres com "syntax error at or near ;".
 */
export function normalizeAiSqlForExecution(sql: string): string {
  return sql.trim().replace(/;+\s*$/g, '').trim();
}

/** Normalização + correções de nomes de tabela (ex.: pedido_venda → pedidos_venda). Use antes da RPC. */
export function prepareAiSqlForRpc(sql: string): string {
  return applyPlanintexTableNameCorrections(normalizeAiSqlForExecution(sql));
}

/**
 * Extrai SQL da resposta do modelo. O prompt pede <sql>...</sql>, mas vários modelos
 * devolvem apenas blocos markdown ```sql, o que fazia a RPC nunca ser chamada.
 */
export function extractSqlFromAssistantResponse(text: string): string | null {
  const trimmed = text.trim();

  const tagMatch = trimmed.match(/<sql>([\s\S]*?)<\/sql>/i);
  if (tagMatch?.[1]) {
    const q = prepareAiSqlForRpc(tagMatch[1]);
    if (q) return q;
  }

  const fenceRe = /```(?:sql)?\s*([\s\S]*?)```/gi;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(trimmed)) !== null) {
    const candidate = prepareAiSqlForRpc(m[1]);
    if (/^\s*(with|select)\s/i.test(candidate) && candidate.length > 8) {
      return candidate;
    }
  }

  return null;
}
