import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/useAuth';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

import { chatWithOpenRouterStream } from '../lib/openRouterClient';
import { useOutletContext, useLocation } from 'react-router-dom';
import type { LayoutContextType } from '../components/Layout';
import type { OpenRouterMessage, Message } from '../types';
import { MessageItem } from '../components/chat/MessageItem';
import { ChatInput } from '../components/chat/ChatInput';
import { ModelSelector } from '../components/chat/ModelSelector';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

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

  const location = useLocation();

  useEffect(() => {
    // If navigated from Assistants page with an assistant ID
    if (location.state && location.state.assistantId) {
      setActiveAssistantId(location.state.assistantId);
      setSelectedModelId(''); // clear standard model
      // Clear the state so it doesn't re-trigger on refresh if navigated away and back normally
      window.history.replaceState({}, document.title);

      // If we are currently in an old conversation, we should clear it to start a fresh chat with the new assistant
      if (activeConversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const { isRecording, toggleRecording } = useSpeechRecognition({
    onResult: (transcript) => setInput((prev) => prev + (prev ? ' ' : '') + transcript),
  });

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

  const [showSql, setShowSql] = useState<string | null>(null);

  const toggleSql = (messageId: string) => {
    setShowSql(prev => prev === messageId ? null : messageId);
  };

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

    let systemPrompt = `Você é o Rower AI, um assistente especialista em manufatura e análise de dados conectado ao ERP Planintex.

        CONTEÚDO E SEGURANÇA:
        1. O usuário fará perguntas sobre dados do ERP (tabelas disponíveis no schema 'planintex').
        2. Se precisar consultar dados, VOCÊ DEVE responder EXCLUSIVAMENTE com uma query SQL válida no schema 'planintex', delimitada pelas tags <sql> e </sql>. Exemplo: <sql>SELECT count(*) FROM planintex.ordens WHERE empresa_id = '${companyId}';</sql>.
        3. Use a role 'ai_reader_role' (apenas leitura). NÃO tente comandos como INSERT, UPDATE, DELETE ou DROP.
        4. O 'empresa_id' do usuário logado é: '${companyId}'. VOCÊ DEVE SEMPRE filtrar todas as consultas usando "WHERE empresa_id = '${companyId}'" para garantir o isolamento dos dados. Nunca esqueça este filtro.
        
        PROCESSO DE RESPOSTA:
        1. Identifique se a pergunta exige dados do banco.
        2. Se sim, gere o SQL com o filtro de empresa_id e aguarde o resultado.
        3. Quando receber o JSON com os resultados, analise-os e responda ao usuário em linguagem natural.
        4. Formate os dados em tabelas markdown ou listas para melhor legibilidade.
        5. NÃO exponha o bloco <sql> na sua resposta final ao usuário, apenas o resultado da análise.
        6. Se a pergunta não envolver dados (ex: "Como você está?"), responda normalmente.
        
        DIRETRIZES DE ESTILO:
        - Seja profissional, conciso e use Português do Brasil.
        - Se não encontrar dados para a empresa, informe que não há registros para o critério solicitado.
        - Você tem acesso à internet para informações gerais, mas priorize os dados do ERP para questões de negócio.
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
                onDone: async (finalText: string, usage?: any) => {
                    // VERIFY IF THE AI RETURNED SQL
                    const finalResponseContent = finalText;
                    const sqlMatch = finalText.match(/<sql>([\s\S]*?)<\/sql>/i);

                    if (sqlMatch && sqlMatch[1]) {
                        const extractedSql = sqlMatch[1].trim();
                        console.log("Executando SQL Gerado pela IA:", extractedSql);
                        const { data: sqlData, error: sqlError } = await supabase.rpc('execute_ai_sql', {
                            query: extractedSql
                        });

                        // Check for error inside the returned JSON from the RPC (handled by EXCEPTION in PL/pgSQL)
                        const rpcError = (sqlData as any)?.error;
                        const actualError = sqlError || rpcError;

                        const queryResultStr = actualError ? `Erro ao executar a consulta: ${actualError.message || JSON.stringify(actualError)}` : JSON.stringify(sqlData, null, 2);
                        const dbResultPrompt = `Resultado da query SQL:\n\`\`\`json\n${queryResultStr}\n\`\`\`\nPor favor, forneça a resposta final ao usuário em linguagem natural. Se houve um erro, explique que não foi possível obter os dados agora.`;

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
                                onDone: async (finalText2: string, usage2?: any) => {
                                     // Combine usage from both steps if available
                                     const combinedUsage = {
                                         prompt_tokens: (usage?.prompt_tokens || 0) + (usage2?.prompt_tokens || 0),
                                         completion_tokens: (usage?.completion_tokens || 0) + (usage2?.completion_tokens || 0),
                                         total_tokens: (usage?.total_tokens || 0) + (usage2?.total_tokens || 0)
                                     };
                                     await saveFinalMessage(conversationId!, finalText2, 'auto', tempAiMessageId, extractedSql, combinedUsage);
                                }
                            }
                        );
                        return; // Exit here as phase 2 handled saving
                    }

                    // Save AI response if no SQL was executed
                    await saveFinalMessage(conversationId!, finalResponseContent, 'auto', tempAiMessageId, undefined, usage);
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

  const saveFinalMessage = async (convId: string, content: string, model: string, tempId: string, sqlQuery?: string, usage?: any) => {
        const { data: aiMsg, error: aiError } = await supabase
            .schema('droweder_ia')
            .from('messages')
            .insert({
                conversation_id: convId,
                role: 'assistant',
                content: content,
                model_used: model,
                sql_query: sqlQuery
            })
            .select()
            .single();

        if (aiMsg) {
            setMessages(prev => prev.map(msg => msg.id === tempId ? (aiMsg as Message) : msg));

            // Log usage if available
            if (usage && usage.total_tokens > 0) {
                // Approximate cost calculation (BRL)
                // Llama 3.3 70B is free on OpenRouter, but we can simulate a cost or use 0
                // For a real app, you'd fetch the actual price from OpenRouter or a config
                const tokens = usage.total_tokens;
                const cost_brl = (tokens / 1000000) * 0.50; // Example: R$ 0.50 per 1M tokens

                await supabase
                    .schema('droweder_ia')
                    .from('billing_logs')
                    .insert({
                        user_id: user?.id,
                        company_id: companyId,
                        tokens_used: tokens,
                        cost_brl: cost_brl,
                        description: `Chat completion - ${model}`
                    });
            }
        } else if (aiError) {
             console.error('Error saving AI message:', aiError);
             setError("Erro ao salvar resposta no histórico.");
        }
        setLoading(false);
  };




  const activeAssistant = assistants.find(a => a.id === activeAssistantId);

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 bg-transparent overflow-hidden transition-colors duration-200">
      <div className="relative flex-1 flex flex-col min-w-0 min-h-0 bg-transparent transition-colors duration-200">
        {loading && (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-50 dark:opacity-80 transition-opacity duration-1000">
            <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-red-600/30 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10000ms]" />
            <div className="absolute top-[20%] -right-[20%] w-[80%] h-[80%] bg-blue-600/30 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[7000ms]" />
            <div className="absolute -bottom-[30%] left-[20%] w-[70%] h-[70%] bg-yellow-500/20 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10000ms]" />
          </div>
        )}

        <ModelSelector
          selectedModelId={selectedModelId}
          setSelectedModelId={setSelectedModelId}
          showModelMenu={showModelMenu}
          setShowModelMenu={setShowModelMenu}
          modelMenuRef={modelMenuRef}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-transparent scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-blue-700 scrollbar-track-transparent ">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-gray-300 space-y-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-white/20 overflow-hidden">
                <img 
                  src="https://phofwpyxbeulodrzfdjq.supabase.co/storage/v1/object/public/imagens_app/favicom_drowederAI.png" 
                  alt="Rower AI" 
                  className="w-full h-full object-contain p-2"
                />
              </div>
              {activeAssistant ? (
                <div className="text-center max-w-md">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Olá! Sou o {activeAssistant.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400">
                    {activeAssistant.description || "Como posso ajudar você hoje?"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
                  <button onClick={() => setInput("Qual a previsão de demanda para o próximo mês?")} className="p-4 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm text-left transition-colors shadow-sm">
                    <h3 className="text-sm font-medium text-slate-800 dark:text-white mb-1">Previsão de Demanda</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">Analise tendências futuras</p>
                  </button>
                  <button onClick={() => setInput("Quais ordens estão atrasadas?")} className="p-4 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm text-left transition-colors shadow-sm">
                    <h3 className="text-sm font-medium text-slate-800 dark:text-white mb-1">Ordens Atrasadas</h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">Liste gargalos na produção</p>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-md bg-red-100 dark:bg-red-900/40 p-4 border border-red-500/30 mx-auto max-w-2xl mt-4 backdrop-blur-sm">
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

          {messages.map((msg, index) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isLast={index === messages.length - 1}
              isLoading={loading}
              isCopied={!!copiedMessages[msg.id]}
              onCopy={handleCopyMessage}
              onRegenerate={handleRegenerate}
              showSql={showSql === msg.id}
              onToggleSql={toggleSql}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          loading={loading}
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          handleSendMessage={handleSendMessage}
          isInputExpanded={isInputExpanded}
          setIsInputExpanded={setIsInputExpanded}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      </div>
    </div>
  );
};

export default Chat;
