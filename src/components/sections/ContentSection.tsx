'use client'

import { lazy, Suspense, memo, useEffect } from 'react'
import { Section } from '@/types'
import { InicioSection } from './InicioSection'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorBoundary } from '@/components/ui/error-boundary'

// Lazy load de secciones pesadas para code splitting con prefetching
// Usar importaciones directas más simples y robustas
const RecuerdosSection = lazy(() => 
  import('./RecuerdosSection').then(mod => ({ default: mod.RecuerdosSection }))
)
const MensajesSection = lazy(() => 
  import('./MensajesSection').then(mod => ({ default: mod.MensajesSection }))
)
const RecetasSection = lazy(() => 
  import('./RecetasSection').then(mod => ({ default: mod.RecetasSection }))
)
const PlanesSection = lazy(() => 
  import('./PlanesSection').then(mod => ({ default: mod.PlanesSection }))
)
const PeliculasSection = lazy(() => 
  import('./PeliculasSection').then(mod => ({ default: mod.PeliculasSection }))
)
const MascotasSection = lazy(() => 
  import('./MascotasSection').then(mod => ({ default: mod.MascotasSection }))
)
// Default exports (sin transformación necesaria)
const MusicaSection = lazy(() => import('./MusicaSection'))
const FotosSection = lazy(() => import('./FotosSection'))

// Prefetching de módulos para mejorar rendimiento de navegación
const prefetchModule = (moduleLoader: () => Promise<any>) => {
  // Prefetch en idle time para no bloquear la UI
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      moduleLoader()
    }, { timeout: 2000 })
  } else {
    // Fallback para navegadores sin requestIdleCallback
    setTimeout(() => {
      moduleLoader()
    }, 100)
  }
}

// Componente de loading optimizado
const SectionSkeleton = () => (
  <div className="space-y-4">
    <CardSkeleton />
    <ListSkeleton count={3} />
  </div>
)

interface ContentSectionProps {
  section: Section
}

// Memoizar el componente para prevenir re-renders innecesarios
export const ContentSection = memo(function ContentSection({ section }: ContentSectionProps) {
  // Prefetch módulos adyacentes para mejorar navegación
  useEffect(() => {
    // Prefetch módulos comunes cuando el usuario está en inicio
    if (section === 'inicio') {
      prefetchModule(() => import('./MensajesSection'))
      prefetchModule(() => import('./RecuerdosSection'))
    }
  }, [section])

  return (
    <ErrorBoundary>
      <Suspense fallback={<SectionSkeleton />}>
        {renderSection(section)}
      </Suspense>
    </ErrorBoundary>
  )
})

function renderSection(section: Section) {
  switch (section) {
    case 'inicio':
      // InicioSection se carga inmediatamente ya que es la primera vista
      return <InicioSection />
    case 'recuerdos':
      return <RecuerdosSection />
    case 'mensajes':
      return <MensajesSection />
    case 'musica':
      return <MusicaSection />
    case 'recetas':
      return <RecetasSection />
    case 'planes':
      return <PlanesSection />
    case 'peliculas':
      return <PeliculasSection />
    case 'fotos':
      return <FotosSection />
    case 'mascotas':
      return <MascotasSection />
    default:
      return <InicioSection />
  }
}
