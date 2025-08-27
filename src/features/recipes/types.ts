export interface Recipe {
  id: string
  title: string
  description: string
  category: 'desayuno' | 'almuerzo' | 'cena' | 'postre' | 'bebida' | 'snack' | 'sopa' | 'ensalada' | 'pasta' | 'carne' | 'pescado' | 'vegetariano' | 'vegano' | 'otro'
  servings: number
  ingredients: string[]
  instructions: string[]
  isFavorite?: boolean
  rating?: number
  tags: string[]
  images?: string[]
  created_at?: string
  updated_at?: string
}

export interface RecipeForm {
  title: string
  description: string
  category: Recipe['category']
  servings: number
  ingredients: string[]
  instructions: string[]
  tags: string[]
  images: File[]
}
