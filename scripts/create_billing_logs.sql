-- Switch to the droweder_ia schema context
SET search_path TO droweder_ia;

-- Create the billing_logs table
CREATE TABLE IF NOT EXISTS billing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost_brl NUMERIC NOT NULL DEFAULT 0.00,
    description TEXT
);

-- Enable RLS
ALTER TABLE billing_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Usuários independentes veem seus próprios logs" ON billing_logs;
DROP POLICY IF EXISTS "Admins de empresa veem logs da empresa" ON billing_logs;

-- Policy 1: Independent users (no company_id) can see their own logs
CREATE POLICY "Usuários independentes veem seus próprios logs"
ON billing_logs
FOR SELECT
USING (
    user_id = auth.uid()
    AND company_id IS NULL
);

-- Policy 2: Company admins can see logs for their company
-- Note: We assume the application will pass the current user's company_id
-- or we use a subquery to check the user's role in planintex.profiles.
-- But since we cannot easily do cross-schema joins in RLS without explicit grants,
-- a safer approach is to check if the user is linked to the company and has the right role.
CREATE POLICY "Admins de empresa veem logs da empresa"
ON billing_logs
FOR SELECT
USING (
    company_id IS NOT NULL AND
    company_id IN (
        SELECT empresa_id
        FROM planintex.profiles
        WHERE id = auth.uid()
        AND (role = 'Admin' OR is_superadmin = true)
    )
);

-- Allow system/service role to insert
DROP POLICY IF EXISTS "Service role can insert billing logs" ON billing_logs;
CREATE POLICY "Service role can insert billing logs"
ON billing_logs
FOR INSERT
WITH CHECK (true);

-- Create index for faster querying
CREATE INDEX IF NOT EXISTS idx_billing_logs_user_id ON billing_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_logs_company_id ON billing_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_logs_transaction_date ON billing_logs(transaction_date DESC);
