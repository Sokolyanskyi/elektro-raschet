import type { MessageKey } from "./i18n/messages";
import type { MeterType } from "./types";

export const DEFAULT_DAY_RATE = 4.6;
export const DEFAULT_NIGHT_RATE = 2.3;
export const DEFAULT_GAS_RATE = 7.96;

export const MAX_READING = 9_999_999;
export const MAX_RATE = 1_000;

export interface UsageInput {
  dayPrev: number;
  dayCurr: number;
  nightPrev: number;
  nightCurr: number;
  dayRate: number;
  nightRate: number;
  gasPrev?: number;
  gasCurr?: number;
  gasRate?: number;
  gasDeliveryFee?: number;
}

export interface UsageResult {
  dayUsage: number;
  nightUsage: number;
  totalUsage: number;
  dayCost: number;
  nightCost: number;
  total: number;
  gasUsage: number;
  gasCost: number;
  gasTotal: number;
}

/** Округление до копеек (половина — вверх). */
export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const sign = value < 0 ? -1 : 1;
  const rounded = (sign * Math.round((Math.abs(value) + Number.EPSILON) * 100)) / 100;
  return rounded === 0 ? 0 : rounded;
}

export function calculateUsage(input: UsageInput): UsageResult {
  const dayUsage = round2(input.dayCurr - input.dayPrev);
  const nightUsage = round2(input.nightCurr - input.nightPrev);
  const dayCost = round2(dayUsage * input.dayRate);
  const nightCost = round2(nightUsage * input.nightRate);
  const gasUsage = round2((input.gasCurr ?? 0) - (input.gasPrev ?? 0));
  const gasCost = round2(gasUsage * (input.gasRate ?? 0) + (input.gasDeliveryFee ?? 0));

  const total = round2(dayCost + nightCost + gasCost);

  return {
    dayUsage,
    nightUsage,
    totalUsage: round2(dayUsage + nightUsage + gasUsage),
    dayCost,
    nightCost,
    total,
    gasUsage,
    gasCost,
    gasTotal: gasCost,
  };
}

/** Разбирает число, введённое человеком: «12 345,67», «12345.67», «1 234». */
export function parseNumber(value: string): number | null {
  if (typeof value !== "string") return null;
  const cleaned = value
    .replace(/[\s\u00a0\u202f]/g, "")
    .replace(",", ".");
  if (cleaned === "" || cleaned === "." || cleaned === "-") return null;
  if (!/^\d*\.?\d*$/.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isValidPeriod(period: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
}

export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/**
 * Validation returns stable message keys rather than sentences. The form
 * translates them, so switching the interface language updates existing errors.
 */
export type ValidationErrors = Record<string, MessageKey>;

export function validateDraft(
  draft: {
    type?: MeterType;
    period: string;
    enteredAt: string;
    dayPrev: number | null;
    dayCurr: number | null;
    nightPrev: number | null;
    nightCurr: number | null;
    dayRate: number | null;
    nightRate: number | null;
    gasPrev?: number | null;
    gasCurr?: number | null;
    gasRate?: number | null;
    gasDeliveryFee?: number | null;
  },
  options?: {
    existing?: { id: string; period: string; type?: MeterType }[];
    currentId?: string;
  },
): ValidationErrors {
  const isGas = draft.type === "gas";
  const errors: ValidationErrors = {};

  if (!isValidPeriod(draft.period)) {
    errors.period = "validation.periodRequired";
  } else if (
    options?.existing?.some(
      (record) =>
        record.period === draft.period &&
        record.id !== options.currentId &&
        (record.type ?? "electricity") === (isGas ? "gas" : "electricity"),
    )
  ) {
    errors.period = "validation.periodDuplicate";
  }

  if (!isValidDate(draft.enteredAt)) {
    errors.enteredAt = "validation.enteredAtRequired";
  }

  if (isGas) {
    // Газовая форма: показания и тариф газа обязательны, электричество не проверяем.
    const gasReadings: Array<[string, number | null | undefined, MessageKey]> = [
      ["gasPrev", draft.gasPrev, "validation.prevRequired"],
      ["gasCurr", draft.gasCurr, "validation.currRequired"],
    ];
    for (const [key, value, messageKey] of gasReadings) {
      if (value === null || value === undefined) {
        errors[key] = messageKey;
      } else if (value < 0) {
        errors[key] = "validation.negativeReading";
      } else if (value > MAX_READING) {
        errors[key] = "validation.readingTooLarge";
      }
    }
    if (
      draft.gasCurr !== null &&
      draft.gasCurr !== undefined &&
      draft.gasPrev !== null &&
      draft.gasPrev !== undefined &&
      draft.gasCurr < draft.gasPrev
    ) {
      errors.gasCurr = "validation.currLessPrev";
    }

    if (draft.gasRate === null || draft.gasRate === undefined) {
      errors.gasRate = "validation.rateRequired";
    } else if (draft.gasRate <= 0) {
      errors.gasRate = "validation.ratePositive";
    } else if (draft.gasRate > MAX_RATE) {
      errors.gasRate = "validation.rateTooLarge";
    }

    if (draft.gasDeliveryFee !== null && draft.gasDeliveryFee !== undefined) {
      if (draft.gasDeliveryFee < 0) {
        errors.gasDeliveryFee = "validation.ratePositive";
      } else if (draft.gasDeliveryFee > MAX_RATE) {
        errors.gasDeliveryFee = "validation.rateTooLarge";
      }
    }
    return errors;
  }

  const readings: Array<[string, number | null, MessageKey]> = [
    ["dayPrev", draft.dayPrev, "validation.prevRequired"],
    ["dayCurr", draft.dayCurr, "validation.currRequired"],
    ["nightPrev", draft.nightPrev, "validation.prevRequired"],
    ["nightCurr", draft.nightCurr, "validation.currRequired"],
  ];

  for (const [key, value, messageKey] of readings) {
    if (value === null) {
      errors[key] = messageKey;
    } else if (value < 0) {
      errors[key] = "validation.negativeReading";
    } else if (value > MAX_READING) {
      errors[key] = "validation.readingTooLarge";
    }
  }

  if (draft.dayCurr !== null && draft.dayPrev !== null && draft.dayCurr < draft.dayPrev) {
    errors.dayCurr = "validation.currLessPrev";
  }
  if (
    draft.nightCurr !== null &&
    draft.nightPrev !== null &&
    draft.nightCurr < draft.nightPrev
  ) {
    errors.nightCurr = "validation.currLessPrev";
  }

  const rates: Array<[string, number | null]> = [
    ["dayRate", draft.dayRate],
    ["nightRate", draft.nightRate],
  ];
  for (const [key, value] of rates) {
    if (value === null) {
      errors[key] = "validation.rateRequired";
    } else if (value <= 0) {
      errors[key] = "validation.ratePositive";
    } else if (value > MAX_RATE) {
      errors[key] = "validation.rateTooLarge";
    }
  }

  return errors;
}
