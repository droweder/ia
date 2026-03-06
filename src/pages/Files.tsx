import React, { useState, useEffect, useRef } from 'react';
import { Folder, File as FileIcon, Upload, Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface StorageFile {
    name: string;
    id: string | null;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: Record<string, any>;
}

const Files: React.FC = () => {
    const { user } = useAuth();
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [sectors, setSectors] = useState<string[]>([]);
    const [selectedSector, setSelectedSector] = useState<string | null>(null);
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newSectorName, setNewSectorName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCompanyId = async () => {
            if (!user) return;
            const { data } = await supabase
                .schema('planintex')
                .from('profiles')
                .select('empresa_id')
                .eq('id', user.id)
                .single();

            if (data?.empresa_id) {
                setCompanyId(data.empresa_id);
            }
        };
        fetchCompanyId();
    }, [user]);

    useEffect(() => {
        if (companyId) {
            loadSectors();
        }
    }, [companyId]);

    useEffect(() => {
        if (companyId && selectedSector) {
            loadFiles(selectedSector);
        } else {
            setFiles([]);
        }
    }, [selectedSector, companyId]);

    const loadSectors = async () => {
        if (!companyId) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase.storage
                .from('company_files')
                .list(companyId, { sortBy: { column: 'name', order: 'asc' } });

            if (error) {
                console.error("Error loading sectors:", error);
                return;
            }

            if (data) {
                // In Supabase storage list, folders have id = null
                const folders = data.filter(item => item.id === null).map(f => f.name);
                setSectors(folders);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loadFiles = async (sector: string) => {
        if (!companyId) return;
        setIsLoading(true);
        try {
            const path = `${companyId}/${sector}`;
            const { data, error } = await supabase.storage
                .from('company_files')
                .list(path, { sortBy: { column: 'name', order: 'asc' } });

            if (error) {
                console.error("Error loading files:", error);
                return;
            }

            if (data) {
                // Filter out the .keep files
                const actualFiles = data.filter(f => f.name !== '.keep' && f.id !== null);
                setFiles(actualFiles);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSector = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSectorName.trim() || !companyId) return;

        setIsLoading(true);
        try {
            const sectorName = newSectorName.trim();
            const filePath = `${companyId}/${sectorName}/.keep`;

            // Create a small empty blob to act as a placeholder for the folder
            const emptyBlob = new Blob([''], { type: 'text/plain' });

            const { error } = await supabase.storage
                .from('company_files')
                .upload(filePath, emptyBlob);

            if (error && (error as any).statusCode !== '409') { // ignore conflict if folder exists
                console.error("Error creating sector:", error);
                if (error.message.includes('Bucket not found')) {
                    alert("Erro: O bucket 'company_files' não foi encontrado no Supabase. Por favor, crie este bucket (público) no painel do Supabase (Storage) antes de prosseguir com uploads.");
                } else {
                    alert(`Erro ao criar setor: ${error.message}`);
                }
            } else {
                setNewSectorName('');
                await loadSectors();
                setSelectedSector(sectorName);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !companyId || !selectedSector) return;

        setIsUploading(true);
        try {
            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                // Keep the original name, but perhaps add timestamp to avoid collisions if preferred.
                // For a file manager, keeping original name makes sense, we can overwrite or fail on conflict.
                const filePath = `${companyId}/${selectedSector}/${file.name}`;

                const { error } = await supabase.storage
                    .from('company_files')
                    .upload(filePath, file, { upsert: true });

                if (error) {
                    console.error("Error uploading file:", error);
                    if (error.message.includes('Bucket not found')) {
                        alert("Erro: O bucket 'company_files' não foi encontrado no Supabase. Por favor, crie este bucket (público) no painel do Supabase (Storage) antes de prosseguir com uploads.");
                    } else {
                        alert(`Erro ao fazer upload do arquivo: ${error.message}`);
                    }
                }
            }

            await loadFiles(selectedSector);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteFile = async (fileName: string) => {
        if (!companyId || !selectedSector) return;

        try {
            const path = `${companyId}/${selectedSector}/${fileName}`;
            const { error } = await supabase.storage
                .from('company_files')
                .remove([path]);

            if (error) {
                console.error("Error deleting file:", error);
            } else {
                setFiles(prev => prev.filter(f => f.name !== fileName));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (bytes === undefined || bytes === null) return '0 B';
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-full w-full bg-transparent dark:bg-transparent">
            {/* Left Sidebar for Sectors */}
            <div className="w-64 border-r border-slate-200 dark:border-white/10 flex flex-col bg-white/40 dark:bg-white/5 backdrop-blur-xl">
                <div className="p-4 border-b border-slate-200 dark:border-white/10">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-100 flex items-center gap-2">
                        <Folder className="text-[#7e639f]" size={20} />
                        Setores
                    </h2>
                </div>

                <div className="p-4 border-b border-slate-200 dark:border-white/10">
                    <form onSubmit={handleCreateSector} className="flex gap-2">
                        <input
                            type="text"
                            value={newSectorName}
                            onChange={(e) => setNewSectorName(e.target.value)}
                            placeholder="Novo setor..."
                            className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7e639f]"
                        />
                        <button
                            type="submit"
                            disabled={!newSectorName.trim() || isLoading}
                            className="bg-[#7e639f] text-white p-1.5 rounded-lg hover:bg-[#6b5288] disabled:opacity-50 transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sectors.map(sector => (
                        <button
                            key={sector}
                            onClick={() => setSelectedSector(sector)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                                selectedSector === sector
                                    ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-medium'
                                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                        >
                            <Folder size={16} className={selectedSector === sector ? 'text-[#7e639f]' : 'text-slate-400'} />
                            <span className="truncate">{sector}</span>
                        </button>
                    ))}
                    {sectors.length === 0 && !isLoading && (
                        <p className="text-sm text-slate-500 dark:text-gray-400 p-2 text-center">
                            Nenhum setor criado.
                        </p>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl flex items-center justify-between px-6 z-10 shrink-0">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800 dark:text-gray-100">
                            {selectedSector ? `Arquivos: ${selectedSector}` : 'Gerenciador de Arquivos'}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-gray-400">
                            {selectedSector
                                ? 'Gerencie os documentos e dados da empresa deste setor.'
                                : 'Selecione ou crie um setor para começar.'}
                        </p>
                    </div>

                    {selectedSector && (
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar arquivo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7e639f] w-64"
                                />
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                multiple
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="flex items-center gap-2 bg-[#7e639f] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#6b5288] transition-colors disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                Upload
                            </button>
                        </div>
                    )}
                </header>

                {/* File List */}
                <main className="flex-1 overflow-y-auto p-6">
                    {!selectedSector ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Folder className="text-slate-400" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-700 dark:text-gray-200 mb-1">
                                Nenhum setor selecionado
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-gray-400 max-w-sm">
                                Selecione um setor no menu lateral para visualizar os arquivos ou crie um novo setor para começar a organizar os dados da sua empresa.
                            </p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="animate-spin text-[#7e639f]" size={32} />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <FileIcon className="text-slate-400" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-700 dark:text-gray-200 mb-1">
                                Este setor está vazio
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
                                Faça o upload de documentos para disponibilizá-los neste setor.
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm text-[#7e639f] font-medium hover:underline"
                            >
                                Fazer upload de arquivo
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredFiles.map(file => (
                                <div
                                    key={file.name}
                                    className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-[#7e639f]/50 transition-colors backdrop-blur-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                                            <FileIcon className="text-[#7e639f]" size={20} />
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFile(file.name)}
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            title="Excluir arquivo"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 dark:text-gray-200 truncate" title={file.name}>
                                            {file.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-slate-500 dark:text-gray-400">
                                                {formatFileSize(file.metadata?.size)}
                                            </p>
                                            <span className="w-1 h-1 bg-slate-300 dark:bg-gray-600 rounded-full"></span>
                                            <p className="text-xs text-slate-500 dark:text-gray-400">
                                                {new Date(file.created_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Files;
