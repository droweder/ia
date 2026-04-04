
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function directInspection() {
  console.log('--- Inspeção Direta (Sem RPC) ---');
  
  // Tentar acessar tabelas conhecidas em diferentes schemas
  const tables = [
    { schema: 'planintex', name: 'empresas' },
    { schema: 'planintex', name: 'profiles' },
    { schema: 'droweder_ia', name: 'projects' },
    { schema: 'droweder_ia', name: 'conversations' }
  ];

  for (const t of tables) {
    const { data, error } = await supabase
      .schema(t.schema as any)
      .from(t.name)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`[${t.schema}.${t.name}] Erro: ${error.message}`);
    } else {
      console.log(`[${t.schema}.${t.name}] Acesso OK. Colunas: ${Object.keys(data[0] || {}).join(', ')}`);
    }
  }
}

directInspection();
