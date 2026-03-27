const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Find the start of {/* Projetos */} and the start of {/* Conversas Recentes */}
const startMarker = '{/* Projetos */}';
const endMarker = '{/* Conversas Recentes */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    fs.writeFileSync('src/components/Layout.tsx', before + after);
    console.log("Removed Projetos section successfully.");
} else {
    console.log("Could not find markers.");
}
