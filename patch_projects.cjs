const fs = require('fs');

let content = fs.readFileSync('src/pages/Projects.tsx', 'utf8');

// Ensure useNavigate is imported
if (!content.includes('useNavigate')) {
    content = content.replace("import { useState, useEffect, useRef } from 'react';", "import { useState, useEffect, useRef } from 'react';\nimport { useNavigate } from 'react-router-dom';");
}
// Ensure ChevronLeft, Clock, MessageSquare, Plus etc are imported from lucide-react
if (!content.includes('ChevronLeft')) {
    content = content.replace("Folder, Plus, MoreVertical, Pencil, Trash2, Calendar, MessageSquare } from 'lucide-react';", "Folder, Plus, MoreVertical, Pencil, Trash2, Calendar, MessageSquare, ChevronLeft, Clock } from 'lucide-react';");
}

// Ensure activeProject state exists
if (!content.includes('const [activeProject, setActiveProject]')) {
    content = content.replace("const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);", "const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);\n  const [activeProject, setActiveProject] = useState<any>(null);\n  const [projectConversations, setProjectConversations] = useState<any[]>([]);\n  const [isChatsLoading, setIsChatsLoading] = useState(false);\n  const navigate = useNavigate();");
}

fs.writeFileSync('src/pages/Projects.tsx', content);
