"use client";

import { calculateUsage } from "@/lib/calc";
import {
  formatKwh,
  formatMoney,
  formatNumber,
  monthLabel,
  monthShortLabel,
  yearOf,
} from "@/lib/format";
import type { MeterRecord } from "@/lib/types";
import { useI18n } from "./i18n-provider";
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
  const { locale, t } = useI18n();
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

  const scope =
    selectedYear === "all"
      ? t("history.scopeAll")
      : t("history.scopeYear", { year: selectedYear });

  return (
    <section className="history" id="history">
      <div className="history-head">
        <div>
          <p className="eyebrow">{t("history.eyebrow")}</p>
          <h2>{t("history.title")}</h2>
          <p className="history-sub">{t("history.subtitle")}</p>
        </div>
        <div className="year-tabs" role="tablist" aria-label={t("history.yearFilter")}>
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
            {t("history.all")}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <ChartIcon width={26} height={26} />
          </div>
          <h3>
            {selectedYear === "all"
              ? t("history.emptyAll")
              : t("history.emptyYear", { year: selectedYear })}
          </h3>
          <p>{t("history.emptyText")}</p>
          <div className="empty-actions">
            <a className="btn btn-secondary" href="#calculator">
              <PlusIcon width={17} height={17} />
              {t("history.goToCalc")}
            </a>
            {selectedYear !== "all" && records.length > 0 ? (
              <button type="button" className="btn btn-ghost" onClick={() => onSelectYear("all")}>
                {t("history.showAll")}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="year-summary">
            <div className="year-summary-item">
              <span>{t("history.usage")}</span>
              <b>{formatKwh(totals.usage, locale)}</b>
            </div>
            <div className="year-summary-item">
              <span>{t("history.charged")}</span>
              <b>{formatMoney(totals.total, locale)}</b>
            </div>
            <div className="year-summary-item">
              <span>{t("history.paid")}</span>
              <b className="value-paid">{formatMoney(totals.paid, locale)}</b>
            </div>
            <div className="year-summary-item">
              <span>{t("history.debt")}</span>
              <b className={debt > 0 ? "value-debt" : "value-zero"}>
                {formatMoney(debt, locale)}
              </b>
            </div>
          </div>

          {chartYear ? (
            <div className="chart">
              <div className="chart-head">
                <span>{t("history.chartTitle", { year: chartYear })}</span>
                <span>{formatMoney(totals.total, locale)}</span>
              </div>
              <div className="chart-bars">
                {monthly.map((value, index) => (
                  <div className="chart-col" key={index}>
                    <div className="chart-bar-track">
                      <div
                        className={`chart-bar ${value > 0 ? "has-value" : ""}`}
                        style={{ height: `${value > 0 ? Math.max(6, (value / maxMonthly) * 100) : 0}%` }}
                        title={`${monthShortLabel(index + 1, locale)}: ${formatMoney(value, locale)}`}
                      />
                    </div>
                    <span className={`chart-label ${value > 0 ? "has-value" : ""}`}>
                      {monthShortLabel(index + 1, locale)}
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
                    <span>{t("history.yearGroup", { year: group.year })}</span>
                    <span>
                      {formatMoney(
                        group.records.reduce(
                          (sum, record) => sum + calculateUsage(record).total,
                          0,
                        ),
                        locale,
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
            {t("history.total", {
              count: filtered.length,
              kwh: `${formatNumber(totals.usage, locale)} ${t("common.kwh")}`,
              scope,
            })}
          </p>
        </>
      )}
    </section>
  );
}
