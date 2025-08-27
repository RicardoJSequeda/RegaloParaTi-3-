'use client'

import { Section } from '@/types'
import { InicioSection } from './InicioSection'
import { RecuerdosSection } from './RecuerdosSection'
import { MensajesSection } from './MensajesSection'
import MusicaSection from './MusicaSection'
import SorpresaSection from './SorpresaSection'
import { RegalosSection } from './RegalosSection'
import { DiarioSection } from './DiarioSection'
import { RecetasSection } from './RecetasSection'
import { PlanesSection } from './PlanesSection'
import { PeliculasSection } from './PeliculasSection'
import FotosSection from './FotosSection'
import { MascotasSection } from './MascotasSection'
import { MetasSection } from './MetasSection'

interface ContentSectionProps {
  section: Section
}

export function ContentSection({ section }: ContentSectionProps) {
  switch (section) {
    case 'inicio':
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
