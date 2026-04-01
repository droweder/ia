import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, X, Loader2, Save } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { AuroraModalBackground } from './AuroraModalBackground';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  nome?: string;
  nome_completo?: string;
  cargo?: string;
  role?: string;
  is_superadmin?: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [jobRole, setJobRole] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .schema('planintex')
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setProfile(data);
        // Map potential column names
        setFullName(data.nome || data.nome_completo || data.full_name || '');
        setJobRole(data.cargo || data.role || data.job_role || '');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Erro ao carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Create an update object intelligently based on what columns exist in the retrieved profile.
      // If profile is null (doesn't exist), we might need to insert, but let's assume update for now based on context.
      const updateData: any = {};

      // We check what the original keys were to update the right columns
      if (profile) {
          if ('nome' in profile) updateData.nome = fullName;
          else if ('nome_completo' in profile) updateData.nome_completo = fullName;
          else if ('full_name' in profile) updateData.full_name = fullName;
          else updateData.nome = fullName; // default guess if we don't know

          // If the role is editable (sometimes role is restricted, we'll try 'cargo' first)
          if ('cargo' in profile) updateData.cargo = jobRole;
          else if ('job_role' in profile) updateData.job_role = jobRole;
          // Note: we usually don't update 'role' if it's the system access role.
          // If 'role' is the only thing, we'll try to update it, but it might fail due to RLS.
      } else {
          updateData.nome = fullName;
          updateData.cargo = jobRole;
      }

      const { error: updateError } = await supabase
        .schema('planintex')
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Update local profile state
      setProfile(prev => ({ ...prev, ...updateData }));

    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Erro ao salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const displayInitials = fullName
    ? fullName.substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'US';

  // Display role (system role might be different from job role, we show system role in the badge)
  const displaySystemRole = profile?.is_superadmin ? 'Super Admin' : (profile?.role || 'Usuário');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] relative">
        <AuroraModalBackground />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-10">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <User size={24} className="text-blue-500" />
            Meu Perfil
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 relative z-10 flex-1">
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Header Info */}
                    <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl text-white font-bold uppercase shadow-lg border-4 border-[#0B0F19]">
                            {displayInitials}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">{fullName || 'Usuário sem nome'}</h3>
                            <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
                                <Mail size={16} /> {user?.email}
                            </p>
                            <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
                                <Shield size={16} className="text-emerald-500" /> {displaySystemRole}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        <h4 className="text-lg font-medium text-white flex items-center justify-between">
                            <span>Informações Básicas</span>
                            {success && <span className="text-sm text-emerald-500 font-normal animate-pulse">Salvo com sucesso!</span>}
                        </h4>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-400">Nome Completo</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                                    placeholder="Seu nome completo"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-400">Cargo / Função</label>
                                <input
                                    type="text"
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                                    placeholder="Seu cargo na empresa"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3 relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
