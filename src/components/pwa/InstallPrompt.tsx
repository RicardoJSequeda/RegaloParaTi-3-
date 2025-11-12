'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(iOS)

    // Verificar si ya está instalada (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true
    setIsStandalone(standalone)
    setIsInstalled(standalone)

    if (standalone) {
      return
    }

    // Para Chrome/Edge en Android/Windows - escuchar beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    // Escuchar cuando se instala la app
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    // Verificar que el manifest existe y mostrar prompt si es necesario
    fetch('/manifest.webmanifest')
      .then(() => {
        // Si el manifest existe y hay service worker, mostrar prompt
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
              // Mostrar después de un delay para mejor UX (más corto en producción)
              const delay = process.env.NODE_ENV === 'development' ? 5000 : 3000
              setTimeout(() => {
                // Solo mostrar si no hay deferredPrompt (para iOS o cuando el navegador no muestra el evento)
                if (!deferredPrompt) {
                  setShowPrompt(true)
                }
              }, delay)
            }
          })
        }
      })
      .catch(() => {
        // Manifest no disponible, no mostrar prompt
      })

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [deferredPrompt])

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Chrome/Edge - usar el prompt nativo
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
          console.log('Usuario aceptó instalar la PWA')
          setIsInstalled(true)
        } else {
          console.log('Usuario rechazó instalar la PWA')
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
      } catch (error) {
        console.error('Error mostrando prompt de instalación:', error)
      }
    } else if (isIOS) {
      // iOS - mostrar instrucciones
      setShowPrompt(false)
      // Aquí podríamos mostrar un modal con instrucciones
      alert('Para instalar en iOS:\n1. Toca el botón de compartir\n2. Selecciona "Agregar a pantalla de inicio"')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Guardar en localStorage que el usuario rechazó el prompt
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Estado para controlar si se debe mostrar el prompt
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Verificar en el cliente si se debe mostrar
    if (typeof window === 'undefined') return

    // No mostrar si ya está instalada
    if (isInstalled || isStandalone) {
      setShouldShow(false)
      return
    }

    // Verificar si el usuario rechazó recientemente (últimas 12 horas, reducido para mejor UX)
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed && !deferredPrompt) {
      const dismissedTime = parseInt(dismissed, 10)
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60)
      if (hoursSinceDismissed < 12) {
        setShouldShow(false)
        return
      }
    }

    // Mostrar el prompt si:
    // 1. Hay deferredPrompt (Chrome/Edge)
    // 2. Es iOS (mostrar instrucciones)
    // 3. O si showPrompt es true (después de verificar manifest/SW)
    if (deferredPrompt || isIOS || showPrompt) {
      setShouldShow(true)
      return
    }

    // No mostrar si no hay ninguna condición
    setShouldShow(false)
  }, [isInstalled, isStandalone, showPrompt, deferredPrompt, isIOS])

  // No mostrar si no debería mostrarse
  if (!shouldShow || isInstalled || isStandalone) {
    return null
  }

  // Si es iOS, mostrar instrucciones diferentes
  if (isIOS && !deferredPrompt) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 shadow-2xl border-2 border-pink-500 animate-in slide-in-from-bottom-5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Instalar App
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Instala DetalleParaTi en tu iPhone/iPad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
            <li>Toca el botón de compartir</li>
            <li>Selecciona "Agregar a pantalla de inicio"</li>
            <li>Confirma la instalación</li>
          </ol>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Cerrar
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Prompt para Chrome/Edge/Android
  return (
    <Card className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 shadow-2xl border-2 border-pink-500 animate-in slide-in-from-bottom-5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5" />
            Instalar App
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Instala DetalleParaTi en tu dispositivo para acceso rápido y funcionamiento offline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          onClick={handleInstall} 
          className="w-full" 
          size="lg"
          disabled={!deferredPrompt && !isIOS}
        >
          <Download className="mr-2 h-4 w-4" />
          {deferredPrompt ? 'Instalar Ahora' : 'Instalar'}
        </Button>
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="w-full"
          size="sm"
        >
          Ahora no
        </Button>
      </CardContent>
    </Card>
  )
}

