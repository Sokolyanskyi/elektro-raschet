"use client";

import { useEffect, useRef, useState } from "react";
import { parseNumber } from "@/lib/calc";
import { toInputValue } from "@/lib/format";
import type { CloudStatus, Settings, StorageMode } from "@/lib/types";
import {
  CloudIcon,
  DeviceIcon,
  DownloadIcon,
  ShieldIcon,
  UploadIcon,
  WalletIcon,
} from "./icons";
import { Modal } from "./modal";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  mode: StorageMode;
  cloud: CloudStatus | null;
  localCount: number;
  busy: boolean;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImportFile: (file: File) => void;
  onPushLocal: () => void;
  onSignOut: () => void;
}

export function SettingsDialog({
  open,
  onClose,
  settings,
  onSaveSettings,
  mode,
  cloud,
  localCount,
  busy,
  onExportJson,
  onExportCsv,
  onImportFile,
  onPushLocal,
  onSignOut,
}: SettingsDialogProps) {
  const [dayRate, setDayRate] = useState(toInputValue(settings.dayRate));
  const [nightRate, setNightRate] = useState(toInputValue(settings.nightRate));
  const [rateError, setRateError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDayRate(toInputValue(settings.dayRate));
    setNightRate(toInputValue(settings.nightRate));
    setRateError(null);
  }, [open, settings]);

  const saveRates = () => {
    const day = parseNumber(dayRate);
    const night = parseNumber(nightRate);
    if (day === null || night === null || day <= 0 || night <= 0) {
      setRateError("Укажите положительные значения тарифов");
      return;
    }
    onSaveSettings({ dayRate: day, nightRate: night });
    setRateError(null);
    onClose();
  };

  return (
    <Modal open={open} title="Настройки" onClose={onClose} size="wide">
      <div className="settings-section">
        <div className="settings-title">
          <WalletIcon width={18} height={18} />
          <div>
            <h3>Тарифы по умолчанию</h3>
            <p>Подставляются в новые расчёты. В сохранённых месяцах цены не меняются.</p>
          </div>
        </div>
        <div className="rates-grid">
          <div className="field">
            <label htmlFor="settingsDayRate">День, ₴/кВт·ч</label>
            <div className="input-with-unit">
              <input
                id="settingsDayRate"
                className="input"
                type="text"
                inputMode="decimal"
                value={dayRate}
                onChange={(event) => setDayRate(event.target.value)}
              />
              <span className="unit">₴</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="settingsNightRate">Ночь, ₴/кВт·ч</label>
            <div className="input-with-unit">
              <input
                id="settingsNightRate"
                className="input"
                type="text"
                inputMode="decimal"
                value={nightRate}
                onChange={(event) => setNightRate(event.target.value)}
              />
              <span className="unit">₴</span>
            </div>
          </div>
        </div>
        {rateError ? <p className="field-error">{rateError}</p> : null}
        <div className="settings-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={saveRates}>
            Сохранить тарифы
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">
          {mode === "cloud" ? (
            <CloudIcon width={18} height={18} />
          ) : (
            <DeviceIcon width={18} height={18} />
          )}
          <div>
            <h3>Хранение данных</h3>
            <p>
              {mode === "cloud"
                ? "Расчёты синхронизируются между телефоном и компьютером."
                : "Расчёты сохраняются только в этом браузере."}
            </p>
          </div>
        </div>

        {mode === "cloud" ? (
          <div className="storage-card is-cloud">
            <div className="storage-card-head">
              <span className="storage-dot" />
              <b>Облако подключено</b>
              {cloud?.pinRequired ? <span className="tag">PIN-защита</span> : null}
            </div>
            <p>
              Данные доступны на любом устройстве после ввода PIN-кода. История хранится,
              пока существует облачная база.
            </p>
            <div className="storage-actions">
              {localCount > 0 ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onPushLocal}
                  disabled={busy}
                >
                  <UploadIcon width={16} height={16} />
                  Перенести {localCount} с этого устройства
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onSignOut}
                disabled={busy}
              >
                Выйти из облака
              </button>
            </div>
          </div>
        ) : (
          <div className="storage-card is-local">
            <div className="storage-card-head">
              <span className="storage-dot" />
              <b>Локальное хранение</b>
            </div>
            <p>
              Записи не пропадут при обновлении страницы, но не появятся на другом
              устройстве и могут быть потеряны при очистке данных браузера. Скачайте
              резервную копию перед экспериментами.
            </p>
            <div className="setup-box">
              <b>Как включить синхронизацию</b>
              <ol>
                <li>В Vercel откройте проект → Storage → Marketplace → Upstash Redis (free).</li>
                <li>Подключите базу к проекту: появятся KV_REST_API_URL и KV_REST_API_TOKEN.</li>
                <li>Добавьте переменную APP_PIN — код для входа в приложение.</li>
                <li>Передеплойте проект: приложение само перейдёт в облачный режим.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-title">
          <ShieldIcon width={18} height={18} />
          <div>
            <h3>Резервная копия</h3>
            <p>Файл JSON можно хранить отдельно и восстановить данные в любой момент.</p>
          </div>
        </div>
        <div className="backup-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onExportJson}>
            <DownloadIcon width={16} height={16} />
            Скачать JSON
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onExportCsv}>
            <DownloadIcon width={16} height={16} />
            Скачать CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
          >
            <UploadIcon width={16} height={16} />
            Импорт JSON
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportFile(file);
              event.target.value = "";
            }}
          />
        </div>
        <p className="settings-note">
          Импорт добавляет недостающие месяцы и обновляет совпадающие по месяцу записи.
          Записи, которых нет в файле, остаются на месте.
        </p>
      </div>

      <div className="settings-about">
        <p>Расчёт по двум тарифам · версия 1.0</p>
        <p>Приложение не отправляет показания энергопоставщику — это личный учёт.</p>
      </div>
    </Modal>
  );
}
