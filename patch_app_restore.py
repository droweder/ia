import re

file_path = "src/App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Restore PrivateRoute
content = content.replace('<Route>', '<Route element={<PrivateRoute />}>')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Restored PrivateRoute in App.tsx")
