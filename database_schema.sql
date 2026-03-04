-- Script de Criação do Banco de Dados - DRoweder AI + Mock Planintex
-- Script de Criação do Banco de Dados - DRoweder AI
-- Autor: Jules (Full-Stack & Data Engineer)
-- O Schema planintex já existe e é gerenciado pelo ERP principal, este script gerencia apenas o app droweder_ia

-- 1. Estrutura de Schemas
CREATE SCHEMA IF NOT EXISTS droweder_ia;

-- 2. Tabelas do Schema DRoweder AI

-- Adicionando coluna project_id na tabela conversations caso ela já exista
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='droweder_ia' AND table_name='conversations' AND column_name='project_id') THEN
        ALTER TABLE droweder_ia.conversations ADD COLUMN project_id UUID REFERENCES droweder_ia.projects(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS droweder_ia.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES planintex.empresas(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID
);

-- Tabela de Assistentes (Movida para cima para resolver dependência da foreign key em conversations)
CREATE TABLE IF NOT EXISTS droweder_ia.assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    icon TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID
);

-- Adicionando coluna created_by na tabela assistants caso ela já exista
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='droweder_ia' AND table_name='assistants' AND column_name='created_by') THEN
        ALTER TABLE droweder_ia.assistants ADD COLUMN created_by UUID;
    END IF;
END $$;

-- Tabela de Conversas
CREATE TABLE IF NOT EXISTS droweder_ia.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID NOT NULL REFERENCES planintex.empresas(id),
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    project_id UUID REFERENCES droweder_ia.projects(id) ON DELETE SET NULL,
    assistant_id UUID REFERENCES droweder_ia.assistants(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT false NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL
);

-- Adicionando coluna assistant_id, is_pinned e is_archived na tabela conversations caso ela já exista
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='droweder_ia' AND table_name='conversations' AND column_name='assistant_id') THEN
        ALTER TABLE droweder_ia.conversations ADD COLUMN assistant_id UUID REFERENCES droweder_ia.assistants(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='droweder_ia' AND table_name='conversations' AND column_name='is_pinned') THEN
        ALTER TABLE droweder_ia.conversations ADD COLUMN is_pinned BOOLEAN DEFAULT false NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='droweder_ia' AND table_name='conversations' AND column_name='is_archived') THEN
        ALTER TABLE droweder_ia.conversations ADD COLUMN is_archived BOOLEAN DEFAULT false NOT NULL;
    END IF;
END $$;

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS droweder_ia.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES droweder_ia.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Tabela de Arquivos
CREATE TABLE IF NOT EXISTS droweder_ia.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES planintex.empresas(id),
    name TEXT NOT NULL,
    size BIGINT,
    type TEXT,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    uploaded_by UUID
);

-- Adicionando coluna instructions na tabela assistants caso ela já exista (para retrocompatibilidade)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema='droweder_ia' AND table_name='assistants' AND column_name='instructions') THEN
        ALTER TABLE droweder_ia.assistants ADD COLUMN instructions TEXT;
    END IF;
END $$;

-- Tabela de Logs de Faturamento (Billing)
CREATE TABLE IF NOT EXISTS droweder_ia.billing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES planintex.empresas(id),
    tokens_used INTEGER NOT NULL,
    cost_brl NUMERIC(10, 4) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Segurança e Roles (CRÍTICO - Text-to-SQL)

-- Criar a role ai_reader_role se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ai_reader_role') THEN
    CREATE ROLE ai_reader_role;
  END IF;
END
$$;

-- Permissões para ai_reader_role
-- Apenas USAGE no schema planintex
GRANT USAGE ON SCHEMA planintex TO ai_reader_role;

-- Apenas SELECT nas tabelas do planintex
GRANT SELECT ON ALL TABLES IN SCHEMA planintex TO ai_reader_role;

-- Bloqueio explícito de escrita (embora GRANT SELECT não dê permissão, reforçamos)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA planintex FROM ai_reader_role;

-- Garantir que futuras tabelas também sigam essa regra (Opcional, mas boa prática)
ALTER DEFAULT PRIVILEGES IN SCHEMA planintex GRANT SELECT ON TABLES TO ai_reader_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA planintex REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLES FROM ai_reader_role;


