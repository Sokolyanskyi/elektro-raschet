import { DEFAULT_DAY_RATE, DEFAULT_NIGHT_RATE } from "@/lib/calc";
import type { MeterRecord, MeterType } from "@/lib/types";

/** Ключ уникальности записи: один месяц — один счёт каждого типа. */
export function scopeKey(type: MeterType, period: string): string {
  return `${type}:${period}`;
}

export function sortRecords(records: MeterRecord[]): MeterRecord[] {
  return [...records].sort((a, b) => (a.period < b.period ? 1 : a.period > b.period ? -1 : 0));
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function finite(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function hasEmbeddedGas(record: MeterRecord): boolean {
  return (
    record.gasPrev !== 0 ||
    record.gasCurr !== 0 ||
    record.gasRate !== 0 ||
    record.gasDeliveryFee !== 0
  );
}

/**
 * Приводит записи к текущему формату:
 * 1. Каждой записи проставляет type (старые записи без type — электрические)
 *    и досыпает отсутствующие газовые поля нулями.
 * 2. Газ, «встроенный» в старые электрические записи (до появления отдельной
 *    страницы газа), выносит в самостоятельную gas-запись того же месяца,
 *    а в электрической записи газ обнуляет. Если gas-запись за этот месяц уже
 *    есть — встроенный газ просто обнуляется, чтобы не задваивать сумму.
 *
 * Функция идемпотентна: повторный запуск ничего не меняет.
 */
export function normalizeRecords(input: MeterRecord[]): {
  records: MeterRecord[];
  changed: boolean;
} {
  let changed = false;
  const staged: MeterRecord[] = [];

  for (const raw of input) {
    const type: MeterType = raw.type === "gas" ? "gas" : "electricity";
    const record: MeterRecord = {
      ...raw,
      type,
      gasPrev: finite(raw.gasPrev),
      gasCurr: finite(raw.gasCurr),
      gasRate: finite(raw.gasRate),
      gasDeliveryFee: finite(raw.gasDeliveryFee),
    };
    if (
      record.type !== (raw.type as MeterType | undefined) ||
      record.gasPrev !== (raw.gasPrev as number | undefined) ||
      record.gasCurr !== (raw.gasCurr as number | undefined) ||
      record.gasRate !== (raw.gasRate as number | undefined) ||
      record.gasDeliveryFee !== (raw.gasDeliveryFee as number | undefined)
    ) {
      changed = true;
    }
    staged.push(record);
  }

  const gasPeriods = new Set(
    staged.filter((record) => record.type === "gas").map((record) => record.period),
  );
  const result: MeterRecord[] = [];

  for (const record of staged) {
    if (record.type !== "electricity" || !hasEmbeddedGas(record)) {
      result.push(record);
      continue;
    }

    if (!gasPeriods.has(record.period)) {
      const now = new Date().toISOString();
      result.push({
        id: newId(),
        type: "gas",
        period: record.period,
        dayPrev: 0,
        dayCurr: 0,
        nightPrev: 0,
        nightCurr: 0,
        dayRate: DEFAULT_DAY_RATE,
        nightRate: DEFAULT_NIGHT_RATE,
        enteredAt: record.enteredAt,
        paid: false,
        paidAt: null,
        createdAt: now,
        updatedAt: now,
        gasPrev: record.gasPrev,
        gasCurr: record.gasCurr,
        gasRate: record.gasRate,
        gasDeliveryFee: record.gasDeliveryFee,
      });
      gasPeriods.add(record.period);
    }

    result.push({ ...record, gasPrev: 0, gasCurr: 0, gasRate: 0, gasDeliveryFee: 0 });
    changed = true;
  }

  return { records: sortRecords(result), changed };
}
