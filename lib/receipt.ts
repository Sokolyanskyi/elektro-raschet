import { calculateUsage } from "@/lib/calc";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
  monthLabel,
} from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { MessageKey, MessageVars } from "@/lib/i18n/messages";
import type { MeterRecord } from "@/lib/types";

/** Подписи квитанции — передаются из словаря, чтобы документ был на языке интерфейса. */
export interface ReceiptLabels {
  appName: string;
  title: string;
  subtitle: string;
  number: string;
  month: string;
  paidOn: string;
  issued: string;
  status: string;
  paid: string;
  readings: string;
  day: string;
  night: string;
  prev: string;
  curr: string;
  used: string;
  rate: string;
  amount: string;
  total: string;
  note: string;
  footer: string;
  kwh: string;
}

type Translate = (key: MessageKey, vars?: MessageVars) => string;

export function receiptNumber(record: MeterRecord): string {
  let hash = 2166136261;
  const seed = `${record.period}:${record.id}`;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const code = (hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-6);
  return `ER-${record.period.replace("-", "")}-${code}`;
}

export function receiptFileName(record: MeterRecord): string {
  return `receipt-${record.period}-${receiptNumber(record).slice(-6).toLowerCase()}.html`;
}

/**
 * Собирает подписи квитанции из общего словаря.
 * translate принимает ключи i18n, поэтому здесь обычный строковый тип.
 */
