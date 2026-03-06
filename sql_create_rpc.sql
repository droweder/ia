-- Function to execute arbitrary SQL read-only queries as the ai_reader_role
CREATE OR REPLACE FUNCTION planintex.execute_ai_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = planintex
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Simple validation to prevent obvious destructive commands even if role is restricted
  IF query ~* '\b(insert|update|delete|drop|truncate|alter|create|grant|revoke)\b' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed.';
  END IF;

  -- Execute the query with the restricted role
  -- Note: SECURITY DEFINER runs as the creator, so we switch role explicitly
  EXECUTE format('SET LOCAL ROLE ai_reader_role');

  EXECUTE format('SELECT json_agg(t) FROM (%s) t', query) INTO result;

  -- Reset role (handled by transaction end typically, but good practice)
  RESET ROLE;

  RETURN coalesce(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
  -- Catch all errors and return them cleanly instead of failing the RPC completely
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Allow authenticated users to execute this function
GRANT EXECUTE ON FUNCTION planintex.execute_ai_sql(text) TO authenticated;
