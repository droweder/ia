import React from 'react';
import { User, Mail, Shield } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent transition-colors duration-200">
      <div className="h-14 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-white/5 backdrop-blur-md px-6 shadow-sm z-10 shrink-0">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
          <User size={24} className="text-blue-500" />
          Perfil
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-blue-800">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col gap-6">
             <div className="flex items-center gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-4xl text-white font-bold uppercase shadow-lg">
                    DR
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Dirceu Roweder</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <Mail size={16} /> dirceu@droweder.com.br
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <Shield size={16} /> Administrador
                    </p>
                </div>
             </div>

             <div className="space-y-4">
                 <h4 className="text-lg font-medium text-slate-900 dark:text-white">Informações Básicas</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Nome Completo</label>
                         <input type="text" className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" defaultValue="Dirceu Roweder" disabled />
                     </div>
                     <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Cargo</label>
                         <input type="text" className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" defaultValue="CEO" disabled />
                     </div>
                 </div>
                 <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors opacity-50 cursor-not-allowed">
                     Salvar Alterações
                 </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
