import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, ChevronDown, ShieldCheck, Loader2, Database, AlertCircle, Plus, Mic, ArrowUp, Copy, Check, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
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

const Chat: React.FC = () => {
  const { conversations, setConversations, activeConversationId, setActiveConversationId } = useOutletContext<LayoutContextType>();
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
  const [copiedBlocks, setCopiedBlocks] = useState<{ [key: string]: boolean }>({});

  const handleCopyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedBlocks((prev) => ({ ...prev, [blockId]: true }));
      setTimeout(() => {
        setCopiedBlocks((prev) => ({ ...prev, [blockId]: false }));
      }, 2000);
    });
  };

  const [input, setInput] = useState('');
  const [showSql, setShowSql] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hidden feature flag for SQL debug (can be enabled via query param or user role later)
  const SHOW_SQL_DEBUG = false;

  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-flash-lite-preview-02-05:free');

  const models = [
    { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: 'Gemini 2.0 Flash Lite (Free)' },
    { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)' },
    { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B (Free)' },
    { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)' },
  ];

  useEffect(() => {
    if (user) {
        fetchCompanyId();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversationId) {
        fetchMessages(activeConversationId);
    } else {
        setMessages([]); // Clear messages when creating new conversation
    }
  }, [activeConversationId]);

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
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching user company:', error);
            setError("Não foi possível identificar sua empresa.");
        } else if (data) {
            setCompanyId(data.company_id);
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
    if (!input.trim()) return;
    const content = input;
    setInput('');
    await handleSendCustomMessage(content, messages);
  };

  const handleSendCustomMessage = async (newMessageContent: string, currentHistory: Message[]) => {
    if (!newMessageContent.trim() || !user || !companyId) {
        if (!companyId) setError("Empresa não identificada. Contate o suporte.");
        return;
    }

    setLoading(true);
    setError(null);

    let conversationId = activeConversationId;

    // Create conversation if none exists
    if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
            .schema('droweder_ia')
            .from('conversations')
            .insert({
                user_id: user.id,
                company_id: companyId,
                title: newMessageContent.substring(0, 30) + '...',
            })
            .select()
            .single();

        if (convError || !newConv) {
            console.error('Error creating conversation:', convError);
            setError("Erro ao iniciar conversa.");
            setLoading(false);
            return;
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
            content: newMessageContent
        });

    if (msgError) {
        console.error('Error saving message:', msgError);
        setLoading(false);
        return;
    }

    // Optimistic update
    const userMessage: Message = { id: 'temp-' + Date.now(), role: 'user', content: newMessageContent };
    // Only append to the currentHistory we passed in, avoiding race conditions if we trimmed history
    setMessages([...currentHistory, userMessage]);

    // Construct message history for LLM context
    // We instruct the LLM to behave as a data analyst.
    // In a real implementation with Text-to-SQL, the Edge Function handles the "tool calling"
    // to query the database. Here, we simulate that the Edge Function does it.
    const openRouterMessages: OpenRouterMessage[] = [
        { role: 'system', content: `Você é o DRoweder IA, um assistente especialista em manufatura conectado ao ERP Planintex.

        INSTRUÇÕES DE BACKEND (Simulação):
        1. O usuário fará perguntas sobre dados (ordens, estoque, previsão).
        2. Você (o backend) deve consultar o banco de dados (simulado) para obter os números reais.
        3. Responda ao usuário final APENAS com a análise em linguagem natural e os dados formatados (tabelas markdown, listas).
        4. NÃO exponha o comando SQL bruto na resposta final, a menos que o usuário peça explicitamente "Mostre o SQL".
        5. Seja conciso, profissional e use Português do Brasil.
        ` },
        ...currentHistory.map(m => ({ role: m.role, content: m.content }) as OpenRouterMessage),
        { role: 'user', content: newMessageContent }
    ];

    try {
        const aiResponse = await chatWithOpenRouter(selectedModel, openRouterMessages);

        const aiContent = aiResponse?.choices[0]?.message?.content || "Desculpe, não consegui processar sua solicitação no momento.";
        const modelUsed = aiResponse?.model || selectedModel;

        // Save AI response
        const { data: aiMsg, error: aiError } = await supabase
            .schema('droweder_ia')
            .from('messages')
            .insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: aiContent,
                model_used: modelUsed,
            })
            .select()
            .single();

        if (aiMsg) {
            setMessages(prev => [...prev, aiMsg as Message]);
        } else if (aiError) {
             console.error('Error saving AI message:', aiError);
             // Show error in UI as fallback
             setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: "Erro ao salvar resposta no histórico." }]);
        }

    } catch (error) {
        console.error("LLM Error:", error);
        setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: "Erro de conexão com a IA. Tente novamente." }]);
    } finally {
        setLoading(false);
    }
  };

  const toggleSql = (msgId: string) => {
    if (showSql === msgId) {
        setShowSql(null);
    } else {
        setShowSql(msgId);
    }
  }


  return (
    <div className="flex flex-1 flex-col h-full bg-transparent overflow-hidden transition-colors duration-200">

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent transition-colors duration-200">
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-transparent scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/20 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-white/30">
            {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-gray-300 space-y-6">
                    <div className="w-16 h-16 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-white/20">
                        <Bot size={32} className="text-slate-700 dark:text-white" />
                    </div>
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
                        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-gray-300 leading-relaxed break-words">
                            {msg.role === 'user' ? (
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code(props) {
                                            const { children, className, ...rest } = props;
                                            const match = /language-(\w+)/.exec(className || '');
                                            const codeString = String(children).replace(/\n$/, '');
                                            const blockId = `${msg.id}-${codeString.substring(0, 10)}`;

                                            return match ? (
                                                <div className="relative group/code mt-4 mb-4 rounded-md overflow-hidden bg-[#1E1E1E] border border-gray-700/50">
                                                    <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] text-xs text-gray-400">
                                                        <span>{match[1]}</span>
                                                        <button
                                                            onClick={() => handleCopyCode(codeString, blockId)}
                                                            className="flex items-center gap-1 hover:text-white transition-colors"
                                                            title="Copiar código"
                                                        >
                                                            {copiedBlocks[blockId] ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                            <span>{copiedBlocks[blockId] ? 'Copiado!' : 'Copiar'}</span>
                                                        </button>
                                                    </div>
                                                    <div className="p-4 overflow-x-auto text-sm">
                                                        <SyntaxHighlighter
                                                            {...({ ...rest, ref: undefined } as any)}
                                                            PreTag="div"
                                                            children={codeString}
                                                            language={match[1]}
                                                            style={vscDarkPlus}
                                                            customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <code {...rest} className={`${className} bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-sm text-pink-600 dark:text-pink-400`}>
                                                    {children}
                                                </code>
                                            );
                                        }
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
                <div className="relative flex items-end group bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-[26px] transition-all overflow-hidden focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-gray-600">
                    <div className="flex items-center justify-center p-2 pl-3 pb-[10px]">
                        <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors border border-transparent hover:bg-black/5 dark:hover:bg-white/10">
                            <Plus size={20} strokeWidth={2.5} />
                        </button>
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
                            disabled={!input.trim() && !loading}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                ${!input.trim()
                                    ? 'bg-black text-white dark:bg-white dark:text-black opacity-100 hover:opacity-80'
                                    : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-80'
                                }
                                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {!input.trim() ? (
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
                <div className="text-center mt-3">
                    <p className="text-xs text-slate-500 dark:text-gray-400">O ChatGPT pode cometer erros. Confira informações importantes. Consulte as <a href="#" className="underline">Preferências de cookies</a>.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
