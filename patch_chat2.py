import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

# Fix setInput scope access before declaration issue
# The speech recognition setup is using `setInput` before it is initialized as state
# Move the recognition setup logic *below* the state declarations.

setup_block = """
  // === Speech Recognition Setup ===
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onstart = () => setIsRecording(true);

      // onresult and onerror need to be updated after state is declared
      // We'll set these up in a separate effect that depends on setInput
    }

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }
  }, []);
"""

# Find the start of the chat component
comp_start = content.find('const Chat: React.FC = () => {')

# Remove the existing speech recognition block from the top of the component
import re
content = re.sub(r'\s*// === Speech Recognition Setup ===.*?return \(\) => \{.*?if \(recognitionRef\.current\) \{.*?recognitionRef\.current\.stop\(\);.*?\}\s*\};\s*\}, \[\]\);', '', content, flags=re.DOTALL)

with open('src/pages/Chat.tsx', 'w') as f:
    f.write(content)
