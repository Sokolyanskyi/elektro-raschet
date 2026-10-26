"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateUsage } from "@/lib/calc";
import { parseBackup } from "@/lib/client/backup";
import { downloadCsv, downloadJson, readJsonFile, type BackupFile } from "@/lib/client/download";
import { useRecords } from "@/lib/client/use-records";
import {
  currentPeriod,
  formatKwh,
  formatMoney,
  formatMoneyPlain,
  formatNumber,
  monthLabel,
  pluralRu,
  todayISO,
  yearOf,
} from "@/lib/format";
import type { MeterRecord, RecordDraft, Settings } from "@/lib/types";
import { History } from "./history";
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
  const store = useRecords();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | "all">(new Date().getFullYear());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
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
    let paidYear = 0;
    let paidCount = 0;
    let usageYear = 0;
    let recordsYear = 0;

    for (const record of store.records) {
      const usage = calculateUsage(record);
      if (!record.paid) {
        debt += usage.total;
        unpaidCount += 1;
      }
      if (yearOf(record.period) === currentYear) {
        recordsYear += 1;
        usageYear += usage.totalUsage;
        if (record.paid) {
          paidYear += usage.total;
          paidCount += 1;
        }
      }
    }

    return {
      debt: Math.round(debt * 100) / 100,
      unpaidCount,
      paidYear: Math.round(paidYear * 100) / 100,
      paidCount,
      usageYear: Math.round(usageYear * 100) / 100,
      recordsYear,
    };
  }, [store.records, currentYear]);

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
      if (recordId) setEditingId(null);
      return saved;
    },
    [store],
  );

  const beginEdit = (record: MeterRecord) => {
    if (record.paid) {
      notify("Расчёт оплачен. Сначала отмените оплату в истории.", "error");
      return;
    }
    setEditingId(record.id);
    window.setTimeout(() => {
      document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  };

  const markPaid = async (record: MeterRecord) => {
    try {
      await store.setPaid(record.id, true);
      notify(`Оплата за ${monthLabel(record.period)} отмечена — дата сохранена`);
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "Не удалось отметить оплату", "error");
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "delete") {
        await store.remove(confirm.record.id);
        if (editingId === confirm.record.id) setEditingId(null);
        notify(`Расчёт за ${monthLabel(confirm.record.period)} удалён`);
      } else if (confirm.kind === "unlock") {
        await store.setPaid(confirm.record.id, false);
        notify(`Оплата за ${monthLabel(confirm.record.period)} отменена — расчёт разблокирован`);
      } else {
        const result = await store.importRecords(confirm.records, confirm.settings);
        notify(
          `Импорт завершён: добавлено ${result.added}, обновлено ${result.updated}${
            result.skipped ? `, пропущено ${result.skipped}` : ""
          }`,
        );
      }
      setConfirm(null);
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "Не удалось выполнить действие", "error");
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
    notify("Резервная копия скачана");
  };

  const handleExportCsv = () => {
    const rows: (string | number)[][] = [
      [
        "Расчётный месяц",
        "Период",
        "День: прошлый",
        "День: этот",
        "День: кВт·ч",
        "Тариф день",
        "День: сумма",
        "Ночь: прошлый",
        "Ночь: этот",
        "Ночь: кВт·ч",
        "Тариф ночь",
        "Ночь: сумма",
        "Итого",
        "Дата внесения",
        "Оплачено",
        "Дата оплаты",
        "Комментарий",
      ],
    ];

    for (const record of store.records) {
      const usage = calculateUsage(record);
      rows.push([
        monthLabel(record.period),
        record.period,
        formatNumber(record.dayPrev),
        formatNumber(record.dayCurr),
        formatNumber(usage.dayUsage),
        formatNumber(record.dayRate),
        formatMoneyPlain(usage.dayCost),
        formatNumber(record.nightPrev),
        formatNumber(record.nightCurr),
        formatNumber(usage.nightUsage),
        formatNumber(record.nightRate),
        formatMoneyPlain(usage.nightCost),
        formatMoneyPlain(usage.total),
        record.enteredAt,
        record.paid ? "Да" : "Нет",
        record.paidAt ?? "",
        record.note ?? "",
      ]);
    }

    downloadCsv(`elektro-raschet-${todayISO()}.csv`, rows);
    notify("Таблица CSV скачана");
  };

  const handleImportFile = async (file: File) => {
    try {
      const raw = await readJsonFile(file);
      const parsed = parseBackup(raw);
      if (parsed.records.length === 0) {
        notify("В файле не найдено корректных расчётов", "error");
        return;
      }
      setConfirm({
        kind: "import",
        records: parsed.records,
        settings: parsed.settings,
        skipped: parsed.skipped,
      });
    } catch {
      notify("Не удалось прочитать файл. Выберите JSON из резервной копии.", "error");
    }
  };

  const pushLocal = async () => {
    try {
      const result = await store.pushLocalToCloud();
      notify(`Перенесено: добавлено ${result.added}, обновлено ${result.updated}`);
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "Не удалось перенести данные", "error");
    }
  };

  const signOut = async () => {
    try {
      await store.signOut();
      setEditingId(null);
      notify("Вы вышли из облака");
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "Не удалось выйти", "error");
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
        <p>Загружаем расчёты…</p>
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
          <h1>Не удалось загрузить данные</h1>
          <p>{store.error}</p>
          <div className="boot-actions">
            <button type="button" className="btn btn-primary" onClick={() => void store.refresh()}>
              Повторить
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSettingsOpen(true)}>
              Настройки
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
      ? "Удалить расчёт?"
      : confirm?.kind === "unlock"
        ? "Отменить оплату?"
        : "Импортировать данные?";

  const confirmMessage =
    confirm?.kind === "delete" ? (
      <>
        Расчёт за <b>{monthLabel(confirm.record.period)}</b> будет удалён безвозвратно.
        Резервная копия позволит восстановить его.
      </>
    ) : confirm?.kind === "unlock" ? (
      <>
        Отметка об оплате за <b>{monthLabel(confirm.record.period)}</b> будет снята, дата
        оплаты удалится, а расчёт снова станет доступен для изменения.
      </>
    ) : confirm?.kind === "import" ? (
      <>
        Будет добавлено или обновлено <b>{confirm.records.length}</b> расчётов.
        {confirm.skipped > 0 ? ` Пропущено некорректных строк: ${confirm.skipped}.` : ""}{" "}
        Существующие месяцы из файла обновятся, остальные записи сохранятся.
      </>
    ) : null;

  return (
    <>
      <div className="page" id="top">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="На главную">
            <span className="brand-mark">
              <BoltIcon width={20} height={20} />
            </span>
            <span className="brand-text">
              <b>Электроэнергия</b>
              <small>расчёт и оплата по двум тарифам</small>
            </span>
          </a>

          <div className="topbar-actions">
            <span className={`storage-badge ${store.mode === "cloud" ? "is-cloud" : "is-local"}`}>
              {store.mode === "cloud" ? (
                <CloudIcon width={15} height={15} />
              ) : (
                <DeviceIcon width={15} height={15} />
              )}
              {store.mode === "cloud" ? "Облако" : "Это устройство"}
            </span>
            <button
              type="button"
              className="icon-btn"
              aria-label="Настройки"
              onClick={() => setSettingsOpen(true)}
            >
              <GearIcon />
            </button>
          </div>
        </header>

        <main>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">Личный учёт · {monthLabel(currentPeriod())}</p>
              <h1>
                Свет посчитан.
                <br />
                <span>История сохранена.</span>
              </h1>
              <p className="hero-sub">
                Внесите показания за день и ночь — сумма посчитается автоматически.
                Отметьте оплату, и приложение запомнит дату навсегда.
              </p>
              <div className="rate-chips">
                <span className="rate-chip rate-chip-day">
                  <SunIcon width={16} height={16} />
                  День <b>{formatNumber(store.settings.dayRate)} ₴</b>
                </span>
                <span className="rate-chip rate-chip-night">
                  <MoonIcon width={16} height={16} />
                  Ночь <b>{formatNumber(store.settings.nightRate)} ₴</b>
                </span>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setSettingsOpen(true)}
                >
                  изменить
                </button>
              </div>
            </div>

            <div className="stats">
              <div className={`stat ${stats.debt > 0 ? "stat-debt" : "stat-clear"}`}>
                <span className="stat-label">К оплате</span>
                <b className="stat-value">{formatMoney(stats.debt)}</b>
                <span className="stat-sub">
                  {stats.unpaidCount > 0
                    ? `${stats.unpaidCount} ${pluralRu(
                        stats.unpaidCount,
                        "неоплаченный",
                        "неоплаченных",
                        "неоплаченных",
                      )}`
                    : "всё оплачено"}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Оплачено за {currentYear}</span>
                <b className="stat-value">{formatMoney(stats.paidYear)}</b>
                <span className="stat-sub">
                  {stats.paidCount > 0
                    ? `${stats.paidCount} ${pluralRu(
                        stats.paidCount,
                        "платёж",
                        "платежа",
                        "платежей",
                      )}`
                    : "пока нет платежей"}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Расход за {currentYear}</span>
                <b className="stat-value">{formatNumber(stats.usageYear)}</b>
                <span className="stat-sub">кВт·ч · {stats.recordsYear} мес.</span>
              </div>
            </div>
          </section>

          {store.mode === "local" ? (
            <div className="storage-banner">
              <span className="storage-banner-icon">
                <DeviceIcon width={20} height={20} />
              </span>
              <div>
                <b>Данные хранятся только в этом браузере</b>
                <p>
                  Чтобы открывать историю с телефона и компьютера, включите бесплатное
                  облако — настройка за пару минут. Инструкция в настройках.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSettingsOpen(true)}
              >
                Настроить
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
                  <span>Ваши тарифы</span>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setSettingsOpen(true)}
                  >
                    Изменить
                  </button>
                </div>
                <div className="side-rate side-rate-day">
                  <span className="tariff-icon tariff-day">
                    <SunIcon width={18} height={18} />
                  </span>
                  <div>
                    <span>День</span>
                    <small>с 07:00 до 23:00</small>
                  </div>
                  <b>{formatMoney(store.settings.dayRate)}</b>
                </div>
                <div className="side-rate side-rate-night">
                  <span className="tariff-icon tariff-night">
                    <MoonIcon width={18} height={18} />
                  </span>
                  <div>
                    <span>Ночь</span>
                    <small>с 23:00 до 07:00</small>
                  </div>
                  <b>{formatMoney(store.settings.nightRate)}</b>
                </div>
                <p className="side-note">Цена за 1 кВт·ч для новых расчётов.</p>
              </div>

              {latest && latestUsage ? (
                <div className="card side-card">
                  <div className="side-head">
                    <span>Последний расчёт</span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => openHistoryFor(latest)}
                    >
                      В историю
                    </button>
                  </div>
                  <div className="latest-month">
                    <b>{monthLabel(latest.period)}</b>
                    <span className={`status ${latest.paid ? "status-paid" : "status-unpaid"}`}>
                      {latest.paid ? "Оплачено" : "Не оплачено"}
                    </span>
                  </div>
                  <div className="latest-sum">
                    <strong>{formatMoney(latestUsage.total)}</strong>
                    <span>{formatKwh(latestUsage.totalUsage)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm btn-block"
                    onClick={() => beginEdit(latest)}
                    disabled={latest.paid}
                  >
                    {latest.paid ? "Расчёт оплачен" : "Изменить показания"}
                  </button>
                </div>
              ) : (
                <div className="card side-card side-empty">
                  <span className="side-empty-icon">
                    <BoltIcon width={20} height={20} />
                  </span>
                  <b>История пока пуста</b>
                  <p>Первый расчёт появится здесь и будет храниться годами.</p>
                </div>
              )}

              <div className="card side-card side-tip">
                <span className="side-tip-icon">
                  <ShieldIcon width={19} height={19} />
                </span>
                <div>
                  <b>{store.mode === "cloud" ? "Синхронизация включена" : "Ваши данные — только ваши"}</b>
                  <p>
                    {store.mode === "cloud"
                      ? "Телефон и компьютер видят одну историю. Вход защищён PIN-кодом."
                      : "Показания не отправляются энергопоставщику. Скачайте резервную копию в настройках."}
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <History
            records={store.records}
            selectedYear={selectedYear}
            currentYear={currentYear}
            busy={store.busy}
            onSelectYear={setSelectedYear}
            onEdit={beginEdit}
            onDelete={(record) => setConfirm({ kind: "delete", record })}
            onMarkPaid={(record) => void markPaid(record)}
            onUnlock={(record) => setConfirm({ kind: "unlock", record })}
          />
        </main>

        <footer className="footer">
          <div>
            <BoltIcon width={15} height={15} />
            <span>Личный расчёт электроэнергии · {formatNumber(store.settings.dayRate)} / {formatNumber(store.settings.nightRate)} ₴ за кВт·ч</span>
          </div>
          <button type="button" className="link-btn" onClick={() => setSettingsOpen(true)}>
            <WalletIcon width={14} height={14} />
            Настройки и резервная копия
          </button>
        </footer>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={store.settings}
        onSaveSettings={(next) => {
          store.updateSettings(next);
          notify("Тарифы по умолчанию обновлены");
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
            ? "Удалить"
            : confirm?.kind === "unlock"
              ? "Снять оплату"
              : "Импортировать"
        }
        danger={confirm?.kind === "delete"}
        busy={store.busy}
        onConfirm={() => void handleConfirm()}
        onClose={() => setConfirm(null)}
      />

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
