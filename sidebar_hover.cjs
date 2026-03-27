const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// 1. Add state for hover
if (!content.includes('const [isSidebarHovered, setIsSidebarHovered]')) {
    content = content.replace(
        "const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);",
        "const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);\n  const [isSidebarHovered, setIsSidebarHovered] = useState(false);\n  const isEffectivelyExpanded = !isSidebarCollapsed || isSidebarHovered;"
    );
}

// 2. Add event listeners on aside and modify classes
const oldAside = "<aside className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} border-r border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl hidden md:flex flex-col z-10 transition-all duration-300`}>";
const newAside = "<aside \n      onMouseEnter={() => setIsSidebarHovered(true)}\n      onMouseLeave={() => setIsSidebarHovered(false)}\n      className={`${!isEffectivelyExpanded ? 'w-20' : 'w-72'} border-r border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl hidden md:flex flex-col z-10 transition-all duration-300 shrink-0`}>";
content = content.replace(oldAside, newAside);

// 3. Replace !isSidebarCollapsed with isEffectivelyExpanded for rendering conditions
// But be careful not to replace it in the onClick of the collapse button.
// Let's replace only specific usages. Or globally but safely.

content = content.replace(/!isSidebarCollapsed && \(/g, "isEffectivelyExpanded && (");
content = content.replace(/!isSidebarCollapsed && <span/g, "isEffectivelyExpanded && <span");
content = content.replace(/isSidebarCollapsed \?/g, "!isEffectivelyExpanded ?");

// Also fix the toggle buttons: we want the button to just pin/unpin it.
// Right now, pinning is `!isSidebarCollapsed`.
// If `isSidebarCollapsed` is false, it's pinned open. If true, it's pinned closed (but can expand on hover).

// So the button should toggle `isSidebarCollapsed`.
// But wait, if it's currently pinned open (`!isSidebarCollapsed`), the button unpins it.
// Let's update the button logic:
// <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} ...>
// This is already correct.
// But we should change the icon to `Pin` and `PinOff` maybe? Or just keep PanelLeft / Sidebar.

fs.writeFileSync('src/components/Layout.tsx', content);
