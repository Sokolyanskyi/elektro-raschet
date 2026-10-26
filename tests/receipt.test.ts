import { describe, expect, it } from "vitest";
import { translate } from "../lib/i18n";
import {
  buildReceiptHtml,
  receiptFileName,
  receiptLabels,
  receiptNumber,
} from "../lib/receipt";
import type { MeterRecord } from "../lib/types";

const record: MeterRecord = {
  id: "qa-receipt-2026-10",
  period: "2026-10",
  dayPrev: 10000,
  nightPrev: 5000,
  dayCurr: 10300,
  nightCurr: 5100,
  dayRate: 4.32,
  nightRate: 2.16,
  enteredAt: "2026-10-28",
  paid: true,
  paidAt: "2026-10-26T09:00:00.000Z",
  note: "Оплачено картой <b>онлайн</b>",
  createdAt: "2026-10-28T09:00:00.000Z",
  updatedAt: "2026-10-28T09:00:00.000Z",
};

describe("receipt", () => {
  it("builds a stable receipt number and file name", () => {
    expect(receiptNumber(record)).toBe(receiptNumber({ ...record }));
    expect(receiptNumber(record)).toMatch(/^ER-202610-[A-Z0-9]{6}$/);
    expect(receiptFileName(record)).toMatch(/^receipt-2026-10-[a-z0-9]{6}\.html$/);

    const other = { ...record, id: "another-id" };
    expect(receiptNumber(other)).not.toBe(receiptNumber(record));
  });

  it("renders totals, labels and escapes user input", () => {
    const labels = receiptLabels((key, vars) => translate("ru", key, vars), record);
    const html = buildReceiptHtml(record, "ru", labels);

    expect(html).toContain("Октябрь 2026");
    expect(html).toContain(receiptNumber(record));
    expect(html).toContain("1\u00a0512,00");
    expect(html).toContain("Примечание");
    expect(html).toContain("&lt;b&gt;онлайн&lt;/b&gt;");
    expect(html).not.toContain("<b>онлайн</b>");
  });

  it("uses the selected interface language", () => {
    for (const locale of ["ru", "uk", "en", "pl", "zh"] as const) {
      const labels = receiptLabels((key, vars) => translate(locale, key, vars), record);
      const html = buildReceiptHtml(record, locale, labels);
      expect(html, locale).toContain(`<html lang="${locale}">`);
      expect(html, locale).toContain(labels.title);
      expect(html, locale).not.toContain("{number}");
    }
  });
});
