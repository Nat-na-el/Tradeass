import React, { createContext, useContext, useState, useEffect } from "react";

// Safe default context value to avoid undefined issues
const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "tradeass-theme",
}) {
  const [theme, setTheme] = useState(() => {
    // Try to get from localStorage first
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    // Fallback to system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Clean both classes first
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Persist preference
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
