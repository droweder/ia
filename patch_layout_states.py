import sys

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

target = """  const [openChatMenuId, setOpenChatMenuId] = useState<string | null>(null);
  const [chatMenuPosition, setChatMenuPosition] = useState({ top: 0, left: 0 });
  const chatMenuRef = useRef<HTMLDivElement>(null);"""

replacement = """  const [openChatMenuId, setOpenChatMenuId] = useState<string | null>(null);
  const [chatMenuPosition, setChatMenuPosition] = useState({ top: 0, left: 0 });
  const chatMenuRef = useRef<HTMLDivElement>(null);

  const [openProjectMenuId, setOpenProjectMenuId] = useState<string | null>(null);
  const [projectMenuPosition, setProjectMenuPosition] = useState({ top: 0, left: 0 });
  const projectMenuRef = useRef<HTMLDivElement>(null);"""

if target in content and "openProjectMenuId" not in content:
    content = content.replace(target, replacement)
    with open("src/components/Layout.tsx", "w") as f:
        f.write(content)
    print("Patched menu states")
else:
    print("Already patched or target not found")
