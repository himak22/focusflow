const CACHE = 'focusflow-v1'

const PRECACHE = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.webmanifest',
]

// Instalar: precachear shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  )
  self.skipWaiting()
})

// Activar: limpiar caches viejos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: network-first para HTML, cache-first para assets
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    // Navegación: network con fallback a cache
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    )
    return
  }

  // Assets: cache con fallback a network
  e.respondWith(
    caches.match(e.request).then(
      (cached) => cached ?? fetch(e.request).then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, clone))
        return res
      })
    )
  )
})
