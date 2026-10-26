import { isValidDate, isValidPeriod, MAX_RATE, MAX_READING } from "@/lib/calc";
import type { MeterRecord } from "@/lib/types";
import { kvCommand, kvPipeline, type CloudEnv } from "./auth";

const IDS_KEY = "elec:ids";
const recordKey = (id: string) => `elec:rec:${id}`;

function sortRecords(records: MeterRecord[]): MeterRecord[] {
  return records.sort((a, b) => (a.period < b.period ? 1 : a.period > b.period ? -1 : 0));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Проверяет и нормализует запись, пришедшую от клиента.
 * Возвращает null, если данные некорректны.
 */
export function sanitizeRecord(raw: unknown, fallbackId?: string): MeterRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;

  const period = typeof value.period === "string" ? value.period : "";
  if (!isValidPeriod(period)) return null;

  const numberFields = [
    "dayPrev",
    "dayCurr",
    "nightPrev",
    "nightCurr",
    "dayRate",
    "nightRate",
  ] as const;

  for (const field of numberFields) {
    if (!isFiniteNumber(value[field])) return null;
  }

  const dayPrev = value.dayPrev as number;
  const dayCurr = value.dayCurr as number;
  const nightPrev = value.nightPrev as number;
  const nightCurr = value.nightCurr as number;
  const dayRate = value.dayRate as number;
  const nightRate = value.nightRate as number;

  if (
    [dayPrev, dayCurr, nightPrev, nightCurr].some(
      (reading) => reading < 0 || reading > MAX_READING,
    )
  ) {
    return null;
  }
  if (dayCurr < dayPrev || nightCurr < nightPrev) return null;
  if (
    [dayRate, nightRate].some((rate) => rate <= 0 || rate > MAX_RATE)
  ) {
    return null;
  }

  const enteredAt = typeof value.enteredAt === "string" ? value.enteredAt : "";
  if (!isValidDate(enteredAt)) return null;

  const note = typeof value.note === "string" ? value.note.slice(0, 500) : "";
  const paid = value.paid === true;
  const paidAt =
    paid && typeof value.paidAt === "string" && !Number.isNaN(Date.parse(value.paidAt))
      ? value.paidAt
      : null;

  const rawId = typeof value.id === "string" ? value.id : "";
  const id = (fallbackId ?? rawId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  if (!id) return null;

  const now = new Date().toISOString();
  const createdAt =
    typeof value.createdAt === "string" && !Number.isNaN(Date.parse(value.createdAt))
      ? value.createdAt
      : now;
  const updatedAt =
    typeof value.updatedAt === "string" && !Number.isNaN(Date.parse(value.updatedAt))
      ? value.updatedAt
      : now;

  return {
    id,
    period,
    dayPrev,
    nightCurr,
    dayCurr,
    nightPrev,
    dayRate,
    nightRate,
    enteredAt,
    note: note || undefined,
    paid,
    paidAt: paid ? (paidAt ?? now) : null,
    createdAt,
    updatedAt,
  };
}

export async function listRecords(env: CloudEnv): Promise<MeterRecord[]> {
  const ids = await kvCommand<string[]>(env, ["SMEMBERS", IDS_KEY]);
  if (!ids || ids.length === 0) return [];

  const values = await kvCommand<Array<string | null>>(env, [
    "MGET",
    ...ids.map((id) => recordKey(id)),
  ]);

  const records: MeterRecord[] = [];
  for (const value of values) {
    if (!value) continue;
    try {
      const parsed = sanitizeRecord(JSON.parse(value));
      if (parsed) records.push(parsed);
    } catch {
      // пропускаем повреждённые записи, чтобы не ронять список
    }
  }
  return sortRecords(records);
}

export async function getRecord(env: CloudEnv, id: string): Promise<MeterRecord | null> {
  const value = await kvCommand<string | null>(env, ["GET", recordKey(id)]);
  if (!value) return null;
  try {
    return sanitizeRecord(JSON.parse(value), id);
  } catch {
    return null;
  }
}

export async function saveRecord(env: CloudEnv, record: MeterRecord): Promise<void> {
  await kvPipeline(env, [
    ["SET", recordKey(record.id), JSON.stringify(record)],
    ["SADD", IDS_KEY, record.id],
  ]);
}

export async function deleteRecord(env: CloudEnv, id: string): Promise<void> {
  await kvPipeline(env, [
    ["DEL", recordKey(id)],
    ["SREM", IDS_KEY, id],
  ]);
}

/** Массовое добавление/обновление (импорт и перенос локальных данных). */
export async function mergeRecords(
  env: CloudEnv,
  incoming: MeterRecord[],
): Promise<{ added: number; updated: number; skipped: number }> {
  const existing = await listRecords(env);
  const byId = new Map(existing.map((record) => [record.id, record]));
  const periods = new Map(existing.map((record) => [record.period, record.id]));

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const commands: unknown[][] = [];

  for (const record of incoming) {
    const existingRecord = byId.get(record.id);
    const periodOwner = periods.get(record.period);

    if (periodOwner && periodOwner !== record.id && !existingRecord) {
      skipped += 1;
      continue;
    }

    if (existingRecord) {
      updated += 1;
    } else {
      added += 1;
    }

    commands.push(["SET", recordKey(record.id), JSON.stringify(record)]);
    commands.push(["SADD", IDS_KEY, record.id]);
    byId.set(record.id, record);
    periods.set(record.period, record.id);
  }

  await kvPipeline(env, commands);
  return { added, updated, skipped };
}
