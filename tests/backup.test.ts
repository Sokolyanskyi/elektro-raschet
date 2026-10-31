import { describe, expect, it } from "vitest";
import { parseBackup } from "../lib/client/backup";
import { mergeRecordLists } from "../lib/client/local-store";
import type { MeterRecord } from "../lib/types";

function record(overrides: Partial<MeterRecord> = {}): MeterRecord {
  return {
    id: "rec-1",
    period: "2026-10",
    dayPrev: 100,
    dayCurr: 200,
    nightPrev: 50,
    nightCurr: 80,
    dayRate: 4.6,
    nightRate: 2.3,
    enteredAt: "2026-10-26",
    paid: false,
    paidAt: null,
    createdAt: "2026-10-26T10:00:00.000Z",
    updatedAt: "2026-10-26T10:00:00.000Z",
    gasPrev: 0,
    gasCurr: 0,
    gasRate: 7.96,
    gasDeliveryFee: 0,
    ...overrides,
  };
}

describe("parseBackup", () => {
  it("читает полный файл резервной копии", () => {
    const parsed = parseBackup({
      app: "elektro-raschet",
      version: 1,
      settings: { dayRate: 5, nightRate: 2.5 },
      records: [record()],
    });
    expect(parsed.records).toHaveLength(1);
    expect(parsed.settings).toEqual({ dayRate: 5, nightRate: 2.5 });
    expect(parsed.skipped).toBe(0);
  });

  it("принимает простой массив и восстанавливает оплату", () => {
    const parsed = parseBackup([
      record({ paid: true, paidAt: "2026-10-27T12:00:00.000Z" }),
    ]);
    expect(parsed.records[0].paid).toBe(true);
    expect(parsed.records[0].paidAt).toBe("2026-10-27T12:00:00.000Z");
  });

  it("пропускает битые строки и дубли месяцев", () => {
    const parsed = parseBackup([
      record(),
      record({ id: "rec-2" }),
      { period: "2026-13" },
      { ...record({ id: "rec-3", period: "2026-09" }), dayCurr: 10 },
    ]);
    expect(parsed.records).toHaveLength(1);
    expect(parsed.skipped).toBe(3);
  });

  it("подставляет тарифы по умолчанию, если их нет", () => {
    const parsed = parseBackup([
      { ...record(), dayRate: undefined, nightRate: undefined },
    ]);
    expect(parsed.records[0].dayRate).toBe(4.6);
    expect(parsed.records[0].nightRate).toBe(2.3);
  });
});

describe("mergeRecordLists", () => {
  it("добавляет новые и обновляет совпавшие по id", () => {
    const existing = [record({ id: "a", period: "2026-09" }), record({ id: "b" })];
    const incoming = [
      record({ id: "b", dayCurr: 250 }),
      record({ id: "c", period: "2026-11" }),
    ];
    const result = mergeRecordLists(existing, incoming);
    expect(result.added).toBe(1);
    expect(result.updated).toBe(1);
    expect(result.records).toHaveLength(3);
    expect(result.records.find((item) => item.id === "b")?.dayCurr).toBe(250);
  });

  it("не создаёт два расчёта за один месяц", () => {
    const existing = [record({ id: "a" })];
    const incoming = [record({ id: "b" })];
    const result = mergeRecordLists(existing, incoming);
    expect(result.added).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.records).toHaveLength(1);
  });
});
