import re

# Fix empty block statement error in src/lib/openRouterClient.ts
with open('src/lib/openRouterClient.ts', 'r') as f:
    content = f.read()
content = content.replace("try { errText = await response.text(); } catch(e) {}", "try { errText = await response.text(); } catch (e) { console.error('Error reading response text', e); }")
with open('src/lib/openRouterClient.ts', 'w') as f:
    f.write(content)

# Fix empty block statement error in supabase/functions/chat/index.ts
with open('supabase/functions/chat/index.ts', 'r') as f:
    content = f.read()
content = content.replace("} catch(e) {}", "} catch (e) { console.error('Error parsing error JSON', e); }")
with open('supabase/functions/chat/index.ts', 'w') as f:
    f.write(content)
