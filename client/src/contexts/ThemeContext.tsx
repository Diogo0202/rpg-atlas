import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type Theme = "light" | "dark";

export function resolveArchiveTheme(stored: string | null, defaultTheme: Theme): Theme {
  return stored === "light" || stored === "dark" ? stored : defaultTheme;
}

export function toggleArchiveTheme(theme: Theme): Theme {
  return theme === "light" ? "dark" : "light";
}

export function shouldAnimateThemeChange(prefersReducedMotion: boolean) {
  return !prefersReducedMotion;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const transitionTimer = useRef<number | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return resolveArchiveTheme(stored, defaultTheme);
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        const root = document.documentElement;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (shouldAnimateThemeChange(reduceMotion)) {
          if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
          root.dataset.themeTransition = "active";
          transitionTimer.current = window.setTimeout(() => {
            delete root.dataset.themeTransition;
            transitionTimer.current = null;
          }, 280);
        }
        setTheme(toggleArchiveTheme);
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
