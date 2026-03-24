import re

with open("src/pages/Chat.tsx", "r") as f:
    content = f.read()

# Let's remove the lines referencing fullText that were left from the previous PDF logic block
# wait, there's a fullText inside the PDF reading block!
# `let fullText = "";`
# I accidentally removed it using the replace `let fullText = ""; // eslint-disable-line` but wait, there was `let fullText = "";` inside PDF.
# Let's just restore the file and do precise replacements.
content = content.replace("for (let i = 1; i <= pdf.numPages; i++) {\n                        const page = await pdf.getPage(i);\n                        const textContent = await page.getTextContent();\n                        const pageText = textContent.items.map((item: any) => item.str).join(\" \");\n                         += pageText + \"\\n\";\n                    }", "for (let i = 1; i <= pdf.numPages; i++) {\n                        const page = await pdf.getPage(i);\n                        const textContent = await page.getTextContent();\n                        const pageText = textContent.items.map((item: any) => item.str).join(\" \");\n                        fullText += pageText + \"\\n\";\n                    }")

# Oh, the error says Cannot find name 'fullText'. Let's see where it's used.
content = content.replace("extractedTextFromFiles += `\\n\\n--- Conteúdo do arquivo PDF: ${file.name} ---\\n${}\\n--- Fim do arquivo ---\\n`;", "extractedTextFromFiles += `\\n\\n--- Conteúdo do arquivo PDF: ${file.name} ---\\n${fullText}\\n--- Fim do arquivo ---\\n`;")

# Just restore the let fullText = ""; inside the pdf block
content = content.replace("const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;", "const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;\n                    let fullText = '';")

with open("src/pages/Chat.tsx", "w") as f:
    f.write(content)

print("Restored fullText variable for PDF parser in Chat.tsx")
