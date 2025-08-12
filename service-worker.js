// Ben’s Humpin’ & Dumpin’ — SW r36
const CACHE = 'bhd-cache-r36';
const ASSETS = [
  './',
  './index.html',
  './config.js',
  './icon-192.png',
  './icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Don’t cache Google Maps calls
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    return; // let network handle it
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      // cache GETs
      if (e.request.method === 'GET' && resp.ok) {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return resp;
    }).catch(() => hit))
  );
});