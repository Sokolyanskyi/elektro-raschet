import {
  DEFAULT_DAY_RATE,
  DEFAULT_GAS_RATE,
  DEFAULT_NIGHT_RATE,
  MAX_RATE,
  MAX_READING,
  isValidDate,
  isValidPeriod,
} from "@/lib/calc";
import type { MeterRecord, MeterType, Settings } from "@/lib/types";
import { newId, sortRecords } from "./local-store";
import { todayISO } from "@/lib/format";

export interface ParsedBackup {
  records: MeterRecord[];
  settings: Settings | null;
  skipped: number;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeRecord(raw: unknown): MeterRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.period !== "string" || !isValidPeriod(value.period)) return null;

  const type: MeterType = value.type === "gas" ? "gas" : "electricity";

  const dayPrev = toNumber(value.dayPrev) ?? 0;
  const dayCurr = toNumber(value.dayCurr) ?? 0;
  const nightPrev = toNumber(value.nightPrev) ?? 0;
  const nightCurr = toNumber(value.nightCurr) ?? 0;

  const gasPrev = toNumber(value.gasPrev) ?? 0;
  const gasCurr = toNumber(value.gasCurr) ?? 0;

  if (type === "electricity") {
    if (
      [dayPrev, dayCurr, nightPrev, nightCurr].some(
        (reading) => reading < 0 || reading > MAX_READING,
      ) ||
      dayCurr < dayPrev ||
      nightCurr < nightPrev
    ) {
      return null;
    }
  } else {
    if (gasPrev < 0 || gasCurr < 0 || gasCurr < gasPrev) return null;
  }

  const dayRate = toNumber(value.dayRate);
  const nightRate = toNumber(value.nightRate);
  const safeDayRate =
    dayRate && dayRate > 0 && dayRate <= MAX_RATE ? dayRate : DEFAULT_DAY_RATE;
  const safeNightRate =
    nightRate && nightRate > 0 && nightRate <= MAX_RATE ? nightRate : DEFAULT_NIGHT_RATE;
  const gasRate = toNumber(value.gasRate);
  const safeGasRate =
    gasRate && gasRate > 0 && gasRate <= MAX_RATE
      ? gasRate
      : type === "gas"
        ? DEFAULT_GAS_RATE
        : 0;
  const gasDeliveryFee = toNumber(value.gasDeliveryFee);

  const enteredAt =
    typeof value.enteredAt === "string" && isValidDate(value.enteredAt)
      ? value.enteredAt
      : todayISO();

  const now = new Date().toISOString();
  const paid = value.paid === true;
  const paidAt =
    paid && typeof value.paidAt === "string" && !Number.isNaN(Date.parse(value.paidAt))
      ? value.paidAt
      : paid
        ? now
        : null;

  const id =
    typeof value.id === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(value.id)
      ? value.id
      : newId();

  return {
    id,
    type,
    period: value.period,
    dayPrev,
    dayCurr,
    nightPrev,
    nightCurr,
    dayRate: safeDayRate,
    nightRate: safeNightRate,
    enteredAt,
    note: typeof value.note === "string" ? value.note.slice(0, 500) : undefined,
    paid,
    paidAt,
    createdAt:
      typeof value.createdAt === "string" && !Number.isNaN(Date.parse(value.createdAt))
        ? value.createdAt
        : now,
    updatedAt:
      typeof value.updatedAt === "string" && !Number.isNaN(Date.parse(value.updatedAt))
        ? value.updatedAt
        : now,
    gasPrev,
    gasCurr,
    gasRate: safeGasRate,
    gasDeliveryFee: gasDeliveryFee ?? 0,
  };
}

/**
 * Разбирает файл резервной копии. Поддерживает как полный формат
 * { app, version, settings, records }, так и простой массив записей.
 */
export function parseBackup(raw: unknown): ParsedBackup {
  let items: unknown[] = [];
  let settings: Settings | null = null;

  if (Array.isArray(raw)) {
    items = raw;
  } else if (raw && typeof raw === "object") {
    const value = raw as Record<string, unknown>;
    items = Array.isArray(value.records) ? value.records : [];
    if (value.settings && typeof value.settings === "object") {
      const source = value.settings as Record<string, unknown>;
      const dayRate = toNumber(source.dayRate);
      const nightRate = toNumber(source.nightRate);
      const gasRate = toNumber(source.gasRate);
      const gasDeliveryFee = toNumber(source.gasDeliveryFee);
      if (dayRate && nightRate && dayRate > 0 && nightRate > 0) {
        settings = {
          dayRate,
          nightRate,
          gasRate: gasRate && gasRate > 0 ? gasRate : DEFAULT_GAS_RATE,
          gasDeliveryFee: gasDeliveryFee && gasDeliveryFee >= 0 ? gasDeliveryFee : 0,
        };
      }
    }
  }

  const byId = new Map<string, MeterRecord>();
  const scopes = new Set<string>();
  let skipped = 0;

  for (const item of items) {
    const record = normalizeRecord(item);
    if (!record) {
      skipped += 1;
      continue;
    }
    const scope = `${record.type}:${record.period}`;
    if (byId.has(record.id) || scopes.has(scope)) {
      skipped += 1;
      continue;
    }
    byId.set(record.id, record);
    scopes.add(scope);
  }

  return { records: sortRecords([...byId.values()]), settings, skipped };
}
