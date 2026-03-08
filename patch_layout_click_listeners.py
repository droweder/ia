import sys

with open("src/components/Layout.tsx", "r") as f:
    content = f.read()

target_click = """      // Close chat menu if clicking outside
      if (openChatMenuId && chatMenuRef.current && !chatMenuRef.current.contains(e.target as Node)) {
        setOpenChatMenuId(null);
      }
    };"""

replacement_click = """      // Close chat menu if clicking outside
      if (openChatMenuId && chatMenuRef.current && !chatMenuRef.current.contains(e.target as Node)) {
        setOpenChatMenuId(null);
      }
      // Close project menu if clicking outside
      if (openProjectMenuId && projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setOpenProjectMenuId(null);
      }
    };"""

target_scroll = """    const handleScroll = () => {
        if (openChatMenuId) {
            setOpenChatMenuId(null);
        }
    };"""

replacement_scroll = """    const handleScroll = () => {
        if (openChatMenuId) {
            setOpenChatMenuId(null);
        }
        if (openProjectMenuId) {
            setOpenProjectMenuId(null);
        }
    };"""

if target_click in content and "openProjectMenuId && projectMenuRef" not in content:
    content = content.replace(target_click, replacement_click)

if target_scroll in content and "openProjectMenuId) {" not in content:
    content = content.replace(target_scroll, replacement_scroll)

if "openChatMenuId, showUserMenu" in content:
    content = content.replace("openChatMenuId, showUserMenu", "openChatMenuId, openProjectMenuId, showUserMenu")
if "openChatMenuId]" in content:
    content = content.replace("openChatMenuId]", "openChatMenuId, openProjectMenuId]")

with open("src/components/Layout.tsx", "w") as f:
    f.write(content)
print("Patched click and scroll listeners")
