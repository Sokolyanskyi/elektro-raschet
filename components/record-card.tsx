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
  const usage = calculateUsage(record);

  return (
    <article className={`record ${record.paid ? "is-paid" : "is-unpaid"}`}>
      <div className="record-main">
        <div className="record-head">
          <div className="record-month">
            <span className={`month-mark ${record.paid ? "is-paid" : ""}`}>
              {record.paid ? <CheckIcon width={15} height={15} /> : <span />}
            </span>
            <div>
              <h3>{monthLabel(record.period)}</h3>
              <p>
                {formatKwh(usage.totalUsage)} · данные от {formatDate(record.enteredAt)}
              </p>
            </div>
          </div>
          <div className="record-sum">
            <strong>{formatMoney(usage.total)}</strong>
            <span className={`status ${record.paid ? "status-paid" : "status-unpaid"}`}>
              {record.paid ? "Оплачено" : "Не оплачено"}
            </span>
          </div>
        </div>

        <div className="record-breakdown">
          <div className="breakdown-chip">
            <span className="breakdown-name">
              <SunIcon width={14} height={14} />
              День
            </span>
            <span className="breakdown-calc">
              {formatNumber(usage.dayUsage)} × {formatNumber(record.dayRate)} ₴
            </span>
            <b>{formatMoney(usage.dayCost)}</b>
          </div>
          <div className="breakdown-chip">
            <span className="breakdown-name">
              <MoonIcon width={14} height={14} />
              Ночь
            </span>
            <span className="breakdown-calc">
              {formatNumber(usage.nightUsage)} × {formatNumber(record.nightRate)} ₴
            </span>
            <b>{formatMoney(usage.nightCost)}</b>
          </div>
        </div>

        <div className="record-meta">
          <span>
            День: {formatNumber(record.dayPrev)} → {formatNumber(record.dayCurr)}
          </span>
          <span className="meta-sep">·</span>
          <span>
            Ночь: {formatNumber(record.nightPrev)} → {formatNumber(record.nightCurr)}
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
            <b>{record.paid ? "Оплачено" : "Отметить оплату"}</b>
            <small>
              {record.paid
                ? formatDateTime(record.paidAt)
                : "Дата зафиксируется автоматически"}
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
              Отменить оплату
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
                Изменить
              </button>
              <button
                type="button"
                className="mini-btn mini-danger"
                onClick={() => onDelete(record)}
                disabled={busy}
              >
                <TrashIcon width={15} height={15} />
                Удалить
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
