
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

// Inicializar cliente com schema planintex por padrão para o RPC
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'planintex' }
});

async function runQuery(query: string) {
  const { data, error } = await supabase.rpc('execute_ai_sql', { query });
  
  if (error) return { data: null, error };
  
  // O RPC retorna jsonb, que pode ser um objeto de erro { error: '...' } ou o resultado
  if (data && typeof data === 'object' && !Array.isArray(data) && (data as any).error) {
    return { data: null, error: new Error((data as any).error) };
  }
  
  return { data: data as any[], error: null };
}

async function inspectDatabase() {
  console.log('=== INÍCIO DA ANÁLISE COMPLETA DO BANCO DE DADOS ===\n');

  // 1. Verificar Schemas
  console.log('--- 1. Schemas ---');
  const schemaQuery = "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('planintex', 'droweder_ia', 'public')";
  const { data: schemas, error: schemaErr } = await runQuery(schemaQuery);
  if (schemaErr) {
    console.error('Erro ao listar schemas:', schemaErr.message);
  } else {
    console.log('Schemas encontrados:', schemas!.map(s => s.schema_name).join(', '));
  }

  // 2. Verificar Tabelas por Schema
  const targetSchemas = ['planintex', 'droweder_ia'];
  for (const schema of targetSchemas) {
    console.log(`\n--- 2. Tabelas no Schema: ${schema} ---`);
    const tableQuery = `SELECT table_name FROM information_schema.tables WHERE table_schema = '${schema}' AND table_type = 'BASE TABLE'`;
    const { data: tables, error: tableErr } = await runQuery(tableQuery);
    
    if (tableErr) {
      console.error(`Erro ao listar tabelas em ${schema}:`, tableErr.message);
      continue;
    }

    if (!tables || tables.length === 0) {
      console.log(`Nenhuma tabela encontrada no schema ${schema}.`);
      continue;
    }

    for (const t of tables) {
      const tableName = t.table_name;
      console.log(`\n> Tabela: ${tableName}`);

      // Colunas e Tipos
      const colQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = '${schema}' AND table_name = '${tableName}'
        ORDER BY ordinal_position
      `;
      const { data: cols } = await runQuery(colQuery);
      if (cols) {
        console.log('  Colunas:', cols.map(c => `${c.column_name} (${c.data_type})${c.is_nullable === 'NO' ? ' NOT NULL' : ''}`).join(', '));
      }

      // Constraints (PK, FK)
      const constraintQuery = `
        SELECT tc.constraint_name, tc.constraint_type, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
        WHERE tc.table_schema = '${schema}' AND tc.table_name = '${tableName}'
      `;
      const { data: constraints } = await runQuery(constraintQuery);
      if (constraints) {
        constraints.forEach(c => {
          if (c.constraint_type === 'PRIMARY KEY') {
            console.log(`  PK: ${c.column_name}`);
          } else if (c.constraint_type === 'FOREIGN KEY') {
            console.log(`  FK: ${c.column_name} -> ${c.foreign_table_name}(${c.foreign_column_name})`);
          }
        });
      }

      // Índices
      const indexQuery = `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = '${schema}' AND tablename = '${tableName}'
      `;
      const { data: indexes } = await runQuery(indexQuery);
      if (indexes && indexes.length > 0) {
        console.log('  Índices:', indexes.map(i => i.indexname).join(', '));
      }
    }
  }

  // 3. Verificar RPC e Funções
  console.log('\n--- 3. Funções e RPC ---');
  const funcQuery = "SELECT routine_name FROM information_schema.routines WHERE routine_schema IN ('planintex', 'public') AND routine_name = 'execute_ai_sql'";
  const { data: funcs } = await runQuery(funcQuery);
  if (funcs && funcs.length > 0) {
    console.log('Função execute_ai_sql encontrada:', funcs.map(f => f.routine_name).join(', '));
  } else {
    console.error('AVISO: Função execute_ai_sql NÃO encontrada no schema planintex.');
  }

  // 4. Verificar Permissões (Simulado via RPC)
  console.log('\n--- 4. Teste de Permissões ---');
  const permTestQuery = "SELECT current_user, session_user";
  const { data: perms } = await runQuery(permTestQuery);
  if (perms) {
    console.log('Usuário atual da sessão (via RPC):', perms);
  }

  console.log('\n=== FIM DA ANÁLISE ===');
}

inspectDatabase().catch(err => {
  console.error('Falha fatal na análise:', err);
});
