# DRoweder IA - SaaS B2B Multi-tenant

Aplicação de Inteligência Artificial conectada ao ERP Planintex.

## Stack Tecnológica
- **Frontend:** React 19 (Vite), TypeScript, Tailwind CSS
- **Banco de Dados:** Supabase (PostgreSQL)
- **Hospedagem:** Vercel
- **LLM:** OpenRouter (via Supabase Edge Functions)

## Estrutura do Projeto

- `/src/pages`: Componentes das páginas (Chat, Dashboards, Login).
- `/src/components`: Componentes reutilizáveis (Layout, Sidebar, PrivateRoute).
- `/supabase/functions`: Backend Serverless (Edge Functions).
- `database_schema.sql`: Script SQL completo para configuração do banco de dados.

## Configuração do Banco de Dados (Supabase)

O script `database_schema.sql` contém toda a definição necessária. Ele deve ser executado no SQL Editor do Supabase.

### Funcionalidades do Script:
1.  **Schemas:** Cria `planintex` (simulando o ERP existente) e `droweder_ia` (dados da IA).
2.  **Tabelas:** Estrutura para conversas, mensagens e logs de faturamento.
3.  **Segurança (RLS):** Ativa Row Level Security para isolamento de dados entre inquilinos (tenants).
4.  **Role de IA:** Configura a `ai_reader_role` com permissões de leitura estritas.

## Configuração da Edge Function (OpenRouter)

Para proteger a chave da API do OpenRouter, utilizamos uma Supabase Edge Function.

1.  **Instale o Supabase CLI:**
    Siga as instruções oficiais: https://supabase.com/docs/guides/cli

2.  **Faça Login:**
    ```bash
    supabase login
    ```

3.  **Configure o Segredo (API Key):**
    No dashboard do Supabase ou via CLI, adicione a chave da API do OpenRouter.
    ```bash
    supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
    ```

4.  **Faça o Deploy da Função:**
    ```bash
    supabase functions deploy chat-completion
    ```

## Executando Localmente

1.  Clone o repositório.
2.  Crie um arquivo `.env` baseado no `.env.example` com suas credenciais do Supabase.
3.  Instale as dependências:
    ```bash
    npm install
    ```
4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

## Deploy no Vercel

O projeto está configurado para deploy contínuo no Vercel.

*   **Build command:** `npm run build`
*   **Publish directory:** `dist`
*   **Variáveis de Ambiente:** Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel do Vercel.

## Arquitetura de Segurança Text-to-SQL (Crítico)

### 1. Role de Leitura Dedicada (`ai_reader_role`)
Todas as queries geradas pela IA devem ser executadas sob a identidade da role `ai_reader_role` no banco de dados.
*   **Permissões:** `GRANT SELECT` apenas.
*   **Bloqueios:** `REVOKE INSERT, UPDATE, DELETE, TRUNCATE`.

### 2. Isolamento de Tenant (RLS)
As tabelas da aplicação `droweder_ia` possuem políticas RLS ativas baseadas no `company_id` do usuário logado.

### 3. Proteção de API Keys
A chave do OpenRouter nunca é exposta no frontend. O cliente React chama a Edge Function `chat-completion`, que proxyia a requisição para a LLM de forma segura.

---
*MVP v1.0.0 - Deploy pronto para QA/Produção*
