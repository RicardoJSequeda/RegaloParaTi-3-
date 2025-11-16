import { NavigationItem } from '@/types'
import { Home, Image, MessageCircle, Music, Calendar, Camera, ChefHat, Film, PawPrint } from 'lucide-react'

export const navigationItems: NavigationItem[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'recuerdos', label: 'Nuestros Recuerdos', icon: Image },
  { id: 'mensajes', label: 'Mensajes Especiales', icon: MessageCircle },
  { id: 'musica', label: 'Nuestras Canciones', icon: Music },
  { id: 'recetas', label: 'Nuestras Recetas', icon: ChefHat },
  { id: 'peliculas', label: 'Películas y Series', icon: Film },
  { id: 'planes', label: 'Nuestros Planes', icon: Calendar },
  { id: 'fotos', label: 'Nuestras Fotos', icon: Camera },
  { id: 'mascotas', label: 'Cuidado de Mascotas', icon: PawPrint },
]
