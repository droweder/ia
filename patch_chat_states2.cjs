const fs = require('fs');
let content = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

const stateBlock = `const MODELS = [
  { id: 'free', name: 'Automático (Gratuito)', description: 'Modelos rápidos e gratuitos', isPaid: false },
  { id: 'auto', name: 'Automático (Pago)', description: 'O melhor modelo disponível pago', isPaid: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Pago)', description: 'Mais inteligente, OpenAI', isPaid: true },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Pago)', description: 'Excelente para código, Anthropic', isPaid: true }
];\n\n`;

content = content.replace("const Chat: React.FC = () => {", stateBlock + "const Chat: React.FC = () => {\n  const [selectedModelId, setSelectedModelId] = useState('free');\n  const [showModelMenu, setShowModelMenu] = useState(false);\n  const modelMenuRef = useRef<HTMLDivElement>(null);\n\n  useEffect(() => {\n    const handleClickOutside = (event: MouseEvent) => {\n      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {\n        setShowModelMenu(false);\n      }\n    };\n    document.addEventListener('mousedown', handleClickOutside);\n    return () => document.removeEventListener('mousedown', handleClickOutside);\n  }, []);\n");

// Fix duplicate ChevronDown issue and add Sparkles if missing.
content = content.replace("ShieldCheck, Sparkles, ChevronDown", "ShieldCheck");
if (!content.includes("Sparkles")) {
    content = content.replace("Trash2, RefreshCw, StopCircle", "Trash2, RefreshCw, StopCircle, Sparkles");
}

fs.writeFileSync('src/pages/Chat.tsx', content);
