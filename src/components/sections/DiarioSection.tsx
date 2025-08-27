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
  BookOpen, 
  Heart, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Calendar, 
  Smile, 
  Camera,
  X,
  Save,
  Image as ImageIcon,
  Star,
  Clock,
  MapPin,
  User,
  Users,
  Quote,
  Sparkles,
  Moon,
  Sun,
  Cloud,
  Zap,
  Droplets,
  Flame,
  Lock,
  Loader2
} from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { uploadPublicFile } from '@/lib/supabase/storage'
import { DiaryEntry as DiaryEntryType, DiaryEntryForm } from '@/features/diary/types'

// Usar el tipo de DiaryEntryType importado

const moods = [
  { value: 'muy_feliz', label: 'Muy Feliz', icon: '😄', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'feliz', label: 'Feliz', icon: '😊', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'tranquilo', label: 'Tranquilo', icon: '😌', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'nostalgico', label: 'Nostálgico', icon: '🥺', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'emocionado', label: 'Emocionado', icon: '🤩', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { value: 'romantico', label: 'Romántico', icon: '💕', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'melancolico', label: 'Melancólico', icon: '😔', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { value: 'energico', label: 'Energético', icon: '⚡', color: 'bg-orange-100 text-orange-800 border-orange-200' }
]

const weathers = [
  { value: 'soleado', label: 'Soleado', icon: '☀️' },
  { value: 'nublado', label: 'Nublado', icon: '☁️' },
  { value: 'lluvioso', label: 'Lluvioso', icon: '🌧️' },
  { value: 'ventoso', label: 'Ventoso', icon: '💨' },
  { value: 'frio', label: 'Frío', icon: '❄️' },
  { value: 'caluroso', label: 'Caluroso', icon: '🔥' }
]

const predefinedTags = [
  'Amor', 'Cita', 'Sorpresa', 'Viaje', 'Casa', 'Familia', 'Trabajo', 'Salud',
  'Celebración', 'Reflexión', 'Futuro', 'Recuerdo', 'Música', 'Comida', 'Naturaleza'
]

export function DiarioSection() {
  const [entries, setEntries] = useState<DiaryEntryType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntryType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState('Todos')
  const [selectedAuthor, setSelectedAuthor] = useState('Todos')
  const [showPrivate, setShowPrivate] = useState(true)

  const [entryForm, setEntryForm] = useState<DiaryEntryForm>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    mood: 'feliz',
    weather: 'soleado',
    location: '',
    author: 'yo',
    isPrivate: false,
    tags: [],
    images: []
  })

  // Cargar entradas desde Supabase
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/diary')
        if (response.ok) {
          const data = await response.json()
          setEntries(data)
        } else {
          console.error('Error fetching diary entries')
        }
      } catch (error) {
        console.error('Error fetching diary entries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [])

  // Suscripción en tiempo real
  useEffect(() => {
    const supabase = getBrowserClient()
    
    const channel = supabase
      .channel('diary_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'diary_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries(prev => [payload.new as DiaryEntryType, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setEntries(prev => prev.map(e => e.id === payload.new.id ? payload.new as DiaryEntryType : e))
          } else if (payload.eventType === 'DELETE') {
            setEntries(prev => prev.filter(e => e.id !== payload.old.id))
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
    totalEntries: entries.length,
    totalWords: entries.reduce((sum, entry) => sum + entry.wordCount, 0),
    averageWords: Math.round(entries.reduce((sum, entry) => sum + entry.wordCount, 0) / (entries.length || 1)) || 0,
    favoriteEntries: entries.filter(e => e.isFavorite).length,
    privateEntries: entries.filter(e => e.isPrivate).length,
    mostFrequentMood: getMostFrequentMood(),
    longestEntry: entries.length
      ? entries.reduce((longest, entry) => (entry.wordCount > longest.wordCount ? entry : longest), entries[0])
      : null
  }

  function getMostFrequentMood() {
    if (entries.length === 0) return 'feliz'
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const moodEntries = Object.entries(moodCounts)
    if (moodEntries.length === 0) return 'feliz'
    return moodEntries.reduce((a, b) => (moodCounts[a[0]] > moodCounts[b[0]] ? a : b))[0]
  }

  // Filtrar entradas
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesMood = selectedMood === 'Todos' || entry.mood === selectedMood
    const matchesAuthor = selectedAuthor === 'Todos' || entry.author === selectedAuthor
    const matchesPrivacy = showPrivate || !entry.isPrivate
    
    return matchesSearch && matchesMood && matchesAuthor && matchesPrivacy
  })

  const openAddModal = () => {
    setEntryForm({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      mood: 'feliz',
      weather: 'soleado',
      location: '',
      author: 'yo',
      isPrivate: false,
      tags: [],
      images: []
    })
    setShowAddModal(true)
  }

  const openEditModal = (entry: DiaryEntryType) => {
    setSelectedEntry(entry)
    setEntryForm({
      title: entry.title,
      content: entry.content,
      date: entry.date,
      mood: entry.mood,
      weather: entry.weather,
      location: entry.location || '',
      author: entry.author,
      isPrivate: entry.isPrivate,
      tags: [...entry.tags],
      images: []
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (entry: DiaryEntryType) => {
    setSelectedEntry(entry)
    setShowDeleteModal(true)
  }

  const handleSaveEntry = async () => {
    if (!entryForm.title || !entryForm.content) return

    try {
      setSaving(true)
      const wordCount = entryForm.content.split(/\s+/).filter(word => word.length > 0).length
      let imageUrls: string[] = []

      // Subir imágenes si existen
      if (entryForm.images.length > 0) {
        const uploadPromises = entryForm.images.map(async (image, index) => {
          try {
            const uploadResult = await uploadPublicFile(
              'diary-images',
              image,
              `diary/${Date.now()}-${index}/`
            )
            return uploadResult.url
          } catch (error) {
            console.error('Error uploading image:', error)
            return null
          }
        })

        const uploadedUrls = await Promise.all(uploadPromises)
        imageUrls = uploadedUrls.filter(url => url !== null) as string[]
      }

      const entryData = {
        title: entryForm.title,
        content: entryForm.content,
        date: entryForm.date,
        mood: entryForm.mood,
        weather: entryForm.weather,
        location: entryForm.location,
        author: entryForm.author,
        isPrivate: entryForm.isPrivate,
        tags: entryForm.tags,
        images: imageUrls,
        wordCount
      }

      if (showEditModal && selectedEntry) {
        // Editar entrada existente
        const response = await fetch(`/api/diary/${selectedEntry.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData)
        })

        if (!response.ok) {
          console.error('Error updating diary entry')
          return
        }

        setShowEditModal(false)
      } else {
        // Agregar nueva entrada
        const response = await fetch('/api/diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData)
        })

        if (!response.ok) {
          console.error('Error creating diary entry')
          return
        }

        setShowAddModal(false)
      }

      // Limpiar formulario
      setEntryForm({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        mood: 'feliz',
        weather: 'soleado',
        location: '',
        author: 'yo',
        isPrivate: false,
        tags: [],
        images: []
      })
    } catch (error) {
      console.error('Error saving diary entry:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return

    try {
      const response = await fetch(`/api/diary/${selectedEntry.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        console.error('Error deleting diary entry')
        return
      }

      setShowDeleteModal(false)
      setSelectedEntry(null)
    } catch (error) {
      console.error('Error deleting diary entry:', error)
    }
  }

  const toggleFavorite = async (entryId: string) => {
    try {
      const entry = entries.find(e => e.id === entryId)
      if (!entry) return

      const response = await fetch(`/api/diary/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !entry.isFavorite })
      })

      if (!response.ok) {
        console.error('Error toggling favorite')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setEntryForm(prev => ({ ...prev, images: [...prev.images, ...imageFiles] }))
  }

  const removeImage = (index: number) => {
    setEntryForm(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }))
  }

  const handleTagToggle = (tag: string) => {
    setEntryForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const addCustomTag = (tag: string) => {
    if (tag && !entryForm.tags.includes(tag)) {
      setEntryForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const getMoodIcon = (mood: string) => {
    return moods.find(m => m.value === mood)?.icon || '😊'
  }

  const getMoodColor = (mood: string) => {
    return moods.find(m => m.value === mood)?.color || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getWeatherIcon = (weather: string) => {
    return weathers.find(w => w.value === weather)?.icon || '☀️'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <BookOpen className="h-10 w-10 text-pink-500" />
          Nuestro Diario de Amor
        </h1>
        <p className="text-gray-600 text-lg">
          Documenta los momentos más especiales de tu relación
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600 font-medium">Total Entradas</p>
                <p className="text-2xl font-bold text-pink-700">{stats.totalEntries}</p>
              </div>
              <BookOpen className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Palabras</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalWords}</p>
              </div>
              <Quote className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Promedio</p>
                <p className="text-2xl font-bold text-green-700">{stats.averageWords} palabras</p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Favoritos</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.favoriteEntries}</p>
              </div>
              <Heart className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar en el diario..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos los estados</SelectItem>
                  {moods.map(mood => (
                    <SelectItem key={mood.value} value={mood.value}>
                      {mood.icon} {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="yo">Yo</SelectItem>
                  <SelectItem value="pareja">Mi pareja</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={openAddModal}
              className="bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Entrada
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Entradas */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <span className="text-lg text-gray-600">Cargando entradas del diario...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
              entry.isFavorite ? 'ring-2 ring-pink-200 bg-pink-50' : ''
            } ${entry.isPrivate ? 'border-l-4 border-l-purple-400' : ''}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">{entry.title}</h3>
                        {entry.isPrivate && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <Lock className="h-3 w-3 mr-1" />
                            Privado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(entry.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {entry.author === 'yo' ? 'Yo' : entry.author === 'pareja' ? 'Mi pareja' : 'Ambos'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Quote className="h-4 w-4" />
                          {entry.wordCount} palabras
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(entry.id)
                        }}
                      >
                        <Heart className={`h-4 w-4 ${entry.isFavorite ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditModal(entry)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteModal(entry)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Estado de ánimo y clima */}
                  <div className="flex items-center gap-3">
                    <Badge className={getMoodColor(entry.mood)}>
                      {getMoodIcon(entry.mood)} {moods.find(m => m.value === entry.mood)?.label}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {getWeatherIcon(entry.weather)} {weathers.find(w => w.value === entry.weather)?.label}
                    </Badge>
                    {entry.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {entry.location}
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed line-clamp-3">
                      {entry.content}
                    </p>
                  </div>

                  {/* Tags */}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Imágenes */}
                  {entry.images && entry.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {entry.images.slice(0, 4).map((image, index) => (
                        <AspectRatio key={index} ratio={1} className="rounded-lg overflow-hidden">
                          <img 
                            src={image} 
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </AspectRatio>
                      ))}
                      {entry.images.length > 4 && (
                        <div className="flex items-center justify-center bg-gray-100 rounded-lg">
                          <span className="text-sm text-gray-500">+{entry.images.length - 4}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          ))}
        </div>
      )}

      {/* Modal para Agregar/Editar Entrada */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={() => {
        setShowAddModal(false)
        setShowEditModal(false)
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-pink-500" />
              {showEditModal ? 'Editar Entrada' : 'Nueva Entrada del Diario'}
            </DialogTitle>
            <DialogDescription>
              Comparte tus pensamientos y sentimientos más profundos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <Input
                  value={entryForm.title}
                  onChange={(e) => setEntryForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="¿Qué título le pondrías a este momento?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <Input
                  type="date"
                  value={entryForm.date}
                  onChange={(e) => setEntryForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            {/* Estado de ánimo y clima */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Cómo te sientes?
                </label>
                <Select value={entryForm.mood} onValueChange={(value: DiaryEntryType['mood']) => setEntryForm(prev => ({ ...prev, mood: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map(mood => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.icon} {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clima
                </label>
                <Select value={entryForm.weather} onValueChange={(value: DiaryEntryType['weather']) => setEntryForm(prev => ({ ...prev, weather: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weathers.map(weather => (
                      <SelectItem key={weather.value} value={weather.value}>
                        {weather.icon} {weather.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <Input
                  value={entryForm.location}
                  onChange={(e) => setEntryForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="¿Dónde estás?"
                />
              </div>
            </div>

            {/* Contenido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu historia *
              </label>
              <textarea
                value={entryForm.content}
                onChange={(e) => setEntryForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Escribe desde el corazón... ¿Qué pasó hoy? ¿Cómo te sientes? ¿Qué pensaste?"
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {entryForm.content.split(/\s+/).filter(word => word.length > 0).length} palabras
              </div>
            </div>

            {/* Configuración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autor
                </label>
                <Select value={entryForm.author} onValueChange={(value: DiaryEntryType['author']) => setEntryForm(prev => ({ ...prev, author: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yo">Yo</SelectItem>
                    <SelectItem value="pareja">Mi pareja</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={entryForm.isPrivate}
                  onChange={(e) => setEntryForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">
                  Entrada privada
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {predefinedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={entryForm.tags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${entryForm.tags.includes(tag) ? 'bg-pink-100 text-pink-800 border-pink-200' : ''}`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar etiqueta personalizada..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addCustomTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes (Opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="diary-images"
                />
                <label htmlFor="diary-images" className="cursor-pointer">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Haz clic para agregar imágenes</p>
                </label>
              </div>
              
              {entryForm.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {entryForm.images.map((image, index) => (
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
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
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
              onClick={handleSaveEntry}
              disabled={!entryForm.title || !entryForm.content || saving}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Eliminar Entrada
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar "{selectedEntry?.title}"? Esta acción no se puede deshacer.
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
              onClick={handleDeleteEntry}
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
