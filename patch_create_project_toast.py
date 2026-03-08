import re
file_path = "src/components/Layout.tsx"
with open(file_path, "r") as f:
    content = f.read()

# I see it uses showToast. I will replace setToastMessage with showToast.
content = content.replace('setToastMessage("Erro: Usuário ou empresa não identificados.");', 'showToast("Erro: Usuário ou empresa não identificados.", "error");')
content = content.replace('setToastMessage(`Erro ao criar projeto: ${error.message}`);', 'showToast(`Erro ao criar projeto: ${error.message}`, "error");')
content = content.replace('setToastMessage("Projeto criado com sucesso!");', 'showToast("Projeto criado com sucesso!", "success");')
content = content.replace('setToastMessage(`Erro inesperado: ${e.message}`);', 'showToast(`Erro inesperado: ${e.message}`, "error");')

with open(file_path, "w") as f:
    f.write(content)
