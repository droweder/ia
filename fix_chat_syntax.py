with open("src/pages/Chat.tsx", "r") as f:
    content = f.read()

# Fix the syntax error around saveFinalMessage where I accidentally left `return true; };` twice or similar
old_block = """        setLoading(false);
  };


    return true;
  };"""
new_block = """        setLoading(false);
  };"""

content = content.replace(old_block, new_block)

with open("src/pages/Chat.tsx", "w") as f:
    f.write(content)

print("Fixed syntax in Chat.tsx")
