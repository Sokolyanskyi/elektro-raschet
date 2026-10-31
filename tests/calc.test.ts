import { describe, expect, it } from "vitest";
import {
  DEFAULT_DAY_RATE,
  DEFAULT_NIGHT_RATE,
  calculateUsage,
  isValidDate,
  isValidPeriod,
  parseNumber,
  round2,
  validateDraft,
} from "../lib/calc";
import { formatDate, monthLabel, shiftPeriod, toInputValue } from "../lib/format";

const base = {
  dayPrev: 1000,
  dayCurr: 1180,
  nightPrev: 500,
  nightCurr: 530,
  dayRate: DEFAULT_DAY_RATE,
  nightRate: DEFAULT_NIGHT_RATE,
};

describe("calculateUsage", () => {
  it("считает расход и сумму по двум тарифам", () => {
    const usage = calculateUsage(base);
    expect(usage.dayUsage).toBe(180);
    expect(usage.nightUsage).toBe(30);
    expect(usage.totalUsage).toBe(210);
    expect(usage.dayCost).toBe(828);
    expect(usage.nightCost).toBe(69);
    expect(usage.total).toBe(897);
  });

  it("округляет копейки корректно", () => {
    const usage = calculateUsage({
      ...base,
      dayPrev: 0,
      dayCurr: 1.005,
      nightPrev: 0,
      nightCurr: 0,
    });
    expect(usage.dayUsage).toBe(1.01);
    expect(usage.dayCost).toBe(4.65);
    expect(usage.total).toBe(4.65);
  });

  it("поддерживает дробные показания", () => {
    const usage = calculateUsage({
      ...base,
      dayPrev: 1234.4,
      dayCurr: 1299.9,
      nightPrev: 700.1,
      nightCurr: 744.6,
    });
    expect(usage.dayUsage).toBe(65.5);
    expect(usage.nightUsage).toBe(44.5);
    expect(usage.total).toBeCloseTo(403.65, 2);
    expect(usage.dayCost).toBeCloseTo(301.3, 2);
    expect(usage.nightCost).toBeCloseTo(102.35, 2);
  });

  it("не даёт отрицательный ноль", () => {
    expect(round2(-0.0001)).toBe(0);
  });

  it("считает расход и стоимость газа с доставкой", () => {
    const usage = calculateUsage({
      ...base,
      gasPrev: 100,
      gasCurr: 118,
      gasRate: 7.96,
      gasDeliveryFee: 30,
    });
    expect(usage.gasUsage).toBe(18);
    expect(usage.gasCost).toBeCloseTo(18 * 7.96 + 30, 2);
    expect(usage.gasTotal).toBeCloseTo(18 * 7.96 + 30, 2);
    expect(usage.total).toBeCloseTo(usage.dayCost + usage.nightCost + usage.gasCost, 2);
  });

  it("газ без расхода не даёт стоимости", () => {
    const usage = calculateUsage({
      ...base,
      gasPrev: 50,
      gasCurr: 50,
      gasRate: 7.96,
      gasDeliveryFee: 30,
    });
    expect(usage.gasUsage).toBe(0);
    expect(usage.gasCost).toBe(30);
    expect(usage.total).toBeCloseTo(usage.dayCost + usage.nightCost + usage.gasCost, 2);
  });
});

describe("parseNumber", () => {
  it("понимает запятую и пробелы", () => {
    expect(parseNumber("12 345,67")).toBe(12345.67);
    expect(parseNumber("12345.67")).toBe(12345.67);
    expect(parseNumber("1\u00a0234\u202f5")).toBe(12345);
  });

  it("возвращает null для пустых и мусорных значений", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("  ")).toBeNull();
    expect(parseNumber("12a")).toBeNull();
    expect(parseNumber("1,2,3")).toBeNull();
    expect(parseNumber("-5")).toBeNull();
  });
});

describe("validateDraft", () => {
  const draft = {
    period: "2026-10",
    enteredAt: "2026-10-26",
    ...base,
  };

  it("пропускает корректный расчёт", () => {
    expect(validateDraft(draft)).toEqual({});
  });

  it("ловит показание меньше предыдущего", () => {
    const errors = validateDraft({ ...draft, dayCurr: 999 });
    expect(errors.dayCurr).toBeTruthy();
  });

  it("ловит дубль месяца, но разрешает редактирование той же записи", () => {
    const existing = [{ id: "a", period: "2026-10" }];
    expect(validateDraft(draft, { existing }).period).toBeTruthy();
    expect(validateDraft(draft, { existing, currentId: "a" }).period).toBeUndefined();
  });

  it("проверяет тариф и дату", () => {
    expect(validateDraft({ ...draft, dayRate: 0 }).dayRate).toBeTruthy();
    expect(validateDraft({ ...draft, enteredAt: "2026-02-31" }).enteredAt).toBeTruthy();
  });
});

describe("periods and dates", () => {
  it("переключает месяц через границу года", () => {
    expect(shiftPeriod("2026-12", 1)).toBe("2027-01");
    expect(shiftPeriod("2026-01", -1)).toBe("2025-12");
  });

  it("форматирует месяц и дату без сдвига часового пояса", () => {
    expect(monthLabel("2026-10")).toBe("Октябрь 2026");
    expect(formatDate("2026-10-26")).toBe("26.10.2026");
    expect(formatDate(null)).toBe("—");
  });

  it("не принимает невозможные даты и месяцы", () => {
    expect(isValidDate("2026-02-29")).toBe(false);
    expect(isValidDate("2024-02-29")).toBe(true);
    expect(isValidPeriod("2026-13")).toBe(false);
    expect(isValidPeriod("2026-1")).toBe(false);
  });

  it("переводит число в строку для поля ввода", () => {
    expect(toInputValue(1234.5)).toBe("1234,5");
    expect(toInputValue(null)).toBe("");
  });
});
