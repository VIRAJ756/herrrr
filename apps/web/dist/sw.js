const CACHE = 'trinetra-v1';
const OFFLINE_URLS = ['/', '/index.html'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(OFFLINE_URLS)))
);

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

const sosQueue = [];
self.addEventListener('message', e => {
  if (e.data.type === 'QUEUE_SOS') sosQueue.push(e.data.payload);
});
self.addEventListener('sync', e => {
  if (e.tag === 'sos-sync') {
    e.waitUntil(
      Promise.all(sosQueue.map(payload =>
        fetch('/api/sos', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' }
        })
      ))
    );
  }
});
