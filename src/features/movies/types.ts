export interface Movie {
  id: string
  title: string
  description: string
  type: 'pelicula' | 'serie'
  genre: 'romantico' | 'accion' | 'comedia' | 'drama' | 'terror' | 'ciencia_ficcion' | 'fantasia' | 'thriller' | 'animacion' | 'documental' | 'biografico' | 'historico' | 'musical' | 'western' | 'policial' | 'misterio' | 'aventura' | 'otro'
  image?: string
  watchLink?: string
  season?: number
  episode?: number
  status: 'visto' | 'pendiente' | 'en_progreso' | 'favorito'
  isFavorite: boolean
  created_at: string
  updated_at: string
}

export interface MovieForm {
  title: string
  description: string
  type: 'pelicula' | 'serie'
  genre: 'romantico' | 'accion' | 'comedia' | 'drama' | 'terror' | 'ciencia_ficcion' | 'fantasia' | 'thriller' | 'animacion' | 'documental' | 'biografico' | 'historico' | 'musical' | 'western' | 'policial' | 'misterio' | 'aventura' | 'otro'
  image?: string
  watchLink?: string
  season?: number
  episode?: number
  status: 'visto' | 'pendiente' | 'en_progreso' | 'favorito'
  isFavorite: boolean
}
