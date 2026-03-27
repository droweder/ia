const fs = require('fs');
let content = fs.readFileSync('src/pages/Chat.tsx', 'utf8');

// I need to add `MODELS`, `selectedModelId` and `showModelMenu` state.
// Previously `patch_chat_models.cjs` failed to inject it because the replacement block for `const Chat: React.FC = () => {` did not match perfectly.
// Let me inject it right after imports.

const stateBlock = `const MODELS = [
  { id: 'free', name: 'Automático (Gratuito)', description: 'Modelos rápidos e gratuitos', isPaid: false },
  { id: 'auto', name: 'Automático (Pago)', description: 'O melhor modelo disponível pago', isPaid: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Pago)', description: 'Mais inteligente, OpenAI', isPaid: true },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Pago)', description: 'Excelente para código, Anthropic', isPaid: true }
];\n\n`;

content = content.replace("export default function Chat() {", stateBlock + "export default function Chat() {\n  const [selectedModelId, setSelectedModelId] = useState('free');\n  const [showModelMenu, setShowModelMenu] = useState(false);\n  const modelMenuRef = useRef<HTMLDivElement>(null);\n\n  useEffect(() => {\n    const handleClickOutside = (event: MouseEvent) => {\n      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {\n        setShowModelMenu(false);\n      }\n    };\n    document.addEventListener('mousedown', handleClickOutside);\n    return () => document.removeEventListener('mousedown', handleClickOutside);\n  }, []);\n");

// Add missing icon Sparkles
if (!content.includes('Sparkles,')) {
    content = content.replace("ShieldCheck", "ShieldCheck, Sparkles, ChevronDown");
}

fs.writeFileSync('src/pages/Chat.tsx', content);
