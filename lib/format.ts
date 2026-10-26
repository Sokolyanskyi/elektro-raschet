import type { Locale } from "./i18n/locales";
import { LOCALE_META, usesDecimalComma } from "./i18n/locales";

const KWH_UNIT: Record<Locale, string> = {
  ru: "кВт·ч",
  uk: "кВт·ч",
  en: "kWh",
  pl: "kWh",
  zh: "千瓦时",
};

const moneyFormatters = new Map<Locale, Intl.NumberFormat>();
const moneyPlainFormatters = new Map<Locale, Intl.NumberFormat>();
const numberFormatters = new Map<Locale, Intl.NumberFormat>();
const dateFormatters = new Map<Locale, Intl.DateTimeFormat>();
const monthLongFormatters = new Map<Locale, Intl.DateTimeFormat>();
const monthShortFormatters = new Map<Locale, Intl.DateTimeFormat>();
const timeFormatters = new Map<Locale, Intl.DateTimeFormat>();

function intlTag(locale: Locale): string {
  return LOCALE_META[locale]?.intl ?? LOCALE_META.ru.intl;
}

function moneyFormatter(locale: Locale): Intl.NumberFormat {
  let formatter = moneyFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlTag(locale), {
      style: "currency",
      currency: "UAH",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    moneyFormatters.set(locale, formatter);
  }
  return formatter;
}

function moneyPlainFormatter(locale: Locale): Intl.NumberFormat {
  let formatter = moneyPlainFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlTag(locale), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    moneyPlainFormatters.set(locale, formatter);
  }
  return formatter;
}

function numberFormatter(locale: Locale): Intl.NumberFormat {
  let formatter = numberFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlTag(locale), {
      maximumFractionDigits: 2,
    });
    numberFormatters.set(locale, formatter);
  }
  return formatter;
}

function dateFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(intlTag(locale), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
    dateFormatters.set(locale, formatter);
  }
  return formatter;
}

function monthLongFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = monthLongFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(intlTag(locale), {
      month: "long",
      timeZone: "UTC",
    });
    monthLongFormatters.set(locale, formatter);
  }
  return formatter;
}

function monthShortFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = monthShortFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(intlTag(locale), {
      month: "short",
      timeZone: "UTC",
    });
    monthShortFormatters.set(locale, formatter);
  }
  return formatter;
}

function timeFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = timeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(intlTag(locale), {
      hour: "2-digit",
      minute: "2-digit",
    });
    timeFormatters.set(locale, formatter);
  }
  return formatter;
}

export function formatMoney(value: number, locale: Locale = "ru"): string {
  return moneyFormatter(locale).format(Number.isFinite(value) ? value : 0);
}

export function formatMoneyPlain(value: number, locale: Locale = "ru"): string {
  return moneyPlainFormatter(locale).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number, locale: Locale = "ru"): string {
  return numberFormatter(locale).format(Number.isFinite(value) ? value : 0);
}

export function formatKwh(value: number, locale: Locale = "ru"): string {
  return `${formatNumber(value, locale)} ${KWH_UNIT[locale] ?? KWH_UNIT.ru}`;
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

function capitalize(text: string, locale: Locale): string {
  if (!text) return text;
  const [first, ...rest] = Array.from(text);
  return first.toLocaleUpperCase(intlTag(locale)) + rest.join("");
}

/** «2026-10» → «Октябрь 2026» / «October 2026» / «2026年10月». */
export function monthLabel(period: string, locale: Locale = "ru"): string {
  if (!/^\d{4}-\d{2}$/.test(period)) return period;
  const [year, month] = period.split("-").map(Number);
  if (month < 1 || month > 12) return period;
  const name = monthLongFormatter(locale).format(new Date(Date.UTC(year, month - 1, 1)));
  if (locale === "zh") {
    return `${year}年${name}`;
  }
  return `${capitalize(name, locale)} ${year}`;
}

/** «11» → «Ноябрь» / «November» / «十一月» (без года). */
export function monthName(month: number, locale: Locale = "ru"): string {
  if (month < 1 || month > 12) return "";
  return capitalize(
    monthLongFormatter(locale).format(new Date(Date.UTC(2026, month - 1, 1))),
    locale,
  );
}

export function monthShortLabel(month: number, locale: Locale = "ru"): string {
  if (month < 1 || month > 12) return "";
  return monthShortFormatter(locale)
    .format(new Date(Date.UTC(2026, month - 1, 1)))
    .replace(/\.$/, "");
}

export function yearOf(period: string): number {
  return Number(period.slice(0, 4));
}

/** «2026-10-26» → «26.10.2026» (без сдвигов часового пояса). */
export function formatDate(value: string | null | undefined, locale: Locale = "ru"): string {
  if (!value) return "—";
  const datePart = value.slice(0, 10);
  const parts = datePart.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(date.getTime())) {
      return dateFormatter(locale).format(date);
    }
  }
  return datePart;
}

export function formatDateTime(
  value: string | null | undefined,
  locale: Locale = "ru",
): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value, locale);
  const time = timeFormatter(locale).format(date);
  return `${formatDate(value, locale)}, ${time}`;
}

/** Локальная дата в формате YYYY-MM-DD. */
export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Превращает выбранную пользователем дату (YYYY-MM-DD) в ISO-метку.
 * Полдень по локальному времени не даёт дате сдвинуться при показе.
 */
export function paidAtFromDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date().toISOString();
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
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

/** Из числа в строку для input: 1234.5 → «1234,5» (ru) или «1234.5» (en). */
export function toInputValue(
  value: number | null | undefined,
  locale: Locale = "ru",
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  const text = String(value);
  return usesDecimalComma(locale) ? text.replace(".", ",") : text;
}
