'use client'

import { lazy, Suspense, memo } from 'react'
import { Section } from '@/types'
import { InicioSection } from './InicioSection'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorBoundary } from '@/components/ui/error-boundary'

// Lazy load de secciones pesadas para code splitting
// Usar importaciones directas más simples y robustas
const RecuerdosSection = lazy(() => 
  import('./RecuerdosSection').then(mod => ({ default: mod.RecuerdosSection }))
)
const MensajesSection = lazy(() => 
  import('./MensajesSection').then(mod => ({ default: mod.MensajesSection }))
)
const RegalosSection = lazy(() => 
  import('./RegalosSection').then(mod => ({ default: mod.RegalosSection }))
)
const DiarioSection = lazy(() => 
  import('./DiarioSection').then(mod => ({ default: mod.DiarioSection }))
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
const MetasSection = lazy(() => 
  import('./MetasSection').then(mod => ({ default: mod.MetasSection }))
)
// Default exports (sin transformación necesaria)
const MusicaSection = lazy(() => import('./MusicaSection'))
const SorpresaSection = lazy(() => import('./SorpresaSection'))
const FotosSection = lazy(() => import('./FotosSection'))

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
    case 'sorpresa':
      return <SorpresaSection />
    case 'regalos':
      return <RegalosSection />
    case 'diario':
      return <DiarioSection />
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
    case 'metas':
      return <MetasSection />
    default:
      return <InicioSection />
  }
}
