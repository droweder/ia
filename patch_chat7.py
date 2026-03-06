import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

# Fix unused imports/variables to satisfy strict tsc
content = content.replace("ChevronDown, ChevronUp, ShieldCheck", "ChevronDown, ShieldCheck")
content = content.replace("const blockId = React.useId();", "")
content = content.replace("const [copiedBlocks, setCopiedBlocks] = useState<{ [key: string]: boolean }>({});", "")
content = content.replace("""  const handleCopyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedBlocks((prev) => ({ ...prev, [blockId]: true }));
      setTimeout(() => {
        setCopiedBlocks((prev) => ({ ...prev, [blockId]: false }));
      }, 2000);
    });
  };""", "")

with open('src/pages/Chat.tsx', 'w') as f:
    f.write(content)

print("Patch applied.")
