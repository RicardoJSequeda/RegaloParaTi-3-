'use client'

import { useEffect, useState } from 'react'
import { LoginForm } from '@/features/auth/LoginForm'
import { Dashboard } from '@/features/dashboard/Dashboard'
import { useAuth } from '@/hooks/useAuth'
import { useDarkMode } from '@/hooks/useDarkMode'

// Wrapper para evitar SSR
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px'
      }}>
        Cargando...
      </div>
    )
  }

  return <>{children}</>
}

// Deshabilitar completamente el prerendering
export const dynamic = 'force-dynamic'
// En Next.js 14.2+, con dynamic = 'force-dynamic', no necesitamos revalidate ni fetchCache
// Remover runtime edge para evitar problemas con hooks y módulos

export default function Home() {
  return (
    <ClientOnly>
      <HomeContent />
    </ClientOnly>
  )
}

function HomeContent() {
  const { isLoggedIn, login, logout, isInitialized: authInitialized } = useAuth()
  const { isDarkMode, toggleDarkMode, isInitialized: themeInitialized } = useDarkMode()

  // Mostrar loading hasta que ambos hooks estén inicializados
  if (!authInitialized || !themeInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: isDarkMode ? '#fff' : '#000'
      }}>
        Cargando...
      </div>
    )
  }

  return (
    <main>
      {!isLoggedIn ? (
        <LoginForm 
          onLogin={login} 
          onToggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
        />
      ) : (
        <Dashboard 
          onLogout={logout}
          onToggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
        />
      )}
    </main>
  )
}
