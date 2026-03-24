import re

with open("src/pages/Login.tsx", "r") as f:
    content = f.read()

# 2. Remove console.error(err)
old_catch = """    } catch (err: any) {
      console.error(err);
      if (err.message === "Invalid login credentials") {"""
new_catch = """    } catch (err: any) {
      if (err.message === "Invalid login credentials") {"""
content = content.replace(old_catch, new_catch)

with open("src/pages/Login.tsx", "w") as f:
    f.write(content)

print("Removed console.error(err) in Login.tsx")
