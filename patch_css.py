import re

file_path = "src/index.css"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace Aurora Gradient in index.css
new_aurora = """    /* Aurora Gradient Background */
    background: radial-gradient(
      circle at 50% 50%,
      rgba(5, 5, 10, 1) 0%, /* Predominantly Black/Very Dark Slate */
      rgba(0, 0, 0, 1) 100%
    );
    background-color: #000000;
    background-image:
      radial-gradient(at 10% 20%, hsla(220,100%,40%,0.2) 0px, transparent 50%), /* Blue */
      radial-gradient(at 90% 80%, hsla(350,100%,50%,0.15) 0px, transparent 50%), /* Red */
      radial-gradient(at 50% 90%, hsla(40,100%,50%,0.15) 0px, transparent 50%), /* Yellow */
      radial-gradient(at 80% 10%, hsla(220,100%,40%,0.15) 0px, transparent 50%); /* Blue */
    background-attachment: fixed;"""

content = re.sub(r'/\* Aurora Gradient Background \*/.*?background-attachment: fixed;', new_aurora, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched index.css")
