const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/Chat.tsx', 'utf-8');

// The original lines to replace
const targetStr = `<div className="p-4 overflow-x-auto text-sm scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-transparent">
                    <SyntaxHighlighter
                        {...({ ...props, ref: undefined } as any)}
                        PreTag="div"
                        children={codeString}
                        language={language}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                    />
                </div>`;

const newStr = `<div className="p-4 text-sm w-full">
                    <SyntaxHighlighter
                        {...({ ...props, ref: undefined } as any)}
                        PreTag="div"
                        children={codeString}
                        language={language}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                        wrapLongLines={false}
                        className="scrollbar-thin scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 scrollbar-track-transparent"
                    />
                </div>`;

fileContent = fileContent.replace(targetStr, newStr);

fs.writeFileSync('src/pages/Chat.tsx', fileContent);
