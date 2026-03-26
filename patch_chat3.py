import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

# Add the speech recognition setup below state declarations
state_declarations = r"const \[messages, setMessages\] = useState<Message\[\]>\(\[\]\);"

new_setup_block = """  const [messages, setMessages] = useState<Message[]>([]);

  // === Speech Recognition Setup ===
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => setIsRecording(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
         setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }
  }, []); // Note: setInput from useState is stable
"""

content = re.sub(state_declarations, new_setup_block, content, count=1)

with open('src/pages/Chat.tsx', 'w') as f:
    f.write(content)
