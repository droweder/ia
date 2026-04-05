-- =============================================================================
-- RPC execute_ai_sql — dados do ERP no schema PLANINTEX
-- Rode este script inteiro no SQL Editor do Supabase (como postgres / owner).
--
-- • A implementação real é planintex.execute_ai_sql: é nesse schema que a IA deve
--   consultar tabelas (idealmente com nomes qualificados: planintex.sua_tabela).
-- • search_path = planintex, public faz nomes não qualificados resolverem primeiro
--   no ERP (planintex), não em public.
-- • public.execute_ai_sql existe só como ponte para o PostgREST/Supabase
--   (supabase.rpc('execute_ai_sql')); ela apenas chama planintex.execute_ai_sql.
--
-- SECURITY INVOKER: a consulta roda como authenticated + JWT, com GRANT/RLS do
-- planintex. Não use SET ROLE dentro de SECURITY DEFINER (erro no Postgres).
-- =============================================================================

-- Role opcional (outros scripts / documentação); a RPC não faz mais switch para ela.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ai_reader_role') THEN
    CREATE ROLE ai_reader_role;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA planintex TO ai_reader_role;
GRANT SELECT ON ALL TABLES IN SCHEMA planintex TO ai_reader_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA planintex GRANT SELECT ON TABLES TO ai_reader_role;

CREATE OR REPLACE FUNCTION planintex.execute_ai_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = planintex, public
AS $$
DECLARE
  result jsonb;
  q text;
BEGIN
  -- trim + remover ; final: a query é embutida em SELECT json_agg(t) FROM (<q>) t e um ; dentro
  -- dos parênteses gera "syntax error at or near ;" (comum quando a IA termina com ;).
  q := trim(both from query);
  q := regexp_replace(q, ';+\s*$', '');
  q := trim(both from q);

  IF q = '' THEN
    RETURN jsonb_build_object('error', 'Empty query after trim');
  END IF;

  -- Limite de palavra POSIX (no Postgres, \b não é confiável como “word boundary” ARE)
  IF q ~* '[[:<:]](insert|update|delete|drop|truncate|alter|create|grant|revoke)[[:>:]]' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed.';
  END IF;

  -- Não use format('%s', q): caracteres % no SQL quebram o format() do Postgres.
  EXECUTE 'SELECT json_agg(t) FROM (' || q || ') t' INTO result;

  RETURN coalesce(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION planintex.execute_ai_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION planintex.execute_ai_sql(text) TO authenticated;

-- Ponte em public (API padrão). Alternativa no app: supabase.schema('planintex').rpc('execute_ai_sql', …)
CREATE OR REPLACE FUNCTION public.execute_ai_sql(query text)
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
SET search_path = planintex, public
AS $$
  SELECT planintex.execute_ai_sql($1);
$$;

REVOKE ALL ON FUNCTION public.execute_ai_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.execute_ai_sql(text) TO authenticated;

-- Lista tabelas reais do planintex (information_schema) para o modelo não inventar nomes como pedido_venda.
CREATE OR REPLACE FUNCTION planintex.ai_list_planintex_tables()
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    jsonb_agg(sub.table_name ORDER BY sub.table_name),
    '[]'::jsonb
  )
  FROM (
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'planintex'
      AND table_type = 'BASE TABLE'
  ) sub;
$$;

REVOKE ALL ON FUNCTION planintex.ai_list_planintex_tables() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION planintex.ai_list_planintex_tables() TO authenticated;

CREATE OR REPLACE FUNCTION public.ai_list_planintex_tables()
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
STABLE
AS $$
  SELECT planintex.ai_list_planintex_tables();
$$;

REVOKE ALL ON FUNCTION public.ai_list_planintex_tables() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ai_list_planintex_tables() TO authenticated;
