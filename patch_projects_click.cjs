const fs = require('fs');

let content = fs.readFileSync('src/pages/Projects.tsx', 'utf8');

if (!content.includes('onClick={() => loadProjectChats(project)}')) {
    content = content.replace(
      "<div \n                key={project.id}\n                className=\"group relative flex flex-col p-5",
      "<div \n                key={project.id}\n                onClick={() => loadProjectChats(project)}\n                className=\"group relative flex flex-col p-5 cursor-pointer"
    );
    fs.writeFileSync('src/pages/Projects.tsx', content);
}
