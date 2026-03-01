import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mock function to simulate DB query execution by the AI Agent
// In production, this would use a Supabase client with the 'ai_reader_role' to actually run the SQL.
async function executeMockSql(query: string): Promise<any[]> {
    console.log("Executing SQL:", query);
    // Return mock data based on simple keywords
    if (query.toLowerCase().includes("ordens")) {
        return [
            { id: "ORD-123", status: "Em Produção", qtd: 500, data_entrega: "2024-05-20" },
            { id: "ORD-124", status: "Planejado", qtd: 1200, data_entrega: "2024-06-01" },
            { id: "ORD-125", status: "Atrasado", qtd: 300, data_entrega: "2024-05-15" }
        ];
    }
    if (query.toLowerCase().includes("estoque")) {
         return [
            { item: "Aço 1020", qtd: 5000, unidade: "kg" },
            { item: "Parafusos M6", qtd: 15000, unidade: "un" }
        ];
    }
    return [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, model } = await req.json();
    const lastUserMessage = messages[messages.length - 1].content;

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    // --- STEP 1: Text-to-SQL Generation ---
    // We ask the LLM to generate SQL based on the user request.
    const sqlSystemPrompt = `You are a SQL expert for a PostgreSQL database.
    Schema: 'planintex.ordens(id, status, qtd, data_entrega)', 'planintex.estoque(item, qtd, unidade)'.
    Return ONLY the SQL query, nothing else. No markdown code blocks.`;

    // Simplification: For this MVP, we skip the actual LLM call for SQL generation to save tokens/latency
    // and rely on the mocked execution logic directly, OR we can do a real call.
    // Let's do a mock SQL generation for speed in this demo environment.
    let generatedSql = "";
    if (lastUserMessage.toLowerCase().includes("ordem") || lastUserMessage.toLowerCase().includes("produção")) {
        generatedSql = "SELECT * FROM planintex.ordens WHERE status = 'Em Produção' LIMIT 5";
    } else if (lastUserMessage.toLowerCase().includes("estoque")) {
        generatedSql = "SELECT * FROM planintex.estoque LIMIT 10";
    } else {
        generatedSql = "SELECT 'No data found for this context' as message";
    }

    // --- STEP 2: Execute SQL (Simulated) ---
    // Here we would run the SQL against Supabase using ai_reader_role
    const dbResults = await executeMockSql(generatedSql);

    // --- STEP 3: Natural Language Response ---
    // We feed the data back to the LLM to generate the final answer.
    const finalSystemPrompt = `Você é o DRoweder IA, um assistente especialista em PCP.
    Analise os dados fornecidos abaixo (resultado de uma consulta ao banco de dados) e responda à pergunta do usuário.
    Seja direto, use tabelas markdown se houver muitos dados, e fale em Português do Brasil.

    Dados do Banco: ${JSON.stringify(dbResults)}
    `;

    const finalMessages = [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: lastUserMessage }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://droweder-ai.com",
        "X-Title": "DRoweder AI",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model, // Use the model selected by user
        messages: finalMessages,
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ error: errorText }), {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const data = await response.json();

    // Add internal debug info (optional, for frontend dev mode)
    // data.choices[0].message.sql_debug = generatedSql;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
