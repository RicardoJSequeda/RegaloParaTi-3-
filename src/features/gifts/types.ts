export interface Gift {
  id: string
  name: string
  description: string
  category: 'romantico' | 'practico' | 'tecnologico' | 'moda' | 'hogar' | 'experiencia' | 'otro'
  type: 'deseo' | 'recibido' | 'regalado'
  image?: string
  rating?: number
  isFavorite: boolean
  purchased: boolean
  recipient: 'yo' | 'pareja' | 'ambos'
  created_at?: string
  updated_at?: string
}

export interface GiftForm {
  name: string
  description: string
  category: Gift['category']
  type: Gift['type']
  recipient: Gift['recipient']
  image: File | null
}
