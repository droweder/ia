import re

file_path = "src/App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace <Route element={<PrivateRoute />}> with just <Route>
content = content.replace('<Route element={<PrivateRoute />}>', '<Route>')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched App.tsx to bypass Auth for screenshot")
