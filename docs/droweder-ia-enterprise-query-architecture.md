# Evolução do DRoweder IA para consultas corporativas seguras

## Bloco 1 — Diagnóstico

Problemas prováveis do fluxo atual:

- A resposta do modelo pode conter SQL livre, com validação fraca antes da execução.
- A intenção do usuário não é representada em uma estrutura auditável antes de virar SQL.
- Perguntas operacionais comuns, como pedidos pendentes e pedidos aguardando faturamento, dependem da IA acertar nomes de tabelas, colunas e status.
- Erros de execução SQL são repassados como texto genérico, sem código de erro, causa provável, ação sugerida e trilha de auditoria.
- O isolamento multiempresa depende do prompt e da RPC, mas não há um gate de negócio explícito bloqueando consultas sem `empresa_id`.
- Faltam métricas por intenção, correlationId e logs estruturados para analisar falhas recorrentes.

Pedidos pendentes e aguardando faturamento podem falhar por divergência entre linguagem de negócio e schema físico: nomes como `pedido_venda` versus `pedidos_venda`, status cadastrados como `ABERTO`, `PENDENTE`, `A FATURAR` ou `AGUARDANDO FATURAMENTO`, colunas como `numero`, `numero_pedido`, `situacao` ou `status`, e ausência de filtros obrigatórios de empresa ou paginação.

## Bloco 2 — Arquitetura sugerida

Fluxo recomendado:

1. Receber pergunta, usuário e empresa ativa.
2. Gerar `correlationId`.
3. Interpretar intenção e entidades.
4. Montar uma consulta intermediária estruturada.
5. Validar contexto, permissão, empresa, limites e catálogo homologado.
6. Traduzir a estrutura para SQL somente por templates seguros.
7. Validar SQL final contra política de leitura, escopo de empresa, whitelist e paginação.
8. Executar com timeout e limite padrão.
9. Formatar resposta indicando se foi baseada em dados reais.
10. Registrar telemetria com pergunta, intenção, estrutura, SQL, duração, linhas e erro.

Responsabilidades por módulo:

- Orquestrador: coordena o fluxo ponta a ponta e decide fallback.
- Parser de intenção: transforma texto em intenção homologada.
- Extrator de entidades: captura empresa, período, cliente, status, unidade e pedido.
- Validador de contexto: bloqueia falta de empresa ativa ou permissão.
- Query builder estruturado: cria objeto intermediário previsível.
- Tradutor SQL: aplica templates homologados e whitelist.
- Executor seguro: executa apenas leitura, com limite e tratamento de erro.
- Formatador: cria resposta amigável e alternativa segura.
- Logger/telemetria: registra correlationId e dados de auditoria.

## Bloco 3 — Modelo de execução seguro

Estrutura intermediária mínima:

```ts
{
  version: '2026-06-18',
  intent: 'sales_orders_pending',
  entity: 'sales_order',
  filters: [
    { field: 'empresa_id', operator: '=', value: empresaId },
    { field: 'status', operator: 'in', value: ['PENDENTE', 'ABERTO', 'EM ABERTO'] }
  ],
  orderBy: [{ field: 'data_emissao', direction: 'desc' }],
  limit: 50,
  companyScope: { empresaId }
}
```

Regras de validação:

- Bloquear intenção desconhecida quando a pergunta exigir dados internos.
- Exigir `empresa_id` igual à empresa ativa do usuário.
- Exigir permissão de leitura no domínio consultado.
- Exigir limite entre 1 e 200.
- Permitir apenas tabelas e colunas presentes no catálogo da IA.
- Permitir apenas `SELECT`/`WITH` e bloquear comandos de escrita ou múltiplos comandos.
- Não expor stack trace ao usuário; detalhes técnicos ficam apenas no log.

## Bloco 4 — Código

A implementação inicial está em `src/lib/enterpriseAiQuery.ts` e cobre:

- Parser de intenção para pedidos pendentes e aguardando faturamento.
- Extração simples de cliente, período ISO e número do pedido.
- Estrutura intermediária versionada.
- Validador de contexto, permissão, empresa e paginação.
- Tradutor para template SQL de pedidos de venda.
- Validador de SQL final.
- Erro amigável padronizado.
- Logger estruturado com correlationId.

O chat usa esse fluxo antes do fallback generativo. Quando uma intenção homologada é reconhecida, ele consulta o Planintex de forma estruturada, informa que a resposta veio de dados reais e sugere refinamentos por período, cliente ou número do pedido.

Exemplos cobertos:

- “Quais são os pedidos de venda pendentes da minha empresa?” vira intenção `sales_orders_pending` e status homologados `PENDENTE`, `ABERTO`, `EM ABERTO`.
- “Quais são os pedidos de venda aguardando faturamento da minha empresa?” vira intenção `sales_orders_awaiting_billing` e status homologados `AGUARDANDO FATURAMENTO`, `A FATURAR`, `PENDENTE FATURAMENTO`.

## Bloco 5 — QA e observabilidade

Checklist de testes:

- Funcional: pedidos pendentes retorna lista ou ausência de dados com mensagem clara.
- Funcional: pedidos aguardando faturamento usa a intenção correta.
- Funcional: perguntas por cliente extraem filtro de cliente.
- Funcional: perguntas com número do pedido extraem o número.
- Segurança: consulta sem empresa ativa é bloqueada.
- Segurança: SQL com `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER` ou múltiplos comandos é bloqueado.
- Segurança: SQL sem `LIMIT` é bloqueado.
- Multiempresa: toda consulta contém `empresa_id` da empresa ativa.
- Permissão: usuário sem permissão recebe erro de permissão amigável.
- Observabilidade: cada execução registra `correlationId`, pergunta, usuário, empresa, intenção, estrutura, SQL, duração, linhas e erro.
- Desempenho: limite padrão de 50 e máximo de 200.
- Regressão: manter conjunto de perguntas frequentes por intenção e validar estrutura intermediária esperada.
- UX: falhas sugerem alternativas seguras, como filtrar por período ou listar pedidos recentes.
