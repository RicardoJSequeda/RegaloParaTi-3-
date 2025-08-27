'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { 
  ChefHat, 
  Heart, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Clock, 
  Users, 
  Star,
  Camera,
  X,
  Save,
  Image as ImageIcon,
  Timer,
  Utensils,
  Flame,
  Leaf,
  Coffee,
  Cake,
  Pizza,
  Fish,
  Beef,
  Salad,
  Soup,
  Dessert,
  Loader2,
  BookOpen,
  ChefHat as ChefHatIcon,
  Lightbulb,
  CheckCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { uploadPublicFile } from '@/lib/supabase/storage'
import { Recipe, RecipeForm } from '@/features/recipes/types'

const categories = [
  { value: 'desayuno', label: 'Desayuno', icon: '🌅' },
  { value: 'almuerzo', label: 'Almuerzo', icon: '🍽️' },
  { value: 'cena', label: 'Cena', icon: '🌙' },
  { value: 'postre', label: 'Postre', icon: '🍰' },
  { value: 'bebida', label: 'Bebida', icon: '🥤' },
  { value: 'snack', label: 'Snack', icon: '🍿' },
  { value: 'sopa', label: 'Sopa', icon: '🍲' },
  { value: 'ensalada', label: 'Ensalada', icon: '🥗' },
  { value: 'pasta', label: 'Pasta', icon: '🍝' },
  { value: 'carne', label: 'Carne', icon: '🥩' },
  { value: 'pescado', label: 'Pescado', icon: '🐟' },
  { value: 'vegetariano', label: 'Vegetariano', icon: '🥬' },
  { value: 'vegano', label: 'Vegano', icon: '🌱' },
  { value: 'otro', label: 'Otro', icon: '🍴' }
]



const predefinedTags = [
  'Romántico', 'Fácil', 'Rápido', 'Saludable', 'Picante', 'Dulce', 'Salado', 'Sin Gluten',
  'Sin Lactosa', 'Bajo en Calorías', 'Proteína', 'Favorito', 'Tradicional', 'Innovador'
]

