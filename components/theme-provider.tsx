"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  THEME_META,
  detectTheme,
  isTheme,
  loadStoredTheme,
  saveStoredTheme,
  type ThemeId,
} from "@/lib/theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * The inline script in <head> has already picked the scheme before first paint.
 * Reading it back here (instead of starting from "classic") keeps the first
 * client render in sync and avoids a light flash on a saved dark scheme.
 */
function readInitialTheme(): ThemeId {
  if (typeof document !== "undefined") {
    const applied = document.documentElement.dataset.theme;
    if (isTheme(applied)) return applied;
  }
  return loadStoredTheme() ?? detectTheme();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readInitialTheme);
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    const meta = THEME_META[theme];

    root.dataset.theme = theme;
    root.style.colorScheme = meta.scheme;

    // Next.js восстанавливает head из layout при клиентских переходах между
    // страницами, и динамический theme-color мог потеряться — актуализируем
    // мета-тег на каждой смене маршрута и каждой смене темы.
    const applyThemeColor = () => {
      let tag = document.querySelector('meta[name="theme-color"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "theme-color");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", meta.barColor);
    };
    applyThemeColor();

    // No colour transition on the very first render — the scheme was already
    // painted correctly by the inline script.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    // Smoothly fade colours while switching, then remove the helper class so
    // regular hover transitions keep their own timing.
    root.classList.add("theme-switching");
    const timer = window.setTimeout(() => {
      root.classList.remove("theme-switching");
    }, 460);
    return () => window.clearTimeout(timer);
  }, [theme, pathname]);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    saveStoredTheme(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return value;
}
