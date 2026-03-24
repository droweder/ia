import re

with open("src/pages/Login.tsx", "r") as f:
    content = f.read()

# 1. Update imports to include Eye and EyeOff
content = content.replace(
    "import { Mail, Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';",
    "import { Mail, Lock, ShieldCheck, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';"
)

# 2. Add state
content = content.replace(
    "const [password, setPassword] = useState('');",
    "const [password, setPassword] = useState('');\n  const [showPassword, setShowPassword] = useState(false);"
)

# 3. Update the password input wrapper and input field
old_password_block = """
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-white/10 rounded-md py-2.5 border bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm transition-all"
                  placeholder="••••••••"
                />
              </div>"""

new_password_block = """
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-white/10 rounded-md py-2.5 border bg-white/5 text-white placeholder-gray-400 backdrop-blur-sm transition-all"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-300 focus:outline-none"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>"""

content = content.replace(old_password_block, new_password_block)

with open("src/pages/Login.tsx", "w") as f:
    f.write(content)

print("Updated Login.tsx")
