import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, ChevronDown, ShieldCheck, Loader2, Database, AlertCircle, Plus, Mic, ArrowUp, Copy, Check, RefreshCcw, X, File as FileIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

import { chatWithOpenRouter } from '../lib/openRouterClient';
import { useOutletContext } from 'react-router-dom';
import type { LayoutContextType } from '../components/Layout';
import type { OpenRouterMessage } from '../types';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    model_used?: string;
    sql_query?: string; // New field for internal SQL logging (if we decide to show it later)
}


const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    const [isCopied, setIsCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(match && match[1] !== 'sql'); // hide SQL by default

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    if (inline || !match) {
        return (
            <code {...props} className={`${className || ''} bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-sm text-pink-600 dark:text-pink-400`}>
                {children}
            </code>
        );
    }

    const language = match[1];

    return (
        <div className="relative group/code mt-4 mb-4 rounded-xl overflow-hidden bg-[#1E1E1E] border border-gray-700/50 shadow-sm">
            <div
                className={`flex items-center justify-between px-4 py-2.5 bg-[#2D2D2D] text-xs font-medium text-gray-400 transition-colors ${language === 'sql' ? 'cursor-pointer hover:bg-[#3D3D3D]' : ''}`}
                onClick={() => language === 'sql' && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    {language === 'sql' && (
                        <ChevronDown size={14} className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                    <span className="uppercase tracking-wider">{language === 'sql' ? 'SQL EXECUTADO PELA IA' : language}</span>
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                        title="Copiar código"
                    >
                        {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span className={isCopied ? "text-emerald-400" : ""}>{isCopied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="w-full overflow-x-auto p-4 text-sm scrollbar-thin scrollbar-thumb-blue-900 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-blue-800 dark:hover:scrollbar-thumb-blue-700 scrollbar-track-transparent">
                    <SyntaxHighlighter
                        {...({ ...props, ref: undefined } as any)}
                        PreTag="div"
                        children={codeString}
                        language={language}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                        wrapLongLines={false}
                    />
                </div>
            )}
        </div>
    );
};

const Chat: React.FC = () => {
  const { conversations, setConversations, activeConversationId, setActiveConversationId, activeAssistantId, setActiveAssistantId, assistants } = useOutletContext<LayoutContextType>();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR'; // Set language to Portuguese

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const [copiedMessages, setCopiedMessages] = useState<{ [key: string]: boolean }>({});

  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessages((prev) => ({ ...prev, [messageId]: true }));
      setTimeout(() => {
        setCopiedMessages((prev) => ({ ...prev, [messageId]: false }));
      }, 2000);
    });
  };

  const handleRegenerate = async () => {
    if (messages.length === 0 || loading) return;

    // Find the last user message to resubmit
    const lastUserMsgIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMsgIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserMsgIndex;
    const lastUserMessage = messages[actualIndex];

    // Temporarily set input and trigger send, removing all messages after that user message
    const previousMessages = messages.slice(0, actualIndex);
    setMessages(previousMessages); // Trim the chat history

    // Call the send function with the previous user's query
    // To do this cleanly, we can bypass the setInput and just call a custom fetch
    await handleSendCustomMessage(lastUserMessage.content, previousMessages);
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Microphone start error:", e);
      }
    }
  };




  const [input, setInput] = useState('');
  const [showSql, setShowSql] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Hidden feature flag for SQL debug (can be enabled via query param or user role later)
  const SHOW_SQL_DEBUG = false;

  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-pro-exp-02-05:free');

  const models = [
    { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro (Web Search)' },
    { id: 'google/gemini-2.0-flash-lite-001', name: 'Gemini 2.0 Flash Lite' },
    { id: 'perplexity/llama-3.1-sonar-huge-128k-online', name: 'Perplexity Sonar Online' },
    { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B (Free)' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)' },
  ];

  useEffect(() => {
    if (user) {
        fetchCompanyId();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversationId) {
        fetchMessages(activeConversationId);
        // Sync active assistant with the loaded conversation if needed
        const currentConv = conversations.find(c => c.id === activeConversationId);
        if (currentConv && currentConv.assistant_id) {
            setActiveAssistantId(currentConv.assistant_id);
        } else {
            setActiveAssistantId(null);
        }
    } else {
        setMessages([]); // Clear messages when creating new conversation
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCompanyId = async () => {
    if (!user) return;
    try {
        const { data, error } = await supabase
            .schema('planintex')
            .from('profiles')
            .select('empresa_id')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching user company:', error);
            setError("Não foi possível identificar sua empresa.");
        } else if (data) {
            setCompanyId(data.empresa_id);
        } else {
             setError("Sua conta não está vinculada a nenhuma empresa no Planintex.");
        }
    } catch (err) {
        console.error("Unexpected error fetching company:", err);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
        .schema('droweder_ia')
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) console.error('Error fetching messages:', error);
    if (data) setMessages(data as Message[]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return;
    const content = input;
    const currentAttachments = [...attachments];

    // Do not clear input and attachments yet; they will be cleared upon successful sending
    const success = await handleSendCustomMessage(content, messages, currentAttachments);
    if (success) {
        setInput('');
        setAttachments([]);
    }
  };

  const handleSendCustomMessage = async (newMessageContent: string, currentHistory: Message[], files: File[] = []) => {
    if ((!newMessageContent.trim() && files.length === 0) || !user || !companyId) {
        if (!companyId) setError("Empresa não identificada. Contate o suporte.");
        return false;
    }

    setLoading(true);
    setError(null);

    let conversationId = activeConversationId;

    // Process files
    const fileUrls: string[] = [];
    let extractedTextFromFiles = "";

    if (files.length > 0) {
        for (const file of files) {
            const fileExt = file.name.split('.').pop()?.toLowerCase();

            // Text extraction based on file type
            try {
                if (fileExt === 'txt' || fileExt === 'csv' || fileExt === 'json') {
                    const text = await file.text();
                    extractedTextFromFiles += `\n\n--- Conteúdo do arquivo: ${file.name} ---\n${text}\n--- Fim do arquivo ---\n`;
                } else if (fileExt === 'pdf') {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    let fullText = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => item.str).join(" ");
                        fullText += pageText + "\n";
                    }
                    extractedTextFromFiles += `\n\n--- Conteúdo do arquivo PDF: ${file.name} ---\n${fullText}\n--- Fim do arquivo ---\n`;
                } else if (fileExt === 'docx') {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    extractedTextFromFiles += `\n\n--- Conteúdo do arquivo DOCX: ${file.name} ---\n${result.value}\n--- Fim do arquivo ---\n`;
                }
            } catch (err) {
                console.error(`Error extracting text from ${file.name}:`, err);
                // We'll still upload it, even if text extraction fails
            }

            // Upload the file to keep a record and provide a public URL
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${companyId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('company_files')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Error uploading file:", uploadError);
                setError(`Erro ao fazer upload do arquivo ${file.name}`);
                setLoading(false);
                return false;
            }

            const { data } = supabase.storage
                .from('company_files')
                .getPublicUrl(filePath);

            fileUrls.push(data.publicUrl);
        }
    }

    // Append file info to the user message for context
    let finalMessageContent = newMessageContent;

    // Add text contents to the user prompt if any files were parsed
    if (extractedTextFromFiles) {
        finalMessageContent += extractedTextFromFiles;
    }

    // Add visual links
    if (fileUrls.length > 0) {
        const links = fileUrls.map(url => `[Arquivo anexado](${url})`).join('\n');
        finalMessageContent = finalMessageContent ? `${finalMessageContent}\n\n${links}` : links;
    }

    // Create conversation if none exists
    if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
            .schema('droweder_ia')
            .from('conversations')
            .insert({
                user_id: user.id,
                company_id: companyId,
                title: finalMessageContent.substring(0, 30) + '...',
                assistant_id: activeAssistantId || null,
            })
            .select()
            .single();

        if (convError || !newConv) {
            console.error('Error creating conversation:', convError);
            setError("Erro ao iniciar conversa.");
            setLoading(false);
            return false;
        }
        conversationId = newConv.id;
        setActiveConversationId(newConv.id);
        setConversations([newConv, ...conversations]);
    }

    // Save user message
    const { error: msgError } = await supabase
        .schema('droweder_ia')
        .from('messages')
        .insert({
            conversation_id: conversationId,
            role: 'user',
            content: finalMessageContent
        });

    if (msgError) {
        console.error('Error saving message:', msgError);
        setLoading(false);
        return false;
    }

    // Optimistic update
    const userMessage: Message = { id: 'temp-' + Date.now(), role: 'user', content: finalMessageContent };
    // Only append to the currentHistory we passed in, avoiding race conditions if we trimmed history
    setMessages([...currentHistory, userMessage]);

    // Text-to-SQL logic
    // We instruct the LLM to behave as a data analyst.
    // In a real implementation with Text-to-SQL, the Edge Function handles the "tool calling"
    // to query the database. Here, we simulate that the Edge Function does it.

let systemPrompt = `Você é o DRoweder IA, um assistente especialista em manufatura conectado ao ERP Planintex.

        INSTRUÇÕES BASE:
        1. O usuário fará perguntas sobre dados do ERP (tabelas disponíveis: planintex.ordens, planintex.pedidos_venda, planintex.empresas, etc).
        2. Se precisar consultar dados, VOCÊ DEVE responder EXCLUSIVAMENTE com uma query SQL válida no schema 'planintex', delimitada pelas tags <sql> e </sql>. Exemplo: <sql>SELECT count(*) FROM planintex.ordens;</sql>.
        3. Use a role 'ai_reader_role' (apenas leitura). Não use INSERT/UPDATE/DELETE.
        4. O sistema executará sua query e retornará o JSON dos resultados em uma mensagem interna.
        5. Quando receber os resultados do JSON (ou se a pergunta não exigir banco de dados), responda ao usuário final APENAS com a análise em linguagem natural e os dados formatados (tabelas markdown, listas).
        6. NÃO exponha comandos SQL na resposta final com textos longos ou não formatados. Se precisar justificar a consulta, e o usuário quiser ver o SQL, envolva-o em blocos de markdown padrão (\`\`\`sql) que agora são ocultos por padrão na interface.
        7. Seja conciso, profissional e use Português do Brasil.\n        8. VOCÊ TEM ACESSO À INTERNET em tempo real. Sempre que um usuário pedir informações de datas futuras (ex: 2025, 2026), notícias, ou dados não constantes no ERP, NÃO NEGUE O ACESSO; pesquise e responda com base nos resultados da web acoplados à sua requisição.
        8. O 'empresa_id' do usuário logado é: ${companyId}. Sempre filtre as tabelas por empresa_id = '${companyId}' quando aplicável.
        `;

    // Inject active assistant instructions if present
    if (activeAssistantId) {
        const activeAssistant = assistants.find(a => a.id === activeAssistantId);
        if (activeAssistant && activeAssistant.instructions) {
             systemPrompt += `\n\nINSTRUÇÕES ESPECÍFICAS DO ASSISTENTE ATUAL (${activeAssistant.name}):\n${activeAssistant.instructions}`;
        }
    }

    const openRouterMessages: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        ...currentHistory.map(m => ({ role: m.role, content: m.content }) as OpenRouterMessage),
        { role: 'user', content: finalMessageContent }
    ];

    try {
        let aiResponse = await chatWithOpenRouter(selectedModel, openRouterMessages);

        // Check for mock error response from openRouterClient when API key is missing
        if (aiResponse?.id === 'mock-id') {
            setError(aiResponse.choices[0].message.content);
            setLoading(false);
            return false;
        }

        const aiContent = aiResponse?.choices[0]?.message?.content || "Desculpe, não consegui processar sua solicitação no momento.";
        let modelUsed = aiResponse?.model || selectedModel;
        let finalResponseContent = aiContent;

        // VERIFY IF THE AI RETURNED SQL
        const sqlMatch = aiContent.match(/<sql>([\s\S]*?)<\/sql>/i);
        if (sqlMatch && sqlMatch[1]) {
            const extractedSql = sqlMatch[1].trim();

            // Log that we are executing SQL (optional UI feedback)
            console.log("Executando SQL Gerado pela IA:", extractedSql);

            // Execute the SQL via our custom RPC
            const { data: sqlData, error: sqlError } = await supabase.rpc('execute_ai_sql', {
                query: extractedSql
            });

            let queryResultStr = "";
            if (sqlError) {
                console.error("Erro ao executar SQL:", sqlError);
                queryResultStr = `Erro ao executar a consulta: ${sqlError.message || JSON.stringify(sqlError)}`;
            } else {
                queryResultStr = JSON.stringify(sqlData, null, 2);
            }

            // Inform the AI about the result
            const dbResultPrompt = `Resultado da query SQL:\n\`\`\`json\n${queryResultStr}\n\`\`\`\nPor favor, forneça a resposta final ao usuário em linguagem natural.`;

            // Add AI's SQL message and the system's response to the context
            openRouterMessages.push({ role: 'assistant', content: aiContent });
            openRouterMessages.push({ role: 'user', content: dbResultPrompt });

            // Request final answer
            aiResponse = await chatWithOpenRouter(selectedModel, openRouterMessages);
            if (aiResponse?.id === 'mock-id') {
                setError(aiResponse.choices[0].message.content);
                setLoading(false);
                return false;
            }
            finalResponseContent = aiResponse?.choices[0]?.message?.content || "Desculpe, ocorreu um erro após a consulta aos dados.";
            modelUsed = aiResponse?.model || selectedModel;
        }

        // Save AI response
        const { data: aiMsg, error: aiError } = await supabase
            .schema('droweder_ia')
            .from('messages')
            .insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: finalResponseContent,
                model_used: modelUsed,
            })
            .select()
            .single();

        if (aiMsg) {
            setMessages(prev => [...prev, aiMsg as Message]);
        } else if (aiError) {
             console.error('Error saving AI message:', aiError);
             // Show error in UI as fallback
             setError("Erro ao salvar resposta no histórico.");
        }

        setLoading(false);
        return true;




    } catch (error: any) {
        console.error("LLM Error:", error);
        setError(`Falha na API da IA: ${error.message || 'Erro de conexão com o servidor'}. Verifique o modelo ou tente novamente.`);
        setLoading(false);
        return false;
    } finally {
        setLoading(false);
    }

    return true;
  };

  const toggleSql = (msgId: string) => {
    if (showSql === msgId) {
        setShowSql(null);
    } else {
        setShowSql(msgId);
    }
  }


  const activeAssistant = assistants.find(a => a.id === activeAssistantId);

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 bg-transparent overflow-hidden transition-colors duration-200">

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent transition-colors duration-200">
        {/* Header - Simplified */}
        <div className="h-14 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white/40 dark:bg-white/5 backdrop-blur-md px-4 shadow-sm z-10">
            <div className="flex items-center gap-4">
                 {/* Model Selector */}
                <div className="relative group">
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="appearance-none bg-transparent font-medium text-slate-700 dark:text-gray-200 text-sm hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg py-1.5 pl-2 pr-8 focus:outline-none cursor-pointer transition-colors"
                    >
                        {models.map(model => (
                            <option key={model.id} value={model.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-gray-200">{model.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Connection Badge */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-gray-300 bg-slate-200/50 dark:bg-white/10 px-3 py-1.5 rounded-full">
                <ShieldCheck size={14} className="text-emerald-500 dark:text-emerald-400" />
                <span className="hidden sm:inline">Planintex Conectado</span>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-transparent scrollbar-thin scrollbar-thumb-blue-900 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-blue-800 dark:hover:scrollbar-thumb-blue-700">
            {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-gray-300 space-y-6">
                    <div className="w-16 h-16 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-white/20">
                        <Bot size={32} className="text-slate-700 dark:text-white" />
                    </div>
                    {activeAssistant ? (
                        <div className="text-center max-w-md">
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                                Olá! Sou o {activeAssistant.name}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-gray-400">
                                {activeAssistant.description || "Como posso ajudar você hoje?"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                            <button onClick={() => setInput("Qual a previsão de demanda para o próximo mês?")} className="p-4 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm text-left transition-colors shadow-sm">
                                <h3 className="text-sm font-medium text-slate-800 dark:text-white mb-1">Previsão de Demanda</h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Analise tendências futuras</p>
                            </button>
                             <button onClick={() => setInput("Quais ordens estão atrasadas?")} className="p-4 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm text-left transition-colors shadow-sm">
                                <h3 className="text-sm font-medium text-slate-800 dark:text-white mb-1">Ordens Atrasadas</h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Liste gargalos na produção</p>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="rounded-md bg-red-100/80 dark:bg-red-900/40 p-4 border border-red-300 dark:border-red-500/30 mx-auto max-w-2xl mt-4 backdrop-blur-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300 group`}>
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-300' : 'bg-[#7e639f] text-white shadow-sm'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div className="flex-1 space-y-2 overflow-hidden">
                        <div className="text-sm font-semibold text-slate-800 dark:text-gray-200">
                            {msg.role === 'user' ? 'Você' : 'DRoweder IA'}
                        </div>
                        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-gray-300 leading-relaxed break-words overflow-x-auto scrollbar-thin scrollbar-thumb-blue-900 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-blue-800 dark:hover:scrollbar-thumb-blue-700">
                            {msg.role === 'user' ? (
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code: CodeBlock
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            )}
                        </div>

                        {/* Action Buttons for AI messages */}
                        {msg.role === 'assistant' && (
                            <div className="flex items-center gap-2 mt-2">
                                <button
                                    onClick={() => handleCopyMessage(msg.content, msg.id)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                    title="Copiar mensagem"
                                >
                                    {copiedMessages[msg.id] ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>

                                {/* Only show regenerate button on the last assistant message */}
                                {messages[messages.length - 1].id === msg.id && (
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={loading}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                                        title="Regerar resposta"
                                    >
                                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Hidden/Debug SQL Accordion */}
                        {SHOW_SQL_DEBUG && msg.role === 'assistant' && (
                            <div className="mt-2">
                                <button
                                    onClick={() => toggleSql(msg.id)}
                                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                >
                                    <Database size={12} />
                                    <span>{showSql === msg.id ? 'Ocultar SQL' : 'Debug SQL'}</span>
                                </button>
                                {showSql === msg.id && (
                                    <div className="mt-2 p-3 bg-slate-100/50 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/10 font-mono text-xs overflow-x-auto text-slate-600 dark:text-gray-400 backdrop-blur-sm">
                                        SELECT * FROM planintex.ordens ...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
             {loading && (
                <div className="flex gap-4 max-w-3xl mx-auto w-full">
                    <div className="w-8 h-8 rounded-sm bg-purple-600/80 text-white flex items-center justify-center flex-shrink-0">
                        <Loader2 size={16} className="animate-spin" />
                    </div>
                    <div className="flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1 delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-transparent backdrop-blur-md">
            <div className="max-w-3xl mx-auto relative">
                <div className="relative flex flex-col group bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-[26px] transition-all overflow-hidden focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-gray-600">
                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 pb-0">
                            {attachments.map((file, index) => (
                                <div key={index} className="relative group/attachment flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden h-16 w-16">
                                    {file.type.startsWith('image/') ? (
                                        <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-gray-300">
                                            <FileIcon size={24} />
                                            <span className="text-[10px] font-medium mt-1 truncate w-14 text-center px-1">{file.name.split('.').pop()?.toUpperCase()}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeAttachment(index)}
                                        className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-gray-200 rounded-full p-0.5 opacity-0 group-hover/attachment:opacity-100 transition-opacity border border-slate-200 dark:border-white/10 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative flex items-end">
                        <div className="flex items-center justify-center p-2 pl-3 pb-[10px]">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
                            >
                                <Plus size={20} strokeWidth={2.5} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                className="hidden"
                            />
                        </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Pergunte alguma coisa"
                        disabled={loading}
                        rows={1}
                        className="flex-1 py-3.5 bg-transparent resize-none focus:outline-none text-base text-slate-900 dark:text-gray-100 placeholder-slate-500 dark:placeholder-gray-400 disabled:opacity-50 max-h-[200px]"
                        style={{ minHeight: '52px' }}
                    />
                    <div className="p-2 pr-3 flex items-center gap-2 pb-[10px]">
                        <button
                            onClick={toggleRecording}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-transparent
                                ${isRecording
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10'
                                }
                            `}
                            title={isRecording ? "Parar gravação" : "Gravar áudio"}
                        >
                             <Mic size={20} strokeWidth={2} />
                        </button>
                        <button
                            onClick={handleSendMessage}
                            disabled={(!input.trim() && attachments.length === 0) || loading}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                ${(!input.trim() && attachments.length === 0)
                                    ? 'bg-black text-white dark:bg-white dark:text-black opacity-100 hover:opacity-80'
                                    : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-80'
                                }
                                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {(!input.trim() && attachments.length === 0) ? (
                                // Simulate Audio Wave icon
                                <div className="flex items-center justify-center gap-[2px]">
                                    <div className="w-[2px] h-2.5 bg-current rounded-full"></div>
                                    <div className="w-[2px] h-4 bg-current rounded-full"></div>
                                    <div className="w-[2px] h-2 bg-current rounded-full"></div>
                                </div>
                            ) : (
                                <ArrowUp size={18} strokeWidth={2.5} />
                            )}
                        </button>
                    </div>
                </div>
                </div>
                <div className="text-center mt-3">
                    <p className="text-xs text-slate-500 dark:text-gray-400">A AI pode cometer erros. Considere verificar informações importantes.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
