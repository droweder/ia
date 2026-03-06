import sys

with open('src/index.css', 'r') as f:
    content = f.read()

scrollbar_css = """
  /* Global Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.5); /* slate-400 */
    border-radius: 10px;
  }
  .dark ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.8);
  }
  .dark ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
}
"""

new_content = content.replace('}\n}\n', '}\n' + scrollbar_css + '\n')
if new_content == content:
    # Try different pattern
    new_content = content.replace('color: white;\n  }', 'color: white;\n  }\n' + scrollbar_css)


with open('src/index.css', 'w') as f:
    f.write(new_content)

print("Patched index.css")
