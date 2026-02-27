import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Bot, User, Database, Loader2, AlertCircle, Mic, MicOff, Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { chatWithOpenRouterViaEdge } from '../lib/openRouterEdge';
import type { OpenRouterMessage } from '../types';
import { useParams, useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    model_used?: string;
    sql_query?: string;
}

const Chat: React.FC = () => {
  const { conversationId: routeConversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [showSql, setShowSql] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const { user } = useAuth();
  const { companyId, error: contextError, addConversation } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hidden feature flag for SQL debug (can be enabled via query param or user role later)
  const SHOW_SQL_DEBUG = false;

  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-flash-thinking-exp:free');

  const models = [
    { id: 'google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Flash Thinking (Free)' },
    { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro Experimental (Free)' },
    { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)' },
  ];

  useEffect(() => {
      // Sync URL parameter with local state
      if (routeConversationId) {
          setActiveConversationId(routeConversationId);
          fetchMessages(routeConversationId);
      } else {
          setActiveConversationId(null);
          setMessages([]);
      }
  }, [routeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (!input.trim() || !user) {
         if (!user) setChatError("Usuário não autenticado.");
         return;
    }
    if (!companyId) {
        setChatError("Empresa não identificada. Aguarde o carregamento ou contate o suporte.");
        return;
    }

    const newMessageContent = input;
    setInput('');
    setIsSending(true);
    setChatError(null);

    let conversationId = activeConversationId;

    // Create conversation if none exists
    if (!conversationId) {
        const title = newMessageContent.substring(0, 30) + '...';
        const { data: newConv, error: convError } = await supabase
            .schema('droweder_ia')
            .from('conversations')
            .insert({
                user_id: user.id,
                company_id: companyId,
                title: title,
            })
            .select()
            .single();

        if (convError || !newConv) {
            console.error('Error creating conversation:', convError);
            setChatError("Erro ao iniciar conversa.");
            setIsSending(false);
            return;
        }
        conversationId = newConv.id;
        setActiveConversationId(newConv.id);

        // Update Sidebar immediately via Context
        addConversation({
            id: newConv.id,
            title: newConv.title,
            created_at: newConv.created_at,
            company_id: newConv.company_id,
            user_id: newConv.user_id
        });

        // Navigate to the new conversation URL to sync sidebar and URL
        navigate(`/chat/${newConv.id}`);
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
        setChatError("Erro ao salvar mensagem.");
        setIsSending(false);
        return;
    }

    // Optimistic update
    const userMessage: Message = { id: 'temp-' + Date.now(), role: 'user', content: newMessageContent };
    setMessages(prev => [...prev, userMessage]);

    // Construct message history for LLM context
    const openRouterMessages: OpenRouterMessage[] = [
        { role: 'system', content: `Você é o DRoweder IA, um assistente especialista em manufatura conectado ao ERP Planintex.

        INSTRUÇÕES DE BACKEND (Simulação):
        1. O usuário fará perguntas sobre dados (ordens, estoque, previsão).
        2. Você (o backend) deve consultar o banco de dados (simulado) para obter os números reais.
        3. Responda ao usuário final APENAS com a análise em linguagem natural e os dados formatados (tabelas markdown, listas).
        4. NÃO exponha o comando SQL bruto na resposta final, a menos que o usuário peça explicitamente "Mostre o SQL".
        5. Seja conciso, profissional e use Português do Brasil.
        ` },
        ...messages.map(m => ({ role: m.role, content: m.content }) as OpenRouterMessage),
        { role: 'user', content: newMessageContent }
    ];

    try {
        const aiResponse = await chatWithOpenRouterViaEdge(selectedModel, openRouterMessages);

        if (!aiResponse) {
             throw new Error("No response from AI Edge Function");
        }

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
             setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: "Erro ao salvar resposta no histórico." }]);
        }

    } catch (error: any) {
        console.error("LLM Error:", error);

        // Try to extract useful error message from the object if possible
        let errorMessage = "Erro de conexão com a IA. Tente novamente.";

        if (error && typeof error === 'object') {
             // Supabase Functions often return the error in a specific structure
             if (error.message) {
                 errorMessage = `Erro: ${error.message}`;
             } else if (error.error) { // sometimes strictly { error: "..." }
                 errorMessage = `Erro: ${error.error}`;
             }
        }

        setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: errorMessage }]);
    } finally {
        setIsSending(false);
    }
  };

  const toggleSql = (msgId: string) => {
    if (showSql === msgId) {
        setShowSql(null);
    } else {
        setShowSql(msgId);
    }
  }

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Seu navegador não suporta reconhecimento de voz.");
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
    };

    recognition.onend = () => {
        setIsRecording(false);
    };

    recognition.start();
  };

  // Combine context error (company fetch) with local chat error
  const displayError = chatError || contextError;

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 transition-colors duration-200 relative">

        {/* Header - Transparent/Minimal */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 pointer-events-none">
            <div className="pointer-events-auto">
                 {/* Model Selector - Text Only Style */}
                <div className="relative group">
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="appearance-none bg-transparent font-medium text-gray-600 dark:text-gray-300 text-sm py-1.5 pr-6 focus:outline-none cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        {models.map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>
            <div className="pointer-events-auto">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <div className="w-5 h-5 border border-gray-300 dark:border-gray-600 rounded"></div>
                </button>
            </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto pt-16 pb-32 px-4 md:px-0 scrollbar-thin">

            {/* Empty State / Welcome Screen */}
            {messages.length === 0 && !isSending && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-2">
                        <span className="text-3xl font-bold text-white">DR</span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Olá, eu sou o DRoweder IA!
                        </h1>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Em que posso te ajudar hoje?
                        </h2>
                    </div>

                    <p className="text-gray-500 max-w-md">
                        Adicione documentos e arquivos para enriquecer nossa conversa.
                    </p>
                </div>
            )}

            {/* Error Banner */}
            {displayError && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 mx-auto max-w-2xl mt-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{displayError}</h3>
                            {!companyId && (
                                <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                                    Seu usuário não está vinculado a nenhuma empresa no ERP mock.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-6 max-w-3xl mx-auto pb-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 group`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white'}`}>
                            {msg.role === 'user' ? <User size={16} className="text-gray-500 dark:text-gray-400" /> : <Bot size={16} />}
                        </div>

                        <div className="flex-1 space-y-1 overflow-hidden">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {msg.role === 'user' ? 'Você' : 'DRoweder IA'}
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                            </div>

                            {/* Hidden/Debug SQL Accordion */}
                            {SHOW_SQL_DEBUG && msg.role === 'assistant' && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => toggleSql(msg.id)}
                                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <Database size={12} />
                                        <span>{showSql === msg.id ? 'Ocultar SQL' : 'Debug SQL'}</span>
                                    </button>
                                    {showSql === msg.id && (
                                        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 font-mono text-xs overflow-x-auto text-gray-600 dark:text-gray-400">
                                            SELECT * FROM planintex.ordens ...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                 {isSending && (
                    <div className="flex gap-4 w-full max-w-3xl mx-auto">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                            <Loader2 size={16} className="animate-spin" />
                        </div>
                        <div className="flex items-center h-8">
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce mr-1"></span>
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce mr-1 delay-100"></span>
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 pb-8 z-20">
            <div className="max-w-3xl mx-auto">
                <div className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2rem] shadow-lg focus-within:ring-2 focus-within:ring-purple-100 dark:focus-within:ring-purple-900 transition-all">

                    {/* Left Icon (Plus) */}
                    <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Plus size={20} />
                    </button>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Pergunte alguma coisa..."
                        disabled={isSending}
                        rows={1}
                        className="w-full pl-14 pr-12 py-4 bg-transparent resize-none focus:outline-none text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 disabled:opacity-50 max-h-32"
                        style={{ minHeight: '56px' }}
                    />

                    {/* Right Icon (Mic) */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                            onClick={toggleRecording}
                            className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            title={isRecording ? "Parar gravação" : "Gravar áudio"}
                        >
                            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                    </div>
                </div>
                <div className="text-center mt-3">
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">A IA pode cometer erros. Considere verificar informações importantes.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
