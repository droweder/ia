import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Search, Upload, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';

interface FileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  created_at: string;
  uploaded_by: string;
}

const Files: React.FC = () => {
  const { user } = useAuth();
  const { companyId } = useChat();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (companyId) {
      fetchFiles();
    }
  }, [companyId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .schema('droweder_ia')
        .from('files')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError('Erro ao carregar arquivos.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    if (!companyId || !user) return;

    const file = event.target.files[0];
    const fileSize = file.size;
    const fileType = file.type;
    const fileName = file.name;
    const filePath = `${companyId}/${Date.now()}_${fileName}`;

    setUploading(true);
    setError(null);

    try {
      // 1. Upload to Storage
      const { error: storageError } = await supabase.storage
        .from('company_files')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // 2. Get Public URL (or signed URL if private)
      const { data: { publicUrl } } = supabase.storage
        .from('company_files')
        .getPublicUrl(filePath);

      // 3. Insert into Database
      const { data: newFile, error: dbError } = await supabase
        .schema('droweder_ia')
        .from('files')
        .insert({
          company_id: companyId,
          name: fileName,
          size: fileSize,
          type: fileType,
          url: publicUrl,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setFiles(prev => [newFile, ...prev]);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Falha ao enviar arquivo. Tente novamente.');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
      if (!confirm(`Tem certeza que deseja excluir "${fileName}"?`)) return;

      try {
          // Optimistic UI update
          setFiles(prev => prev.filter(f => f.id !== fileId));

          const { error } = await supabase
              .schema('droweder_ia')
              .from('files')
              .delete()
              .eq('id', fileId);

          if (error) throw error;

          // Note: Ideally we should also delete from Storage, but RLS might restrict that or we can use a trigger.
          // For now, we remove the database reference.

      } catch (err) {
          console.error("Delete error:", err);
          alert("Erro ao excluir arquivo.");
          fetchFiles(); // Revert on error
      }
  };

  const formatSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Arquivos e Documentos</h1>
           <p className="text-sm text-gray-500 mt-1">Gerencie os arquivos utilizados nas suas conversas com a IA.</p>
        </div>
        <div className="relative">
            <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
            />
            <label
                htmlFor="file-upload"
                className={`flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                <span>{uploading ? 'Enviando...' : 'Enviar arquivo'}</span>
            </label>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* Error Banner */}
        {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-200">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
        )}

        {/* Search */}
        <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar arquivos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
            </div>
        </div>

        {/* Files Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {loading ? (
                <div className="p-8 text-center text-gray-500">Carregando arquivos...</div>
            ) : filteredFiles.length === 0 ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                    <FileText size={48} className="text-gray-300 dark:text-gray-600" />
                    <p>Nenhum arquivo encontrado.</p>
                </div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium border-b border-gray-100 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Tamanho</th>
                            <th className="px-6 py-4">Data de Envio</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredFiles.map((file) => (
                            <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                            <FileText size={16} />
                                        </div>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400">
                                            {file.name}
                                        </a>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{file.type?.split('/')[1]?.toUpperCase() || 'FILE'}</td>
                                <td className="px-6 py-4 text-gray-500">{formatSize(file.size)}</td>
                                <td className="px-6 py-4 text-gray-500">{new Date(file.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={file.url}
                                            download
                                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                            title="Baixar"
                                        >
                                            <Download size={16} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(file.id, file.name)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default Files;
