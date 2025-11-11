'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Escuchar el evento beforeinstallprompt
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

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Mostrar el prompt de instalación
    deferredPrompt.prompt()

    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la PWA')
      setIsInstalled(true)
    } else {
      console.log('Usuario rechazó instalar la PWA')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Guardar en localStorage que el usuario rechazó el prompt
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // No mostrar si ya está instalada o si el usuario rechazó recientemente
  if (isInstalled || !showPrompt) {
    return null
  }

  // Verificar si el usuario rechazó recientemente (últimas 24 horas)
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (dismissed) {
    const dismissedTime = parseInt(dismissed, 10)
    const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60)
    if (hoursSinceDismissed < 24) {
      return null
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm shadow-lg border-2 border-pink-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Instalar App</CardTitle>
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
        <Button onClick={handleInstall} className="w-full" size="lg">
          <Download className="mr-2 h-4 w-4" />
          Instalar Ahora
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

