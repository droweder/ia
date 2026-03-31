import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { createClient, type Session, type User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password?: string) => {
    if (!password) {
        // Fallback to Magic Link if password is not provided
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        return;
    }

    // Attempt login on DRoweder first, then Particular.
    const drowederUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
    const drowederAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
    const particularUrl = import.meta.env.VITE_SUPABASE_PARTICULAR_URL || 'https://particular-supabase-url.supabase.co';
    const particularAnonKey = import.meta.env.VITE_SUPABASE_PARTICULAR_ANON_KEY || 'your-anon-key';

    // We instantiate temp clients with isolated storage keys to avoid "Multiple GoTrueClient instances" warning
    // and overlapping session caches during the test.
    const drowederClient = createClient(drowederUrl, drowederAnonKey, {
        auth: { storageKey: 'temp-auth-droweder', persistSession: false }
    });

    // Attempt login on DRoweder
    const { data: drowederData, error: drowederError } = await drowederClient.auth.signInWithPassword({ email, password });

    if (drowederError && (drowederError.message.toLowerCase().includes("invalid login credentials") || drowederError.status === 400 || drowederError.status === 403)) {
        // Try Particular if invalid credentials on DRoweder
        const particularClient = createClient(particularUrl, particularAnonKey, {
            auth: { storageKey: 'temp-auth-particular', persistSession: false }
        });
        const { data: particularData, error: particularError } = await particularClient.auth.signInWithPassword({ email, password });

        if (particularError) {
            throw particularError;
        } else {
            // Success on Particular
            localStorage.setItem('active_project', 'particular');
            await supabase.auth.setSession({
                access_token: particularData.session.access_token,
                refresh_token: particularData.session.refresh_token
            });
            window.location.href = '/chat';
        }
    } else if (drowederError) {
        // Other DRoweder error (e.g. rate limit, network)
        throw drowederError;
    } else {
        // Success on DRoweder
        localStorage.setItem('active_project', 'droweder');
        await supabase.auth.setSession({
            access_token: drowederData.session.access_token,
            refresh_token: drowederData.session.refresh_token
        });
        window.location.href = '/chat';
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('active_project');
    window.location.href = '/login'; // Force reload to clear client state
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut }}>
      {!loading ? children : <div className="flex h-screen items-center justify-center text-gray-500">Carregando...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
