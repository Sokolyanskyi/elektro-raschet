/** Тип счётчика: электроэнергия или газ. */
export type MeterType = "electricity" | "gas";

/**
 * Одна запись = один расчётный месяц одного счётчика.
 *
 * Показания хранятся как есть (два числа на каждый тариф: на начало и на конец
 * периода), а тарифы фиксируются в самой записи. Благодаря этому старые расчёты
 * никогда не «пересчитываются» задним числом, даже если тарифы поменяются.
 *
 * У электрических записей газовые поля равны нулю, у газовых — нулевые дневные
 * и ночные показания. Ненужная для типа часть всегда заполнена нулями, поэтому
 * calculateUsage работает одинаково для обоих типов.
 */
export interface MeterRecord {
  id: string;
  type: MeterType;
  /** Расчётный месяц в формате YYYY-MM. */
  period: string;
  /** Показание на начало периода (прошлый месяц). */
  dayPrev: number;
  nightPrev: number;
  /** Показание на конец периода (этот месяц). */
  dayCurr: number;
  nightCurr: number;
  /** Тариф, действовавший на момент расчёта, грн/кВт·ч. */
  dayRate: number;
  nightRate: number;
  /** Дата, когда были внесены показания (YYYY-MM-DD). */
  enteredAt: string;
  note?: string;
  paid: boolean;
  /** Фактическая дата отметки об оплате (ISO). */
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Показание газового счётчика на начало периода, м³. */
  gasPrev: number;
  /** Показание газового счётчика на конец периода, м³. */
  gasCurr: number;
  /** Тариф газа, грн/м³. */
  gasRate: number;
  /** Фиксированная плата за доставку газа, грн/мес. */
  gasDeliveryFee: number;
}

/** Данные, которые вводит пользователь в форме. */
export type RecordDraft = Pick<
  MeterRecord,
  | "type"
  | "period"
  | "dayPrev"
  | "nightPrev"
  | "dayCurr"
  | "nightCurr"
  | "dayRate"
  | "nightRate"
  | "gasPrev"
  | "gasCurr"
  | "gasRate"
  | "gasDeliveryFee"
  | "enteredAt"
  | "note"
>;

export interface Settings {
  dayRate: number;
  nightRate: number;
  gasRate: number;
  gasDeliveryFee: number;
}

export type StorageMode = "loading" | "local" | "cloud" | "locked" | "error";

export interface CloudStatus {
  cloud: boolean;
  pinRequired: boolean;
  authenticated: boolean;
}
