'use client'

import { lazy, Suspense, memo } from 'react'
import { Section } from '@/types'
import { InicioSection } from './InicioSection'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'

// Lazy load de secciones pesadas para code splitting
const RecuerdosSection = lazy(() => import('./RecuerdosSection').then(m => ({ default: m.RecuerdosSection })))
const MensajesSection = lazy(() => import('./MensajesSection').then(m => ({ default: m.MensajesSection })))
const MusicaSection = lazy(() => import('./MusicaSection').then(m => ({ default: m.default })))
const SorpresaSection = lazy(() => import('./SorpresaSection').then(m => ({ default: m.default })))
const RegalosSection = lazy(() => import('./RegalosSection').then(m => ({ default: m.RegalosSection })))
const DiarioSection = lazy(() => import('./DiarioSection').then(m => ({ default: m.DiarioSection })))
const RecetasSection = lazy(() => import('./RecetasSection').then(m => ({ default: m.RecetasSection })))
const PlanesSection = lazy(() => import('./PlanesSection').then(m => ({ default: m.PlanesSection })))
const PeliculasSection = lazy(() => import('./PeliculasSection').then(m => ({ default: m.PeliculasSection })))
const FotosSection = lazy(() => import('./FotosSection').then(m => ({ default: m.default })))
const MascotasSection = lazy(() => import('./MascotasSection').then(m => ({ default: m.MascotasSection })))
const MetasSection = lazy(() => import('./MetasSection').then(m => ({ default: m.MetasSection })))

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
    <Suspense fallback={<SectionSkeleton />}>
      {renderSection(section)}
    </Suspense>
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
