export const LOCALES = ["ru", "uk", "en", "pl", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_STORAGE_KEY = "elec.locale.v1";

export interface LocaleMeta {
  /** Name of the language in that language. */
  nativeName: string;
  /** English name, helpful when the current interface language is not this one. */
  englishName: string;
  /** BCP 47 tag written to <html lang>. */
  htmlLang: string;
  /** Tag used for Intl formatting. */
  intl: string;
  /** BCP 47 tag used for search engines and unrelated metadata. */
  short: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  ru: {
    nativeName: "Русский",
    englishName: "Russian",
    htmlLang: "ru",
    intl: "ru-RU",
    short: "ru",
  },
  uk: {
    nativeName: "Українська",
    englishName: "Ukrainian",
    htmlLang: "uk",
    intl: "uk-UA",
    short: "uk",
  },
  en: {
    nativeName: "English",
    englishName: "English",
    htmlLang: "en",
    intl: "en-GB",
    short: "en",
  },
  pl: {
    nativeName: "Polski",
    englishName: "Polish",
    htmlLang: "pl",
    intl: "pl-PL",
    short: "pl",
  },
  zh: {
    nativeName: "中文",
    englishName: "Chinese",
    htmlLang: "zh",
    intl: "zh-CN",
    short: "zh",
  },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace("_", "-");
  if (normalized.startsWith("uk")) return "uk";
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("pl")) return "pl";
  if (normalized.startsWith("zh")) return "zh";
  if (normalized.startsWith("en")) return "en";
  return null;
}

/** Best supported locale for the browser, falling back to Russian. */
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "ru";
  const candidates =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate);
    if (locale) return locale;
  }
  return "ru";
}

export function loadStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveStoredLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable in private mode; the language still applies.
  }
}

/** Decimal separator used in text inputs for this locale. */
export function usesDecimalComma(locale: Locale): boolean {
  return locale === "ru" || locale === "uk" || locale === "pl";
}
