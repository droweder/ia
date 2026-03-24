import re

with open("src/lib/openRouterClient.ts", "r") as f:
    content = f.read()

content = content.replace("import { supabase } from './supabase';", "import { supabase } from './supabaseClient';")
with open("src/lib/openRouterClient.ts", "w") as f:
    f.write(content)

with open("src/pages/Chat.tsx", "r") as f:
    chat_content = f.read()

chat_content = chat_content.replace(
    "const scrollToBottom = () => {\n    messagesEndRef.current?.scrollIntoView({ behavior: \"smooth\" });\n  };",
    ""
)

chat_content = chat_content.replace("let fullText = \"\"; // eslint-disable-line", "")
chat_content = chat_content.replace("let phase2Text = \"\"; // eslint-disable-line", "")
chat_content = chat_content.replace("fullText = chunk;", "")
chat_content = chat_content.replace("phase2Text = chunk2;", "")

# Fix null string argument for saveFinalMessage
# saveFinalMessage(conversationId, finalResponseContent, selectedModel, tempAiMessageId);
# conversationId can be null if it wasn't initialized, but wait, it is initialized above.
# Let's typecast conversationId!

chat_content = chat_content.replace(
    "saveFinalMessage(conversationId, finalText2, selectedModel, tempAiMessageId)",
    "saveFinalMessage(conversationId!, finalText2, selectedModel, tempAiMessageId)"
)
chat_content = chat_content.replace(
    "saveFinalMessage(conversationId, finalResponseContent, selectedModel, tempAiMessageId)",
    "saveFinalMessage(conversationId!, finalResponseContent, selectedModel, tempAiMessageId)"
)

with open("src/pages/Chat.tsx", "w") as f:
    f.write(chat_content)

print("Fixed TS errors")
