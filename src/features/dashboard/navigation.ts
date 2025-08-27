import { NavigationItem } from '@/types'
import { Home, Image, MessageCircle, Music, Gift, Calendar, Camera, Package, BookOpen, ChefHat, Film, PawPrint, Target } from 'lucide-react'

export const navigationItems: NavigationItem[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'recuerdos', label: 'Nuestros Recuerdos', icon: Image },
  { id: 'mensajes', label: 'Mensajes Especiales', icon: MessageCircle },
  { id: 'musica', label: 'Nuestra Música', icon: Music },
  { id: 'sorpresa', label: 'Sorpresa', icon: Gift },
  { id: 'regalos', label: 'Regalos y Sorpresas', icon: Package },
  { id: 'diario', label: 'Nuestro Diario', icon: BookOpen },
  { id: 'recetas', label: 'Nuestras Recetas', icon: ChefHat },
  { id: 'peliculas', label: 'Películas y Series', icon: Film },
  { id: 'planes', label: 'Nuestros Planes', icon: Calendar },
  { id: 'fotos', label: 'Nuestras Fotos', icon: Camera },
  { id: 'mascotas', label: 'Cuidado de Mascotas', icon: PawPrint },
  { id: 'metas', label: 'Metas y Sueños', icon: Target },
]
