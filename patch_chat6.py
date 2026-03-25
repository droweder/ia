import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

# Fix setInput scope access before declaration issue
# Move the recognition setup logic *below* the state declarations.
setup_block_regex = r"\s*// === Speech Recognition Setup ===.*?return \(\) => \{.*?if \(recognitionRef\.current\) \{.*?recognitionRef\.current\.stop\(\);.*?\}\s*\};\s*\}, \[\]\);"

match = re.search(setup_block_regex, content, flags=re.DOTALL)
if match:
    setup_block = match.group(0)
    content = content.replace(setup_block, '')

    # insert after state declarations
    insert_point = "  const [loading, setLoading] = useState(false);"
    content = content.replace(insert_point, insert_point + "\n\n" + setup_block)

# Fix fetchCompanyId scope access before declaration issue
fetch_call_regex = r"\s*useEffect\(\(\) => \{\s*if \(user\) \{\s*fetchCompanyId\(\);\s*\}\s*\}, \[user\]\);"
match_fetch = re.search(fetch_call_regex, content, flags=re.DOTALL)
if match_fetch:
    fetch_call_block = match_fetch.group(0)
    content = content.replace(fetch_call_block, '')

    # insert after fetchCompanyId is declared
    insert_point2 = "  };\n\n  const fetchMessages = async (conversationId: string) => {"
    content = content.replace(insert_point2, "  };\n\n" + fetch_call_block.strip() + "\n\n  const fetchMessages = async (conversationId: string) => {")


with open('src/pages/Chat.tsx', 'w') as f:
    f.write(content)
