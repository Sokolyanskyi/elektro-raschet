const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

const moneyFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

export function formatMoney(value: number): string {
  return `${moneyFormatter.format(Number.isFinite(value) ? value : 0)} ₴`;
}

export function formatMoneyPlain(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatKwh(value: number): string {
  return `${formatNumber(value)} кВт·ч`;
}

/** Русские формы множественного числа: 1 расчёт, 2 расчёта, 5 расчётов. */
export function pluralRu(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(Math.trunc(count));
  const lastTwo = abs % 100;
  const last = abs % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

/** «2026-10» → «Октябрь 2026». */
export function monthLabel(period: string): string {
  if (!/^\d{4}-\d{2}$/.test(period)) return period;
  const [year, month] = period.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

export function monthShortLabel(month: number): string {
  return MONTHS_SHORT[month - 1] ?? "";
}

export function yearOf(period: string): number {
  return Number(period.slice(0, 4));
}

/** «2026-10-26» → «26.10.2026» (без сдвигов часового пояса). */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const datePart = value.slice(0, 10);
  const parts = datePart.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return datePart;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  const time = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${formatDate(value)}, ${time}`;
}

/** Локальная дата в формате YYYY-MM-DD. */
export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Текущий расчётный месяц, например «2026-10». */
export function currentPeriod(): string {
  return todayISO().slice(0, 7);
}

export function shiftPeriod(period: string, months: number): string {
  if (!/^\d{4}-\d{2}$/.test(period)) return currentPeriod();
  const [year, month] = period.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Предыдущий месяц относительно расчётного. */
export function previousPeriod(period: string): string {
  return shiftPeriod(period, -1);
}

/** Из числа в строку для input: 1234.5 → «1234,5». */
export function toInputValue(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  return String(value).replace(".", ",");
}
