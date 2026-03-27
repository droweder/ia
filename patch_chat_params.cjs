const fs = require('fs');
let content = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// Replace the fixed 'auto' model parameter with `selectedModelId`
content = content.replace(/await chatWithOpenRouterStream\(\n            messagesForApi,\n            systemPrompt,\n            'auto',\n/g, "await chatWithOpenRouterStream(\n            messagesForApi,\n            systemPrompt,\n            selectedModelId,\n");

content = content.replace(/await chatWithOpenRouterStream\(\n                            followUpMessages,\n                            systemPrompt,\n                            'auto',\n/g, "await chatWithOpenRouterStream(\n                            followUpMessages,\n                            systemPrompt,\n                            selectedModelId,\n");

fs.writeFileSync('src/pages/Chat.tsx', content);
