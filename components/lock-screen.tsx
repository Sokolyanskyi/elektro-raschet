"use client";

import { useState, type FormEvent } from "react";
import { BoltIcon, LockIcon } from "./icons";

interface LockScreenProps {
  onSignIn: (pin: string) => Promise<void>;
}

export function LockScreen({ onSignIn }: LockScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!pin.trim()) {
      setError("Введите PIN-код");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSignIn(pin.trim());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось войти");
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
        <p className="eyebrow">Личный кабинет</p>
        <h1>Электроэнергия</h1>
        <p className="lock-sub">
          Введите PIN-код, чтобы открыть расчёты и историю оплат на этом устройстве.
        </p>

        <form onSubmit={handleSubmit} className="lock-form">
          <label htmlFor="pin" className="sr-only">
            PIN-код
          </label>
          <div className="input-with-icon">
            <LockIcon width={18} height={18} />
            <input
              id="pin"
              className="input input-pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              placeholder="PIN-код"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              autoFocus
            />
          </div>
          {error ? <p className="field-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? "Проверяем…" : "Войти"}
          </button>
        </form>

        <p className="lock-hint">
          PIN-код задаётся владельцем приложения в переменной <code>APP_PIN</code> на Vercel.
          Сессия сохраняется на 120 дней.
        </p>
      </div>
    </main>
  );
}
