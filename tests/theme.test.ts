import { describe, expect, it } from "vitest";
import { LOCALES, messages } from "../lib/i18n";
import {
  THEMES,
  THEME_INIT_SCRIPT,
  THEME_META,
  THEME_STORAGE_KEY,
  isTheme,
} from "../lib/theme";

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

describe("colour schemes", () => {
  it("offers at least six distinct schemes", () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(6);
    expect(new Set(THEMES).size).toBe(THEMES.length);
  });

  it("describes every scheme for the picker and the status bar", () => {
    for (const id of THEMES) {
      const meta = THEME_META[id];
      expect(meta, id).toBeDefined();
      expect(["light", "dark"], id).toContain(meta.scheme);
      expect(meta.barColor, id).toMatch(HEX);
      for (const colour of Object.values(meta.preview)) {
        expect(colour, `${id} preview`).toMatch(HEX);
      }
    }
  });

  it("includes both a light and a dark option", () => {
    const schemes = new Set(THEMES.map((id) => THEME_META[id].scheme));
    expect(schemes).toEqual(new Set(["light", "dark"]));
  });

  it("has a translated name for every scheme in every locale", () => {
    for (const locale of LOCALES) {
      for (const id of THEMES) {
        const key = `theme.${id}` as const;
        expect(messages[locale][key], `${locale}:${key}`).toBeTruthy();
      }
      expect(messages[locale]["settings.themeTitle"]).toBeTruthy();
      expect(messages[locale]["settings.themeText"]).toBeTruthy();
    }

    // Labels are localised, not just copied from English.
    const english = THEMES.map((id) => messages.en[`theme.${id}`]);
    const russian = THEMES.map((id) => messages.ru[`theme.${id}`]);
    expect(russian).not.toEqual(english);
  });

  it("recognises only known scheme ids", () => {
    for (const id of THEMES) {
      expect(isTheme(id)).toBe(true);
    }
    expect(isTheme("neon")).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(42)).toBe(false);
  });

  it("applies a stored scheme before first paint", () => {
    expect(THEME_INIT_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(THEME_INIT_SCRIPT).toContain("prefers-color-scheme");
    for (const id of THEMES) {
      expect(THEME_INIT_SCRIPT).toContain(`"${id}"`);
    }
  });
});
