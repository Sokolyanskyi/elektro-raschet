"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateUsage } from "@/lib/calc";
import { parseBackup } from "@/lib/client/backup";
import {
  downloadCsv,
  downloadFile,
  downloadJson,
  readJsonFile,
  type BackupFile,
} from "@/lib/client/download";
import { useRecords } from "@/lib/client/use-records";
import {
  currentPeriod,
  formatKwh,
  formatMoney,
  formatMoneyPlain,
  formatNumber,
  monthLabel,
  paidAtFromDate,
  todayISO,
  yearOf,
} from "@/lib/format";
import type { MeterRecord, RecordDraft, Settings } from "@/lib/types";
import {
  buildReceiptHtml,
  receiptFileName,
  receiptLabels,
} from "@/lib/receipt";
import { History } from "./history";
import { useI18n } from "./i18n-provider";
import {
  BoltIcon,
  CloudIcon,
  DeviceIcon,
  GearIcon,
  MoonIcon,
  ShieldIcon,
  SunIcon,
  WalletIcon,
} from "./icons";
import { LockScreen } from "./lock-screen";
import { ConfirmDialog } from "./modal";
import { RecordForm } from "./record-form";
import { ReceiptDialog } from "./receipt-dialog";
import { SettingsDialog } from "./settings-dialog";

type ConfirmState =
  | { kind: "delete"; record: MeterRecord }
  | { kind: "unlock"; record: MeterRecord }
  | {
      kind: "import";
      records: MeterRecord[];
      settings: Settings | null;
      skipped: number;
    };

interface ToastState {
  id: number;
  message: string;
  tone: "success" | "error";
}

