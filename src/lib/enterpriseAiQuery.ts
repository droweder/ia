export type AiIntent =
  | 'sales_orders_pending'
  | 'sales_orders_awaiting_billing'
  | 'sales_orders_by_customer'
  | 'sales_orders_by_period'
  | 'sales_orders_overdue'
  | 'production_order_status'
  | 'daily_production'
  | 'unknown';

export type AiErrorType =
  | 'CONTEXT_ERROR'
  | 'PERMISSION_ERROR'
  | 'VALIDATION_ERROR'
  | 'CONNECTION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SQL_INVALID_ERROR'
  | 'SCHEMA_ERROR';

export interface QueryFilter {
  field: 'empresa_id' | 'cliente' | 'status' | 'data_inicio' | 'data_fim' | 'numero_pedido';
  operator: '=' | 'ilike' | '>=' | '<=' | 'in';
  value: string | string[];
}

export interface StructuredQuery {
  version: '2026-06-18';
  intent: AiIntent;
  entity: 'sales_order' | 'production_order' | 'production' | 'unknown';
  filters: QueryFilter[];
  orderBy: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit: number;
  companyScope: { empresaId: string };
  needsClarification?: string;
}

export interface AiExecutionLog {
  correlationId: string;
  question: string;
  userId: string;
  companyId: string;
  intent: AiIntent;
  structuredQuery?: StructuredQuery;
  sql?: string;
  params?: Record<string, unknown>;
  durationMs?: number;
  rowCount?: number;
  errorType?: AiErrorType;
}

