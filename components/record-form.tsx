"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  DEFAULT_DAY_RATE,
  DEFAULT_GAS_RATE,
  DEFAULT_NIGHT_RATE,
  calculateUsage,
  parseNumber,
  validateDraft,
} from "@/lib/calc";
import {
  currentPeriod,
  formatKwh,
  formatMoney,
  formatNumber,
  monthLabel,
  shiftPeriod,
  todayISO,
  toInputValue,
} from "@/lib/format";
import { usesDecimalComma } from "@/lib/i18n";
import type { MeterRecord, MeterType, RecordDraft, Settings } from "@/lib/types";
import { useI18n } from "./i18n-provider";
import {
  BoltIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  FuelIcon,
  MoonIcon,
  SunIcon,
  WalletIcon,
} from "./icons";
import { MonthPicker } from "./month-picker";

interface RecordFormProps {
  /** Тип счётчика этой страницы: форма подстраивается под него. */
  meter: MeterType;
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
  meter,
  records,
  editing,
  defaultRates,
  busy,
  onSave,
  onCancelEdit,
  onOpenExisting,
  onNotify,
}: RecordFormProps) {
  const { locale, t } = useI18n();
  const isGas = meter === "gas";
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
    toInputValue(editing ? editing.dayPrev : initialSource?.dayCurr, locale),
  );
  const [nightPrev, setNightPrev] = useState(
    toInputValue(editing ? editing.nightPrev : initialSource?.nightCurr, locale),
  );
  const [dayCurr, setDayCurr] = useState(toInputValue(editing?.dayCurr, locale));
  const [nightCurr, setNightCurr] = useState(toInputValue(editing?.nightCurr, locale));
  const [dayRate, setDayRate] = useState(
    toInputValue(editing ? editing.dayRate : defaultRates.dayRate, locale),
  );
  const [nightRate, setNightRate] = useState(
    toInputValue(editing ? editing.nightRate : defaultRates.nightRate, locale),
  );
  const [gasPrev, setGasPrev] = useState(
    toInputValue(editing ? editing.gasPrev : initialSource?.gasCurr, locale),
  );
  const [gasCurr, setGasCurr] = useState(toInputValue(editing?.gasCurr, locale));
  const [gasRate, setGasRate] = useState(
    toInputValue(editing ? editing.gasRate : defaultRates.gasRate, locale),
  );
  const [gasDeliveryFee, setGasDeliveryFee] = useState(
    toInputValue(editing ? editing.gasDeliveryFee : defaultRates.gasDeliveryFee, locale),
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
      gasPrev: parseNumber(gasPrev),
      gasCurr: parseNumber(gasCurr),
      gasRate: parseNumber(gasRate),
      gasDeliveryFee: parseNumber(gasDeliveryFee),
    }),
    [dayPrev, dayCurr, nightPrev, nightCurr, dayRate, nightRate, gasPrev, gasCurr, gasRate, gasDeliveryFee],
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
          type: meter,
          period,
          enteredAt,
          dayPrev: isGas ? 0 : numbers.dayPrev,
          dayCurr: isGas ? 0 : numbers.dayCurr,
          nightPrev: isGas ? 0 : numbers.nightPrev,
          nightCurr: isGas ? 0 : numbers.nightCurr,
          dayRate: isGas ? DEFAULT_DAY_RATE : numbers.dayRate,
          nightRate: isGas ? DEFAULT_NIGHT_RATE : numbers.nightRate,
          gasPrev: isGas ? numbers.gasPrev : 0,
          gasCurr: isGas ? numbers.gasCurr : 0,
          gasRate: isGas ? numbers.gasRate : 0,
          gasDeliveryFee: isGas ? numbers.gasDeliveryFee : 0,
        },
        { existing: records, currentId: editing?.id },
      ),
    [meter, isGas, period, enteredAt, numbers, records, editing],
  );

  const readingsReady = isGas
    ? numbers.gasPrev !== null && numbers.gasCurr !== null
    : numbers.dayPrev !== null &&
      numbers.dayCurr !== null &&
      numbers.nightPrev !== null &&
      numbers.nightCurr !== null;

  const ratesReady = isGas
    ? numbers.gasRate !== null
    : numbers.dayRate !== null && numbers.nightRate !== null;

  const usage = useMemo(() => {
    if (!readingsReady || !ratesReady) return null;
    if (isGas) {
      return calculateUsage({
        dayPrev: 0,
        dayCurr: 0,
        nightPrev: 0,
        nightCurr: 0,
        dayRate: DEFAULT_DAY_RATE,
        nightRate: DEFAULT_NIGHT_RATE,
        gasPrev: numbers.gasPrev ?? 0,
        gasCurr: numbers.gasCurr ?? 0,
        gasRate: numbers.gasRate ?? DEFAULT_GAS_RATE,
        gasDeliveryFee: numbers.gasDeliveryFee ?? 0,
      });
    }
    return calculateUsage({
      dayPrev: numbers.dayPrev ?? 0,
      dayCurr: numbers.dayCurr ?? 0,
      nightPrev: numbers.nightPrev ?? 0,
      nightCurr: numbers.nightCurr ?? 0,
      dayRate: numbers.dayRate ?? DEFAULT_DAY_RATE,
      nightRate: numbers.nightRate ?? DEFAULT_NIGHT_RATE,
    });
  }, [isGas, readingsReady, ratesReady, numbers]);

  const negativeUsage = usage !== null && (
    isGas ? usage.gasUsage < 0 : usage.dayUsage < 0 || usage.nightUsage < 0
  );
  const resultReady = usage !== null && !negativeUsage;

  const visibleError = (key: string): string | undefined => {
    const code = errors[key];
    if (!code) return undefined;
    if (!showErrors && key !== "period") return undefined;
    return t(code);
  };

  const handlePeriodChange = (next: string) => {
    setPeriod(next);
    if (editing) return;
    const source = latestBefore(next, records);
    if (isGas) {
      setGasPrev(source ? toInputValue(source.gasCurr, locale) : "");
    } else {
      setDayPrev(source ? toInputValue(source.dayCurr, locale) : "");
      setNightPrev(source ? toInputValue(source.nightCurr, locale) : "");
    }
    setPrefillSource(source?.period ?? null);
  };

  const resetAfterSave = (saved: MeterRecord) => {
    const next = shiftPeriod(saved.period, 1);
    setPeriod(next);
    if (isGas) {
      setGasPrev(toInputValue(saved.gasCurr, locale));
      setGasCurr("");
    } else {
      setDayPrev(toInputValue(saved.dayCurr, locale));
      setNightPrev(toInputValue(saved.nightCurr, locale));
      setDayCurr("");
      setNightCurr("");
    }
    setEnteredAt(todayISO());
    setPrefillSource(saved.period);
    setShowErrors(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);

    if (Object.keys(errors).length > 0) {
      onNotify(t("form.validationToast"), "error");
      return;
    }

    const draft: RecordDraft = isGas
      ? {
          type: "gas",
          period,
          dayPrev: 0,
          dayCurr: 0,
          nightPrev: 0,
          nightCurr: 0,
          dayRate: DEFAULT_DAY_RATE,
          nightRate: DEFAULT_NIGHT_RATE,
          gasPrev: numbers.gasPrev!,
          gasCurr: numbers.gasCurr!,
          gasRate: numbers.gasRate!,
          gasDeliveryFee: numbers.gasDeliveryFee ?? 0,
          enteredAt,
        }
      : {
          type: "electricity",
          period,
          dayPrev: numbers.dayPrev!,
          dayCurr: numbers.dayCurr!,
          nightPrev: numbers.nightPrev!,
          nightCurr: numbers.nightCurr!,
          dayRate: numbers.dayRate!,
          nightRate: numbers.nightRate!,
          gasPrev: 0,
          gasCurr: 0,
          gasRate: 0,
          gasDeliveryFee: 0,
          enteredAt,
        };

    if ((editing?.note ?? "").trim() && draft.note === undefined) {
      draft.note = editing?.note;
    }

    setSaving(true);
    try {
      const saved = await onSave(draft, editing?.id);
      const month = monthLabel(saved.period, locale);
      onNotify(
        editing
          ? t("form.savedEdit", { month })
          : t("form.saved", { month }),
        "success",
      );
      if (!editing) resetAfterSave(saved);
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : t("form.saveError"),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const gasUsed =
    isGas && numbers.gasCurr !== null && numbers.gasPrev !== null
      ? numbers.gasCurr - numbers.gasPrev
      : null;
  const dayUsed = !isGas && numbers.dayCurr !== null && numbers.dayPrev !== null
    ? numbers.dayCurr - numbers.dayPrev
    : null;
  const nightUsed = !isGas && numbers.nightCurr !== null && numbers.nightPrev !== null
    ? numbers.nightCurr - numbers.nightPrev
    : null;

  const placeholder = usesDecimalComma(locale) ? "00000,0" : "00000.0";
  const usageUnit = isGas ? t("common.m3") : t("common.kwh");

  return (
    <section className="card form-card" id="calculator">
      <div className="card-head">
        <div>
          <p className="eyebrow">{editing ? t("form.editEyebrow") : t("form.newEyebrow")}</p>
          <h2>
            {editing
              ? monthLabel(editing.period, locale)
              : t("form.newTitle")}
          </h2>
        </div>
        <span className="soft-badge">
          {isGas ? <FuelIcon width={14} height={14} /> : <BoltIcon width={14} height={14} />}
          {monthLabel(period, locale)}
        </span>
      </div>

      {editing ? (
        <div className="edit-banner">
          <span>{t("form.editBanner")}</span>
          <button type="button" className="link-btn" onClick={onCancelEdit}>
            {t("form.cancel")}
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid form-grid-2">
          <Field
            label={t("form.periodLabel")}
            htmlFor="period"
            error={visibleError("period")}
            hint={t("form.periodHint")}
          >
            <MonthPicker id="period" value={period} onChange={handlePeriodChange} />
          </Field>

          <Field
            label={t("form.enteredAtLabel")}
            htmlFor="enteredAt"
            error={visibleError("enteredAt")}
            hint={t("form.enteredAtHint")}
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
          <span>{t("form.readingsSection")}</span>
          <span>{usageUnit}</span>
        </div>

        {prefillSource && !editing ? (
          <div className="prefill-hint">
            {isGas ? <FuelIcon width={14} height={14} /> : <BoltIcon width={14} height={14} />}
            {t("form.prefill", { month: monthLabel(prefillSource, locale) })}
          </div>
        ) : null}

        <div className="meter-list">
          {!isGas ? (
            <div className="meter-card meter-day">
              <div className="meter-top">
                <div className="meter-title">
                  <span className="tariff-icon tariff-day">
                    <SunIcon width={18} height={18} />
                  </span>
                  <div>
                    <b>{t("common.day")}</b>
                    <small>
                      {formatNumber(numbers.dayRate ?? defaultRates.dayRate, locale)}{" "}
                      {t("form.rateUnit")}
                    </small>
                  </div>
                </div>
                <div className={`used-pill ${dayUsed !== null && dayUsed < 0 ? "is-negative" : ""}`}>
                  <span>{t("form.used")}</span>
                  <b>{dayUsed !== null ? formatNumber(dayUsed, locale) : "—"}</b>
                </div>
              </div>
              <div className="meter-fields">
                <Field label={t("form.prevMonth")} htmlFor="dayPrev" error={visibleError("dayPrev")}>
                  <div className="input-with-unit">
                    <input
                      id="dayPrev"
                      className="input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder={placeholder}
                      value={dayPrev}
                      onChange={(event) => {
                        setDayPrev(event.target.value);
                        setPrefillSource(null);
                      }}
                    />
                    <span className="unit">{t("common.kwh")}</span>
                  </div>
                </Field>
                <div className="meter-arrow">→</div>
                <Field label={t("form.thisMonth")} htmlFor="dayCurr" error={visibleError("dayCurr")}>
                  <div className="input-with-unit">
                    <input
                      id="dayCurr"
                      className="input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder={placeholder}
                      value={dayCurr}
                      onChange={(event) => setDayCurr(event.target.value)}
                    />
                    <span className="unit">{t("common.kwh")}</span>
                  </div>
                </Field>
              </div>
            </div>
          ) : null}

          {!isGas ? (
            <div className="meter-card meter-night">
              <div className="meter-top">
                <div className="meter-title">
                  <span className="tariff-icon tariff-night">
                    <MoonIcon width={18} height={18} />
                  </span>
                  <div>
                    <b>{t("common.night")}</b>
                    <small>
                      {formatNumber(numbers.nightRate ?? defaultRates.nightRate, locale)}{" "}
                      {t("form.rateUnit")}
                    </small>
                  </div>
                </div>
                <div className={`used-pill ${nightUsed !== null && nightUsed < 0 ? "is-negative" : ""}`}>
                  <span>{t("form.used")}</span>
                  <b>{nightUsed !== null ? formatNumber(nightUsed, locale) : "—"}</b>
                </div>
              </div>
              <div className="meter-fields">
                <Field label={t("form.prevMonth")} htmlFor="nightPrev" error={visibleError("nightPrev")}>
                  <div className="input-with-unit">
                    <input
                      id="nightPrev"
                      className="input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder={placeholder}
                      value={nightPrev}
                      onChange={(event) => {
                        setNightPrev(event.target.value);
                        setPrefillSource(null);
                      }}
                    />
                    <span className="unit">{t("common.kwh")}</span>
                  </div>
                </Field>
                <div className="meter-arrow">→</div>
                <Field label={t("form.thisMonth")} htmlFor="nightCurr" error={visibleError("nightCurr")}>
                  <div className="input-with-unit">
                    <input
                      id="nightCurr"
                      className="input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder={placeholder}
                      value={nightCurr}
                      onChange={(event) => setNightCurr(event.target.value)}
                    />
                    <span className="unit">{t("common.kwh")}</span>
                  </div>
                </Field>
              </div>
            </div>
          ) : null}

          {isGas ? (
            <div className="meter-card meter-gas">
              <div className="meter-top">
                <div className="meter-title">
                  <span className="tariff-icon tariff-gas">
                    <FuelIcon width={18} height={18} />
                  </span>
                  <div>
                    <b>{t("common.gas")}</b>
                    <small>
                      {formatNumber(numbers.gasRate ?? defaultRates.gasRate, locale)}{" "}
                      {t("form.gasRateUnit")}
                    </small>
                  </div>
                </div>
                <div className={`used-pill ${gasUsed !== null && gasUsed < 0 ? "is-negative" : ""}`}>
                  <span>{t("form.used")}</span>
                  <b>{gasUsed !== null ? formatNumber(gasUsed, locale) : "—"}</b>
                </div>
              </div>
              <div className="meter-fields">
                <Field label={t("form.prevMonth")} htmlFor="gasPrev" error={visibleError("gasPrev")}>
                  <div className="input-with-unit">
                    <input
                      id="gasPrev"
                      className="input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder={placeholder}
                      value={gasPrev}
                      onChange={(event) => {
                        setGasPrev(event.target.value);
                        setPrefillSource(null);
                      }}
                    />
                    <span className="unit">{t("common.m3")}</span>
                  </div>
                </Field>
                <div className="meter-arrow">→</div>
                <Field label={t("form.thisMonth")} htmlFor="gasCurr" error={visibleError("gasCurr")}>
                  <div className="input-with-unit">
                    <input
                      id="gasCurr"
                      className="input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder={placeholder}
                      value={gasCurr}
                      onChange={(event) => setGasCurr(event.target.value)}
                    />
                    <span className="unit">{t("common.m3")}</span>
                  </div>
                </Field>
              </div>
              <div className="gas-delivery">
                <Field
                  label={t("settings.gasRateLabel")}
                  htmlFor="gasRate"
                  error={visibleError("gasRate")}
                >
                  <div className="input-with-unit">
                    <input
                      id="gasRate"
                      className="input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder={usesDecimalComma(locale) ? "0,00" : "0.00"}
                      value={gasRate}
                      onChange={(event) => setGasRate(event.target.value)}
                    />
                    <span className="unit">₴/м³</span>
                  </div>
                </Field>
                <Field
                  label={t("settings.gasDeliveryLabel")}
                  htmlFor="gasDeliveryFee"
                  error={visibleError("gasDeliveryFee")}
                  hint={t("form.gasDeliveryHint")}
                >
                  <div className="input-with-unit">
                    <input
                      id="gasDeliveryFee"
                      className="input"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder={usesDecimalComma(locale) ? "0,00" : "0.00"}
                      value={gasDeliveryFee}
                      onChange={(event) => setGasDeliveryFee(event.target.value)}
                    />
                    <span className="unit">₴</span>
                  </div>
                </Field>
              </div>
            </div>
          ) : null}
        </div>

        {!isGas ? (
          <div className={`rates-panel ${ratesOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="rates-toggle"
              onClick={() => setRatesOpen((open) => !open)}
              aria-expanded={ratesOpen}
            >
              <span className="rates-toggle-label">
                <WalletIcon width={17} height={17} />
                {t("form.ratesToggle")}
              </span>
              <span className="rates-summary">
                {formatNumber(numbers.dayRate ?? defaultRates.dayRate, locale)} /{" "}
                {formatNumber(numbers.nightRate ?? defaultRates.nightRate, locale)} ₴
                <ChevronDownIcon width={16} height={16} />
              </span>
            </button>
            {ratesOpen ? (
              <div className="rates-grid">
                <Field
                  label={t("form.rateDayLabel")}
                  htmlFor="dayRate"
                  error={visibleError("dayRate")}
                >
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
                <Field
                  label={t("form.rateNightLabel")}
                  htmlFor="nightRate"
                  error={visibleError("nightRate")}
                >
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
                <p className="rates-hint">{t("form.ratesHint")}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {duplicate ? (
          <div className="alert alert-warning">
            <div>
              <b>{t("form.duplicateTitle", { month: monthLabel(period, locale) })}</b>
              <p>{t("form.duplicateText")}</p>
            </div>
            <button
              type="button"
              className="link-btn"
              onClick={() => onOpenExisting(duplicate)}
            >
              {t("form.openExisting")}
            </button>
          </div>
        ) : null}

        <div className={`result-panel ${negativeUsage ? "is-invalid" : ""}`}>
          <div className="result-top">
            <div>
              <span className="result-label">
                {t("form.toPay", { month: monthLabel(period, locale) })}
              </span>
              <strong className={`result-total ${resultReady ? "" : "is-placeholder"}`}>
                {resultReady ? formatMoney(usage.total, locale) : "—"}
              </strong>
            </div>
            <div className="result-total-kwh">
              <span>{resultReady ? formatNumber(usage.totalUsage, locale) : "—"}</span>
              <small>{isGas ? t("form.totalM3") : t("form.totalKwh")}</small>
            </div>
          </div>

          {resultReady ? (
            <div className="result-breakdown">
              {isGas ? (
                <>
                  <div className="result-row">
                    <span className="result-row-label">
                      <i className="dot dot-day" />
                      {t("form.breakdownGas", {
                        m3: formatNumber(usage.gasUsage, locale),
                        rate: formatNumber(numbers.gasRate ?? defaultRates.gasRate, locale),
                      })}
                    </span>
                    <b>
                      {formatMoney(
                        Math.round((usage.total - (numbers.gasDeliveryFee ?? 0)) * 100) / 100,
                        locale,
                      )}
                    </b>
                  </div>
                  {(numbers.gasDeliveryFee ?? 0) > 0 ? (
                    <div className="result-row">
                      <span className="result-row-label">
                        <i className="dot dot-night" />
                        {t("receipt.deliveryFee")}
                      </span>
                      <b>{formatMoney(numbers.gasDeliveryFee ?? 0, locale)}</b>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="result-row">
                    <span className="result-row-label">
                      <i className="dot dot-day" />
                      {t("form.breakdownDay", {
                        kwh: formatNumber(usage.dayUsage, locale),
                        rate: formatNumber(numbers.dayRate!, locale),
                      })}
                    </span>
                    <b>{formatMoney(usage.dayCost, locale)}</b>
                  </div>
                  <div className="result-row">
                    <span className="result-row-label">
                      <i className="dot dot-night" />
                      {t("form.breakdownNight", {
                        kwh: formatNumber(usage.nightUsage, locale),
                        rate: formatNumber(numbers.nightRate!, locale),
                      })}
                    </span>
                    <b>{formatMoney(usage.nightCost, locale)}</b>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="result-placeholder">
              {negativeUsage
                ? t("form.negative")
                : t("form.resultPlaceholder")}
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
            {saving
              ? t("form.saving")
              : editing
                ? t("form.saveChanges")
                : t("form.save")}
          </button>
          {editing ? (
            <button type="button" className="btn btn-ghost" onClick={onCancelEdit} disabled={saving}>
              {t("form.cancel")}
            </button>
          ) : null}
          <p className="form-note">{t("form.note")}</p>
        </div>
      </form>
    </section>
  );
}
