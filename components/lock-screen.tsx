"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "./i18n-provider";
import { BoltIcon, LockIcon } from "./icons";

interface LockScreenProps {
  onSignIn: (pin: string) => Promise<void>;
}

export function LockScreen({ onSignIn }: LockScreenProps) {
  const { t } = useI18n();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!pin.trim()) {
      setError(t("lock.enterPin"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSignIn(pin.trim());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("lock.fallback"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="lock-page">
      <div className="lock-card">
        <span className="brand-mark brand-mark-lg">
          <BoltIcon width={26} height={26} />
        </span>
        <p className="eyebrow">{t("lock.eyebrow")}</p>
        <h1>{t("app.name")}</h1>
        <p className="lock-sub">{t("lock.subtitle")}</p>

        <form onSubmit={handleSubmit} className="lock-form">
          <label htmlFor="pin" className="sr-only">
            {t("lock.pinLabel")}
          </label>
          <div className="input-with-icon">
            <LockIcon width={18} height={18} />
            <input
              id="pin"
              className="input input-pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              placeholder={t("lock.pinPlaceholder")}
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              autoFocus
            />
          </div>
          {error ? <p className="field-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? t("lock.checking") : t("lock.submit")}
          </button>
        </form>

        <p className="lock-hint">
          {t("lock.hintBefore")}
          <code>APP_PIN</code>
          {t("lock.hintAfter")}
        </p>
      </div>
    </main>
  );
}
