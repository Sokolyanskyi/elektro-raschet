// Минимальный service worker: делает приложение устанавливаемым (PWA),
// ничего не кеширует, чтобы данные и интерфейс всегда были актуальными.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Запросы обрабатываются браузером как обычно, без перехвата.
});
