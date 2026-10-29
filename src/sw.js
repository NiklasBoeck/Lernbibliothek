// Offline-Start der Web-Version: App-Dateien zwischenspeichern, index.html zuerst aus dem Netz.
const CACHE = 'lernbibliothek-__VERSION__';
const SHELL = __SHELL__;
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (e.request.mode === 'navigate') {
    // Bei schlechtem oder keinem Netz nach 3 s die gespeicherte Version starten
    const net = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put('index.html', c)); } return r; });
    const cached = () => caches.match('index.html', { ignoreSearch: true });
    const timeout = new Promise(res => setTimeout(res, 3000)).then(cached);
    e.respondWith(Promise.race([net.catch(cached), timeout.then(r => r || net)]).then(r => r || net));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
