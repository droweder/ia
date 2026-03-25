import re

with open('supabase/functions/chat/index.ts', 'r') as f:
    content = f.read()

# Replace the fallbackModels array
new_fallback = """    const fallbackModels = [
      'google/gemini-2.0-pro-exp-02-05:free',
      'google/gemini-2.0-flash-lite-001',
      'google/gemma-3-27b-it:free'
    ];"""

content = re.sub(r'const fallbackModels = \[[^\]]+\];', new_fallback, content, flags=re.MULTILINE)

# Remove the plugins array from requestBody
new_request_body = """    const requestBody: any = {
      models: fallbackModels,
      messages: payloadMessages,
      stream: true
    };"""

content = re.sub(r'const requestBody: any = \{\s*models: fallbackModels,\s*messages: payloadMessages,\s*stream: true,\s*// O Gemini exige plugins para web search\s*plugins: \[\s*\{\s*id: "web",\s*max_results: 5\s*\}\s*\]\s*\};', new_request_body, content, flags=re.MULTILINE)

with open('supabase/functions/chat/index.ts', 'w') as f:
    f.write(content)
