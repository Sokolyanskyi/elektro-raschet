"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { calculateUsage, parseNumber, validateDraft } from "@/lib/calc";
import {
  currentPeriod,
  formatMoney,
  formatNumber,
  monthLabel,
  shiftPeriod,
  todayISO,
  toInputValue,
} from "@/lib/format";
import type { MeterRecord, RecordDraft, Settings } from "@/lib/types";
import {
  BoltIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  MoonIcon,
  SunIcon,
  WalletIcon,
} from "./icons";

interface RecordFormProps {
  records: MeterRecord[];
  editing: MeterRecord | null;
  defaultRates: Settings;
  busy: boolean;
  onSave: (draft: RecordDraft, editingId?: string) => Promise<MeterRecord>;
  onCancelEdit: () => void;
  onOpenExisting: (record: MeterRecord) => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

function latestBefore(
  period: string,
  records: MeterRecord[],
  excludeId?: string,
): MeterRecord | null {
  return (
    [...records]
      .filter((record) => record.id !== excludeId && record.period < period)
      .sort((a, b) => (a.period < b.period ? 1 : a.period > b.period ? -1 : 0))[0] ?? null
  );
}

function suggestedPeriod(records: MeterRecord[]): string {
  const now = currentPeriod();
  if (!records.some((record) => record.period === now)) return now;
  return shiftPeriod(now, 1);
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function RecordForm({
  records,
  editing,
  defaultRates,
  busy,
  onSave,
  onCancelEdit,
  onOpenExisting,
  onNotify,
}: RecordFormProps) {
  const initialPeriod = useMemo(
    () => (editing ? editing.period : suggestedPeriod(records)),
    // форма пересоздаётся через key при смене режима, значения нужны только на старте
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const initialSource = useMemo(
    () => (editing ? null : latestBefore(initialPeriod, records)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [period, setPeriod] = useState(initialPeriod);
  const [enteredAt, setEnteredAt] = useState(editing?.enteredAt ?? todayISO());
  const [dayPrev, setDayPrev] = useState(
    toInputValue(editing ? editing.dayPrev : initialSource?.dayCurr),
  );
  const [nightPrev, setNightPrev] = useState(
    toInputValue(editing ? editing.nightPrev : initialSource?.nightCurr),
  );
  const [dayCurr, setDayCurr] = useState(toInputValue(editing?.dayCurr));
  const [nightCurr, setNightCurr] = useState(toInputValue(editing?.nightCurr));
  const [dayRate, setDayRate] = useState(
    toInputValue(editing ? editing.dayRate : defaultRates.dayRate),
  );
  const [nightRate, setNightRate] = useState(
    toInputValue(editing ? editing.nightRate : defaultRates.nightRate),
  );
  const [prefillSource, setPrefillSource] = useState<string | null>(
    initialSource?.period ?? null,
  );
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ratesOpen, setRatesOpen] = useState(false);

  const numbers = useMemo(
    () => ({
      dayPrev: parseNumber(dayPrev),
      dayCurr: parseNumber(dayCurr),
      nightPrev: parseNumber(nightPrev),
      nightCurr: parseNumber(nightCurr),
      dayRate: parseNumber(dayRate),
      nightRate: parseNumber(nightRate),
    }),
    [dayPrev, dayCurr, nightPrev, nightCurr, dayRate, nightRate],
  );

  const duplicate = useMemo(
    () =>
      records.find(
        (record) => record.period === period && record.id !== editing?.id,
      ) ?? null,
    [records, period, editing],
  );

  const errors = useMemo(
    () =>
      validateDraft(
        {
          period,
          enteredAt,
          dayPrev: numbers.dayPrev,
          dayCurr: numbers.dayCurr,
          nightPrev: numbers.nightPrev,
          nightCurr: numbers.nightCurr,
          dayRate: numbers.dayRate,
          nightRate: numbers.nightRate,
        },
        { existing: records, currentId: editing?.id },
      ),
    [period, enteredAt, numbers, records, editing],
  );

  const readingsReady =
    numbers.dayPrev !== null &&
    numbers.dayCurr !== null &&
    numbers.nightPrev !== null &&
    numbers.nightCurr !== null;

  const ratesReady = numbers.dayRate !== null && numbers.nightRate !== null;

  const usage = useMemo(() => {
    if (!readingsReady || !ratesReady) return null;
    return calculateUsage({
      dayPrev: numbers.dayPrev!,
      dayCurr: numbers.dayCurr!,
      nightPrev: numbers.nightPrev!,
      nightCurr: numbers.nightCurr!,
      dayRate: numbers.dayRate!,
      nightRate: numbers.nightRate!,
    });
  }, [readingsReady, ratesReady, numbers]);

  const negativeUsage = usage !== null && (usage.dayUsage < 0 || usage.nightUsage < 0);
  const resultReady = usage !== null && !negativeUsage;

  const visibleError = (key: string): string | undefined =>
    showErrors || key === "period" ? errors[key] : undefined;

  const handlePeriodChange = (next: string) => {
    setPeriod(next);
    if (editing) return;
    const source = latestBefore(next, records);
    setDayPrev(source ? toInputValue(source.dayCurr) : "");
    setNightPrev(source ? toInputValue(source.nightCurr) : "");
    setPrefillSource(source?.period ?? null);
  };

  const resetAfterSave = (saved: MeterRecord) => {
    const next = shiftPeriod(saved.period, 1);
    setPeriod(next);
    setDayPrev(toInputValue(saved.dayCurr));
    setNightPrev(toInputValue(saved.nightCurr));
    setDayCurr("");
    setNightCurr("");
    setEnteredAt(todayISO());
    setPrefillSource(saved.period);
    setShowErrors(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);

    if (Object.keys(errors).length > 0) {
      onNotify("Проверьте заполнение полей", "error");
      return;
    }

    const draft: RecordDraft = {
      period,
      dayPrev: numbers.dayPrev!,
      dayCurr: numbers.dayCurr!,
      nightPrev: numbers.nightPrev!,
      nightCurr: numbers.nightCurr!,
      dayRate: numbers.dayRate!,
      nightRate: numbers.nightRate!,
      enteredAt,
    };

    setSaving(true);
    try {
      const saved = await onSave(draft, editing?.id);
      onNotify(
        editing
          ? `Изменения за ${monthLabel(saved.period)} сохранены`
          : `Расчёт за ${monthLabel(saved.period)} сохранён`,
        "success",
      );
      if (!editing) resetAfterSave(saved);
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "Не удалось сохранить расчёт",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const dayUsed = numbers.dayCurr !== null && numbers.dayPrev !== null
    ? numbers.dayCurr - numbers.dayPrev
    : null;
  const nightUsed = numbers.nightCurr !== null && numbers.nightPrev !== null
    ? numbers.nightCurr - numbers.nightPrev
    : null;

  return (
    <section className="card form-card" id="calculator">
      <div className="card-head">
        <div>
          <p className="eyebrow">{editing ? "Редактирование" : "Новый расчёт"}</p>
          <h2>{editing ? monthLabel(editing.period) : "Внесите показания"}</h2>
        </div>
        <span className="soft-badge">
          <BoltIcon width={14} height={14} />
          {monthLabel(period)}
        </span>
      </div>

      {editing ? (
        <div className="edit-banner">
          <span>Вы изменяете сохранённый расчёт. После сохранения история обновится.</span>
          <button type="button" className="link-btn" onClick={onCancelEdit}>
            Отменить
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid form-grid-2">
          <Field
            label="Расчётный месяц"
            htmlFor="period"
            error={visibleError("period")}
            hint="Месяц, за который оплачиваем"
          >
            <input
              id="period"
              className="input"
              type="month"
              value={period}
              onChange={(event) => handlePeriodChange(event.target.value)}
              required
            />
          </Field>

          <Field
            label="Дата внесения данных"
            htmlFor="enteredAt"
            error={visibleError("enteredAt")}
            hint="Когда вы записали показания"
          >
            <div className="input-with-icon">
              <CalendarIcon width={17} height={17} />
              <input
                id="enteredAt"
                className="input"
                type="date"
                value={enteredAt}
                max={todayISO()}
                onChange={(event) => setEnteredAt(event.target.value)}
                required
              />
            </div>
          </Field>
        </div>

        <div className="section-label">
          <span>Показания счётчика</span>
          <span>кВт·ч</span>
        </div>

        {prefillSource && !editing ? (
          <div className="prefill-hint">
            <BoltIcon width={14} height={14} />
            Прошлые показания подставлены из расчёта за {monthLabel(prefillSource)}
          </div>
        ) : null}

        <div className="meter-list">
          <div className="meter-card meter-day">
            <div className="meter-top">
              <div className="meter-title">
                <span className="tariff-icon tariff-day">
                  <SunIcon width={18} height={18} />
                </span>
                <div>
                  <b>День</b>
                  <small>{formatNumber(numbers.dayRate ?? defaultRates.dayRate)} ₴ / кВт·ч</small>
                </div>
              </div>
              <div className={`used-pill ${dayUsed !== null && dayUsed < 0 ? "is-negative" : ""}`}>
                <span>Использовано</span>
                <b>{dayUsed !== null ? formatNumber(dayUsed) : "—"}</b>
              </div>
            </div>
            <div className="meter-fields">
              <Field label="Прошлый месяц" htmlFor="dayPrev" error={visibleError("dayPrev")}>
                <div className="input-with-unit">
                  <input
                    id="dayPrev"
                    className="input"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="00000,0"
                    value={dayPrev}
                    onChange={(event) => {
                      setDayPrev(event.target.value);
                      setPrefillSource(null);
                    }}
                  />
                  <span className="unit">кВт·ч</span>
                </div>
              </Field>
              <div className="meter-arrow">→</div>
              <Field label="Этот месяц" htmlFor="dayCurr" error={visibleError("dayCurr")}>
                <div className="input-with-unit">
                  <input
                    id="dayCurr"
                    className="input"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="00000,0"
                    value={dayCurr}
                    onChange={(event) => setDayCurr(event.target.value)}
                  />
                  <span className="unit">кВт·ч</span>
                </div>
              </Field>
            </div>
          </div>

          <div className="meter-card meter-night">
            <div className="meter-top">
              <div className="meter-title">
                <span className="tariff-icon tariff-night">
                  <MoonIcon width={18} height={18} />
                </span>
                <div>
                  <b>Ночь</b>
                  <small>{formatNumber(numbers.nightRate ?? defaultRates.nightRate)} ₴ / кВт·ч</small>
                </div>
              </div>
              <div className={`used-pill ${nightUsed !== null && nightUsed < 0 ? "is-negative" : ""}`}>
                <span>Использовано</span>
                <b>{nightUsed !== null ? formatNumber(nightUsed) : "—"}</b>
              </div>
            </div>
            <div className="meter-fields">
              <Field label="Прошлый месяц" htmlFor="nightPrev" error={visibleError("nightPrev")}>
                <div className="input-with-unit">
                  <input
                    id="nightPrev"
                    className="input"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="00000,0"
                    value={nightPrev}
                    onChange={(event) => {
                      setNightPrev(event.target.value);
                      setPrefillSource(null);
                    }}
                  />
                  <span className="unit">кВт·ч</span>
                </div>
              </Field>
              <div className="meter-arrow">→</div>
              <Field label="Этот месяц" htmlFor="nightCurr" error={visibleError("nightCurr")}>
                <div className="input-with-unit">
                  <input
                    id="nightCurr"
                    className="input"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="00000,0"
                    value={nightCurr}
                    onChange={(event) => setNightCurr(event.target.value)}
                  />
                  <span className="unit">кВт·ч</span>
                </div>
              </Field>
            </div>
          </div>
        </div>

        <div className={`rates-panel ${ratesOpen ? "is-open" : ""}`}>
          <button
            type="button"
            className="rates-toggle"
            onClick={() => setRatesOpen((open) => !open)}
            aria-expanded={ratesOpen}
          >
            <span className="rates-toggle-label">
              <WalletIcon width={17} height={17} />
              Тарифы для этого расчёта
            </span>
            <span className="rates-summary">
              {formatNumber(numbers.dayRate ?? defaultRates.dayRate)} /{" "}
              {formatNumber(numbers.nightRate ?? defaultRates.nightRate)} ₴
              <ChevronDownIcon width={16} height={16} />
            </span>
          </button>
          {ratesOpen ? (
            <div className="rates-grid">
              <Field label="Тариф день, ₴/кВт·ч" htmlFor="dayRate" error={visibleError("dayRate")}>
                <div className="input-with-unit">
                  <input
                    id="dayRate"
                    className="input"
                    type="text"
                    inputMode="decimal"
                    value={dayRate}
                    onChange={(event) => setDayRate(event.target.value)}
                  />
                  <span className="unit">₴</span>
                </div>
              </Field>
              <Field label="Тариф ночь, ₴/кВт·ч" htmlFor="nightRate" error={visibleError("nightRate")}>
                <div className="input-with-unit">
                  <input
                    id="nightRate"
                    className="input"
                    type="text"
                    inputMode="decimal"
                    value={nightRate}
                    onChange={(event) => setNightRate(event.target.value)}
                  />
                  <span className="unit">₴</span>
                </div>
              </Field>
              <p className="rates-hint">
                Тариф сохраняется вместе с расчётом. Если тарифы изменятся, старые месяцы
                останутся посчитанными по прежней цене.
              </p>
            </div>
          ) : null}
        </div>

        {duplicate ? (
          <div className="alert alert-warning">
            <div>
              <b>За {monthLabel(period)} уже есть расчёт.</b>
              <p>Откройте его, чтобы изменить показания, или выберите другой месяц.</p>
            </div>
            <button
              type="button"
              className="link-btn"
              onClick={() => onOpenExisting(duplicate)}
            >
              Открыть
            </button>
          </div>
        ) : null}

        <div className={`result-panel ${negativeUsage ? "is-invalid" : ""}`}>
          <div className="result-top">
            <div>
              <span className="result-label">К оплате за {monthLabel(period)}</span>
              <strong className={`result-total ${resultReady ? "" : "is-placeholder"}`}>
                {resultReady ? formatMoney(usage.total) : "—"}
              </strong>
            </div>
            <div className="result-total-kwh">
              <span>{resultReady ? formatNumber(usage.totalUsage) : "—"}</span>
              <small>кВт·ч всего</small>
            </div>
          </div>

          {resultReady ? (
            <div className="result-breakdown">
              <div className="result-row">
                <span className="result-row-label">
                  <i className="dot dot-day" />
                  День · {formatNumber(usage.dayUsage)} кВт·ч × {formatNumber(numbers.dayRate!)}
                </span>
                <b>{formatMoney(usage.dayCost)}</b>
              </div>
              <div className="result-row">
                <span className="result-row-label">
                  <i className="dot dot-night" />
                  Ночь · {formatNumber(usage.nightUsage)} кВт·ч × {formatNumber(numbers.nightRate!)}
                </span>
                <b>{formatMoney(usage.nightCost)}</b>
              </div>
            </div>
          ) : (
            <p className="result-placeholder">
              {negativeUsage
                ? "Показание «этот месяц» меньше показания за прошлый месяц. Проверьте цифры."
                : "Заполните показания за прошлый и текущий месяц — сумма посчитается автоматически."}
            </p>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving || busy || Boolean(duplicate)}
          >
            <CheckIcon width={18} height={18} />
            {saving ? "Сохраняем…" : editing ? "Сохранить изменения" : "Сохранить расчёт"}
          </button>
          {editing ? (
            <button type="button" className="btn btn-ghost" onClick={onCancelEdit} disabled={saving}>
              Отмена
            </button>
          ) : null}
          <p className="form-note">
            После сохранения расчёт появится в истории. Отметка «Оплачено» ставится там же
            и фиксирует дату оплаты.
          </p>
        </div>
      </form>
    </section>
  );
}
