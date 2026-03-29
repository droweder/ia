import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    console.log("[ThemeContext] Applying theme:", theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light'); root.style.backgroundColor = "#0B0F19"; root.style.color = "#ffffff";
      console.log("[ThemeContext] Set dark mode colors. root.className:", root.className);
    } else {
      root.classList.remove('dark');
      root.classList.add('light'); root.style.backgroundColor = "#ffffff"; root.style.color = "#1e293b";
      console.log("[ThemeContext] Set light mode colors. root.className:", root.className);
    }
    localStorage.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    console.log("[ThemeContext] Toggling theme from", theme);
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
