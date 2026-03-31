import { createClient } from '@supabase/supabase-js';

const activeProject = localStorage.getItem('active_project') || 'droweder';

// Default project (DRoweder)
const drowederUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const drowederAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Secondary project (Particular)
const particularUrl = import.meta.env.VITE_SUPABASE_PARTICULAR_URL || 'https://particular-supabase-url.supabase.co';
const particularAnonKey = import.meta.env.VITE_SUPABASE_PARTICULAR_ANON_KEY || 'your-anon-key';

const supabaseUrl = activeProject === 'particular' ? particularUrl : drowederUrl;
const supabaseAnonKey = activeProject === 'particular' ? particularAnonKey : drowederAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