export function RecetasSection() {
  const supabase = getBrowserClient()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cargar recetas
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading recipes:', error)
        } else {
          setRecipes(data || [])
        }
      } catch (error) {
        console.error('Error in loadRecipes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecipes()

    // Real-time updates
    const channel = supabase
      .channel('recipes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => loadRecipes())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Limpiar notificación automáticamente
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')


  const [recipeForm, setRecipeForm] = useState<RecipeForm>({
    title: '',
    description: '',
    category: 'cena',
    servings: 2,
    ingredients: [''],
    instructions: [''],
    tags: [],
    images: []
  })

  // Estadísticas
  const stats = {
    totalRecipes: recipes.length,
    averageRating: (() => {
      const ratedRecipes = recipes.filter(r => r.rating && r.rating > 0)
      if (ratedRecipes.length === 0) return 0
      const totalRating = ratedRecipes.reduce((sum, r) => sum + (r.rating || 0), 0)
      return totalRating / ratedRecipes.length
    })(),
    favoriteRecipes: recipes.filter(r => r.isFavorite).length,
    mostPopularCategory: getMostPopularCategory()
  }

  function getMostPopularCategory() {
    if (recipes.length === 0) return 'N/A'
    const categoryCounts = recipes.reduce((acc, recipe) => {
      const category = recipe.category || 'otro'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const entries = Object.entries(categoryCounts)
    if (entries.length === 0) return 'N/A'
    
    return entries.reduce((a, b) => categoryCounts[a[0]] > categoryCounts[b[0]] ? a : b)[0]
  }

  // Filtrar recetas
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'Todas' || recipe.category === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  const openAddModal = () => {
    setRecipeForm({
      title: '',
      description: '',
      category: 'cena',
      servings: 2,
      ingredients: [''],
      instructions: [''],
      tags: [],
      images: []
    })
    setShowAddModal(true)
  }

  const openEditModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setRecipeForm({
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      servings: recipe.servings,
      ingredients: [...recipe.ingredients],
      instructions: [...recipe.instructions],
      tags: [...recipe.tags],
      images: []
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setShowDeleteModal(true)
  }

  const openInstructionsModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setShowInstructionsModal(true)
  }

  const handleSaveRecipe = async () => {
    if (!recipeForm.title || !recipeForm.description) {
      setNotification({ type: 'error', message: 'El título y la descripción son obligatorios' })
      return
    }

    try {
      setSaving(true)
    let imageUrls: string[] = []

      // Subir imágenes si hay nuevas
    if (recipeForm.images.length > 0) {
        const uploads = await Promise.all(
          recipeForm.images.map((file, idx) => 
            uploadPublicFile('recipe-images', file, `recipes/${Date.now()}-${idx}/`)
          )
        )
        imageUrls = uploads.map(u => u.url)
      }

      const payload = {
        title: recipeForm.title.trim(),
        description: recipeForm.description.trim(),
        category: recipeForm.category,
        servings: recipeForm.servings || 1,
        ingredients: recipeForm.ingredients.filter(ing => ing.trim() !== ''),
        instructions: recipeForm.instructions.filter(inst => inst.trim() !== ''),
        "isFavorite": selectedRecipe?.isFavorite || false,
        rating: selectedRecipe?.rating || null,
        tags: recipeForm.tags || [],
        images: imageUrls.length > 0 ? imageUrls : (selectedRecipe?.images || [])
      }

             if (showEditModal && selectedRecipe) {
         // Editar receta existente
         const response = await fetch(`/api/recipes/${selectedRecipe.id}`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload)
         })

         if (response.ok) {
           const updatedRecipe = await response.json()
           setRecipes(prev => prev.map(r => r.id === selectedRecipe.id ? updatedRecipe : r))
           setShowEditModal(false)
           setSelectedRecipe(null)
           setNotification({ type: 'success', message: '¡Receta actualizada exitosamente!' })
         } else {
           const errorData = await response.json().catch(() => ({}))
           console.error('Error response:', response.status, errorData)
           const errorMessage = errorData.details || errorData.error || `Error ${response.status}`
           setNotification({ type: 'error', message: `Error al actualizar la receta: ${errorMessage}` })
         }
       } else {
         // Agregar nueva receta
         const response = await fetch('/api/recipes', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload)
         })

         if (response.ok) {
           const newRecipe = await response.json()
      setRecipes(prev => [newRecipe, ...prev])
      setShowAddModal(false)
           setNotification({ type: 'success', message: '¡Receta creada exitosamente!' })
         } else {
           const errorData = await response.json().catch(() => ({}))
           console.error('Error response:', response.status, errorData)
           const errorMessage = errorData.details || errorData.error || `Error ${response.status}`
           setNotification({ type: 'error', message: `Error al crear la receta: ${errorMessage}` })
         }
       }
         } catch (error) {
       console.error('Error saving recipe:', error)
       setNotification({ type: 'error', message: 'Error al guardar la receta' })
     } finally {
       setSaving(false)
     }
  }

  const handleDeleteRecipe = async () => {
    if (!selectedRecipe) return

    try {
      const response = await fetch(`/api/recipes/${selectedRecipe.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
      setRecipes(prev => prev.filter(r => r.id !== selectedRecipe.id))
      setShowDeleteModal(false)
      setSelectedRecipe(null)
      }
    } catch (error) {
      console.error('Error deleting recipe:', error)
    }
  }

  const toggleFavorite = async (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId)
    if (!recipe) return

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !recipe.isFavorite })
      })

      if (response.ok) {
    setRecipes(prev => prev.map(r => 
      r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r
    ))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setRecipeForm(prev => ({ ...prev, images: [...prev.images, ...imageFiles] }))
  }

  const removeImage = (index: number) => {
    setRecipeForm(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }))
  }

  const addIngredient = () => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }))
  }

  const removeIngredient = (index: number) => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const updateIngredient = (index: number, value: string) => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }))
  }

  const addInstruction = () => {
    setRecipeForm(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const removeInstruction = (index: number) => {
    setRecipeForm(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setRecipeForm(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }))
  }

  const handleTagToggle = (tag: string) => {
    setRecipeForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '🍴'
  }



  const formatTime = (minutes: number) => {
    if (!minutes || minutes <= 0) return '0 min'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">Cargando recetas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden">
       {/* Notificación */}
       {notification && (
         <div className={`fixed top-4 right-4 z-50 p-3 sm:p-4 rounded-lg shadow-lg flex items-center gap-2 sm:gap-3 transition-all duration-300 ${
           notification.type === 'success' 
             ? 'bg-green-100 border border-green-300 text-green-800' 
             : 'bg-red-100 border border-red-300 text-red-800'
         }`}>
           {notification.type === 'success' ? (
             <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
           ) : (
             <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
           )}
           <span className="font-medium text-[clamp(0.8rem,2vw,0.9rem)]">{notification.message}</span>
           <button
             onClick={() => setNotification(null)}
             className="ml-2 text-gray-500 hover:text-gray-700"
           >
             <X className="h-3 w-3 sm:h-4 sm:w-4" />
           </button>
         </div>
       )}

      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-3 px-2">
        <h1 className="text-[clamp(1.5rem,5vw,2.5rem)] font-bold text-gray-900 dark:text-white flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-pink-500" />
          Nuestras Recetas de Amor
        </h1>
        <p className="text-[clamp(0.9rem,3vw,1.1rem)] text-gray-600 dark:text-gray-300 max-w-full sm:max-w-2xl mx-auto px-2">
          Comparte y guarda tus recetas favoritas para cocinar juntos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2 px-3 sm:px-4 lg:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 scroll-horizontal">
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl flex-shrink-0 sm:flex-shrink min-w-[140px] sm:min-w-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[clamp(0.8rem,2.5vw,0.9rem)] text-pink-600 dark:text-pink-400 font-medium">Total Recetas</p>
                <p className="text-[clamp(1.2rem,4vw,2rem)] font-bold text-pink-700 dark:text-pink-300">{stats.totalRecipes}</p>
              </div>
              <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl flex-shrink-0 sm:flex-shrink min-w-[140px] sm:min-w-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[clamp(0.8rem,2.5vw,0.9rem)] text-green-600 dark:text-green-400 font-medium">Promedio</p>
                 <p className="text-[clamp(1.2rem,4vw,2rem)] font-bold text-green-700 dark:text-green-300">
                   {stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} ⭐` : 'Sin calificaciones'}
                 </p>
              </div>
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl flex-shrink-0 sm:flex-shrink min-w-[140px] sm:min-w-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[clamp(0.8rem,2.5vw,0.9rem)] text-yellow-600 dark:text-yellow-400 font-medium">Favoritas</p>
                <p className="text-[clamp(1.2rem,4vw,2rem)] font-bold text-yellow-700 dark:text-yellow-300">{stats.favoriteRecipes}</p>
              </div>
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl overflow-hidden mx-3 sm:mx-0">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar recetas..."
                  className="pl-10 border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-40 border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.label}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={openAddModal}
              className="bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-4 sm:px-6 py-2 sm:py-3 rounded-full w-full sm:w-auto text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Receta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Recetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-3 sm:px-0">
        {filteredRecipes.map((recipe) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl overflow-hidden ${
              recipe.isFavorite ? 'ring-2 ring-pink-200 bg-pink-50 dark:bg-pink-900/20' : ''
              }`}
              onClick={() => openInstructionsModal(recipe)}
            >
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {/* Imagen */}
                  <div className="relative">
                    {recipe.images && recipe.images.length > 0 ? (
                      <AspectRatio ratio={16/9} className="rounded-lg overflow-hidden">
                        <img 
                          src={recipe.images[0]} 
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    ) : (
                      <div className="w-full h-24 sm:h-32 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg flex items-center justify-center">
                        <Utensils className="h-8 w-8 sm:h-12 sm:w-12 text-orange-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 text-[clamp(0.6rem,1.5vw,0.7rem)]">
                        {getCategoryIcon(recipe.category)} {categories.find(c => c.value === recipe.category)?.label}
                      </Badge>
                    </div>

                    {/* Botones de acción */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(recipe.id)
                        }}
                      >
                        <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${recipe.isFavorite ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(recipe)
                        }}
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteModal(recipe)
                        }}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-[clamp(0.9rem,2.5vw,1rem)]">{recipe.title}</h3>
                      {recipe.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />
                          <span className="text-[clamp(0.7rem,1.8vw,0.8rem)] text-gray-500 dark:text-gray-400">{recipe.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-[clamp(0.8rem,2vw,0.9rem)] text-gray-600 dark:text-gray-400 line-clamp-2">{recipe.description}</p>
                    
                    <div className="flex items-center gap-4 text-[clamp(0.7rem,1.8vw,0.8rem)] text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{recipe.servings} porciones</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-[clamp(0.6rem,1.5vw,0.7rem)] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            {tag}
                          </Badge>
                        ))}
                        {recipe.tags.length > 3 && (
                          <Badge variant="outline" className="text-[clamp(0.6rem,1.5vw,0.7rem)] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            +{recipe.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Indicador de instrucciones */}
                    <div className="flex items-center justify-center pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex items-center gap-1 text-[clamp(0.7rem,1.8vw,0.8rem)] text-pink-500 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-full border border-pink-200 dark:border-pink-700">
                        <BookOpen className="h-3 w-3" />
                        <span>Haz clic para ver instrucciones</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal para Agregar/Editar Receta */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={() => {
        setShowAddModal(false)
        setShowEditModal(false)
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-0 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[clamp(1.2rem,3vw,1.5rem)]">
              <ChefHat className="h-5 w-5 text-pink-500" />
              {showEditModal ? 'Editar Receta' : 'Nueva Receta'}
            </DialogTitle>
            <DialogDescription className="text-[clamp(0.9rem,2.5vw,1rem)]">
              Comparte tu receta especial con todos los detalles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de la Receta *
                </label>
                <Input
                  value={recipeForm.title}
                  onChange={(e) => setRecipeForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Pasta Carbonara Romántica"
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                />
              </div>


            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción *
              </label>
              <textarea
                value={recipeForm.description}
                onChange={(e) => setRecipeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe tu receta..."
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:border-pink-500 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <Select value={recipeForm.category} onValueChange={(value: Recipe['category']) => setRecipeForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Porciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Porciones
              </label>
              <Input
                type="number"
                value={recipeForm.servings}
                onChange={(e) => setRecipeForm(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                min="1"
                className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
              />
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredientes *
              </label>
              <div className="space-y-2">
                {recipeForm.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder={`Ingrediente ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      disabled={recipeForm.ingredients.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIngredient}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ingrediente
                </Button>
              </div>
            </div>

            {/* Instrucciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instrucciones *
              </label>
              <div className="space-y-2">
                {recipeForm.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <Input
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Paso ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                      disabled={recipeForm.instructions.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addInstruction}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Paso
                </Button>
              </div>
            </div>



            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Etiquetas
              </label>
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={recipeForm.tags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer text-[clamp(0.7rem,1.8vw,0.8rem)] ${recipeForm.tags.includes(tag) ? 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-700' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imágenes (Opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-3 sm:p-4 text-center hover:border-pink-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="recipe-images"
                />
                <label htmlFor="recipe-images" className="cursor-pointer">
                  <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-[clamp(0.8rem,2vw,0.9rem)] text-gray-600 dark:text-gray-400">Haz clic para agregar imágenes</p>
                </label>
              </div>
              
              {recipeForm.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {recipeForm.images.map((image, index) => (
                    <div key={index} className="relative">
                      <AspectRatio ratio={1} className="rounded-lg overflow-hidden">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Vista previa ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-5 w-5 sm:h-6 sm:w-6 p-0 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3 sm:h-3 sm:w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveRecipe}
              disabled={!recipeForm.title || !recipeForm.description || saving}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
              <Save className="h-4 w-4 mr-2" />
              Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-white dark:bg-gray-800 border-0 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[clamp(1.2rem,3vw,1.5rem)]">
              <Trash2 className="h-5 w-5 text-red-500" />
              Eliminar Receta
            </DialogTitle>
            <DialogDescription className="text-[clamp(0.9rem,2.5vw,1rem)]">
              ¿Estás seguro de que quieres eliminar "{selectedRecipe?.title}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteRecipe}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Instrucciones */}
      <Dialog open={showInstructionsModal} onOpenChange={setShowInstructionsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-0 rounded-2xl">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[clamp(1.3rem,4vw,1.8rem)]">
                  <BookOpen className="h-6 w-6 text-pink-500" />
                  {selectedRecipe.title}
                </DialogTitle>
                <DialogDescription className="text-[clamp(1rem,3vw,1.2rem)]">
                  {selectedRecipe.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Información de la receta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                    <div>
                      <p className="text-[clamp(0.8rem,2vw,0.9rem)] text-gray-600 dark:text-gray-400">Preparación</p>
                      <p className="font-semibold text-[clamp(0.9rem,2.5vw,1rem)]">{formatTime((selectedRecipe as any).prepTime || (selectedRecipe as any).prep_time || 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                    <div>
                      <p className="text-[clamp(0.8rem,2vw,0.9rem)] text-gray-600 dark:text-gray-400">Cocción</p>
                      <p className="font-semibold text-[clamp(0.9rem,2.5vw,1rem)]">{formatTime((selectedRecipe as any).cookTime || (selectedRecipe as any).cook_time || 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    <div>
                      <p className="text-[clamp(0.8rem,2vw,0.9rem)] text-gray-600 dark:text-gray-400">Porciones</p>
                      <p className="font-semibold">{selectedRecipe.servings}</p>
                    </div>
                  </div>

                </div>

                {/* Imágenes */}
                {selectedRecipe.images && selectedRecipe.images.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Camera className="h-5 w-5 text-pink-500" />
                      Galería de Imágenes
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedRecipe.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <AspectRatio ratio={1} className="rounded-lg overflow-hidden">
                            <img 
                              src={image} 
                              alt={`${selectedRecipe.title} - Imagen ${index + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          </AspectRatio>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredientes */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-pink-500" />
                    Ingredientes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instrucciones */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-pink-500" />
                    Instrucciones
                  </h3>
                  <div className="space-y-3">
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>



                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Información
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Categoría:</span>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {getCategoryIcon(selectedRecipe.category)} {categories.find(c => c.value === selectedRecipe.category)?.label}
                        </Badge>
                      </div>

                      {selectedRecipe.rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Calificación:</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < selectedRecipe.rating! ? 'fill-current text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-1">({selectedRecipe.rating})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedRecipe.tags.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-pink-500" />
                        Etiquetas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipe.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowInstructionsModal(false)}
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setShowInstructionsModal(false)
                    openEditModal(selectedRecipe)
                  }}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Receta
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
