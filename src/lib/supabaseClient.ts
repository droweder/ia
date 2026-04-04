import { createClient } from '@supabase/supabase-js';

const getEnvVar = (name: string, isRequired = false): string => {
  const value = import.meta.env[name];
  if (!value && isRequired) {
    console.error(`Required environment variable missing: ${name}`);
    return '';
  }
  return value || '';
};

const activeProject = localStorage.getItem('active_project') || 'droweder';

// Default project (DRoweder)
const drowederUrl = getEnvVar('VITE_SUPABASE_URL', true);
const drowederAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', true);

// Secondary project (Particular)
const particularUrl = getEnvVar('VITE_SUPABASE_PARTICULAR_URL');
const particularAnonKey = getEnvVar('VITE_SUPABASE_PARTICULAR_ANON_KEY');

const supabaseUrl = activeProject === 'particular' ? particularUrl : drowederUrl;
const supabaseAnonKey = activeProject === 'particular' ? particularAnonKey : drowederAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
