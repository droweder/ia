const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// The replacement swallowed the 'Novo Chat' button which lived before 'Buscar em chats'
// Need to restore that.
const { execSync } = require('child_process');
execSync('git checkout src/components/Layout.tsx');
