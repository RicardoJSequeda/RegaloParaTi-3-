'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { 
  Gift, 
  Heart, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  Smile, 
  Camera,
  X,
  Save,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { uploadPublicFile } from '@/lib/supabase/storage'
import { Gift as GiftType, GiftForm } from '@/features/gifts/types'

// Usar el tipo de GiftType importado

const categories = [
  { value: 'romantico', label: 'Romántico', icon: '💕' },
  { value: 'practico', label: 'Práctico', icon: '🛠️' },
  { value: 'tecnologico', label: 'Tecnológico', icon: '📱' },
  { value: 'moda', label: 'Moda', icon: '👗' },
  { value: 'hogar', label: 'Hogar', icon: '🏠' },
  { value: 'experiencia', label: 'Experiencia', icon: '🎯' },
  { value: 'otro', label: 'Otro', icon: '🎁' }
]

const occasions = [
  'Cumpleaños',
  'Aniversario',
  'San Valentín',
  'Navidad',
  'Día de la Madre',
  'Día del Padre',
  'Graduación',
  'Promoción',
  'Sin ocasión especial',
  'Sorpresa'
]

export function RegalosSection() {
  const [gifts, setGifts] = useState<GiftType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('Todos')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [selectedType, setSelectedType] = useState('Todos')

  const [giftForm, setGiftForm] = useState<GiftForm>({
    name: '',
    description: '',
    category: 'romantico',
    type: 'deseo',
    recipient: 'pareja',
    image: null
  })

  // Cargar regalos desde Supabase
  useEffect(() => {
    const fetchGifts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/gifts')
        if (response.ok) {
          const data = await response.json()
          setGifts(data)
        } else {
          console.error('Error fetching gifts')
        }
      } catch (error) {
        console.error('Error fetching gifts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGifts()
  }, [])

  // Suscripción en tiempo real
  useEffect(() => {
    const supabase = getBrowserClient()
    
    const channel = supabase
      .channel('gifts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'gifts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGifts(prev => [payload.new as GiftType, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setGifts(prev => prev.map(g => g.id === payload.new.id ? payload.new as GiftType : g))
          } else if (payload.eventType === 'DELETE') {
            setGifts(prev => prev.filter(g => g.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Estadísticas
  const stats = {
    totalGifts: gifts.length,
    totalWishlist: gifts.filter(g => g.type === 'deseo').length,
    totalReceived: gifts.filter(g => g.type === 'recibido').length,
    totalGiven: gifts.filter(g => g.type === 'regalado').length,
    averageRating: gifts.filter(g => g.rating).reduce((sum, g) => sum + (g.rating || 0), 0) / gifts.filter(g => g.rating).length || 0,
    favoriteGifts: gifts.filter(g => g.isFavorite).length
  }

  // Filtrar regalos
  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gift.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'Todos' || 
                         (selectedFilter === 'Deseos' && gift.type === 'deseo') ||
                         (selectedFilter === 'Recibidos' && gift.type === 'recibido') ||
                         (selectedFilter === 'Regalados' && gift.type === 'regalado')
    const matchesCategory = selectedCategory === 'Todas' || gift.category === selectedCategory.toLowerCase()
    const matchesType = selectedType === 'Todos' || gift.type === selectedType.toLowerCase()
    
    return matchesSearch && matchesFilter && matchesCategory && matchesType
  })

  const openAddModal = () => {
    setGiftForm({
      name: '',
      description: '',
      category: 'romantico',
      type: 'deseo',
      recipient: 'pareja',
      image: null
    })
    setShowAddModal(true)
  }

  const openEditModal = (gift: GiftType) => {
    setSelectedGift(gift)
    setGiftForm({
      name: gift.name,
      description: gift.description,
      category: gift.category,
      type: gift.type,
      recipient: gift.recipient,
      image: null
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (gift: GiftType) => {
    setSelectedGift(gift)
    setShowDeleteModal(true)
  }

  const handleSaveGift = async () => {
    if (!giftForm.name || !giftForm.description) return

    try {
      setSaving(true)
      let imageUrl = undefined

      // Subir imagen si existe
      if (giftForm.image) {
        try {
          const uploadResult = await uploadPublicFile(
            'gift-images',
            giftForm.image,
            'gifts/'
          )
          
          imageUrl = uploadResult.url
        } catch (error) {
          console.error('Error uploading image:', error)
          return
        }
      }

      const giftData = {
        name: giftForm.name,
        description: giftForm.description,
        category: giftForm.category,
        type: giftForm.type,
        recipient: giftForm.recipient,
        image: imageUrl,
        purchased: giftForm.type === 'regalado' || giftForm.type === 'recibido'
      }

      if (showEditModal && selectedGift) {
        // Editar regalo existente
        const response = await fetch(`/api/gifts/${selectedGift.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(giftData)
        })

        if (!response.ok) {
          console.error('Error updating gift')
          return
        }

        setShowEditModal(false)
      } else {
        // Agregar nuevo regalo
        const response = await fetch('/api/gifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(giftData)
        })

        if (!response.ok) {
          console.error('Error creating gift')
          return
        }

        setShowAddModal(false)
      }

      // Limpiar formulario
      setGiftForm({
        name: '',
        description: '',
        category: 'romantico',
        type: 'deseo',
        recipient: 'pareja',
        image: null
      })
    } catch (error) {
      console.error('Error saving gift:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGift = async () => {
    if (!selectedGift) return

    try {
      const response = await fetch(`/api/gifts/${selectedGift.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        console.error('Error deleting gift')
        return
      }

      setShowDeleteModal(false)
      setSelectedGift(null)
    } catch (error) {
      console.error('Error deleting gift:', error)
    }
  }

  const toggleFavorite = async (giftId: string) => {
    try {
      const gift = gifts.find(g => g.id === giftId)
      if (!gift) return

      const response = await fetch(`/api/gifts/${giftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !gift.isFavorite })
      })

      if (!response.ok) {
        console.error('Error toggling favorite')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setGiftForm(prev => ({ ...prev, image: file }))
    }
  }

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '🎁'
  }



  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deseo': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'recibido': return 'bg-green-100 text-green-800 border-green-200'
      case 'regalado': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="w-full min-h-screen p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="text-center space-y-2 sm:space-y-3 px-2">
        <h1 className="text-[clamp(1.5rem,5vw,2.5rem)] font-bold text-gray-900 dark:text-white flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <Gift className="h-8 w-8 sm:h-10 sm:w-10 text-pink-500" />
          Regalos y Sorpresas
        </h1>
        <p className="text-[clamp(0.9rem,3vw,1.1rem)] text-gray-600 dark:text-gray-300 max-w-full sm:max-w-2xl mx-auto px-2">
          Gestiona tus regalos, deseos y sorpresas especiales
        </p>
      </div>

      {/* Estadísticas */}
      <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2 px-3 sm:px-4 lg:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 scroll-horizontal">
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl flex-shrink-0 sm:flex-shrink min-w-[140px] sm:min-w-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[clamp(0.8rem,2.5vw,0.9rem)] text-pink-600 dark:text-pink-400 font-medium">Total Regalos</p>
                <p className="text-[clamp(1.2rem,4vw,2rem)] font-bold text-pink-700 dark:text-pink-300">{stats.totalGifts}</p>
              </div>
              <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl flex-shrink-0 sm:flex-shrink min-w-[140px] sm:min-w-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[clamp(0.8rem,2.5vw,0.9rem)] text-blue-600 dark:text-blue-400 font-medium">Lista de Deseos</p>
                <p className="text-[clamp(1.2rem,4vw,2rem)] font-bold text-blue-700 dark:text-blue-300">{stats.totalWishlist}</p>
              </div>
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl flex-shrink-0 sm:flex-shrink min-w-[140px] sm:min-w-0 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[clamp(0.8rem,2.5vw,0.9rem)] text-yellow-600 dark:text-yellow-400 font-medium">Favoritos</p>
                <p className="text-[clamp(1.2rem,4vw,2rem)] font-bold text-yellow-700 dark:text-yellow-300">{stats.favoriteGifts}</p>
              </div>
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
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
                  placeholder="Buscar regalos..."
                  className="pl-10 border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-40 border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Deseos">Deseos</SelectItem>
                  <SelectItem value="Recibidos">Recibidos</SelectItem>
                  <SelectItem value="Regalados">Regalados</SelectItem>
                </SelectContent>
              </Select>

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
              Agregar Regalo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Regalos */}
      {loading ? (
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-pink-500" />
            <span className="text-[clamp(0.9rem,3vw,1.1rem)] text-gray-600 dark:text-gray-400">Cargando regalos...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-3 sm:px-0">
          {filteredGifts.map((gift) => (
          <motion.div
            key={gift.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl overflow-hidden ${
              gift.isFavorite ? 'ring-2 ring-pink-200 bg-pink-50 dark:bg-pink-900/20' : ''
            }`}>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {/* Imagen */}
                  <div className="relative">
                    {gift.image ? (
                      <AspectRatio ratio={16/9} className="rounded-lg overflow-hidden">
                        <img 
                          src={gift.image} 
                          alt={gift.name}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    ) : (
                      <div className="w-full h-24 sm:h-32 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                        <Gift className="h-8 w-8 sm:h-12 sm:w-12 text-pink-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <Badge className={`text-[clamp(0.6rem,1.5vw,0.7rem)] ${getTypeColor(gift.type)}`}>
                        {gift.type === 'deseo' ? 'Deseo' : gift.type === 'recibido' ? 'Recibido' : 'Regalado'}
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
                          toggleFavorite(gift.id)
                        }}
                      >
                        <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${gift.isFavorite ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(gift)
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
                          openDeleteModal(gift)
                        }}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-[clamp(0.9rem,2.5vw,1rem)]">{gift.name}</h3>
                    </div>
                    
                    <p className="text-[clamp(0.8rem,2vw,0.9rem)] text-gray-600 dark:text-gray-400 line-clamp-2">{gift.description}</p>
                    
                    <div className="flex items-center gap-2 text-[clamp(0.7rem,1.8vw,0.8rem)] text-gray-500 dark:text-gray-400">
                      <span>{getCategoryIcon(gift.category)}</span>
                      <span>{categories.find(c => c.value === gift.category)?.label}</span>
                    </div>

                    {gift.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < gift.rating! ? 'fill-current text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="text-[clamp(0.7rem,1.8vw,0.8rem)] text-gray-500 dark:text-gray-400 ml-1">({gift.rating})</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          ))}
        </div>
      )}

      {/* Modal para Agregar/Editar Regalo */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={() => {
        setShowAddModal(false)
        setShowEditModal(false)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-0 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[clamp(1.2rem,3vw,1.5rem)]">
              <Gift className="h-5 w-5 text-pink-500" />
              {showEditModal ? 'Editar Regalo' : 'Agregar Nuevo Regalo'}
            </DialogTitle>
            <DialogDescription className="text-[clamp(0.9rem,2.5vw,1rem)]">
              Completa la información del regalo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Regalo *
                </label>
                <Input
                  value={giftForm.name}
                  onChange={(e) => setGiftForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Anillo de compromiso"
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                />
              </div>


            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción *
              </label>
              <textarea
                value={giftForm.description}
                onChange={(e) => setGiftForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el regalo..."
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:border-pink-500 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Solo categoría y tipo - campos esenciales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría
                </label>
                <Select value={giftForm.category} onValueChange={(value: GiftType['category']) => setGiftForm(prev => ({ ...prev, category: value }))}>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <Select value={giftForm.type} onValueChange={(value: GiftType['type']) => setGiftForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deseo">Deseo</SelectItem>
                    <SelectItem value="recibido">Recibido</SelectItem>
                    <SelectItem value="regalado">Regalado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>



            {/* Solo destinatario - campo esencial */}
                          <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Para
                  </label>
                  <Select value={giftForm.recipient} onValueChange={(value: GiftType['recipient']) => setGiftForm(prev => ({ ...prev, recipient: value }))}>
                    <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yo">Para mí</SelectItem>
                      <SelectItem value="pareja">Para mi pareja</SelectItem>
                      <SelectItem value="ambos">Para ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              <div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-3 sm:p-4 text-center hover:border-pink-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="gift-image"
                  />
                  <label htmlFor="gift-image" className="cursor-pointer">
                    {giftForm.image ? (
                      <div className="space-y-2">
                        <img 
                          src={URL.createObjectURL(giftForm.image)} 
                          alt="Vista previa"
                          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-lg object-cover"
                        />
                        <p className="text-[clamp(0.8rem,2vw,0.9rem)] text-gray-600 dark:text-gray-400">{giftForm.image.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            setGiftForm(prev => ({ ...prev, image: null }))
                          }}
                          className="text-[clamp(0.7rem,1.8vw,0.8rem)] px-2 sm:px-3 py-1 sm:py-2 rounded-lg"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto" />
                        <p className="text-[clamp(0.8rem,2vw,0.9rem)] text-gray-600 dark:text-gray-400">Haz clic para agregar imagen</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
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
              onClick={handleSaveGift}
              disabled={!giftForm.name || !giftForm.description || saving}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Guardando...' : 'Guardar'}
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
              Eliminar Regalo
            </DialogTitle>
            <DialogDescription className="text-[clamp(0.9rem,2.5vw,1rem)]">
              ¿Estás seguro de que quieres eliminar "{selectedGift?.name}"? Esta acción no se puede deshacer.
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
              onClick={handleDeleteGift}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
