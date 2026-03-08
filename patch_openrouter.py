import re

file_path = "src/pages/Chat.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Replace the invalid model ID with the new one
content = content.replace(
    "{ id: 'perplexity/llama-3.1-sonar-huge-128k-online', name: 'Perplexity Sonar Online' },",
    "{ id: 'perplexity/sonar-pro-search', name: 'Perplexity Sonar Online' },"
)

with open(file_path, "w") as f:
    f.write(content)
