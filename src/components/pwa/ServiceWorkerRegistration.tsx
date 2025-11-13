'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Registrar el Service Worker SOLO en producción. Registrar en dev puede
    // interferir con el servidor de desarrollo (HMR, cambios de chunks) y
    // causar errores de carga de chunks (ChunkLoadError).
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Registrar el service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Service Worker] Registered successfully:', registration.scope)

          // Verificar actualizaciones cada hora
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)

          // Escuchar actualizaciones del service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Hay una nueva versión disponible
                  console.log('[Service Worker] New version available')
                  // Opcional: mostrar notificación al usuario
                  if (confirm('Hay una nueva versión disponible. ¿Deseas recargar?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('[Service Worker] Registration failed:', error)
        })

      // Escuchar mensajes del service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[Service Worker] Message received:', event.data)
      })

      // Manejar cuando el service worker toma control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[Service Worker] Controller changed')
        window.location.reload()
      })
    } else {
      // En entorno de desarrollo evitamos registrar el SW. Si ya existe uno
      // registrado (p. ej. por pruebas anteriores), intentamos no romper la
      // sesión del desarrollador y dejamos que sea el devtools quien lo
      // gestione. Se recomienda ir a Application > Service Workers y
      // desregistrarlo cuando se haga debugging.
    }
  }, [])

  return null
}