export interface FriendlyAiError {
  id: string;
  type: AiErrorType;
  userMessage: string;
  probableCause: string;
  suggestedAction: string;
  technicalMessage?: string;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const SALES_ORDER_TABLE = 'planintex.pedidos_venda';
const ALLOWED_TABLES = new Set([SALES_ORDER_TABLE]);
const ALLOWED_COLUMNS = new Set([
  'id',
  'empresa_id',
  'numero',
  'numero_pedido',
  'cliente',
  'cliente_nome',
  'status',
  'situacao',
  'data_emissao',
  'data_entrega',
  'valor_total',
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function createCorrelationId(): string {
  return `ia_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function parseIntent(question: string): AiIntent {
  const q = normalize(question);
  const hasOrder = /\b(pedido|pedidos|pv|venda|vendas)\b/.test(q);

  if (hasOrder && /(aguardando faturamento|a faturar|para faturar|nao faturad|pendente de faturamento)/.test(q)) {
    return 'sales_orders_awaiting_billing';
  }
  if (hasOrder && /(pendente|pendentes|em aberto|aberto)/.test(q)) return 'sales_orders_pending';
  if (hasOrder && /(cliente|comprador)/.test(q)) return 'sales_orders_by_customer';
  if (hasOrder && /(periodo|mes|semana|dia|entre|de \d{1,2}\/\d{1,2})/.test(q)) return 'sales_orders_by_period';
  if (hasOrder && /(atrasad|vencid|fora do prazo)/.test(q)) return 'sales_orders_overdue';
  if (/\b(op|ordem de producao|ordens de producao)\b/.test(q) && /(status|situacao|andamento)/.test(q)) return 'production_order_status';
  if (/(producao do dia|produzido hoje|producao hoje)/.test(q)) return 'daily_production';
  return 'unknown';
}

function extractCustomer(question: string): string | null {
  const match = question.match(/cliente\s+([\p{L}\p{N}\s.-]{2,80})/iu);
  return match?.[1]?.trim() ?? null;
}

function extractOrderNumber(question: string): string | null {
  const match = question.match(/(?:pedido|pv)\s*(?:n[ºo.]*)?\s*(\d{2,})/iu);
  return match?.[1] ?? null;
}

function extractPeriod(question: string): { start?: string; end?: string } {
  const range = question.match(/(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})/);
  if (range) return { start: range[1], end: range[2] };
  return {};
}

export function buildStructuredQuery(question: string, empresaId: string): StructuredQuery {
  const intent = parseIntent(question);
  const filters: QueryFilter[] = [{ field: 'empresa_id', operator: '=', value: empresaId }];
  const period = extractPeriod(question);
  const customer = extractCustomer(question);
  const orderNumber = extractOrderNumber(question);

  if (customer) filters.push({ field: 'cliente', operator: 'ilike', value: customer });
  if (orderNumber) filters.push({ field: 'numero_pedido', operator: '=', value: orderNumber });
  if (period.start) filters.push({ field: 'data_inicio', operator: '>=', value: period.start });
  if (period.end) filters.push({ field: 'data_fim', operator: '<=', value: period.end });

  if (intent === 'sales_orders_pending') {
    filters.push({ field: 'status', operator: 'in', value: ['PENDENTE', 'ABERTO', 'EM ABERTO'] });
  }
  if (intent === 'sales_orders_awaiting_billing') {
    filters.push({ field: 'status', operator: 'in', value: ['AGUARDANDO FATURAMENTO', 'A FATURAR', 'PENDENTE FATURAMENTO'] });
  }

  const entity = intent.startsWith('sales_orders') ? 'sales_order' : intent === 'unknown' ? 'unknown' : 'production_order';
  return {
    version: '2026-06-18',
    intent,
    entity,
    filters,
    orderBy: [{ field: 'data_emissao', direction: 'desc' }],
    limit: DEFAULT_LIMIT,
    companyScope: { empresaId },
  };
}

export function validateStructuredQuery(query: StructuredQuery, userCanReadPlanintex = true): FriendlyAiError | null {
  if (!query.companyScope.empresaId) return createAiError('CONTEXT_ERROR', 'Empresa ativa não identificada.', 'Perfil sem empresa ativa.', 'Selecione uma empresa ou contate o suporte.');
  if (!userCanReadPlanintex) return createAiError('PERMISSION_ERROR', 'Você não tem permissão para consultar estes dados.', 'Perfil sem permissão de leitura no ERP.', 'Solicite acesso ao administrador.');
  if (query.intent === 'unknown') return createAiError('VALIDATION_ERROR', 'Não entendi com segurança qual consulta você precisa.', 'Intenção não homologada no catálogo.', 'Tente informar entidade, período, cliente ou número do pedido.');
  if (!query.filters.some((f) => f.field === 'empresa_id' && f.value === query.companyScope.empresaId)) return createAiError('VALIDATION_ERROR', 'Consulta bloqueada por falta de escopo da empresa.', 'Filtro obrigatório empresa_id ausente.', 'Reenvie a pergunta após confirmar a empresa ativa.');
  if (query.limit < 1 || query.limit > MAX_LIMIT) return createAiError('VALIDATION_ERROR', 'Consulta bloqueada por limite inválido.', 'Limite fora da política de paginação.', `Use um limite entre 1 e ${MAX_LIMIT}.`);
  return null;
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function structuredQueryToSql(query: StructuredQuery): string {
  if (query.entity !== 'sales_order') throw new Error(`Intent ${query.intent} ainda não possui template SQL homologado.`);
  if (!ALLOWED_TABLES.has(SALES_ORDER_TABLE)) throw new Error('Tabela não autorizada para IA.');

  const columns = ['numero_pedido', 'cliente_nome', 'status', 'data_emissao', 'data_entrega', 'valor_total'].filter((column) => ALLOWED_COLUMNS.has(column));
  const where = query.filters.map((filter) => {
    switch (filter.field) {
      case 'empresa_id':
        return `empresa_id = ${sqlString(String(filter.value))}`;
      case 'cliente':
        return `(cliente_nome ILIKE ${sqlString(`%${filter.value}%`)} OR cliente ILIKE ${sqlString(`%${filter.value}%`)})`;
      case 'numero_pedido':
        return `(numero_pedido = ${sqlString(String(filter.value))} OR numero = ${sqlString(String(filter.value))})`;
      case 'data_inicio':
        return `data_emissao >= ${sqlString(String(filter.value))}`;
      case 'data_fim':
        return `data_emissao <= ${sqlString(String(filter.value))}`;
      case 'status':
        if (!Array.isArray(filter.value)) return `status = ${sqlString(String(filter.value))}`;
        return `upper(coalesce(status, situacao, '')) IN (${filter.value.map((v) => sqlString(v)).join(', ')})`;
      default:
        throw new Error(`Filtro não autorizado: ${filter.field}`);
    }
  });

  return `SELECT ${columns.join(', ')}\nFROM ${SALES_ORDER_TABLE}\nWHERE ${where.join('\n  AND ')}\nORDER BY data_emissao DESC\nLIMIT ${Math.min(query.limit, MAX_LIMIT)}`;
}

export function validateSqlSafety(sql: string, empresaId: string): FriendlyAiError | null {
  const normalized = normalize(sql);
  if (!/^\s*(select|with)\b/i.test(sql)) return createAiError('SQL_INVALID_ERROR', 'Consulta bloqueada: somente leitura é permitida.', 'SQL não inicia com SELECT/WITH.', 'Reformule a pergunta para consultar dados, não alterar dados.');
  if (/(insert|update|delete|drop|truncate|alter|create|grant|revoke|;\s*\w+)/i.test(sql)) return createAiError('SQL_INVALID_ERROR', 'Consulta bloqueada por conter comando não permitido.', 'SQL contém operação perigosa ou múltiplos comandos.', 'Use apenas consultas de leitura homologadas.');
  if (!normalized.includes(`empresa_id = '${empresaId.toLowerCase()}'`) && !normalized.includes(`empresa_id='${empresaId.toLowerCase()}'`)) return createAiError('VALIDATION_ERROR', 'Consulta bloqueada por não restringir a empresa ativa.', 'Filtro empresa_id não encontrado no SQL final.', 'Inclua a empresa ativa no escopo da pergunta.');
  if (!normalized.includes('limit ')) return createAiError('VALIDATION_ERROR', 'Consulta bloqueada por falta de paginação.', 'LIMIT obrigatório ausente.', 'Solicite uma listagem limitada ou resumida.');
  return null;
}

export function createAiError(type: AiErrorType, userMessage: string, probableCause: string, suggestedAction: string, technicalMessage?: string): FriendlyAiError {
  return { id: createCorrelationId(), type, userMessage, probableCause, suggestedAction, technicalMessage };
}

export function formatFriendlyError(error: FriendlyAiError): string {
  return `${error.userMessage}\n\nCódigo: ${error.id}\nCausa provável: ${error.probableCause}\nAção sugerida: ${error.suggestedAction}`;
}

export function logAiExecution(event: AiExecutionLog): void {
  console.info('[DRowederIA][query-execution]', JSON.stringify(event));
}
