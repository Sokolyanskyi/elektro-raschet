import { describe, expect, it } from "vitest";
import { calculateUsage, validateDraft } from "../lib/calc";
import { normalizeRecords, scopeKey } from "../lib/records";
import { parseBackup } from "../lib/client/backup";
import { buildReceiptHtml, receiptFileName, receiptLabels, receiptNumber } from "../lib/receipt";
import { translate } from "../lib/i18n";
import type { MeterRecord } from "../lib/types";

function electricityRecord(overrides: Partial<MeterRecord> = {}): MeterRecord {
  return {
    id: "elec-1",
    type: "electricity",
    period: "2026-10",
    dayPrev: 1000,
    dayCurr: 1100,
    nightPrev: 500,
    nightCurr: 530,
    dayRate: 4.6,
    nightRate: 2.3,
    enteredAt: "2026-10-31",
    paid: false,
    paidAt: null,
    createdAt: "2026-10-31T10:00:00.000Z",
    updatedAt: "2026-10-31T10:00:00.000Z",
    gasPrev: 0,
    gasCurr: 0,
    gasRate: 0,
    gasDeliveryFee: 0,
    ...overrides,
  };
}

describe("normalizeRecords", () => {
  it("выносит встроенный газ старой записи в отдельную gas-запись", () => {
    const legacy = electricityRecord({
      gasPrev: 100,
      gasCurr: 130,
      gasRate: 7.96,
      gasDeliveryFee: 20,
    }) as MeterRecord & { type?: string };
    delete (legacy as { type?: string }).type;

    const { records, changed } = normalizeRecords([legacy]);
    expect(changed).toBe(true);
    expect(records).toHaveLength(2);

    const elec = records.find((r) => r.period === "2026-10" && r.type === "electricity")!;
    expect(elec.gasPrev).toBe(0);
    expect(elec.gasCurr).toBe(0);
    expect(elec.gasRate).toBe(0);
    expect(elec.gasDeliveryFee).toBe(0);
    expect(calculateUsage(elec).total).toBeCloseTo(460 + 69, 2);

    const gas = records.find((r) => r.type === "gas")!;
    expect(gas.period).toBe("2026-10");
    expect(gas.gasPrev).toBe(100);
    expect(gas.gasCurr).toBe(130);
    expect(gas.gasRate).toBe(7.96);
    expect(gas.gasDeliveryFee).toBe(20);
    expect(gas.paid).toBe(false);

    // Повторный запуск ничего не меняет.
    const second = normalizeRecords(records);
    expect(second.changed).toBe(false);
    expect(second.records).toHaveLength(2);
  });

  it("не дублирует газ, если gas-запись за месяц уже существует", () => {
    const legacy = electricityRecord({
      gasPrev: 100,
      gasCurr: 130,
      gasRate: 7.96,
      gasDeliveryFee: 20,
    });
    const gas = electricityRecord({
      id: "gas-1",
      type: "gas",
      dayPrev: 0,
      dayCurr: 0,
      nightPrev: 0,
      nightCurr: 0,
      gasPrev: 100,
      gasCurr: 130,
      gasRate: 7.96,
      gasDeliveryFee: 20,
    });

    const { records } = normalizeRecords([legacy, gas]);
    expect(records.filter((r) => r.type === "gas")).toHaveLength(1);
    const elec = records.find((r) => r.type === "electricity")!;
    expect(elec.gasCurr).toBe(0);
  });

  it("scopeKey различает типы в одном месяце", () => {
    expect(scopeKey("electricity", "2026-10")).toBe("electricity:2026-10");
    expect(scopeKey("gas", "2026-10")).toBe("gas:2026-10");
  });
});

describe("validateDraft (gas)", () => {
  const base = {
    type: "gas" as const,
    period: "2026-11",
    enteredAt: "2026-11-01",
    dayPrev: null,
    dayCurr: null,
    nightPrev: null,
    nightCurr: null,
    dayRate: null,
    nightRate: null,
    gasPrev: 100,
    gasCurr: 130,
    gasRate: 7.96,
    gasDeliveryFee: 20,
  };

  it("пропускает корректный газовый расчёт без проверки электричества", () => {
    expect(validateDraft(base)).toEqual({});
  });

  it("требует газовые показания и тариф", () => {
    const errors = validateDraft({ ...base, gasCurr: null, gasRate: null });
    expect(errors.gasCurr).toBe("validation.currRequired");
    expect(errors.gasRate).toBe("validation.rateRequired");
    expect(errors.dayPrev).toBeUndefined();
  });

  it("не даёт текущему показанию быть меньше прошлого", () => {
    expect(validateDraft({ ...base, gasCurr: 90 }).gasCurr).toBe("validation.currLessPrev");
  });

  it("находит дубль месяца в рамках своего типа", () => {
    const existing = [
      { id: "gas-x", period: "2026-11", type: "gas" as const },
      { id: "elec-x", period: "2026-11", type: "electricity" as const },
    ];
    expect(validateDraft(base, { existing })).toEqual({ period: "validation.periodDuplicate" });
    expect(
      validateDraft({ ...base, type: "electricity", dayPrev: 1, dayCurr: 2, nightPrev: 1, nightCurr: 2, dayRate: 4.6, nightRate: 2.3 }, { existing })
        .period,
    ).toBe("validation.periodDuplicate");
  });
});

