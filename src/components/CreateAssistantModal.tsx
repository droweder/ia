import { useState, useRef } from 'react';
import { X, Bot, UploadCloud, Globe, Image as ImageIcon, Terminal, Plus, Trash2 } from 'lucide-react';

interface CreateAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string, instructions?: string) => void;
}

export function CreateAssistantModal({ isOpen, onClose, onCreate }: CreateAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'configure'>('configure');
  const [assistantName, setAssistantName] = useState('');
  const [assistantDescription, setAssistantDescription] = useState('');
  const [assistantInstructions, setAssistantInstructions] = useState('');

  // New state for GPT Builder features
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([]);
  const [capabilities, setCapabilities] = useState({
    webBrowsing: false,
    imageGeneration: false,
    codeInterpreter: false,
  });
  // State omitted as it's not being used yet to satisfy linter

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (assistantName.trim()) {
      // Pass the extra capabilities if the onCreate signature changes in the future,
      // but for now we stick to the provided signature and just show the UI.
      onCreate(assistantName.trim(), assistantDescription.trim(), assistantInstructions.trim());
      setAssistantName('');
      setAssistantDescription('');
      setAssistantInstructions('');
      setKnowledgeFiles([]);
      setCapabilities({ webBrowsing: false, imageGeneration: false, codeInterpreter: false });
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setKnowledgeFiles([...knowledgeFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setKnowledgeFiles(knowledgeFiles.filter((_, i) => i !== index));
  };

  const toggleCapability = (key: keyof typeof capabilities) => {
    setCapabilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#212121] text-slate-800 dark:text-gray-200 w-full max-w-[800px] h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Criar assistente</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">Configure um GPT personalizado</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-lg flex items-center mr-4">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'create'
                    ? 'bg-white dark:bg-[#343541] shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                }`}
              >
                Criar
              </button>
              <button
                onClick={() => setActiveTab('configure')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'configure'
                    ? 'bg-white dark:bg-[#343541] shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                }`}
              >
                Configurar
              </button>
            </div>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-slate-400 dark:scrollbar-thumb-white/20">

          {activeTab === 'create' ? (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <Bot size={48} className="text-[#7e639f] mb-4" />
                <h3 className="text-xl font-medium text-slate-800 dark:text-white">Em breve: GPT Builder</h3>
                <p className="text-slate-600 dark:text-gray-400 max-w-md">
                   O modo "Criar" permitirá que você converse com uma IA para construir seu assistente passo a passo. Por enquanto, use a aba <strong>Configurar</strong> para criar seu assistente manualmente.
                </p>
                <button
                    onClick={() => setActiveTab('configure')}
                    className="px-6 py-2 mt-4 rounded-xl bg-[#7e639f] text-white font-medium hover:bg-[#6c538c] transition-colors"
                >
                    Ir para Configurar
                </button>
             </div>
          ) : (
            <div className="flex flex-col gap-8 max-w-3xl mx-auto">
                {/* 1. Instruções */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-slate-200 dark:border-white/10 pb-2">1. Informações Básicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Nome <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={assistantName}
                                    onChange={(e) => setAssistantName(e.target.value)}
                                    placeholder="Ex: Analista de Dados"
                                    className="w-full bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#7e639f] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={assistantDescription}
                                    onChange={(e) => setAssistantDescription(e.target.value)}
                                    placeholder="Ex: Especialista em analisar relatórios..."
                                    className="w-full bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-white/10 rounded-xl py-2 px-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#7e639f] transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5">
                            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-[#343541] flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-gray-500 cursor-pointer hover:bg-slate-300 dark:hover:bg-[#40414f] transition-colors relative group">
                                <ImageIcon className="text-slate-400 dark:text-gray-400" size={32} />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus size={24} className="text-white" />
                                </div>
                            </div>
                            <span className="text-xs text-slate-500 mt-2">Adicionar Foto</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Instruções (Prompt de Sistema) <span className="text-red-500">*</span></label>
                        <textarea
                            value={assistantInstructions}
                            onChange={(e) => setAssistantInstructions(e.target.value)}
                            placeholder="O que este assistente faz? Como ele deve se comportar? O que ele deve evitar?"
                            rows={6}
                            className="w-full bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#7e639f] transition-colors resize-y min-h-[120px]"
                        />
                    </div>
                </section>

                {/* 2. Base de Conhecimento */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Base de Conhecimento
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium">Arquivos</span>
                        </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">
                        Faça upload de arquivos (PDFs, planilhas, documentos) para que o assistente os use como referência ao responder.
                    </p>

                    <div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <UploadCloud size={32} className="text-slate-400 mb-3" />
                        <p className="text-sm font-medium text-slate-700 dark:text-gray-300">Clique ou arraste arquivos para cá</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, TXT, DOCX, CSV (Máx 10MB por arquivo)</p>
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.txt,.docx,.csv,.xlsx"
                        />
                    </div>

                    {knowledgeFiles.length > 0 && (
                        <ul className="mt-4 space-y-2">
                            {knowledgeFiles.map((file, index) => (
                                <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#2b2d31] border border-slate-200 dark:border-white/10">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-md">
                                            <UploadCloud size={16} className="text-slate-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-gray-200 truncate">{file.name}</span>
                                        <span className="text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </div>
                                    <button onClick={() => removeFile(index)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* 3. Capacidades Extras */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-white/10 pb-2">
                        <h3 className="text-lg font-semibold">Capacidades Extras</h3>
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2b2d31] cursor-pointer hover:border-[#7e639f] dark:hover:border-[#7e639f] transition-colors">
                            <div className="flex items-center h-5 mt-1">
                                <input
                                    type="checkbox"
                                    checked={capabilities.webBrowsing}
                                    onChange={() => toggleCapability('webBrowsing')}
                                    className="w-4 h-4 rounded border-gray-300 text-[#7e639f] focus:ring-[#7e639f]"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                                    <Globe size={16} className="text-blue-500" />
                                    Navegação na Web
                                </span>
                                <span className="text-xs text-slate-500 dark:text-gray-400">Permite que o assistente pesquise informações na internet em tempo real.</span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2b2d31] cursor-pointer hover:border-[#7e639f] dark:hover:border-[#7e639f] transition-colors">
                            <div className="flex items-center h-5 mt-1">
                                <input
                                    type="checkbox"
                                    checked={capabilities.imageGeneration}
                                    onChange={() => toggleCapability('imageGeneration')}
                                    className="w-4 h-4 rounded border-gray-300 text-[#7e639f] focus:ring-[#7e639f]"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                                    <ImageIcon size={16} className="text-emerald-500" />
                                    Geração de Imagens
                                </span>
                                <span className="text-xs text-slate-500 dark:text-gray-400">Permite usar DALL-E (ou modelo similar) para criar imagens a partir de descrições.</span>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#2b2d31] cursor-pointer hover:border-[#7e639f] dark:hover:border-[#7e639f] transition-colors">
                            <div className="flex items-center h-5 mt-1">
                                <input
                                    type="checkbox"
                                    checked={capabilities.codeInterpreter}
                                    onChange={() => toggleCapability('codeInterpreter')}
                                    className="w-4 h-4 rounded border-gray-300 text-[#7e639f] focus:ring-[#7e639f]"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                                    <Terminal size={16} className="text-amber-500" />
                                    Análise de Dados e Código
                                </span>
                                <span className="text-xs text-slate-500 dark:text-gray-400">Capacidade de escrever e executar código Python para processar arquivos e dados.</span>
                            </div>
                        </label>
                    </div>
                </section>

                {/* 4. Ações */}
                <section className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-white/10 pb-2 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Ações</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-400">
                        Conecte seu assistente a APIs e sistemas externos (ERPs, Bancos de Dados, CRMs) para buscar ou enviar informações automaticamente.
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/20 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <Plus size={16} />
                        Adicionar Ação
                    </button>
                </section>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 shrink-0 bg-slate-50 dark:bg-black/20 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent text-slate-700 dark:text-gray-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!assistantName.trim() || !assistantInstructions.trim()}
            className="px-6 py-2 rounded-full bg-[#7e639f] text-white font-medium text-sm disabled:opacity-50 disabled:bg-slate-400 transition-all hover:opacity-90 active:scale-95"
          >
            Salvar Assistente
          </button>
        </div>

      </div>
    </div>
  );
}
