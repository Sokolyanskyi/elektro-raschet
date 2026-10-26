export const DEFAULT_DAY_RATE = 4.6;
export const DEFAULT_NIGHT_RATE = 2.3;

export const MAX_READING = 9_999_999;
export const MAX_RATE = 1_000;

export interface UsageInput {
  dayPrev: number;
  dayCurr: number;
  nightPrev: number;
  nightCurr: number;
  dayRate: number;
  nightRate: number;
}

export interface UsageResult {
  dayUsage: number;
  nightUsage: number;
  totalUsage: number;
  dayCost: number;
  nightCost: number;
  total: number;
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

  return {
    dayUsage,
    nightUsage,
    totalUsage: round2(dayUsage + nightUsage),
    dayCost,
    nightCost,
    total: round2(dayCost + nightCost),
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

export type ValidationErrors = Record<string, string>;

export function validateDraft(
  draft: {
    period: string;
    enteredAt: string;
    dayPrev: number | null;
    dayCurr: number | null;
    nightPrev: number | null;
    nightCurr: number | null;
    dayRate: number | null;
    nightRate: number | null;
  },
  options?: {
    existing?: { id: string; period: string }[];
    currentId?: string;
  },
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!isValidPeriod(draft.period)) {
    errors.period = "Выберите расчётный месяц";
  } else if (
    options?.existing?.some(
      (record) => record.period === draft.period && record.id !== options.currentId,
    )
  ) {
    errors.period = "За этот месяц уже есть расчёт";
  }

  if (!isValidDate(draft.enteredAt)) {
    errors.enteredAt = "Укажите дату внесения показаний";
  }

  const readings: Array<[string, number | null, string]> = [
    ["dayPrev", draft.dayPrev, "Введите показание за прошлый месяц"],
    ["dayCurr", draft.dayCurr, "Введите показание за этот месяц"],
    ["nightPrev", draft.nightPrev, "Введите показание за прошлый месяц"],
    ["nightCurr", draft.nightCurr, "Введите показание за этот месяц"],
  ];

  for (const [key, value, message] of readings) {
    if (value === null) {
      errors[key] = message;
    } else if (value < 0) {
      errors[key] = "Показание не может быть отрицательным";
    } else if (value > MAX_READING) {
      errors[key] = "Слишком большое значение";
    }
  }

  if (draft.dayCurr !== null && draft.dayPrev !== null && draft.dayCurr < draft.dayPrev) {
    errors.dayCurr = "Показание за этот месяц меньше предыдущего";
  }
  if (
    draft.nightCurr !== null &&
    draft.nightPrev !== null &&
    draft.nightCurr < draft.nightPrev
  ) {
    errors.nightCurr = "Показание за этот месяц меньше предыдущего";
  }

  const rates: Array<[string, number | null]> = [
    ["dayRate", draft.dayRate],
    ["nightRate", draft.nightRate],
  ];
  for (const [key, value] of rates) {
    if (value === null) {
      errors[key] = "Укажите тариф";
    } else if (value <= 0) {
      errors[key] = "Тариф должен быть больше нуля";
    } else if (value > MAX_RATE) {
      errors[key] = "Слишком большой тариф";
    }
  }

  return errors;
}
