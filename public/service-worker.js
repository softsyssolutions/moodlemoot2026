// MoodleMoot Perú 2026 — Service Worker
// Maneja Web Push y un caché mínimo NetworkFirst para HTML.

const CACHE_NAME = "mm-cache-v3";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

// NetworkFirst para navegación HTML — evita servir shells obsoletas.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (req.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch (err) {
        const cached = await caches.match(req);
        if (cached) return cached;
        throw err;
      }
    })()
  );
});

// === Web Push ===
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { title: "MoodleMoot Perú", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "MoodleMoot Perú 2026";
  const tag = payload.tag || `mm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icons/icon-512.png",
    badge: "/icons/icon-512.png",
    data: { url: payload.url || "/" },
    tag,
    renotify: true,
    requireInteraction: payload.requireInteraction ?? true,
    vibrate: [200, 100, 200],
    timestamp: payload.timestamp || Date.now(),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = (event.notification.data && event.notification.data.url) || "/";
  let target;
  try {
    target = new URL(raw, self.location.origin).href;
  } catch (_) {
    target = self.location.origin + "/";
  }

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // 1) Pestaña con la URL exacta → enfocar.
      const exact = all.find((c) => c.url === target);
      if (exact) {
        try {
          return await exact.focus();
        } catch (_) {}
      }

      // 2) Pestaña del mismo origen → intentar navigate + focus.
      const targetOrigin = new URL(target).origin;
      const sameOrigin = all.find((c) => {
        try {
          return new URL(c.url).origin === targetOrigin;
        } catch (_) {
          return false;
        }
      });
      if (sameOrigin) {
        try {
          if ("navigate" in sameOrigin) {
            await sameOrigin.navigate(target);
          }
          return await sameOrigin.focus();
        } catch (_) {
          // cae al openWindow
        }
      }

      // 3) Abrir ventana nueva.
      if (self.clients.openWindow) {
        return self.clients.openWindow(target);
      }
    })()
  );
});
