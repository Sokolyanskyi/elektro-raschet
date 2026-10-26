"use client";

import { calculateUsage } from "@/lib/calc";
import {
  formatDate,
  formatDateTime,
  formatKwh,
  formatMoney,
  formatNumber,
  monthLabel,
} from "@/lib/format";
import type { MeterRecord } from "@/lib/types";
import { useI18n } from "./i18n-provider";
import {
  CheckIcon,
  MoonIcon,
  PencilIcon,
  SunIcon,
  TrashIcon,
  UndoIcon,
} from "./icons";

interface RecordCardProps {
  record: MeterRecord;
  busy: boolean;
  onEdit: (record: MeterRecord) => void;
  onDelete: (record: MeterRecord) => void;
  onMarkPaid: (record: MeterRecord) => void;
  onUnlock: (record: MeterRecord) => void;
}

export function RecordCard({
  record,
  busy,
  onEdit,
  onDelete,
  onMarkPaid,
  onUnlock,
}: RecordCardProps) {
  const { locale, t } = useI18n();
  const usage = calculateUsage(record);
  const status = record.paid ? t("side.statusPaid") : t("side.statusUnpaid");

  return (
    <article className={`record ${record.paid ? "is-paid" : "is-unpaid"}`}>
      <div className="record-main">
        <div className="record-head">
          <div className="record-month">
            <span className={`month-mark ${record.paid ? "is-paid" : ""}`}>
              {record.paid ? <CheckIcon width={15} height={15} /> : <span />}
            </span>
            <div>
              <h3>{monthLabel(record.period, locale)}</h3>
              <p>
                {formatKwh(usage.totalUsage, locale)} ·{" "}
                {t("record.dataFrom", {
                  date: formatDate(record.enteredAt, locale),
                })}
              </p>
            </div>
          </div>
          <div className="record-sum">
            <strong>{formatMoney(usage.total, locale)}</strong>
            <span className={`status ${record.paid ? "status-paid" : "status-unpaid"}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="record-breakdown">
          <div className="breakdown-chip">
            <span className="breakdown-name">
              <SunIcon width={14} height={14} />
              {t("common.day")}
            </span>
            <span className="breakdown-calc">
              {formatNumber(usage.dayUsage, locale)} ×{" "}
              {formatNumber(record.dayRate, locale)} ₴
            </span>
            <b>{formatMoney(usage.dayCost, locale)}</b>
          </div>
          <div className="breakdown-chip">
            <span className="breakdown-name">
              <MoonIcon width={14} height={14} />
              {t("common.night")}
            </span>
            <span className="breakdown-calc">
              {formatNumber(usage.nightUsage, locale)} ×{" "}
              {formatNumber(record.nightRate, locale)} ₴
            </span>
            <b>{formatMoney(usage.nightCost, locale)}</b>
          </div>
        </div>

        <div className="record-meta">
          <span>
            {t("record.metaDay", {
              prev: formatNumber(record.dayPrev, locale),
              curr: formatNumber(record.dayCurr, locale),
            })}
          </span>
          <span className="meta-sep">·</span>
          <span>
            {t("record.metaNight", {
              prev: formatNumber(record.nightPrev, locale),
              curr: formatNumber(record.nightCurr, locale),
            })}
          </span>
          {record.note ? (
            <>
              <span className="meta-sep">·</span>
              <span className="record-note">{record.note}</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="record-side">
        <label
          className={`pay-check ${record.paid ? "is-checked" : ""} ${busy ? "is-busy" : ""}`}
        >
          <input
            type="checkbox"
            checked={record.paid}
            disabled={record.paid || busy}
            onChange={() => {
              if (!record.paid) onMarkPaid(record);
            }}
          />
          <span className="pay-box">
            <CheckIcon width={15} height={15} />
          </span>
          <span className="pay-text">
            <b>{record.paid ? t("side.statusPaid") : t("record.markPaid")}</b>
            <small>
              {record.paid
                ? formatDateTime(record.paidAt, locale)
                : t("record.payDateAuto")}
            </small>
          </span>
        </label>

        <div className="record-actions">
          {record.paid ? (
            <button
              type="button"
              className="mini-btn"
              onClick={() => onUnlock(record)}
              disabled={busy}
            >
              <UndoIcon width={15} height={15} />
              {t("record.unlock")}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="mini-btn"
                onClick={() => onEdit(record)}
                disabled={busy}
              >
                <PencilIcon width={15} height={15} />
                {t("record.edit")}
              </button>
              <button
                type="button"
                className="mini-btn mini-danger"
                onClick={() => onDelete(record)}
                disabled={busy}
              >
                <TrashIcon width={15} height={15} />
                {t("record.delete")}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
