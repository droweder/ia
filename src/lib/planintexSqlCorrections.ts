/**
 * A IA costuma errar singular/plural ou nomes “óbvios”. Corrige antes da RPC.
 * Preferimos o catálogo em tempo real no prompt; isto cobre erros recorrentes.
 */
const TABLE_REPLACEMENTS: ReadonlyArray<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bplanintex\.pedido_venda\b/gi, replacement: 'planintex.pedidos_venda' },
  { pattern: /\bpedido_venda\b/gi, replacement: 'pedidos_venda' },
];

export function applyPlanintexTableNameCorrections(sql: string): string {
  let out = sql;
  for (const { pattern, replacement } of TABLE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}
