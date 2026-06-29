import assert from 'node:assert/strict';
import { validateSqlSafety } from '../src/lib/enterpriseAiQuery.ts';

const empresaId = '11111111-2222-3333-4444-555555555555';

const safeAggregate = validateSqlSafety(
  `SELECT count(*) FROM planintex.pedidos_venda WHERE empresa_id = '${empresaId}'`,
  empresaId,
);
assert.equal(safeAggregate, null, 'aggregate queries scoped by empresa_id should not require LIMIT');

const safeAliasedList = validateSqlSafety(
  `SELECT pv.numero_pedido FROM planintex.pedidos_venda pv WHERE pv.empresa_id = '${empresaId}' ORDER BY pv.data_emissao DESC LIMIT 20`,
  empresaId,
);
assert.equal(safeAliasedList, null, 'aliased empresa_id filters should be accepted');

const missingLimit = validateSqlSafety(
  `SELECT numero_pedido FROM planintex.pedidos_venda WHERE empresa_id = '${empresaId}'`,
  empresaId,
);
assert.equal(missingLimit?.type, 'VALIDATION_ERROR', 'non-aggregate list queries should require LIMIT');

const missingCompanyScope = validateSqlSafety(
  'SELECT count(*) FROM planintex.pedidos_venda',
  empresaId,
);
assert.equal(missingCompanyScope?.type, 'VALIDATION_ERROR', 'queries must include empresa_id scope');

const mutatingStatement = validateSqlSafety(
  `UPDATE planintex.pedidos_venda SET status = 'X' WHERE empresa_id = '${empresaId}'`,
  empresaId,
);
assert.equal(mutatingStatement?.type, 'SQL_INVALID_ERROR', 'mutating statements should be blocked');

console.log('enterpriseAiQuery SQL safety checks passed');
