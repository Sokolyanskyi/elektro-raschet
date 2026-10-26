"use client";

import { monthName } from "@/lib/format";
import { useI18n } from "./i18n-provider";

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

interface MonthPickerProps {
  /** Billing month in `YYYY-MM` form. */
  value: string;
  onChange: (period: string) => void;
  id?: string;
}

/**
 * Native `<input type="month">` renders the month name in the operating
 * system language, which breaks the selected interface language. Two
 * selects keep the field localised in every browser.
 */
export function MonthPicker({ value, onChange, id }: MonthPickerProps) {
  const { locale, t } = useI18n();
  const [rawYear, rawMonth] = value.split("-");
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const currentYear = new Date().getFullYear();
  const safeYear = Number.isFinite(year) ? year : currentYear;
  const safeMonth = Number.isFinite(month) && month >= 1 && month <= 12 ? month : 1;

  // Billing months start in 2021, with 30 years ahead. A year that is already
  // selected (for example from an imported backup) is always kept in the list.
  const firstYear = Math.min(2021, safeYear);
  const lastYear = Math.max(currentYear + 30, safeYear);
  const years: number[] = [];
  for (let option = lastYear; option >= firstYear; option -= 1) {
    years.push(option);
  }

  const update = (nextYear: number, nextMonth: number) => {
    onChange(`${nextYear}-${String(nextMonth).padStart(2, "0")}`);
  };

  return (
    <div className="month-picker">
      <select
        id={id}
        className="input"
        aria-label={t("form.monthAria")}
        value={safeMonth}
        onChange={(event) => update(safeYear, Number(event.target.value))}
      >
        {MONTHS.map((option) => (
          <option key={option} value={option}>
            {monthName(option, locale)}
          </option>
        ))}
      </select>
      <select
        className="input"
        aria-label={t("form.yearAria")}
        value={safeYear}
        onChange={(event) => update(Number(event.target.value), safeMonth)}
      >
        {years.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
