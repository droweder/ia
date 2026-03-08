import re
file_path = "src/components/CreateProjectModal.tsx"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace("import { X, Lightbulb, User, CircleDollarSign, GraduationCap, PenTool, Plane } from 'lucide-react';", "import { X, Lightbulb, CircleDollarSign, GraduationCap, PenTool, Plane } from 'lucide-react';")

with open(file_path, "w") as f:
    f.write(content)
