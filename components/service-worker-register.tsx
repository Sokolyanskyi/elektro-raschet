"use client";

import { useEffect } from "react";

/**
 * Минимальный service worker без кеширования: он нужен только для того,
 * чтобы приложение можно было установить на телефон (PWA), но не мешает
 * обновлениям и не показывает устаревшие данные.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const timer = window.setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // установка приложения не критична для работы
      });
    }, 1500);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
