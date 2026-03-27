const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

if (!appContent.includes("import Projects from './pages/Projects';")) {
    appContent = appContent.replace(
        "import Files from './pages/Files';",
        "import Files from './pages/Files';\nimport Projects from './pages/Projects';"
    );
}

if (!appContent.includes('<Route path="projects" element={<Projects />} />')) {
    appContent = appContent.replace(
        '<Route path="files" element={<Files />} />',
        '<Route path="files" element={<Files />} />\n                <Route path="projects" element={<Projects />} />'
    );
}

fs.writeFileSync('src/App.tsx', appContent);
