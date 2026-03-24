import re

with open("src/pages/Chat.tsx", "r") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { chatWithOpenRouter } from '../lib/openRouterClient';",
    "import { chatWithOpenRouterStream } from '../lib/openRouterClient';"
)

# 2. Add imports for lucide if they're missing and remove OpenRouterMessage if it's there
# We'll just replace the type usage where needed.

# 3. Modify handleSendCustomMessage
old_try_block = """    try {
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
        const sqlMatch = aiContent.match(/<sql>([\\s\\S]*?)<\\/sql>/i);
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
            const dbResultPrompt = `Resultado da query SQL:\\n\\`\\`\\`json\\n${queryResultStr}\\n\\`\\`\\`\\nPor favor, forneça a resposta final ao usuário em linguagem natural.`;

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
    }"""

new_try_block = """    try {
        // Optimistic AI message placeholder
        const tempAiMessageId = 'temp-ai-' + Date.now();
        const initialAiMessage: Message = { id: tempAiMessageId, role: 'assistant', content: '' };

        // Append user message AND empty AI message to state for streaming
        setMessages(prev => {
            // Remove previous temp messages and add new ones
            const filtered = prev.filter(m => !m.id.startsWith('temp-'));
            return [...filtered, userMessage, initialAiMessage];
        });

        // Use standard model for stream (edge function forces the free one anyway)
        const messagesForApi = openRouterMessages.filter(m => m.role !== 'system');
        let fullText = "";

        await chatWithOpenRouterStream(
            messagesForApi,
            systemPrompt,
            {
                onUpdate: (chunk: string) => {
                    fullText = chunk;
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
                    let finalResponseContent = finalText;
                    const sqlMatch = finalText.match(/<sql>([\\s\\S]*?)<\\/sql>/i);

                    if (sqlMatch && sqlMatch[1]) {
                        const extractedSql = sqlMatch[1].trim();
                        console.log("Executando SQL Gerado pela IA:", extractedSql);
                        const { data: sqlData, error: sqlError } = await supabase.rpc('execute_ai_sql', {
                            query: extractedSql
                        });

                        let queryResultStr = sqlError ? `Erro ao executar a consulta: ${sqlError.message || JSON.stringify(sqlError)}` : JSON.stringify(sqlData, null, 2);
                        const dbResultPrompt = `Resultado da query SQL:\\n\\`\\`\\`json\\n${queryResultStr}\\n\\`\\`\\`\\nPor favor, forneça a resposta final ao usuário em linguagem natural.`;

                        const followUpMessages = [...messagesForApi, { role: 'assistant', content: finalText }, { role: 'user', content: dbResultPrompt }];

                        // Clear the temp message text for the second phase of streaming
                        let phase2Text = "";
                        await chatWithOpenRouterStream(
                            followUpMessages,
                            systemPrompt,
                            {
                                onUpdate: (chunk2: string) => {
                                    phase2Text = chunk2;
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
                                     await saveFinalMessage(conversationId, finalText2, selectedModel, tempAiMessageId);
                                }
                            }
                        );
                        return; // Exit here as phase 2 handled saving
                    }

                    // Save AI response if no SQL was executed
                    await saveFinalMessage(conversationId, finalResponseContent, selectedModel, tempAiMessageId);
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
"""

content = content.replace(old_try_block, new_try_block)

with open("src/pages/Chat.tsx", "w") as f:
    f.write(content)

print("Updated Chat.tsx with streaming UI support")
