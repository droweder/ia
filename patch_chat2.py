import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

old_block = """    let systemPrompt = `Você é o DRoweder IA, um assistente especialista em manufatura conectado ao ERP Planintex.

        INSTRUÇÕES BASE:
        1. O usuário fará perguntas sobre dados (ordens, estoque, previsão).
        2. Você NÃO DEVE responder com dados fictícios. Apenas com dados reais, se não os tiver, então deve avisar o usuário.
        3. Responda ao usuário final APENAS com a análise em linguagem natural e os dados formatados (tabelas markdown, listas).
        4. NÃO exponha comandos SQL na resposta final, a menos que o usuário peça explicitamente "Mostre o SQL".
        5. Seja conciso, profissional e use Português do Brasil.
        `;

    // Inject active assistant instructions if present
    if (activeAssistantId) {
        const activeAssistant = assistants.find(a => a.id === activeAssistantId);
        if (activeAssistant && activeAssistant.instructions) {
             systemPrompt += `\\n\\nINSTRUÇÕES ESPECÍFICAS DO ASSISTENTE ATUAL (${activeAssistant.name}):\\n${activeAssistant.instructions}`;
        }
    }

    const openRouterMessages: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        ...currentHistory.map(m => ({ role: m.role, content: m.content }) as OpenRouterMessage),
        { role: 'user', content: finalMessageContent }
    ];

    try {
        const aiResponse = await chatWithOpenRouter(selectedModel, openRouterMessages);

        // Check for mock error response from openRouterClient when API key is missing
        if (aiResponse?.id === 'mock-id') {
            setError(aiResponse.choices[0].message.content);
            setLoading(false);
            return false;
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
             // Show error in UI as fallback
             setError("Erro ao salvar resposta no histórico.");
        }"""

new_block = """    let systemPrompt = `Você é o DRoweder IA, um assistente especialista em manufatura conectado ao ERP Planintex.

        INSTRUÇÕES BASE:
        1. O usuário fará perguntas sobre dados do ERP (tabelas disponíveis no schema planintex: ordens, pedidos_venda, empresas, etc).
        2. Se precisar consultar dados para responder com precisão, VOCÊ DEVE responder EXCLUSIVAMENTE com uma query SQL válida no schema 'planintex', delimitada pelas tags <sql> e </sql>. Exemplo: <sql>SELECT count(*) FROM planintex.ordens;</sql>.
        3. A role que executa a query é apenas de leitura. Não use comandos como INSERT/UPDATE/DELETE.
        4. O sistema executará sua query e retornará o JSON dos resultados em uma nova mensagem de usuário para você interpretar.
        5. Após receber os resultados do JSON (ou se a pergunta não exigir banco de dados), responda ao usuário final APENAS com a análise em linguagem natural e os dados formatados (tabelas markdown, listas).
        6. NÃO exponha comandos SQL na resposta final, a menos que o usuário peça explicitamente "Mostre o SQL".
        7. Seja conciso, profissional e use Português do Brasil.
        8. O 'empresa_id' do usuário logado é: ${companyId}. Sempre filtre as tabelas por empresa_id = '${companyId}' se a coluna existir.
        `;

    // Inject active assistant instructions if present
    if (activeAssistantId) {
        const activeAssistant = assistants.find(a => a.id === activeAssistantId);
        if (activeAssistant && activeAssistant.instructions) {
             systemPrompt += `\\n\\nINSTRUÇÕES ESPECÍFICAS DO ASSISTENTE ATUAL (${activeAssistant.name}):\\n${activeAssistant.instructions}`;
        }
    }

    let openRouterMessages: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        ...currentHistory.map(m => ({ role: m.role, content: m.content }) as OpenRouterMessage),
        { role: 'user', content: finalMessageContent }
    ];

    try {
        let aiResponse = await chatWithOpenRouter(selectedModel, openRouterMessages);

        if (aiResponse?.id === 'mock-id') {
            setError(aiResponse.choices[0].message.content);
            setLoading(false);
            return false;
        }

        let aiContent = aiResponse?.choices[0]?.message?.content || "Desculpe, não consegui processar sua solicitação no momento.";
        let modelUsed = aiResponse?.model || selectedModel;
        let finalResponseContent = aiContent;

        // VERIFY IF THE AI RETURNED SQL
        const sqlMatch = aiContent.match(/<sql>([\\s\\S]*?)<\\/sql>/i);
        if (sqlMatch && sqlMatch[1]) {
            const extractedSql = sqlMatch[1].trim();
            console.log("Executando SQL Gerado pela IA:", extractedSql);

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
             setError("Erro ao salvar resposta no histórico.");
        }"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('src/pages/Chat.tsx', 'w') as f:
        f.write(content)
    print("Patch applied successfully.")
else:
    print("Old block not found. Could not apply patch.")
