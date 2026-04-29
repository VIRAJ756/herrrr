self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal cache-first shell for offline start.
const CACHE = "guardian-shell-v1";
const SHELL_URLS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;

      try {
        const fresh = await fetch(request);
        if (SHELL_URLS.includes(new URL(request.url).pathname)) {
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch (err) {
        const offlineIndex = await cache.match("/index.html");
        return (
          offlineIndex ||
          new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
        );
      }
    })(),
  );
});

self.addEventListener("push", (event) => {
  const data = event.data?.json?.() ?? {
    title: "STREE ASTRA Alert",
    body: "A safety alert was triggered nearby.",
  };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/dashboard"));
});

