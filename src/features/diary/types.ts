export interface DiaryEntry {
  id: string
  title: string
  content: string
  date: string
  mood: 'muy_feliz' | 'feliz' | 'tranquilo' | 'nostalgico' | 'emocionado' | 'romantico' | 'melancolico' | 'energico'
  weather: 'soleado' | 'nublado' | 'lluvioso' | 'ventoso' | 'frio' | 'caluroso'
  location?: string
  author: 'yo' | 'pareja' | 'ambos'
  isPrivate: boolean
  isFavorite: boolean
  tags: string[]
  images?: string[]
  wordCount: number
  created_at?: string
  updated_at?: string
}

export interface DiaryEntryForm {
  title: string
  content: string
  date: string
  mood: DiaryEntry['mood']
  weather: DiaryEntry['weather']
  location: string
  author: DiaryEntry['author']
  isPrivate: boolean
  tags: string[]
  images: File[]
}
