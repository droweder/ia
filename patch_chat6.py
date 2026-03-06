import re

with open('src/pages/Chat.tsx', 'r') as f:
    content = f.read()

# Update the instruction again to be very clear about when to use markdown sql
old_instruction = "6. NÃO exponha comandos SQL na resposta final, a menos que o usuário peça explicitamente \"Mostre o SQL\"."
new_instruction = "6. NÃO exponha comandos SQL na resposta final com textos longos ou não formatados. Se precisar justificar a consulta, e o usuário quiser ver o SQL, envolva-o em blocos de markdown padrão (\\`\\`\\`sql) que agora são ocultos por padrão na interface."

content = content.replace(old_instruction, new_instruction)

with open('src/pages/Chat.tsx', 'w') as f:
    f.write(content)

print("Patch applied.")
