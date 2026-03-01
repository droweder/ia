-- Script de Criação do Banco de Dados - DRoweder AI + Mock Planintex
-- Autor: Jules (Full-Stack & Data Engineer)

-- 1. Estrutura de Schemas
CREATE SCHEMA IF NOT EXISTS planintex;
CREATE SCHEMA IF NOT EXISTS droweder_ia;

-- 2. Tabelas do Schema Planintex (Mock para dependências)
CREATE TABLE IF NOT EXISTS planintex.empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Usuários para vincular auth.uid() a uma empresa (Mock)
CREATE TABLE IF NOT EXISTS planintex.users (
    id UUID PRIMARY KEY, -- Deve corresponder ao auth.users.id do Supabase
    company_id UUID NOT NULL REFERENCES planintex.empresas(id),
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS planintex.ordens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES planintex.empresas(id),
    status TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabelas do Schema DRoweder AI

-- Tabela de Conversas
CREATE TABLE IF NOT EXISTS droweder_ia.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Referência ao usuário que criou
    company_id UUID NOT NULL REFERENCES planintex.empresas(id),
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- Política para Conversations
-- Usuários só podem acessar conversas da sua empresa
CREATE POLICY "Users can access their company conversations" ON droweder_ia.conversations
    FOR ALL
    USING (
        company_id IN (
            SELECT company_id FROM planintex.users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM planintex.users WHERE id = auth.uid()
        )
    );

-- Política para Messages
-- Usuários só podem acessar mensagens de conversas da sua empresa
CREATE POLICY "Users can access messages of their company conversations" ON droweder_ia.messages
    FOR ALL
    USING (
        conversation_id IN (
            SELECT id FROM droweder_ia.conversations
            WHERE company_id IN (
                SELECT company_id FROM planintex.users WHERE id = auth.uid()
            )
        )
    )
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM droweder_ia.conversations
            WHERE company_id IN (
                SELECT company_id FROM planintex.users WHERE id = auth.uid()
            )
        )
    );

-- Política para Billing Logs
-- Usuários só podem ver logs da sua empresa (Read Only recomendado para usuários comuns, Insert pelo sistema)
CREATE POLICY "Users can view their company billing logs" ON droweder_ia.billing_logs
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM planintex.users WHERE id = auth.uid()
        )
    );

-- (Opcional) Política de Insert para Billing Logs se for feito via função de banco ou admin
-- Mas para o escopo atual, focamos na leitura do cliente.
