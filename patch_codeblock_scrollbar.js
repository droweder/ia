import fs from 'fs';

const path = 'src/pages/Chat.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the blue scrollbar classes in the CodeBlock with the rounded gray pill style shown in the user's screenshot
// The screenshot shows a very thin, dark gray rounded pill style horizontal scrollbar thumb.
content = content.replace(
    'className="w-full overflow-x-auto p-4 text-sm scrollbar-thin scrollbar-thumb-blue-900 dark:scrollbar-thumb-blue-800 hover:scrollbar-thumb-blue-800 dark:hover:scrollbar-thumb-blue-700 scrollbar-track-transparent"',
    'className="w-full overflow-x-auto p-4 pb-2 text-sm scrollbar-thin scrollbar-thumb-[#4b5563] hover:scrollbar-thumb-[#6b7280] scrollbar-track-transparent"'
);

// Note: we're using arbitrary colors #4b5563 (gray-600) and #6b7280 (gray-500) to ensure a strictly dark gray appearance in all modes, matching the screenshot.
fs.writeFileSync(path, content, 'utf8');
console.log('patched codeblock scrollbar');
