import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

# Remove the duplicated speech recognition setup block at the top
content = re.sub(r'\s*// === Speech Recognition Setup ===\s*const \[isRecording, setIsRecording\] = useState\(false\);\s*const recognitionRef = useRef<any>\(null\);\s*useEffect\(\(\) => \{.*?\}, \[\]\); // Note: setInput from useState is stable\s*', '', content, flags=re.DOTALL, count=1)

with open('src/pages/Chat.tsx', 'w') as f:
    f.write(content)
