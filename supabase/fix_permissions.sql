-- Enable RLS and add policies for DRoweder IA tables
-- Run this in your Supabase SQL Editor to fix the 403 Forbidden errors

-- ASSISTANTS (Read-only for all authenticated users)
ALTER TABLE droweder_ia.assistants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read assistants"
ON droweder_ia.assistants
FOR SELECT
TO authenticated
USING (true);

-- FILES (CRUD for authenticated users, scoped to their company if possible, but general access for now to unblock)
ALTER TABLE droweder_ia.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read files"
ON droweder_ia.files
FOR SELECT
TO authenticated
USING (true); -- In production, add: company_id = (select company_id from planintex.users where id = auth.uid())

CREATE POLICY "Allow authenticated users to upload files"
ON droweder_ia.files
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete files"
ON droweder_ia.files
FOR DELETE
TO authenticated
USING (true);

-- PROJECTS (CRUD for authenticated users)
ALTER TABLE droweder_ia.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read projects"
ON droweder_ia.projects
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to create projects"
ON droweder_ia.projects
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update projects"
ON droweder_ia.projects
FOR UPDATE
TO authenticated
USING (true);
