import re

with open("src/pages/Login.tsx", "r") as f:
    content = f.read()

# 1. Replace the noise overlay with inline SVG
old_noise = """<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>"""
new_noise = """<div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>"""
content = content.replace(old_noise, new_noise)

with open("src/pages/Login.tsx", "w") as f:
    f.write(content)

print("Updated noise.svg in Login.tsx")
