import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

# Fix setInput scope access before declaration issue manually since regex wasn't matching the complex block
setup_block_regex = r"\s*const \[isRecording, setIsRecording\] = useState\(false\);\s*const recognitionRef = useRef<any>\(null\);\s*useEffect\(\(\) => \{\s*if \('SpeechRecognition' in window \|\| 'webkitSpeechRecognition' in window\) \{.*?return \(\) => \{\s*if \(recognitionRef\.current\) \{\s*recognitionRef\.current\.stop\(\);\s*\}\s*\};\s*\}, \[\]\);"

match = re.search(setup_block_regex, content, flags=re.DOTALL)

if match:
    setup_block = match.group(0)
    content = content.replace(setup_block, '')

    # insert after state declarations
    insert_point = "  const [companyId, setCompanyId] = useState<string | null>(null);"
    content = content.replace(insert_point, insert_point + "\n\n" + setup_block)


with open('src/pages/Chat.tsx', 'w') as f:
    f.write(content)
