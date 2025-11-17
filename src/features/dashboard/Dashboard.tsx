'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Section } from '@/types'
import { Navigation } from '@/components/ui/navigation'
import { FloatingHearts } from '@/components/ui/floating-hearts'
import { ContentSection } from '@/components/sections/ContentSection'
import { navigationItems } from './navigation'
import { useFloatingHearts } from '@/hooks/useFloatingHearts'
import { usePreferences } from '@/hooks/usePreferences'
import { notificationService } from '@/services/notification-service'
import { useNotifications } from '@/hooks/useNotifications'

interface DashboardProps {
  // @ts-ignore - Next.js warning: Valid React callbacks in client components, not Server Actions. Safe to ignore.
  onLogout: () => void
  // @ts-ignore - Next.js warning: Valid React callback in client component
  onToggleDarkMode: () => void
  isDarkMode: boolean
}

// @ts-ignore - Next.js warnings: Valid React callbacks in client components, not Server Actions
export function Dashboard({ onLogout, onToggleDarkMode, isDarkMode }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>('inicio')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const hearts = useFloatingHearts()
  const { preferences } = usePreferences()
  const { permission } = useNotifications()

  // Memoizar función de cambio de sección para prevenir re-renders
  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section)
  }, [])

  // Configurar sistema de notificaciones
  useEffect(() => {
    // Escuchar eventos de click en notificaciones
    const handleNotificationClick = (event: CustomEvent<{ section: Section }>) => {
      const section = event.detail.section
      if (section) {
        handleSectionChange(section)
        // Cerrar sidebar móvil si está abierto
        setSidebarOpen(false)
      }
    }

    window.addEventListener('notificationclick', handleNotificationClick as EventListener)

    // Iniciar servicio de notificaciones si los permisos están otorgados
    if (permission === 'granted') {
      notificationService.start()
    }

    return () => {
      window.removeEventListener('notificationclick', handleNotificationClick as EventListener)
      notificationService.stop()
    }
  }, [permission, handleSectionChange])

  // Memoizar función de toggle sidebar
  const handleSidebarToggle = useCallback((open: boolean) => {
    setSidebarOpen(open)
  }, [])

  // Determinar si mostrar corazones flotantes (memoizado)
  const shouldShowHearts = useMemo(() => 
    preferences.showFloatingHearts && 
    (!isDarkMode || preferences.floatingHeartsInDarkMode),
    [preferences.showFloatingHearts, preferences.floatingHeartsInDarkMode, isDarkMode]
  )

  // Memoizar padding del contenedor - padding simétrico para centrado perfecto
  const containerPadding = 'p-3 sm:p-4 md:p-6'

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation
        navigationItems={navigationItems}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={handleSidebarToggle}
        onLogout={onLogout}
        onToggleDarkMode={onToggleDarkMode}
        isDarkMode={isDarkMode}
      />

      {/* Contenido principal - Mejorado para móvil */}
      <main className="flex-1 lg:ml-72">
        <div className={containerPadding}>
          <ContentSection section={activeSection} />
        </div>
      </main>

      {/* Corazones flotantes - mostrar según preferencias del usuario */}
      {shouldShowHearts && <FloatingHearts hearts={hearts} />}
    </div>
  )
}
