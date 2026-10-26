import { describe, expect, it } from "vitest";
import { validateDraft } from "../lib/calc";
import {
  formatDate,
  formatKwh,
  formatMoney,
  monthLabel,
  monthName,
  paidAtFromDate,
  toInputValue,
} from "../lib/format";
import {
  LOCALES,
  messages,
  normalizeLocale,
  translate,
  type MessageKey,
} from "../lib/i18n";

function placeholders(message: string): string[] {
  return Array.from(message.matchAll(/\{(\w+)\}/g), (match) => match[1]).sort();
}

describe("i18n catalogues", () => {
  const baseKeys = Object.keys(messages.ru).sort() as MessageKey[];

  it("has the same keys and placeholders in every locale", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(messages[locale]).sort()).toEqual(baseKeys);
      for (const key of baseKeys) {
        expect(messages[locale][key].trim().length, `${locale}:${key}`).toBeGreaterThan(0);
        expect(placeholders(messages[locale][key]), `${locale}:${key}`).toEqual(
          placeholders(messages.ru[key]),
        );
      }
    }
  });

  it("interpolates values and keeps unknown placeholders", () => {
    expect(translate("en", "form.saved", { month: "October 2026" })).toBe(
      "Record for October 2026 saved",
    );
    expect(translate("uk", "stats.unpaid", { count: 3 })).toContain("3");
    expect(translate("zh", "confirm.importText", { count: 4 })).toContain("4");
  });

  it("normalises browser language tags", () => {
    expect(normalizeLocale("uk-UA")).toBe("uk");
    expect(normalizeLocale("en_US")).toBe("en");
    expect(normalizeLocale("pl")).toBe("pl");
    expect(normalizeLocale("zh-Hans-CN")).toBe("zh");
    expect(normalizeLocale("de-DE")).toBeNull();
  });
});

describe("localised formatting", () => {
  it("formats months and dates for every locale", () => {
    expect(monthLabel("2026-10")).toBe("Октябрь 2026");
    expect(monthLabel("2026-10", "en")).toBe("October 2026");
    expect(monthLabel("2026-10", "uk")).toBe("Жовтень 2026");
    expect(monthLabel("2026-10", "pl")).toBe("Październik 2026");
    expect(monthLabel("2026-10", "zh")).toBe("2026年十月");

    expect(formatDate("2026-10-26", "en")).toBe("26/10/2026");
    expect(formatDate("2026-10-26", "zh")).toBe("2026/10/26");
    expect(formatDate(null, "en")).toBe("—");
  });

  it("names months for the billing month picker", () => {
    expect(monthName(11, "en")).toBe("November");
    expect(monthName(11, "ru")).toBe("Ноябрь");
    expect(monthName(11, "uk")).toBe("Листопад");
    expect(monthName(11, "pl")).toBe("Listopad");
    expect(monthName(11, "zh")).toBe("十一月");
  });

  it("formats money and kWh with locale rules", () => {
    expect(formatMoney(897, "en")).toBe("₴897.00");
    expect(formatKwh(210, "en")).toBe("210 kWh");
    expect(formatKwh(210, "zh")).toBe("210 千瓦时");
    expect(formatMoney(897, "ru").replace(/\u00a0/g, " ")).toBe("897,00 ₴");
  });

  it("uses the locale decimal separator in inputs", () => {
    expect(toInputValue(1234.5, "en")).toBe("1234.5");
    expect(toInputValue(1234.5, "ru")).toBe("1234,5");
    expect(toInputValue(1234.5, "pl")).toBe("1234,5");
  });

  it("keeps the picked payment date on the same calendar day", () => {
    const paidAt = paidAtFromDate("2026-10-05");
    expect(Number.isNaN(Date.parse(paidAt))).toBe(false);
    expect(formatDate(paidAt, "en")).toBe("05/10/2026");
    expect(formatDate(paidAtFromDate("2021-01-01"), "uk")).toBe("01.01.2021");
  });

  it("falls back to a valid timestamp for a malformed payment date", () => {
    const paidAt = paidAtFromDate("not-a-date");
    expect(Number.isNaN(Date.parse(paidAt))).toBe(false);
  });
});

describe("validation keys", () => {
  it("returns message keys that exist in the catalogue", () => {
    const errors = validateDraft({
      period: "2026-10",
      enteredAt: "2026-10-26",
      dayPrev: 100,
      dayCurr: 90,
      nightPrev: 50,
      nightCurr: null,
      dayRate: 0,
      nightRate: null,
    });

    for (const key of Object.values(errors)) {
      expect(Object.prototype.hasOwnProperty.call(messages.ru, key)).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(messages.en, key)).toBe(true);
    }
    expect(errors.dayCurr).toBe("validation.currLessPrev");
    expect(errors.dayRate).toBe("validation.ratePositive");
  });
});