export function AppShell() {
  const { locale, t } = useI18n();
  const store = useRecords();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | "all">(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [receiptRecord, setReceiptRecord] = useState<MeterRecord | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const initialYearApplied = useRef(false);

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (store.mode === "error" && store.error) {
      notify(store.error, "error");
    }
  }, [store.mode, store.error, notify]);

  const editing = editingId
    ? store.records.find((record) => record.id === editingId) ?? null
    : null;

  const currentYear = new Date().getFullYear();

  const stats = useMemo(() => {
    let debt = 0;
    let unpaidCount = 0;

    for (const record of store.records) {
      if (!record.paid) {
        const usage = calculateUsage(record);
        debt += usage.total;
        unpaidCount += 1;
      }
    }

    return {
      debt: Math.round(debt * 100) / 100,
      unpaidCount,
    };
  }, [store.records]);

  const activeMonthRecord = useMemo(() => {
    const chosen = selectedMonth
      ? store.records.find((record) => record.period === selectedMonth)
      : null;
    if (chosen && (selectedYear === "all" || yearOf(chosen.period) === selectedYear)) {
      return chosen;
    }
    return (
      store.records.find(
        (record) => selectedYear === "all" || yearOf(record.period) === selectedYear,
      ) ?? null
    );
  }, [selectedMonth, selectedYear, store.records]);

  const activeMonthUsage = activeMonthRecord
    ? calculateUsage(activeMonthRecord)
    : null;

  const latest = store.records[0] ?? null;
  const latestUsage = latest ? calculateUsage(latest) : null;

  useEffect(() => {
    if (initialYearApplied.current) return;
    if (store.mode !== "local" && store.mode !== "cloud") return;
    initialYearApplied.current = true;
    if (
      store.records.length > 0 &&
      selectedYear !== "all" &&
      !store.records.some((record) => yearOf(record.period) === selectedYear)
    ) {
      setSelectedYear(yearOf(store.records[0].period));
    }
  }, [store.mode, store.records, selectedYear]);

  const handleSave = useCallback(
    async (draft: RecordDraft, recordId?: string) => {
      const saved = await store.save(draft, recordId);
      setSelectedYear(yearOf(saved.period));
      setSelectedMonth(saved.period);
      if (recordId) setEditingId(null);
      return saved;
    },
    [store],
  );

  const beginEdit = (record: MeterRecord) => {
    setEditingId(record.id);
    window.setTimeout(() => {
      document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  };

  const markPaid = async (record: MeterRecord, paidOn: string) => {
    try {
      const updated = await store.setPaid(record.id, true, paidAtFromDate(paidOn));
      const html = buildReceiptHtml(updated, locale, receiptLabels(t, updated));
      downloadFile(receiptFileName(updated), html, "text/html;charset=utf-8");
      setReceiptRecord(updated);
      notify(t("receipt.saved", { month: monthLabel(updated.period, locale) }));
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : t("toast.paidError"), "error");
    }
  };

  const updatePaidDate = async (record: MeterRecord, paidOn: string) => {
    try {
      const updated = await store.setPaid(record.id, true, paidAtFromDate(paidOn));
      notify(t("toast.paidDateUpdated", { month: monthLabel(updated.period, locale) }));
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : t("toast.paidError"), "error");
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "delete") {
        await store.remove(confirm.record.id);
        if (editingId === confirm.record.id) setEditingId(null);
        notify(t("toast.deleted", { month: monthLabel(confirm.record.period, locale) }));
      } else if (confirm.kind === "unlock") {
        await store.setPaid(confirm.record.id, false);
        notify(t("toast.unlocked", { month: monthLabel(confirm.record.period, locale) }));
      } else {
        const result = await store.importRecords(confirm.records, confirm.settings);
        notify(
          result.skipped
            ? t("toast.importDone", {
                added: result.added,
                updated: result.updated,
                skipped: result.skipped,
              })
            : t("toast.importDoneClean", {
                added: result.added,
                updated: result.updated,
              }),
        );
      }
      setConfirm(null);
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : t("toast.actionFailed"), "error");
    }
  };

  const handleExportJson = () => {
    const payload: BackupFile = {
      app: "elektro-raschet",
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: store.settings,
      records: store.records,
    };
    downloadJson(`elektro-raschet-${todayISO()}.json`, payload);
    notify(t("toast.backupDownloaded"));
  };

  const handleExportCsv = () => {
    const rows: (string | number)[][] = [
      [
        t("csv.month"),
        t("csv.period"),
        t("csv.dayPrev"),
        t("csv.dayCurr"),
        t("csv.dayKwh"),
        t("csv.dayRate"),
        t("csv.daySum"),
        t("csv.nightPrev"),
        t("csv.nightCurr"),
        t("csv.nightKwh"),
        t("csv.nightRate"),
        t("csv.nightSum"),
        t("csv.total"),
        t("csv.enteredAt"),
        t("csv.paid"),
        t("csv.paidAt"),
        t("csv.note"),
      ],
    ];

    for (const record of store.records) {
      const usage = calculateUsage(record);
      rows.push([
        monthLabel(record.period, locale),
        record.period,
        formatNumber(record.dayPrev, locale),
        formatNumber(record.dayCurr, locale),
        formatNumber(usage.dayUsage, locale),
        formatNumber(record.dayRate, locale),
        formatMoneyPlain(usage.dayCost, locale),
        formatNumber(record.nightPrev, locale),
        formatNumber(record.nightCurr, locale),
        formatNumber(usage.nightUsage, locale),
        formatNumber(record.nightRate, locale),
        formatMoneyPlain(usage.nightCost, locale),
        formatMoneyPlain(usage.total, locale),
        record.enteredAt,
        record.paid ? t("common.yes") : t("common.no"),
        record.paidAt ?? "",
        record.note ?? "",
      ]);
    }

    downloadCsv(`elektro-raschet-${todayISO()}.csv`, rows);
    notify(t("toast.csvDownloaded"));
  };

  const handleImportFile = async (file: File) => {
    try {
      const raw = await readJsonFile(file);
      const parsed = parseBackup(raw);
      if (parsed.records.length === 0) {
        notify(t("toast.noValidRecords"), "error");
        return;
      }
      setConfirm({
        kind: "import",
        records: parsed.records,
        settings: parsed.settings,
        skipped: parsed.skipped,
      });
    } catch {
      notify(t("toast.readFileFailed"), "error");
    }
  };

  const pushLocal = async () => {
    try {
      const result = await store.pushLocalToCloud();
      notify(t("toast.moved", { added: result.added, updated: result.updated }));
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : t("toast.moveFailed"), "error");
    }
  };

  const signOut = async () => {
    try {
      await store.signOut();
      setEditingId(null);
      notify(t("toast.signedOut"));
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : t("toast.signOutFailed"), "error");
    }
  };

  const openHistoryFor = (record: MeterRecord) => {
    setSelectedYear(yearOf(record.period));
    window.setTimeout(() => {
      document.getElementById("history")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 20);
  };

  if (store.mode === "loading") {
    return (
      <div className="boot">
        <span className="brand-mark brand-mark-lg">
          <BoltIcon width={26} height={26} />
        </span>
        <p>{t("boot.loading")}</p>
      </div>
    );
  }

  if (store.mode === "locked") {
    return <LockScreen onSignIn={store.signIn} />;
  }

  if (store.mode === "error") {
    return (
      <div className="boot">
        <div className="boot-card">
          <span className="brand-mark brand-mark-lg">
            <BoltIcon width={26} height={26} />
          </span>
          <h1>{t("error.loadTitle")}</h1>
          <p>{store.error}</p>
          <div className="boot-actions">
            <button type="button" className="btn btn-primary" onClick={() => void store.refresh()}>
              {t("error.retry")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSettingsOpen(true)}>
              {t("error.settings")}
            </button>
          </div>
        </div>
        <SettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          settings={store.settings}
          onSaveSettings={store.updateSettings}
          mode={store.mode}
          cloud={store.cloud}
          localCount={store.localCount}
          busy={store.busy}
          onExportJson={handleExportJson}
          onExportCsv={handleExportCsv}
          onImportFile={handleImportFile}
          onPushLocal={pushLocal}
          onSignOut={signOut}
        />
      </div>
    );
  }

  const confirmTitle =
    confirm?.kind === "delete"
      ? t("confirm.deleteTitle")
      : confirm?.kind === "unlock"
        ? t("confirm.unlockTitle")
        : t("confirm.importTitle");

  const confirmMessage =
    confirm?.kind === "delete" ? (
      t("confirm.deleteText", { month: monthLabel(confirm.record.period, locale) })
    ) : confirm?.kind === "unlock" ? (
      t("confirm.unlockText", { month: monthLabel(confirm.record.period, locale) })
    ) : confirm?.kind === "import" ? (
      <>
        {t("confirm.importText", { count: confirm.records.length })}
        {confirm.skipped > 0
          ? ` ${t("confirm.importSkipped", { count: confirm.skipped })}`
          : ""}
      </>
    ) : null;

  return (
    <>
      <div className="page" id="top">
        <header className="topbar">
          <a className="brand" href="#top" aria-label={t("app.home")}>
            <span className="brand-mark">
              <BoltIcon width={20} height={20} />
            </span>
            <span className="brand-text">
              <b>{t("app.name")}</b>
              <small>{t("app.tagline")}</small>
            </span>
          </a>

          <div className="topbar-actions">
            <span className={`storage-badge ${store.mode === "cloud" ? "is-cloud" : "is-local"}`}>
              {store.mode === "cloud" ? (
                <CloudIcon width={15} height={15} />
              ) : (
                <DeviceIcon width={15} height={15} />
              )}
              {store.mode === "cloud" ? t("header.cloud") : t("header.local")}
            </span>
            <button
              type="button"
              className="icon-btn"
              aria-label={t("common.settings")}
              onClick={() => setSettingsOpen(true)}
            >
              <GearIcon />
            </button>
          </div>
        </header>

        <main>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">
                {t("hero.eyebrow", { month: monthLabel(currentPeriod(), locale) })}
              </p>
              <h1>
                {t("hero.title1")}
                <br />
                <span>{t("hero.title2")}</span>
              </h1>
              <p className="hero-sub">{t("hero.subtitle")}</p>
              <div className="rate-chips">
                <span className="rate-chip rate-chip-day">
                  <SunIcon width={16} height={16} />
                  {t("common.day")} <b>{formatNumber(store.settings.dayRate, locale)} ₴</b>
                </span>
                <span className="rate-chip rate-chip-night">
                  <MoonIcon width={16} height={16} />
                  {t("common.night")} <b>{formatNumber(store.settings.nightRate, locale)} ₴</b>
                </span>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setSettingsOpen(true)}
                >
                  {t("hero.changeRate")}
                </button>
              </div>
            </div>

            <div className="stats">
              <div className={`stat ${stats.debt > 0 ? "stat-debt" : "stat-clear"}`}>
                <span className="stat-label">{t("stats.toPay")}</span>
                <b className="stat-value">{formatMoney(stats.debt, locale)}</b>
                <span className="stat-sub">
                  {stats.unpaidCount > 0
                    ? t("stats.unpaid", { count: stats.unpaidCount })
                    : t("stats.allPaid")}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">{t("stats.monthUsage")}</span>
                <b className="stat-value">
                  {activeMonthUsage ? formatKwh(activeMonthUsage.totalUsage, locale) : "—"}
                </b>
                <span className="stat-sub">
                  {activeMonthRecord
                    ? monthLabel(activeMonthRecord.period, locale)
                    : t("stats.noData")}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">{t("stats.monthPaid")}</span>
                <b className="stat-value">
                  {activeMonthUsage && activeMonthRecord
                    ? formatMoney(activeMonthRecord.paid ? activeMonthUsage.total : 0, locale)
                    : "—"}
                </b>
                <span className="stat-sub">
                  {activeMonthRecord
                    ? activeMonthRecord.paid
                      ? t("side.statusPaid")
                      : t("side.statusUnpaid")
                    : t("stats.noData")}
                </span>
              </div>
            </div>
          </section>

          {store.mode === "local" ? (
            <div className="storage-banner">
              <span className="storage-banner-icon">
                <DeviceIcon width={20} height={20} />
              </span>
              <div>
                <b>{t("banner.localTitle")}</b>
                <p>{t("banner.localText")}</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSettingsOpen(true)}
              >
                {t("banner.configure")}
              </button>
            </div>
          ) : null}

          <div className="workspace">
            <RecordForm
              key={editing?.id ?? "new"}
              records={store.records}
              editing={editing}
              defaultRates={store.settings}
              busy={store.busy}
              onSave={handleSave}
              onCancelEdit={() => setEditingId(null)}
              onOpenExisting={beginEdit}
              onNotify={notify}
            />

            <aside className="side-column">
              <div className="card side-card">
                <div className="side-head">
                  <span>{t("side.ratesTitle")}</span>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setSettingsOpen(true)}
                  >
                    {t("common.change")}
                  </button>
                </div>
                <div className="side-rate side-rate-day">
                  <span className="tariff-icon tariff-day">
                    <SunIcon width={18} height={18} />
                  </span>
                  <div>
                    <span>{t("common.day")}</span>
                    <small>{t("side.dayHours")}</small>
                  </div>
                  <b>{formatMoney(store.settings.dayRate, locale)}</b>
                </div>
                <div className="side-rate side-rate-night">
                  <span className="tariff-icon tariff-night">
                    <MoonIcon width={18} height={18} />
                  </span>
                  <div>
                    <span>{t("common.night")}</span>
                    <small>{t("side.nightHours")}</small>
                  </div>
                  <b>{formatMoney(store.settings.nightRate, locale)}</b>
                </div>
                <p className="side-note">{t("side.rateNote")}</p>
              </div>

              {latest && latestUsage ? (
                <div className="card side-card">
                  <div className="side-head">
                    <span>{t("side.lastTitle")}</span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => openHistoryFor(latest)}
                    >
                      {t("side.toHistory")}
                    </button>
                  </div>
                  <div className="latest-month">
                    <b>{monthLabel(latest.period, locale)}</b>
                    <span className={`status ${latest.paid ? "status-paid" : "status-unpaid"}`}>
                      {latest.paid ? t("side.statusPaid") : t("side.statusUnpaid")}
                    </span>
                  </div>
                  <div className="latest-sum">
                    <strong>{formatMoney(latestUsage.total, locale)}</strong>
                    <span>{formatKwh(latestUsage.totalUsage, locale)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm btn-block"
                    onClick={() => beginEdit(latest)}
                    disabled={latest.paid}
                  >
                    {latest.paid ? t("side.recordPaid") : t("side.editReadings")}
                  </button>
                </div>
              ) : (
                <div className="card side-card side-empty">
                  <span className="side-empty-icon">
                    <BoltIcon width={20} height={20} />
                  </span>
                  <b>{t("side.emptyTitle")}</b>
                  <p>{t("side.emptyText")}</p>
                </div>
              )}

              <div className="card side-card side-tip">
                <span className="side-tip-icon">
                  <ShieldIcon width={19} height={19} />
                </span>
                <div>
                  <b>{store.mode === "cloud" ? t("side.syncTitle") : t("side.privacyTitle")}</b>
                  <p>
                    {store.mode === "cloud"
                      ? t("side.syncText")
                      : t("side.privacyText")}
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <History
            records={store.records}
            selectedYear={selectedYear}
            selectedMonth={activeMonthRecord?.period ?? null}
            currentYear={currentYear}
            busy={store.busy}
            onSelectYear={(year) => {
              setSelectedYear(year);
              setSelectedMonth(null);
            }}
            onSelectMonth={setSelectedMonth}
            onEdit={beginEdit}
            onDelete={(record) => setConfirm({ kind: "delete", record })}
            onMarkPaid={(record, paidOn) => void markPaid(record, paidOn)}
            onUnlock={(record) => setConfirm({ kind: "unlock", record })}
            onReceipt={setReceiptRecord}
            onUpdatePaidDate={(record, paidOn) => void updatePaidDate(record, paidOn)}
          />
        </main>

        <footer className="footer">
          <div>
            <BoltIcon width={15} height={15} />
            <span>
              {t("footer.summary", {
                day: formatNumber(store.settings.dayRate, locale),
                night: formatNumber(store.settings.nightRate, locale),
              })}
            </span>
          </div>
          <button type="button" className="link-btn" onClick={() => setSettingsOpen(true)}>
            <WalletIcon width={14} height={14} />
            {t("footer.settings")}
          </button>
        </footer>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={store.settings}
        onSaveSettings={(next) => {
          store.updateSettings(next);
          notify(t("toast.ratesUpdated"));
        }}
        mode={store.mode}
        cloud={store.cloud}
        localCount={store.localCount}
        busy={store.busy}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onImportFile={handleImportFile}
        onPushLocal={pushLocal}
        onSignOut={signOut}
      />

      <ConfirmDialog
        open={confirm !== null}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={
          confirm?.kind === "delete"
            ? t("confirm.deleteAction")
            : confirm?.kind === "unlock"
              ? t("confirm.unlockAction")
              : t("confirm.importAction")
        }
        danger={confirm?.kind === "delete"}
        busy={store.busy}
        onConfirm={() => void handleConfirm()}
        onClose={() => setConfirm(null)}
      />

      <ReceiptDialog record={receiptRecord} onClose={() => setReceiptRecord(null)} />

      {toast ? (
        <div
          key={toast.id}
          className={`toast ${toast.tone === "error" ? "toast-error" : "toast-success"}`}
          role="status"
          aria-live="polite"
        >
          <span className="toast-dot" />
          {toast.message}
        </div>
      ) : null}
    </>
  );
}
