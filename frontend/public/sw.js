// Minimal service worker — required for PWA installability.
// No offline caching strategy here: this is a demo app, always fetch from network.
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => new Response('Hors ligne', { status: 503 })))
})