describe("calculateUsage (gas)", () => {
  it("считает газ с платой за доставку", () => {
    const usage = calculateUsage({
      dayPrev: 0,
      dayCurr: 0,
      nightPrev: 0,
      nightCurr: 0,
      dayRate: 4.6,
      nightRate: 2.3,
      gasPrev: 100,
      gasCurr: 130,
      gasRate: 7.96,
      gasDeliveryFee: 20,
    });
    expect(usage.gasUsage).toBe(30);
    expect(usage.gasCost).toBeCloseTo(30 * 7.96 + 20, 2);
    expect(usage.total).toBeCloseTo(258.8, 2);
    expect(usage.totalUsage).toBe(30);
  });
});

describe("backup (gas)", () => {
  it("читает газовую запись и настройки с газовым тарифом", () => {
    const parsed = parseBackup({
      app: "elektro-raschet",
      version: 1,
      settings: { dayRate: 4.6, nightRate: 2.3, gasRate: 7.96, gasDeliveryFee: 20 },
      records: [
        {
          id: "gas-1",
          type: "gas",
          period: "2026-10",
          gasPrev: 100,
          gasCurr: 130,
          gasRate: 7.96,
          gasDeliveryFee: 20,
          enteredAt: "2026-10-31",
          paid: false,
        },
      ],
    });
    expect(parsed.skipped).toBe(0);
    expect(parsed.records).toHaveLength(1);
    expect(parsed.records[0].type).toBe("gas");
    expect(parsed.settings).toEqual({
      dayRate: 4.6,
      nightRate: 2.3,
      gasRate: 7.96,
      gasDeliveryFee: 20,
    });
  });

  it("разрешает электро- и газовую запись за один месяц", () => {
    const parsed = parseBackup([
      { id: "a", period: "2026-10", dayPrev: 0, dayCurr: 10, nightPrev: 0, nightCurr: 5, dayRate: 4.6, nightRate: 2.3, enteredAt: "2026-10-31" },
      { id: "b", type: "gas", period: "2026-10", gasPrev: 0, gasCurr: 10, gasRate: 7.96, enteredAt: "2026-10-31" },
    ]);
    expect(parsed.skipped).toBe(0);
    expect(parsed.records).toHaveLength(2);
  });
});

describe("receipt (gas)", () => {
  const gas: MeterRecord = {
    id: "gas-1",
    type: "gas",
    period: "2026-10",
    dayPrev: 0,
    dayCurr: 0,
    nightPrev: 0,
    nightCurr: 0,
    dayRate: 4.6,
    nightRate: 2.3,
    enteredAt: "2026-10-31",
    paid: true,
    paidAt: "2026-10-31T12:00:00.000Z",
    createdAt: "2026-10-31T10:00:00.000Z",
    updatedAt: "2026-10-31T10:00:00.000Z",
    gasPrev: 100,
    gasCurr: 130,
    gasRate: 7.96,
    gasDeliveryFee: 20,
  };

  it("номер и имя файла квитанции газа отличаются от электричества", () => {
    expect(receiptNumber(gas)).toMatch(/^GR-202610-[A-Z0-9]{6}$/);
    expect(receiptFileName(gas)).toMatch(/^gas-2026-10-[a-z0-9]{6}\.html$/);
  });

  it("в квитанции газа есть строка доставки и итог с доставкой", () => {
    const labels = receiptLabels((key, vars) => translate("ru", key, vars), gas);
    const html = buildReceiptHtml(gas, "ru", labels);
    expect(html).toContain("Плата за доставку газа");
    expect(html).toContain("Подтверждение оплаты газа");
    expect(html).toContain("258,80"); // 30 × 7.96 + 20 = 258.80
    expect(html).not.toContain("День");
  });
});
