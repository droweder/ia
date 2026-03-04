import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError("Por favor, preencha todos os campos.");
        return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      navigate('/chat');
    } catch (err: any) {
      console.error(err);
      if (err.message === "Invalid login credentials") {
          setError("E-mail ou senha incorretos.");
      } else {
          setError('Erro ao fazer login: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-gray-100">

      {/* Background Aurora Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[10000ms]" />
          <div className="absolute top-[30%] -right-[20%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[7000ms]" />
          <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-yellow-500/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[10000ms]" />
          {/* subtle noise overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
            <img src="https://phofwpyxbeulodrzfdjq.supabase.co/storage/v1/object/public/imagens_app/favicom_droweder.png" alt="DRoweder IA" className="w-12 h-12 object-contain" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Entrar na DRoweder AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          Acesso seguro para empresas conectadas ao Planintex
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Endereço de e-mail
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-white/10 rounded-md py-2.5 border bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm transition-all"
                  placeholder="voce@empresa.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Senha
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-white/10 rounded-md py-2.5 border bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-900/30 p-4 border border-red-500/30 backdrop-blur-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-200">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all gap-2 items-center"
              >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        Entrando...
                    </>
                ) : (
                    'Entrar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400 bg-slate-900">
                  Segurança Enterprise
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-2 text-xs text-gray-400 items-center text-center opacity-80">
                <ShieldCheck size={14} className="flex-shrink-0" />
                <span>Seus dados são protegidos com criptografia de ponta a ponta.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
