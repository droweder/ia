const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// replace .dark ::-webkit-scrollbar-thumb with html.dark ::-webkit-scrollbar-thumb or something if needed
// Actually, just making sure color-scheme: dark is added to .dark body

if (!css.includes('color-scheme: dark;')) {
    css = css.replace('.dark body {', '.dark body {\n    color-scheme: dark;');
    fs.writeFileSync('src/index.css', css);
}
