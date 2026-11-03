// Service worker: офлайн-открытие приложения.
//
// Стратегии:
//  - навигации (HTML): сеть, копия в кеш; при офлайне — последняя сохранённая
//    страница. Приложение открывается без интернета: облако покажет ошибку
//    сети, локальный режим работает полностью.
//  - хешированная статика Next (_next/static), иконки и манифест: cache-first —
//    имена неизменяемы, новые версии приходят с новым HTML и докешируются.
//  - /api/* и сам sw.js: никогда не кешируем — только живая сеть.
//
// Кеш статики ограничен: при превышении лимита удаляются самые старые записи.

const VERSION = "v1";
const NAV_CACHE = `elec-nav-${VERSION}`;
const STATIC_CACHE = `elec-static-${VERSION}`;
const MAX_STATIC_ENTRIES = 120;

const PRECACHE_URLS = ["/", "/gas", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(NAV_CACHE);
      // Прекешируем оболочку по одной, чтобы один сбой не отменял остальные.
      await Promise.allSettled(
        PRECACHE_URLS.map((url) => cache.add(new Request(url, { cache: "reload" }))),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([NAV_CACHE, STATIC_CACHE]);
      for (const name of await caches.keys()) {
        if (!keep.has(name)) await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  for (const key of keys.slice(0, keys.length - maxEntries)) {
    await cache.delete(key);
  }
}

function isStaticAsset(url) {
  if (url.pathname === "/sw.js") return false;
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(png|svg|ico|webmanifest|woff2?)$/.test(url.pathname)
  );
}

async function handleNavigation(request) {
  const cache = await caches.open(NAV_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
      return response;
    }
  } catch {
    // офлайн — падаем в кеш ниже
  }
  const cached =
    (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match("/"));
  if (cached) return cached;
  return new Response("Offline", { status: 503, statusText: "Offline" });
}

async function handleStatic(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
    void trimCache(STATIC_CACHE, MAX_STATIC_ENTRIES);
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }
  if (isStaticAsset(url)) {
    event.respondWith(handleStatic(request));
  }
});