-- 5. Permissões para Aplicação (Role Authenticated)
-- Necessário para que os usuários logados acessem os schemas customizados

GRANT USAGE ON SCHEMA planintex TO authenticated;
GRANT USAGE ON SCHEMA droweder_ia TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA droweder_ia TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA droweder_ia TO authenticated;

-- Apenas SELECT nas tabelas base do planintex (para lookup de empresa)
GRANT SELECT ON ALL TABLES IN SCHEMA planintex TO authenticated;


-- 6. RLS (Row Level Security) e Políticas

-- Habilitar RLS nas tabelas do droweder_ia
ALTER TABLE droweder_ia.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE droweder_ia.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE droweder_ia.billing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE droweder_ia.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE droweder_ia.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE droweder_ia.assistants ENABLE ROW LEVEL SECURITY;

-- Políticas para Projetos, Arquivos e Assistentes (Acesso por Empresa)
DROP POLICY IF EXISTS "Users can access their company projects" ON droweder_ia.projects;
CREATE POLICY "Users can access their company projects" ON droweder_ia.projects
    FOR ALL
    USING (company_id IN (SELECT empresa_id FROM planintex.profiles WHERE id = auth.uid()))
    WITH CHECK (company_id IN (SELECT empresa_id FROM planintex.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can access their company files" ON droweder_ia.files;
CREATE POLICY "Users can access their company files" ON droweder_ia.files
    FOR ALL
    USING (company_id IN (SELECT empresa_id FROM planintex.profiles WHERE id = auth.uid()))
    WITH CHECK (company_id IN (SELECT empresa_id FROM planintex.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can access all assistants" ON droweder_ia.assistants;
CREATE POLICY "Users can access all assistants" ON droweder_ia.assistants
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can create assistants" ON droweder_ia.assistants;
CREATE POLICY "Users can create assistants" ON droweder_ia.assistants
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own assistants" ON droweder_ia.assistants;
CREATE POLICY "Users can update their own assistants" ON droweder_ia.assistants
    FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own assistants" ON droweder_ia.assistants;
CREATE POLICY "Users can delete their own assistants" ON droweder_ia.assistants
    FOR DELETE
    USING (created_by = auth.uid());

-- Política para Conversations
-- Usuários só podem acessar conversas da sua empresa
DROP POLICY IF EXISTS "Users can access their company conversations" ON droweder_ia.conversations;
CREATE POLICY "Users can access their company conversations" ON droweder_ia.conversations
    FOR ALL
    USING (
        company_id IN (
            SELECT empresa_id FROM planintex.profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT empresa_id FROM planintex.profiles WHERE id = auth.uid()
        )
    );

-- Política para Messages
-- Usuários só podem acessar mensagens de conversas da sua empresa
DROP POLICY IF EXISTS "Users can access messages of their company conversations" ON droweder_ia.messages;
CREATE POLICY "Users can access messages of their company conversations" ON droweder_ia.messages
    FOR ALL
    USING (
        conversation_id IN (
            SELECT id FROM droweder_ia.conversations
            WHERE company_id IN (
                SELECT empresa_id FROM planintex.profiles WHERE id = auth.uid()
            )
        )
    )
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM droweder_ia.conversations
            WHERE company_id IN (
                SELECT empresa_id FROM planintex.profiles WHERE id = auth.uid()
            )
        )
    );

-- Política para Billing Logs
-- Usuários só podem ver logs da sua empresa (Read Only recomendado para usuários comuns, Insert pelo sistema)
DROP POLICY IF EXISTS "Users can view their company billing logs" ON droweder_ia.billing_logs;
CREATE POLICY "Users can view their company billing logs" ON droweder_ia.billing_logs
    FOR SELECT
    USING (
        company_id IN (
            SELECT empresa_id FROM planintex.profiles WHERE id = auth.uid()
        )
    );

-- (Opcional) Política de Insert para Billing Logs se for feito via função de banco ou admin
-- Mas para o escopo atual, focamos na leitura do cliente.
