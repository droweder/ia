import React, { useState, useEffect } from 'react';
import { Send, Paperclip, ChevronDown, ChevronUp, Bot, User, Database, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    model_used?: string;
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
        fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversationId) {
        fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

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
    if (!input.trim() || !user) return;

    const newMessageContent = input;
    setInput('');
    setLoading(true);

    let conversationId = activeConversationId;

    // Create conversation if none exists
    if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
            .schema('droweder_ia')
            .from('conversations')
            .insert({
                user_id: user.id,
                company_id: user.user_metadata.company_id, // Assuming company_id is in metadata
                title: newMessageContent.substring(0, 30) + '...',
            })
            .select()
            .single();

        if (convError || !newConv) {
            console.error('Error creating conversation:', convError);
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
    setMessages(prev => [...prev, { id: 'temp-' + Date.now(), role: 'user', content: newMessageContent }]);

    // Simulate AI Response (Mock for now, will be Edge Function later)
    setTimeout(async () => {
        const mockResponse = "Estou processando sua solicitação no banco de dados Planintex...";

        const { data: aiMsg } = await supabase
            .schema('droweder_ia')
            .from('messages')
            .insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: mockResponse,
                model_used: 'gpt-4o-mini',
                // We would store the generated SQL in a separate field or metadata in a real scenario
            })
            .select()
            .single();

        if (aiMsg) {
            setMessages(prev => [...prev, aiMsg as Message]);
        }
        setLoading(false);
    }, 1500);
  };

  const toggleSql = (msgId: string) => {
    if (showSql === msgId) {
        setShowSql(null);
    } else {
        setShowSql(msgId);
    }
  }


  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Sidebar - History */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col hidden md:flex">
        <div className="p-4 font-semibold text-gray-700 border-b border-gray-200 text-sm uppercase tracking-wider flex justify-between items-center">
            <span>Histórico</span>
            <button onClick={() => setActiveConversationId(null)} className="text-indigo-600 hover:text-indigo-800 text-xs">NOVA</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map(conv => (
                <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors truncate ${activeConversationId === conv.id ? 'bg-white shadow-sm text-indigo-700 font-medium ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <Bot size={16} className={activeConversationId === conv.id ? 'text-indigo-600' : 'text-gray-400'} />
                    <span className="truncate">{conv.title}</span>
                </button>
            ))}
            {conversations.length === 0 && (
                <div className="text-center p-4 text-xs text-gray-400">Nenhuma conversa ainda.</div>
            )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Bot className="text-indigo-600" size={20} />
                Assistente de PCP
            </h2>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <ShieldCheck size={14} />
                <span>Conectado de forma segura ao Planintex</span>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50">
            {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                    <Bot size={48} className="text-gray-300" />
                    <p>Comece uma nova conversa perguntando sobre sua produção.</p>
                </div>
            )}

            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-emerald-600'}`}>
                        {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
                        <div className={`p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                            {msg.content}
                        </div>

                        {/* Mock Text-to-SQL Accordion for Assistant */}
                        {msg.role === 'assistant' && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden text-xs shadow-sm w-full max-w-lg">
                                <button
                                    onClick={() => toggleSql(msg.id)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors bg-gray-50/50"
                                >
                                    <div className="flex items-center gap-2">
                                        <Database size={14} className="text-blue-600" />
                                        <span className="font-medium text-blue-900">Ver SQL Gerado (Simulação)</span>
                                    </div>
                                    {showSql === msg.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                                {showSql === msg.id && (
                                    <div className="p-3 bg-slate-900 text-blue-300 font-mono overflow-x-auto border-t border-gray-200 text-[11px] leading-relaxed">
                                        <code>SELECT * FROM planintex.ordens LIMIT 5; -- Exemplo</code>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
             {loading && (
                <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm bg-white border border-gray-200 text-emerald-600">
                        <Loader2 size={18} className="animate-spin" />
                    </div>
                    <div className="bg-white border border-gray-200 text-gray-500 p-4 rounded-2xl rounded-tl-none text-sm shadow-sm">
                        Processando...
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto space-y-3">
                <div className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Pergunte sobre sua produção..."
                        disabled={loading}
                        className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm group-hover:bg-white group-hover:shadow-sm disabled:opacity-50"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                            <Paperclip size={18} />
                        </button>
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || loading}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-gray-400">A IA pode cometer erros. Verifique informações importantes.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
