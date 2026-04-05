/** Evita estourar o contexto do OpenRouter ao colar o JSON inteiro de consultas grandes. */
const MAX_SAMPLE_ROWS = 200;
const MAX_JSON_CHARS = 55_000;

/**
 * Formata o retorno da RPC para colocar no prompt da segunda chamada à IA.
 * Erros permanecem curtos; arrays grandes viram amostra + metadados.
 */
export function formatRpcResultForLlm(sqlData: unknown, actualError: string | undefined): string {
  if (actualError) {
    const msg = `Erro ao executar a consulta: ${actualError}`;
    return msg.length > 8000 ? `${msg.slice(0, 8000)}\n...[mensagem truncada]` : msg;
  }

  let toSerialize: unknown = sqlData;

  if (Array.isArray(sqlData) && sqlData.length > MAX_SAMPLE_ROWS) {
    toSerialize = {
      aviso_amostra: `Somente as primeiras ${MAX_SAMPLE_ROWS} linhas de ${sqlData.length} retornadas pelo banco. Explique isso ao usuário e sugira COUNT(*), filtros mais restritos ou LIMIT se precisarem ver tudo.`,
      total_de_linhas_no_banco: sqlData.length,
      linhas_amostra: sqlData.slice(0, MAX_SAMPLE_ROWS),
    };
  }

  let str = JSON.stringify(toSerialize, null, 2);
  if (str.length > MAX_JSON_CHARS) {
    str = `${str.slice(0, MAX_JSON_CHARS)}\n\n... [truncado em ${MAX_JSON_CHARS} caracteres — resultado muito largo; na próxima consulta use menos colunas e LIMIT]`;
  }

  return str;
}
