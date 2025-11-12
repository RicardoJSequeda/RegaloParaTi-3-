// Service Worker para PWA
const CACHE_NAME = 'detalleparati-v1'
const STATIC_CACHE_NAME = 'detalleparati-static-v1'
const DYNAMIC_CACHE_NAME = 'detalleparati-dynamic-v1'

// Assets estáticos a cachear
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/offline.html',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Estrategia: Cache First para assets estáticos, Network First para API
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  /\.(?:js|css)$/,
  /^\/icons\//,
  /^\/images\//,
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets')
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
      })
      .catch((error) => {
        console.error('[Service Worker] Error caching static assets:', error)
      })
  )
  // Activar el service worker inmediatamente
  self.skipWaiting()
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar caches antiguos
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Tomar control de todas las páginas
  return self.clients.claim()
})

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requests que no son HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Ignorar requests de API en modo desarrollo
  if (url.pathname.startsWith('/api/') && process.env.NODE_ENV === 'development') {
    return
  }

  // Estrategia Cache First para assets estáticos
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Estrategia Network First para páginas y API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME))
    return
  }

  // Para páginas HTML, usar Network First con fallback a cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME))
    return
  }

  // Para otros recursos, usar Network First
  event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME))
})

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME)
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[Service Worker] Cache First error:', error)
    // Intentar devolver una respuesta offline si está disponible
    const cache = await caches.open(STATIC_CACHE_NAME)
    return cache.match(request) || new Response('Offline', { status: 503 })
  }
}

// Estrategia Network First
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', error)
    const cache = await caches.open(cacheName)
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    
    // Si es una página HTML y no hay cache, devolver página offline
    if (request.headers.get('accept')?.includes('text/html')) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      return cache.match('/') || new Response('Offline', { status: 503 })
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls)
      })
    )
  }
})

// Sincronización en background (para cuando vuelva la conexión)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Aquí puedes agregar lógica para sincronizar datos cuando vuelva la conexión
  console.log('[Service Worker] Background sync')
}

