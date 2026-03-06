import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

# Fix the template literal syntax error generated from previous py script
content = content.replace('```json\\n${queryResultStr}\\n```', '```json\\n${queryResultStr}\\n```')
with open('src/pages/Chat.tsx', 'w') as f:
    f.write(content)
