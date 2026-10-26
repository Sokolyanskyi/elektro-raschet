export const THEMES = [
  "classic",
  "sky",
  "emerald",
  "sunset",
  "rose",
  "midnight",
  "graphite",
] as const;

export type ThemeId = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "elec.theme.v1";

export interface ThemeMeta {
  /** "light" or "dark" — written to <html> for native controls and scrollbars. */
  scheme: "light" | "dark";
  /** Colour used for the browser/PWA status bar. */
  barColor: string;
  /** Miniature preview of the palette shown in Settings. */
  preview: {
    bg: string;
    card: string;
    accent: string;
    line: string;
  };
}

export const THEME_META: Record<ThemeId, ThemeMeta> = {
  classic: {
    scheme: "light",
    barColor: "#f3f5fb",
    preview: { bg: "#eef1fa", card: "#ffffff", accent: "#4f46e5", line: "#cbd3e6" },
  },
  sky: {
    scheme: "light",
    barColor: "#eef7fd",
    preview: { bg: "#e8f5fd", card: "#ffffff", accent: "#0369a1", line: "#bfdcea" },
  },
  emerald: {
    scheme: "light",
    barColor: "#eff8f3",
    preview: { bg: "#eaf7f0", card: "#ffffff", accent: "#047857", line: "#c2e0d0" },
  },
  sunset: {
    scheme: "light",
    barColor: "#fdf4ec",
    preview: { bg: "#fcf0e4", card: "#ffffff", accent: "#c2410c", line: "#ecd2bd" },
  },
  rose: {
    scheme: "light",
    barColor: "#fdf1f6",
    preview: { bg: "#fcecf3", card: "#ffffff", accent: "#be185d", line: "#edd0dd" },
  },
  midnight: {
    scheme: "dark",
    barColor: "#080d1a",
    preview: { bg: "#0a1020", card: "#16213a", accent: "#818cf8", line: "#2b3a5c" },
  },
  graphite: {
    scheme: "dark",
    barColor: "#0c0c0e",
    preview: { bg: "#0e0e11", card: "#1d1d21", accent: "#a3e635", line: "#34343c" },
  },
};

export function isTheme(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/** Stored choice, if the user has ever picked a scheme on this device. */
export function loadStoredTheme(): ThemeId | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveStoredTheme(theme: ThemeId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode: the scheme still applies for this session.
  }
}

/** First visit: follow the system appearance, otherwise keep the classic look. */
export function detectTheme(): ThemeId {
  if (typeof window === "undefined") return "classic";
  try {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "midnight"
      : "classic";
  } catch {
    return "classic";
  }
}

/**
 * Runs before first paint so a saved dark scheme never flashes the light one.
 * Keep it free of template literals and optional chaining for old browsers.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var v=${JSON.stringify(
  THEMES,
)};var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(v.indexOf(t)<0){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"midnight":"classic";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
