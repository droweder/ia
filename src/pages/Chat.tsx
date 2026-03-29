/* eslint-disable react-hooks/purity */
import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Bot, User, ChevronDown, ShieldCheck, Database, AlertCircle, Plus, Mic, ArrowUp, Copy, Check, RefreshCcw, X, File as FileIcon, Sparkles } from 'lucide-react';
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

import { chatWithOpenRouterStream } from '../lib/openRouterClient';
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
            <code {...props} className={`${className || ''} bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-sm text-pink-600 dark:text-pink-400`}>
                {children}
            </code>
        );
    }

    const language = match[1];

    return (
        <div className="relative group/code mt-4 mb-4 rounded-xl overflow-hidden bg-[#1E1E1E] border border-gray-700/50 shadow-sm">
            <div
                className={`flex items-center justify-between px-4 py-2.5 bg-[#2D2D2D] text-xs font-medium text-slate-500 dark:text-gray-400 transition-colors ${language === 'sql' ? 'cursor-pointer hover:bg-[#3D3D3D]' : ''}`}
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
                        className="flex items-center gap-1.5 hover:text-slate-800 dark:text-white transition-colors"
                        title="Copiar código"
                    >
                        {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span className={isCopied ? "text-emerald-400" : ""}>{isCopied ? 'Copiado' : 'Copiar'}</span>
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="w-full overflow-x-auto p-4 pb-2 text-sm scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700 scrollbar-track-transparent">
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

const MODELS = [
  { id: 'free', name: 'Automático (Gratuito)', description: 'Modelos rápidos e gratuitos', isPaid: false },
  { id: 'auto', name: 'Automático (Pago)', description: 'O melhor modelo disponível pago', isPaid: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Pago)', description: 'Mais inteligente, OpenAI', isPaid: true },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Pago)', description: 'Excelente para código, Anthropic', isPaid: true }
];

const Chat: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState('free');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [input, setInput] = useState("");
  const [isInputExpanded, setIsInputExpanded] = useState(false);

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





  const [showSql, setShowSql] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (activeConversationId) {
        // eslint-disable-next-line
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
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [messages, loading]);



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

useEffect(() => {
    if (user) {
        fetchCompanyId();
    }
  }, [user]);

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
                    let fullText = '';

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
            const fileName = `${new Date().getTime()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
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

    // Save user message (Aways wait for DB to avoid race conditions with duplicate states)
    const { data: savedUserMsg, error: msgError } = await supabase
        .schema('droweder_ia')
        .from('messages')
        .insert({
            conversation_id: conversationId,
            role: 'user',
            content: finalMessageContent
        })
        .select()
        .single();

    if (msgError || !savedUserMsg) {
        console.error('Error saving message:', msgError);
        setLoading(false);
        return false;
    }

    // Safely append the confirmed user message to state, ignoring temp ids
    setMessages(prev => [...prev.filter(m => !m.id.startsWith('temp-')), savedUserMsg as Message]);

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
        7. Seja conciso, profissional e use Português do Brasil.
        8. VOCÊ TEM ACESSO À INTERNET em tempo real. Sempre que um usuário pedir informações de datas futuras (ex: 2025, 2026), notícias, ou dados não constantes no ERP, NÃO NEGUE O ACESSO; pesquise e responda com base nos resultados da web acoplados à sua requisição.
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
        // Optimistic AI message placeholder. We use a more distinct ID.
        const tempAiMessageId = 'temp-ai-' + Math.random().toString(36).substring(7) + '-' + new Date().getTime();
        const initialAiMessage: Message = { id: tempAiMessageId, role: 'assistant', content: '' };

        // Append empty AI message to state for streaming
        setMessages(prev => [...prev, initialAiMessage]);

        const messagesForApi = openRouterMessages.filter(m => m.role !== 'system');


        await chatWithOpenRouterStream(
            messagesForApi,
            systemPrompt,
            selectedModelId,
            {
                onUpdate: (chunk: string) => {

                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === tempAiMessageId ? { ...msg, content: chunk } : msg
                        )
                    );
                },
                onError: (errMsg: string) => {
                     setError(`Falha na API da IA: ${errMsg}. Verifique sua conexão e tente novamente.`);
                     setLoading(false);
                },
                onDone: async (finalText: string) => {
                    // VERIFY IF THE AI RETURNED SQL
                    const finalResponseContent = finalText;
                    const sqlMatch = finalText.match(/<sql>([\s\S]*?)<\/sql>/i);

                    if (sqlMatch && sqlMatch[1]) {
                        const extractedSql = sqlMatch[1].trim();
                        console.log("Executando SQL Gerado pela IA:", extractedSql);
                        const { data: sqlData, error: sqlError } = await supabase.rpc('execute_ai_sql', {
                            query: extractedSql
                        });

                        const queryResultStr = sqlError ? `Erro ao executar a consulta: ${sqlError.message || JSON.stringify(sqlError)}` : JSON.stringify(sqlData, null, 2);
                        const dbResultPrompt = `Resultado da query SQL:\n\`\`\`json\n${queryResultStr}\n\`\`\`\nPor favor, forneça a resposta final ao usuário em linguagem natural.`;

                        const followUpMessages = [...messagesForApi, { role: 'assistant', content: finalText }, { role: 'user', content: dbResultPrompt }];

                        // Clear the temp message text for the second phase of streaming

                        await chatWithOpenRouterStream(
                            followUpMessages,
                            systemPrompt,
                            selectedModelId,
                            {
                                onUpdate: (chunk2: string) => {

                                    setMessages(prev =>
                                        prev.map(msg =>
                                            msg.id === tempAiMessageId ? { ...msg, content: chunk2 } : msg
                                        )
                                    );
                                },
                                onError: (errMsg2: string) => {
                                    setError(`Falha na API da IA durante SQL: ${errMsg2}.`);
                                },
                                onDone: async (finalText2: string) => {
                                     await saveFinalMessage(conversationId!, finalText2, 'auto', tempAiMessageId);
                                }
                            }
                        );
                        return; // Exit here as phase 2 handled saving
                    }

                    // Save AI response if no SQL was executed
                    await saveFinalMessage(conversationId!, finalResponseContent, 'auto', tempAiMessageId);
                }
            }
        );

    } catch (error: any) {
        console.error("LLM Error:", error);
        setError(`Falha na API da IA: ${error.message || 'Erro de conexão com o servidor'}. Verifique o modelo ou tente novamente.`);
        setLoading(false);
        return false;
    }

    return true;
  };

  const saveFinalMessage = async (convId: string, content: string, model: string, tempId: string) => {
        const { data: aiMsg, error: aiError } = await supabase
            .schema('droweder_ia')
            .from('messages')
            .insert({
                conversation_id: convId,
                role: 'assistant',
                content: content,
                model_used: model,
            })
            .select()
            .single();

        if (aiMsg) {
            setMessages(prev => prev.map(msg => msg.id === tempId ? (aiMsg as Message) : msg));
        } else if (aiError) {
             console.error('Error saving AI message:', aiError);
             setError("Erro ao salvar resposta no histórico.");
        }
        setLoading(false);
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
      <div className="relative flex-1 flex flex-col min-w-0 min-h-0 bg-transparent transition-colors duration-200">
                {loading && (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40 dark:opacity-80 transition-opacity duration-1000">
                <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-red-500/20 dark:bg-red-600/30 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10000ms]" />
                <div className="absolute top-[20%] -right-[20%] w-[80%] h-[80%] bg-blue-500/20 dark:bg-blue-600/30 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[7000ms]" />
                <div className="absolute -bottom-[30%] left-[20%] w-[70%] h-[70%] bg-yellow-400/20 dark:bg-yellow-500/20 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10000ms]" />
            </div>
        )}

        {/* Header - Simplified */}
                <div className="absolute top-4 left-4 z-20" ref={modelMenuRef}>
            <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/40 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 backdrop-blur-xl border border-slate-200 dark:border-slate-200 dark:border-white/10 text-sm font-medium text-gray-300 transition-all shadow-sm"
                title="Selecionar Modelo IA"
            >
                <Sparkles size={16} className={selectedModelId !== 'free' ? 'text-blue-500' : 'text-slate-500 dark:text-gray-400'} />
                <span className="hidden sm:inline">{MODELS.find(m => m.id === selectedModelId)?.name || 'Modelo'}</span>
                <ChevronDown size={14} className="text-slate-500 dark:text-gray-400" />
            </button>

            {/* Dropdown de Modelos */}
            {showModelMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-50 dark:bg-white dark:bg-transparent backdrop-blur-xl border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-200 dark:border-slate-200 dark:border-white/10">
                        <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider pl-2">Selecione o Modelo</p>
                    </div>
                    <div className="p-2 flex flex-col gap-1 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 hover:scrollbar-thumb-blue-700">
                        {MODELS.map(model => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    setSelectedModelId(model.id);
                                    setShowModelMenu(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left
                                    ${selectedModelId === model.id
                                        ? 'bg-blue-500/10 border border-blue-500/20'
                                        : 'hover:bg-white/40 dark:bg-white/5 border border-transparent'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-md ${selectedModelId === model.id ? 'bg-blue-500/20 text-blue-400' : 'bg-white/40 dark:bg-white/5 text-slate-500 dark:text-gray-400'}`}>
                                        <Bot size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-medium ${selectedModelId === model.id ? 'text-blue-400' : 'text-gray-200'}`}>
                                            {model.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {model.description}
                                        </span>
                                    </div>
                                </div>
                                {selectedModelId === model.id && <ShieldCheck size={16} className="text-blue-500" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-transparent scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700 scrollbar-track-transparent ">
            {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-gray-300 space-y-6">
                    <div className="w-16 h-16 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-white/20">
                        <Bot size={32} className="text-slate-700 dark:text-slate-800 dark:text-white" />
                    </div>
                    {activeAssistant ? (
                        <div className="text-center max-w-md">
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-800 dark:text-white mb-2">
                                Olá! Sou o {activeAssistant.name}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-gray-400">
                                {activeAssistant.description || "Como posso ajudar você hoje?"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                            <button onClick={() => setInput("Qual a previsão de demanda para o próximo mês?")} className="p-4 border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-black/5 dark:hover:bg-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm text-left transition-colors shadow-sm">
                                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-800 dark:text-white mb-1">Previsão de Demanda</h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Analise tendências futuras</p>
                            </button>
                             <button onClick={() => setInput("Quais ordens estão atrasadas?")} className="p-4 border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-black/5 dark:hover:bg-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm text-left transition-colors shadow-sm">
                                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-800 dark:text-white mb-1">Ordens Atrasadas</h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Liste gargalos na produção</p>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="rounded-md bg-red-900/40 p-4 border border-red-500/30 mx-auto max-w-2xl mt-4 backdrop-blur-sm">
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
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-white/10 text-gray-300' : 'bg-[#7e639f] text-white shadow-sm'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div className="flex-1 space-y-2 overflow-hidden">
                        <div className="text-sm font-semibold text-slate-800 dark:text-gray-200">
                            {msg.role === 'user' ? 'Você' : 'DRoweder IA'}
                        </div>
                        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-gray-300 leading-relaxed break-words overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700 scrollbar-track-transparent ">
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
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-md hover:bg-slate-100 dark:hover:bg-white/40 dark:bg-white/5 transition-colors"
                                    title="Copiar mensagem"
                                >
                                    {copiedMessages[msg.id] ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>

                                {/* Only show regenerate button on the last assistant message */}
                                {messages[messages.length - 1].id === msg.id && (
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={loading}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-md hover:bg-slate-100 dark:hover:bg-white/40 dark:bg-white/5 transition-colors disabled:opacity-50"
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
                                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                >
                                    <Database size={12} />
                                    <span>{showSql === msg.id ? 'Ocultar SQL' : 'Debug SQL'}</span>
                                </button>
                                {showSql === msg.id && (
                                    <div className="mt-2 p-3 bg-white/40 dark:bg-white/5 rounded-md border border-slate-200 dark:border-slate-200 dark:border-white/10 font-mono text-xs overflow-x-auto text-slate-500 dark:text-gray-400 backdrop-blur-sm">
                                        SELECT * FROM planintex.ordens ...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-transparent backdrop-blur-md">
            <div className="max-w-3xl mx-auto relative">
                <div className="relative flex flex-col group bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-[26px] transition-all overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 shadow-lg">
                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 pb-0">
                            {attachments.map((file, index) => (
                                <div key={index} className="relative group/attachment flex items-center justify-center bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-200 dark:border-white/10 shadow-sm overflow-hidden h-16 w-16">
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
                                        className="absolute -top-1 -right-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl text-gray-200 rounded-full p-0.5 opacity-0 group-hover/attachment:opacity-100 transition-opacity border border-slate-200 dark:border-slate-200 dark:border-white/10 shadow-sm hover:bg-slate-700"
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
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:text-gray-400 dark:hover:text-gray-200 transition-colors border border-transparent hover:bg-black/5 dark:hover:bg-black/5 dark:hover:bg-white/10"
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
                        rows={isInputExpanded ? 10 : 1}
                        className={`flex-1 py-3.5 bg-transparent resize-none focus:outline-none text-base text-slate-800 dark:text-white placeholder-gray-400 disabled:opacity-50 transition-all ${isInputExpanded ? "min-h-[240px] max-h-[50vh]" : "min-h-[52px] max-h-[200px]"}`}
                        style={{ overflowY: "auto" }}
                    />
                    <div className="p-2 pr-3 flex items-center gap-2 pb-[10px]">
                        <button
                            onClick={() => setIsInputExpanded(!isInputExpanded)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:text-gray-400 dark:hover:text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                            title={isInputExpanded ? "Reduzir" : "Expandir"}
                        >
                            {isInputExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button
                            onClick={toggleRecording}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-transparent
                                ${isRecording
                                    ? 'bg-red-500 text-slate-800 dark:text-white animate-pulse'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-black/5 dark:hover:bg-white/10'
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
                                    ? 'bg-black text-slate-800 dark:text-white dark:bg-white dark:text-black opacity-100 hover:opacity-80'
                                    : 'bg-black text-slate-800 dark:text-white dark:bg-white dark:text-black hover:opacity-80'
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
