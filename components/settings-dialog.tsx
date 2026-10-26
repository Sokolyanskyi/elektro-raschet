"use client";

import { useEffect, useRef, useState } from "react";
import { parseNumber } from "@/lib/calc";
import { toInputValue } from "@/lib/format";
import { LOCALES, LOCALE_META } from "@/lib/i18n";
import { THEMES, THEME_META } from "@/lib/theme";
import type { CloudStatus, Settings, StorageMode } from "@/lib/types";
import { useI18n } from "./i18n-provider";
import {
  CheckIcon,
  CloudIcon,
  DeviceIcon,
  DownloadIcon,
  GlobeIcon,
  ShieldIcon,
  SunIcon,
  UploadIcon,
  WalletIcon,
} from "./icons";
import { Modal } from "./modal";
import { useTheme } from "./theme-provider";

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
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [dayRate, setDayRate] = useState(toInputValue(settings.dayRate, locale));
  const [nightRate, setNightRate] = useState(toInputValue(settings.nightRate, locale));
  const [rateError, setRateError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDayRate(toInputValue(settings.dayRate, locale));
    setNightRate(toInputValue(settings.nightRate, locale));
    setRateError(null);
  }, [open, settings, locale]);

  const saveRates = () => {
    const day = parseNumber(dayRate);
    const night = parseNumber(nightRate);
    if (day === null || night === null || day <= 0 || night <= 0) {
      setRateError(t("settings.rateError"));
      return;
    }
    onSaveSettings({ dayRate: day, nightRate: night });
    setRateError(null);
    onClose();
  };

  return (
    <Modal open={open} title={t("settings.title")} onClose={onClose} size="wide">
      <div className="settings-section">
        <div className="settings-title">
          <SunIcon width={18} height={18} />
          <div>
            <h3>{t("settings.themeTitle")}</h3>
            <p>{t("settings.themeText")}</p>
          </div>
        </div>
        <div
          className="theme-options"
          role="radiogroup"
          aria-label={t("settings.themeTitle")}
        >
          {THEMES.map((id) => {
            const meta = THEME_META[id];
            const active = theme === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`theme-option ${active ? "is-active" : ""}`}
                onClick={() => setTheme(id)}
              >
                <span
                  className="theme-swatch"
                  style={{ background: meta.preview.bg }}
                  aria-hidden="true"
                >
                  <span
                    className="theme-swatch-card"
                    style={{
                      background: meta.preview.card,
                      borderColor: meta.preview.line,
                    }}
                  >
                    <span
                      className="theme-swatch-line"
                      style={{ background: meta.preview.line }}
                    />
                    <span
                      className="theme-swatch-line is-short"
                      style={{ background: meta.preview.accent }}
                    />
                  </span>
                  <span
                    className="theme-swatch-dot"
                    style={{ background: meta.preview.accent }}
                  />
                </span>
                <span className="theme-name">{t(`theme.${id}`)}</span>
                {active ? (
                  <span className="theme-check">
                    <CheckIcon width={10} height={10} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">
          <GlobeIcon width={18} height={18} />
          <div>
            <h3>{t("settings.languageTitle")}</h3>
            <p>{t("settings.languageText")}</p>
          </div>
        </div>
        <div
          className="language-options"
          role="radiogroup"
          aria-label={t("settings.languageTitle")}
        >
          {LOCALES.map((code) => {
            const meta = LOCALE_META[code];
            const active = locale === code;
            return (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={active}
                className={`language-option ${active ? "is-active" : ""}`}
                onClick={() => setLocale(code)}
                lang={meta.htmlLang}
              >
                <span className="language-native">{meta.nativeName}</span>
                <small>{meta.englishName}</small>
                {active ? <CheckIcon width={14} height={14} /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">
          <WalletIcon width={18} height={18} />
          <div>
            <h3>{t("settings.ratesTitle")}</h3>
            <p>{t("settings.ratesText")}</p>
          </div>
        </div>
        <div className="rates-grid">
          <div className="field">
            <label htmlFor="settingsDayRate">{t("settings.dayRateLabel")}</label>
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
            <label htmlFor="settingsNightRate">{t("settings.nightRateLabel")}</label>
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
            {t("settings.saveRates")}
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
            <h3>{t("settings.storageTitle")}</h3>
            <p>
              {mode === "cloud"
                ? t("settings.storageCloudText")
                : t("settings.storageLocalText")}
            </p>
          </div>
        </div>

        {mode === "cloud" ? (
          <div className="storage-card is-cloud">
            <div className="storage-card-head">
              <span className="storage-dot" />
              <b>{t("settings.cloudConnected")}</b>
              {cloud?.pinRequired ? (
                <span className="tag">{t("settings.pinProtection")}</span>
              ) : null}
            </div>
            <p>{t("settings.cloudText")}</p>
            <div className="storage-actions">
              {localCount > 0 ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onPushLocal}
                  disabled={busy}
                >
                  <UploadIcon width={16} height={16} />
                  {t("settings.pushLocal", { count: localCount })}
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onSignOut}
                disabled={busy}
              >
                {t("settings.signOut")}
              </button>
            </div>
          </div>
        ) : (
          <div className="storage-card is-local">
            <div className="storage-card-head">
              <span className="storage-dot" />
              <b>{t("settings.localTitle")}</b>
            </div>
            <p>{t("settings.localText")}</p>
            <div className="setup-box">
              <b>{t("settings.setupTitle")}</b>
              <ol>
                <li>{t("settings.setupStep1")}</li>
                <li>{t("settings.setupStep2")}</li>
                <li>{t("settings.setupStep3")}</li>
                <li>{t("settings.setupStep4")}</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-title">
          <ShieldIcon width={18} height={18} />
          <div>
            <h3>{t("settings.backupTitle")}</h3>
            <p>{t("settings.backupText")}</p>
          </div>
        </div>
        <div className="backup-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onExportJson}>
            <DownloadIcon width={16} height={16} />
            {t("settings.exportJson")}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onExportCsv}>
            <DownloadIcon width={16} height={16} />
            {t("settings.exportCsv")}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
          >
            <UploadIcon width={16} height={16} />
            {t("settings.importJson")}
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
        <p className="settings-note">{t("settings.importNote")}</p>
      </div>

      <div className="settings-about">
        <p>{t("settings.aboutVersion")}</p>
        <p>{t("settings.aboutDisclaimer")}</p>
      </div>
    </Modal>
  );
}
