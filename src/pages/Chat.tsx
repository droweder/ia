import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronDown, Bot, User, Database, ShieldCheck, Loader2, AlertCircle, Plus, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { chatWithOpenRouterViaEdge } from '../lib/openRouterEdge';
import type { OpenRouterMessage } from '../types';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    model_used?: string;
    sql_query?: string; // New field for internal SQL logging (if we decide to show it later)
}

interface Conversation {
    id: string;
    title: string;
    created_at: string;
}

const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [showSql, setShowSql] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
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
        fetchConversations();
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

  const fetchConversations = async () => {
    const { data, error } = await supabase
        .schema('droweder_ia')
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching conversations:', error);
    if (data) {
        setConversations(data);
        if (data.length > 0 && !activeConversationId) {
            setActiveConversationId(data[0].id);
        }
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
    if (!input.trim() || !user || !companyId) {
        if (!companyId) setError("Empresa não identificada. Contate o suporte.");
        return;
    }

    const newMessageContent = input;
    setInput('');
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
    setMessages(prev => [...prev, userMessage]);

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
        ...messages.map(m => ({ role: m.role, content: m.content }) as OpenRouterMessage),
        { role: 'user', content: newMessageContent }
    ];

    try {
        const aiResponse = await chatWithOpenRouterViaEdge(selectedModel, openRouterMessages);

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
    <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-200">

      {/* Sidebar - History (Refined Style) */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black flex flex-col hidden md:flex transition-colors duration-200">
         {/* Sidebar header removed as requested to be like ChatGPT (buttons moved to Layout or kept clean) */}
         {/* Assuming Layout handles the global nav, this sidebar might be redundant or specific to chat history.
             If we want ChatGPT style, the global sidebar in Layout is actually the history sidebar.
             For now, I will keep a simple list of conversations here if it's meant to be a secondary panel,
             OR if we assume the Layout sidebar IS the main nav.

             Let's sync with Layout: Layout has the apps. Chat history is specific to Chat.
             ChatGPT has one sidebar for history.
             Current architecture: Global Layout Sidebar + Local Page Content.
             I will keep the "History" list here as a "Recent Chats" panel.
          */}
        <div className="p-3">
             <button
                onClick={() => setActiveConversationId(null)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
             >
                <Plus size={16} />
                Nova Conversa
             </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
            <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase">Hoje</div>
            {conversations.map(conv => (
                <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 transition-colors truncate group ${activeConversationId === conv.id ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                >
                    <MessageSquare size={16} className="text-gray-400 group-hover:text-gray-500" />
                    <span className="truncate flex-1">{conv.title}</span>
                </button>
            ))}
            {conversations.length === 0 && (
                <div className="text-center p-4 text-xs text-gray-400">Nenhuma conversa recente.</div>
            )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 transition-colors duration-200">
        {/* Header - Simplified */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 shadow-sm z-10">
            <div className="flex items-center gap-4">
                 {/* Model Selector */}
                <div className="relative group">
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="appearance-none bg-transparent font-medium text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg py-1.5 pl-2 pr-8 focus:outline-none cursor-pointer transition-colors"
                    >
                        {models.map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Connection Badge */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="hidden sm:inline">Planintex Conectado</span>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-white dark:bg-gray-900 scrollbar-thin">
            {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-6">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                        <Bot size={32} className="text-gray-900 dark:text-gray-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                        <button onClick={() => setInput("Qual a previsão de demanda para o próximo mês?")} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Previsão de Demanda</h3>
                            <p className="text-xs text-gray-500">Analise tendências futuras</p>
                        </button>
                         <button onClick={() => setInput("Quais ordens estão atrasadas?")} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Ordens Atrasadas</h3>
                            <p className="text-xs text-gray-500">Liste gargalos na produção</p>
                        </button>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 mx-auto max-w-2xl mt-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300 group`}>
                    <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-emerald-600 text-white'}`}>
                        {msg.role === 'user' ? <User size={16} className="text-gray-600 dark:text-gray-300" /> : <Bot size={16} />}
                    </div>

                    <div className="flex-1 space-y-2 overflow-hidden">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {msg.role === 'user' ? 'Você' : 'DRoweder IA'}
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
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
             {loading && (
                <div className="flex gap-4 max-w-3xl mx-auto w-full">
                    <div className="w-8 h-8 rounded-sm bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
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
        <div className="p-4 bg-white dark:bg-gray-900">
            <div className="max-w-3xl mx-auto">
                <div className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Envie uma mensagem para o Planintex..."
                        disabled={loading}
                        rows={1}
                        className="w-full pl-4 pr-12 py-3.5 bg-transparent resize-none focus:outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 disabled:opacity-50 max-h-32"
                        style={{ minHeight: '52px' }}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || loading}
                            className={`p-2 rounded-lg transition-colors ${!input.trim() || loading ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">DRoweder IA pode cometer erros. Considere verificar informações importantes.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
