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
  const now = new Date();
  const currentYear = now.getFullYear();

  const firstYear = Math.min(currentYear - 5, Number.isFinite(year) ? year : currentYear);
  const lastYear = Math.max(currentYear + 2, Number.isFinite(year) ? year : currentYear);
  const years: number[] = [];
  for (let option = lastYear; option >= firstYear; option -= 1) {
    years.push(option);
  }

  const update = (nextYear: number, nextMonth: number) => {
    onChange(
      `${nextYear}-${String(nextMonth).padStart(2, "0")}`,
    );
  };

  return (
    <div className="month-picker">
      <select
        id={id}
        className="input"
        aria-label={t("form.monthAria")}
        value={Number.isFinite(month) && month >= 1 && month <= 12 ? month : ""}
        onChange={(event) => update(year, Number(event.target.value))}
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
        value={Number.isFinite(year) ? year : currentYear}
        onChange={(event) => update(Number(event.target.value), month)}
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
