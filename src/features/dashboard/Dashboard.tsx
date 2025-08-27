'use client'

import { useState } from 'react'
import { Section } from '@/types'
import { Navigation } from '@/components/ui/navigation'
import { FloatingHearts } from '@/components/ui/floating-hearts'
import { ContentSection } from '@/components/sections/ContentSection'
import { navigationItems } from './navigation'
import { useFloatingHearts } from '@/hooks/useFloatingHearts'
import { usePreferences } from '@/hooks/usePreferences'

interface DashboardProps {
  onLogout: () => void
  onToggleDarkMode: () => void
  isDarkMode: boolean
}

export function Dashboard({ onLogout, onToggleDarkMode, isDarkMode }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>('inicio')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const hearts = useFloatingHearts()
  const { preferences } = usePreferences()

  // Determinar si mostrar corazones flotantes
  const shouldShowHearts = preferences.showFloatingHearts && 
    (!isDarkMode || preferences.floatingHeartsInDarkMode)

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation
        navigationItems={navigationItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
        onLogout={onLogout}
        onToggleDarkMode={onToggleDarkMode}
        isDarkMode={isDarkMode}
      />

      {/* Contenido principal - Mejorado para móvil */}
      <main className="flex-1 lg:ml-72">
        <div className="p-3 sm:p-4 md:p-6">
          <ContentSection section={activeSection} />
        </div>
      </main>

      {/* Corazones flotantes - mostrar según preferencias del usuario */}
      {shouldShowHearts && <FloatingHearts hearts={hearts} />}
    </div>
  )
}
