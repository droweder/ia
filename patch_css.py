import re

file_path = "src/index.css"

with open(file_path, "r") as f:
    content = f.read()

# I will modify `src/index.css` global scrollbar styles from `background:` to `background-color:`
# because `background` overrides `background-color` and kills tailwind-scrollbar's `--scrollbar-thumb` override!
# When `tailwind-scrollbar` tries to change the color with `background-color: var(--scrollbar-thumb)`,
# it gets ignored because `background` from index.css has the same specificity and overwrites it.

content = content.replace("background: transparent;", "background-color: transparent;")
content = content.replace("background: rgba(148, 163, 184, 0.5);", "background-color: rgba(148, 163, 184, 0.5);")
content = content.replace("background: #1e40af;", "background-color: #1e40af;")
content = content.replace("background: rgba(148, 163, 184, 0.8);", "background-color: rgba(148, 163, 184, 0.8);")
content = content.replace("background: #1d4ed8;", "background-color: #1d4ed8;")

with open(file_path, "w") as f:
    f.write(content)
