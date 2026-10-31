import { DEFAULT_DAY_RATE, DEFAULT_NIGHT_RATE, isValidDate, isValidPeriod, MAX_RATE, MAX_READING } from "@/lib/calc";
import { scopeKey } from "@/lib/records";
import type { MeterRecord, MeterType } from "@/lib/types";
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
 *
 * У электрических записей газовые поля приводятся к нулю (если не заданы),
 * у газовых — дневные и ночные показания нули, а тарифы электричества
 * подставляются дефолтные, чтобы запись оставалась совместимой со старыми
 * клиентами.
 */
export function sanitizeRecord(raw: unknown, fallbackId?: string): MeterRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;

  const period = typeof value.period === "string" ? value.period : "";
  if (!isValidPeriod(period)) return null;

  const type: MeterType = value.type === "gas" ? "gas" : "electricity";

  const dayPrev = isFiniteNumber(value.dayPrev) ? value.dayPrev : 0;
  const dayCurr = isFiniteNumber(value.dayCurr) ? value.dayCurr : 0;
  const nightPrev = isFiniteNumber(value.nightPrev) ? value.nightPrev : 0;
  const nightCurr = isFiniteNumber(value.nightCurr) ? value.nightCurr : 0;
  const dayRate = isFiniteNumber(value.dayRate) ? value.dayRate : DEFAULT_DAY_RATE;
  const nightRate = isFiniteNumber(value.nightRate) ? value.nightRate : DEFAULT_NIGHT_RATE;
  const gasPrev = isFiniteNumber(value.gasPrev) ? value.gasPrev : 0;
  const gasCurr = isFiniteNumber(value.gasCurr) ? value.gasCurr : 0;
  const gasRate = isFiniteNumber(value.gasRate) ? value.gasRate : 0;
  const gasDeliveryFee = isFiniteNumber(value.gasDeliveryFee) ? value.gasDeliveryFee : 0;

  if (type === "electricity") {
    if (
      [dayPrev, dayCurr, nightPrev, nightCurr].some(
        (reading) => reading < 0 || reading > MAX_READING,
      )
    ) {
      return null;
    }
    if (dayCurr < dayPrev || nightCurr < nightPrev) return null;
    if ([dayRate, nightRate].some((rate) => rate <= 0 || rate > MAX_RATE)) {
      return null;
    }
    if (gasCurr < gasPrev || gasDeliveryFee < 0 || gasRate < 0 || gasRate > MAX_RATE) {
      return null;
    }
  } else {
    if (
      [gasPrev, gasCurr].some((reading) => reading < 0 || reading > MAX_READING)
    ) {
      return null;
    }
    if (gasCurr < gasPrev) return null;
    if (gasRate <= 0 || gasRate > MAX_RATE) return null;
    if (gasDeliveryFee < 0 || gasDeliveryFee > MAX_RATE) return null;
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
    type,
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
    gasPrev,
    gasCurr,
    gasRate,
    gasDeliveryFee,
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
  const byScope = new Map(
    existing.map((record) => [scopeKey(record.type, record.period), record.id]),
  );

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const commands: unknown[][] = [];

  for (const record of incoming) {
    const existingRecord = byId.get(record.id);
    const scopeOwner = byScope.get(scopeKey(record.type, record.period));

    if (scopeOwner && scopeOwner !== record.id && !existingRecord) {
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
    byScope.set(scopeKey(record.type, record.period), record.id);
  }

  await kvPipeline(env, commands);
  return { added, updated, skipped };
}
