import re

with open("src/pages/Login.tsx", "r") as f:
    content = f.read()

# 1. Remove the noise inline SVG completely
noise_to_remove = """          {/* subtle noise overlay */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>"""

content = content.replace(noise_to_remove, "")

with open("src/pages/Login.tsx", "w") as f:
    f.write(content)

print("Removed noise overlay from Login.tsx")
