import {
  DEFAULT_DAY_RATE,
  DEFAULT_NIGHT_RATE,
  isValidDate,
  isValidPeriod,
} from "@/lib/calc";
import type { MeterRecord, Settings } from "@/lib/types";

const RECORDS_KEY = "elec.records.v1";
const SETTINGS_KEY = "elec.settings.v1";

export const DEFAULT_SETTINGS: Settings = {
  dayRate: DEFAULT_DAY_RATE,
  nightRate: DEFAULT_NIGHT_RATE,
};

function isRecord(value: unknown): value is MeterRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.period === "string" &&
    isValidPeriod(record.period) &&
    typeof record.enteredAt === "string" &&
    isValidDate(record.enteredAt) &&
    ["dayPrev", "dayCurr", "nightPrev", "nightCurr", "dayRate", "nightRate"].every(
      (key) => typeof record[key] === "number" && Number.isFinite(record[key]),
    ) &&
    typeof record.paid === "boolean"
  );
}

export function sortRecords(records: MeterRecord[]): MeterRecord[] {
  return [...records].sort((a, b) => (a.period < b.period ? 1 : a.period > b.period ? -1 : 0));
}

export function loadLocalRecords(): MeterRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return sortRecords(parsed.filter(isRecord));
  } catch {
    return [];
  }
}

export function saveLocalRecords(records: MeterRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(sortRecords(records)));
}

export function loadLocalSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    const dayRate =
      typeof parsed.dayRate === "number" && parsed.dayRate > 0
        ? parsed.dayRate
        : DEFAULT_DAY_RATE;
    const nightRate =
      typeof parsed.nightRate === "number" && parsed.nightRate > 0
        ? parsed.nightRate
        : DEFAULT_NIGHT_RATE;
    return { dayRate, nightRate };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveLocalSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Объединение записей без дублей: сначала по id, затем по расчётному месяцу. */
export function mergeRecordLists(
  existing: MeterRecord[],
  incoming: MeterRecord[],
): {
  records: MeterRecord[];
  added: number;
  updated: number;
  skipped: number;
} {
  const records = sortRecords(existing);
  const byId = new Map(records.map((record) => [record.id, record]));
  const byPeriod = new Map(records.map((record) => [record.period, record.id]));

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const record of incoming) {
    const sameId = byId.get(record.id);
    const periodOwner = byPeriod.get(record.period);

    if (periodOwner && periodOwner !== record.id && !sameId) {
      skipped += 1;
      continue;
    }

    if (sameId) {
      updated += 1;
      byId.set(record.id, record);
    } else {
      added += 1;
      byId.set(record.id, record);
      byPeriod.set(record.period, record.id);
    }
  }

  return { records: sortRecords([...byId.values()]), added, updated, skipped };
}
