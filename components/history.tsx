"use client";

import { calculateUsage } from "@/lib/calc";
import {
  formatKwh,
  formatMoney,
  formatNumber,
  monthLabel,
  monthShortLabel,
  pluralRu,
  yearOf,
} from "@/lib/format";
import type { MeterRecord } from "@/lib/types";
import { ChartIcon, PlusIcon } from "./icons";
import { RecordCard } from "./record-card";

interface HistoryProps {
  records: MeterRecord[];
  selectedYear: number | "all";
  currentYear: number;
  busy: boolean;
  onSelectYear: (year: number | "all") => void;
  onEdit: (record: MeterRecord) => void;
  onDelete: (record: MeterRecord) => void;
  onMarkPaid: (record: MeterRecord) => void;
  onUnlock: (record: MeterRecord) => void;
}

export function History({
  records,
  selectedYear,
  currentYear,
  busy,
  onSelectYear,
  onEdit,
  onDelete,
  onMarkPaid,
  onUnlock,
}: HistoryProps) {
  const years = Array.from(new Set(records.map((record) => yearOf(record.period))));
  if (!years.includes(currentYear)) years.push(currentYear);
  years.sort((a, b) => b - a);

  const filtered =
    selectedYear === "all"
      ? records
      : records.filter((record) => yearOf(record.period) === selectedYear);

  const totals = filtered.reduce(
    (accumulator, record) => {
      const usage = calculateUsage(record);
      accumulator.usage += usage.totalUsage;
      accumulator.total += usage.total;
      if (record.paid) accumulator.paid += usage.total;
      return accumulator;
    },
    { usage: 0, total: 0, paid: 0 },
  );
  const debt = Math.round((totals.total - totals.paid) * 100) / 100;

  const chartYear = selectedYear === "all" ? null : selectedYear;
  const monthly = Array.from({ length: 12 }, () => 0);
  if (chartYear) {
    for (const record of records) {
      if (yearOf(record.period) === chartYear) {
        const month = Number(record.period.slice(5, 7));
        monthly[month - 1] += calculateUsage(record).total;
      }
    }
  }
  const maxMonthly = Math.max(...monthly, 1);

  const groups: Array<{ year: number; records: MeterRecord[] }> = [];
  for (const record of filtered) {
    const year = yearOf(record.period);
    const last = groups[groups.length - 1];
    if (last && last.year === year) {
      last.records.push(record);
    } else {
      groups.push({ year, records: [record] });
    }
  }

  return (
    <section className="history" id="history">
      <div className="history-head">
        <div>
          <p className="eyebrow">История</p>
          <h2>Расчёты и оплаты</h2>
          <p className="history-sub">
            Все месяцы сохраняются — можно вернуться к любому году.
          </p>
        </div>
        <div className="year-tabs" role="tablist" aria-label="Фильтр по годам">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              role="tab"
              aria-selected={selectedYear === year}
              className={`year-tab ${selectedYear === year ? "is-active" : ""}`}
              onClick={() => onSelectYear(year)}
            >
              {year}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={selectedYear === "all"}
            className={`year-tab ${selectedYear === "all" ? "is-active" : ""}`}
            onClick={() => onSelectYear("all")}
          >
            Все
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ChartIcon width={26} height={26} />
          </div>
          <h3>{selectedYear === "all" ? "Пока нет расчётов" : `За ${selectedYear} год расчётов нет`}</h3>
          <p>
            Сохраните первый расчёт — он появится здесь. Записи хранятся годами, так что
            история всегда будет под рукой.
          </p>
          <div className="empty-actions">
            <a className="btn btn-secondary" href="#calculator">
              <PlusIcon width={17} height={17} />
              К расчёту
            </a>
            {selectedYear !== "all" && records.length > 0 ? (
              <button type="button" className="btn btn-ghost" onClick={() => onSelectYear("all")}>
                Показать все годы
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="year-summary">
            <div className="year-summary-item">
              <span>Расход</span>
              <b>{formatKwh(totals.usage)}</b>
            </div>
            <div className="year-summary-item">
              <span>Начислено</span>
              <b>{formatMoney(totals.total)}</b>
            </div>
            <div className="year-summary-item">
              <span>Оплачено</span>
              <b className="value-paid">{formatMoney(totals.paid)}</b>
            </div>
            <div className="year-summary-item">
              <span>Долг</span>
              <b className={debt > 0 ? "value-debt" : "value-zero"}>
                {formatMoney(debt)}
              </b>
            </div>
          </div>

          {chartYear ? (
            <div className="chart">
              <div className="chart-head">
                <span>Начисления по месяцам, {chartYear}</span>
                <span>{formatMoney(totals.total)}</span>
              </div>
              <div className="chart-bars">
                {monthly.map((value, index) => (
                  <div className="chart-col" key={index}>
                    <div className="chart-bar-track">
                      <div
                        className={`chart-bar ${value > 0 ? "has-value" : ""}`}
                        style={{ height: `${value > 0 ? Math.max(6, (value / maxMonthly) * 100) : 0}%` }}
                        title={`${monthShortLabel(index + 1)}: ${formatMoney(value)}`}
                      />
                    </div>
                    <span className={`chart-label ${value > 0 ? "has-value" : ""}`}>
                      {monthShortLabel(index + 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="record-groups">
            {groups.map((group) => (
              <div className="record-group" key={group.year}>
                {selectedYear === "all" ? (
                  <div className="group-title">
                    <span>{group.year} год</span>
                    <span>
                      {formatMoney(
                        group.records.reduce(
                          (sum, record) => sum + calculateUsage(record).total,
                          0,
                        ),
                      )}
                    </span>
                  </div>
                ) : null}
                <div className="record-list">
                  {group.records.map((record) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      busy={busy}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onMarkPaid={onMarkPaid}
                      onUnlock={onUnlock}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="history-total">
            Показано {filtered.length}{" "}
            {pluralRu(filtered.length, "расчёт", "расчёта", "расчётов")}
            {selectedYear === "all" ? " за всё время" : ` за ${selectedYear} год`} ·{" "}
            {formatNumber(totals.usage)} кВт·ч
          </p>
        </>
      )}
    </section>
  );
}
