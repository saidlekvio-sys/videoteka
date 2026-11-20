// Офлайн-оболочка приложения. Видео и запросы к Яндекс Диску/серверу аккаунтов не кэшируются.
const V = 'sva-shell-202611202129';
const SHELL = ['./', 'index.html', 'vendor/pdf.min.js', 'vendor/pdf.worker.min.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('sva-shell-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // чужие адреса — напрямую
  if (e.request.mode === 'navigate') { // страница: сначала сеть (обновления), без сети — из кэша
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('index.html', c)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