export function receiptLabels(translate: Translate, record: MeterRecord): ReceiptLabels {
  return {
    appName: translate("app.name"),
    title: translate("receipt.title"),
    subtitle: translate("receipt.subtitle"),
    number: translate("receipt.number", { number: receiptNumber(record) }),
    month: translate("receipt.month"),
    paidOn: translate("receipt.paidOn"),
    issued: translate("receipt.issued"),
    status: translate("receipt.status"),
    paid: translate("side.statusPaid"),
    readings: translate("receipt.readings"),
    day: translate("common.day"),
    night: translate("common.night"),
    prev: translate("receipt.prev"),
    curr: translate("receipt.curr"),
    used: translate("receipt.used"),
    rate: translate("receipt.rate"),
    amount: translate("receipt.amount"),
    total: translate("receipt.total"),
    note: translate("receipt.note"),
    footer: translate("receipt.footer"),
    kwh: translate("common.kwh"),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Автономный HTML-документ квитанции: без внешних ресурсов, с печатными стилями.
 * Все данные берутся из записи, поэтому квитанцию можно восстановить в любой момент.
 */
export function buildReceiptHtml(
  record: MeterRecord,
  locale: Locale,
  labels: ReceiptLabels,
): string {
  const usage = calculateUsage(record);
  const month = escapeHtml(monthLabel(record.period, locale));
  const number = escapeHtml(labels.number);
  const issued = escapeHtml(formatDateTime(new Date().toISOString(), locale));
  const paidOn = escapeHtml(
    record.paidAt ? formatDateTime(record.paidAt, locale) : formatDate(record.enteredAt, locale),
  );
  const note = record.note?.trim() ? escapeHtml(record.note.trim()) : "";
  const kwh = escapeHtml(labels.kwh);

  const row = (name: string, prev: number, curr: number, used: number, rate: number, cost: number) => `
    <tr>
      <th scope="row">${escapeHtml(name)}</th>
      <td>${escapeHtml(formatNumber(prev, locale))}</td>
      <td>${escapeHtml(formatNumber(curr, locale))}</td>
      <td>${escapeHtml(formatNumber(used, locale))}</td>
      <td>${escapeHtml(formatNumber(rate, locale))}</td>
      <td class="num">${escapeHtml(formatMoney(cost, locale))}</td>
    </tr>`;

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(labels.title)} — ${month}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    background: #eef0f6; color: #16192b;
  }
  .receipt {
    max-width: 760px; margin: 0 auto; padding: 32px;
    background: #fff; border-radius: 18px;
    box-shadow: 0 18px 50px rgba(22, 25, 43, 0.10);
  }
  .top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .mark {
    width: 46px; height: 46px; flex: 0 0 auto;
    display: grid; place-items: center; border-radius: 13px;
    background: linear-gradient(145deg, #5b5bf0, #7d5cf5); color: #fff;
  }
  .brand b { display: block; font-size: 15px; letter-spacing: -0.01em; }
  .brand small { display: block; margin-top: 2px; font-size: 11px; color: #6c7186; }
  .doc { text-align: right; }
  .doc h1 { margin: 0; font-size: 21px; letter-spacing: -0.02em; }
  .doc p { margin: 4px 0 0; font-size: 11px; color: #6c7186; }
  .rule { height: 4px; margin: 22px 0; border-radius: 4px; background: linear-gradient(90deg, #5b5bf0, #a78bfa 55%, #c4b5fd); }
  .meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 22px; }
  .meta span { display: block; font-size: 9px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: #8a8fa3; }
  .meta b { display: block; margin-top: 3px; font-size: 12px; font-weight: 650; }
  .pill {
    display: inline-block; margin-top: 3px; padding: 3px 9px;
    border: 1px solid #b7e4cc; border-radius: 999px;
    background: #e9f9f0; color: #147a4a; font-size: 10.5px; font-weight: 700;
  }
  h2 { margin: 0 0 9px; font-size: 13px; letter-spacing: -0.01em; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  thead th {
    padding: 7px 8px; border-bottom: 1.5px solid #d8dbe7;
    text-align: left; font-size: 9px; letter-spacing: 0.07em; text-transform: uppercase; color: #6c7186;
  }
  tbody th, tbody td { padding: 9px 8px; border-bottom: 1px solid #eceef5; }
  tbody th { text-align: left; font-weight: 650; }
  td { font-variant-numeric: tabular-nums; }
  .num { text-align: right; white-space: nowrap; }
  thead th.num { text-align: right; }
  .total td, .total th { border-bottom: 0; padding-top: 13px; font-size: 13px; }
  .total .num { font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }
  .note {
    margin-top: 18px; padding: 10px 12px;
    border: 1px dashed #d8dbe7; border-radius: 10px;
    font-size: 11px; color: #4b5065;
  }
  .note b { color: #16192b; }
  .foot {
    display: flex; justify-content: space-between; gap: 16px;
    margin-top: 26px; padding-top: 14px; border-top: 1px solid #eceef5;
    font-size: 9.5px; color: #8a8fa3;
  }
  @page { size: A4; margin: 13mm; }
  @media (max-width: 560px) {
    body { padding: 10px; }
    .receipt { padding: 18px; }
    .top { flex-direction: column; }
    .doc { text-align: left; }
    .meta { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    table { font-size: 10px; }
    thead th, tbody th, tbody td { padding: 6px 4px; }
    .foot { flex-direction: column; gap: 6px; }
  }
  @media print {
    body { padding: 0; background: #fff; }
    .receipt { max-width: none; padding: 0; border-radius: 0; box-shadow: none; }
  }
</style>
</head>
<body>
  <main class="receipt">
    <div class="top">
      <div class="brand">
        <span class="mark" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M13.2 2 4.8 13.4h6L10.8 22l8.4-11.4h-6L13.2 2Z" fill="currentColor"/>
          </svg>
        </span>
        <span>
          <b>${escapeHtml(labels.appName)}</b>
          <small>${escapeHtml(labels.subtitle)}</small>
        </span>
      </div>
      <div class="doc">
        <h1>${escapeHtml(labels.title)}</h1>
        <p>${number}</p>
      </div>
    </div>

    <div class="rule"></div>

    <div class="meta">
      <div><span>${escapeHtml(labels.month)}</span><b>${month}</b></div>
      <div><span>${escapeHtml(labels.paidOn)}</span><b>${paidOn}</b></div>
      <div><span>${escapeHtml(labels.status)}</span><b class="pill">${escapeHtml(labels.paid)}</b></div>
      <div><span>${escapeHtml(labels.issued)}</span><b>${issued}</b></div>
    </div>

    <h2>${escapeHtml(labels.readings)}</h2>
    <table>
      <thead>
        <tr>
          <th scope="col"></th>
          <th scope="col">${escapeHtml(labels.prev)}</th>
          <th scope="col">${escapeHtml(labels.curr)}</th>
          <th scope="col">${escapeHtml(labels.used)}, ${kwh}</th>
          <th scope="col">${escapeHtml(labels.rate)}, ₴</th>
          <th scope="col" class="num">${escapeHtml(labels.amount)}</th>
        </tr>
      </thead>
      <tbody>
        ${row(labels.day, record.dayPrev, record.dayCurr, usage.dayUsage, record.dayRate, usage.dayCost)}
        ${row(labels.night, record.nightPrev, record.nightCurr, usage.nightUsage, record.nightRate, usage.nightCost)}
        <tr class="total">
          <th scope="row" colspan="4">${escapeHtml(labels.total)}</th>
          <td colspan="2" class="num">${escapeHtml(formatMoney(usage.total, locale))}</td>
        </tr>
      </tbody>
    </table>

    ${
      note
        ? `<div class="note"><b>${escapeHtml(labels.note)}:</b> ${note}</div>`
        : ""
    }

    <div class="foot">
      <span>${escapeHtml(labels.footer)}</span>
      <span>${number}</span>
    </div>
  </main>
</body>
</html>`;
}
