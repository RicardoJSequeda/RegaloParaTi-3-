'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog'

import { Skeleton } from '@/components/ui/skeleton'
import { AspectRatio } from '@/components/ui/aspect-ratio'

import { Photo } from '@/types'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Calendar, 
  Tag,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Heart
} from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser-client'

// Predefined tag options
const predefinedTags = [
  'romántico', 'especial', 'cita', 'viaje', 'playa', 'montaña', 'restaurante', 
  'cena', 'desayuno', 'naturaleza', 'ciudad', 'familia', 'amigos', 'mascota',
  'deportes', 'música', 'arte', 'cultura', 'historia', 'aventura', 'relax',
  'celebración', 'aniversario', 'cumpleaños', 'navidad', 'halloween', 'verano',
  'invierno', 'primavera', 'otoño', 'noche', 'amanecer', 'atardecer', 'lluvia',
  'nieve', 'sol', 'luna', 'estrellas', 'flores', 'árboles', 'mar', 'río',
  'cascada', 'desierto', 'bosque', 'parque', 'museo', 'teatro', 'cine',
  'shopping', 'café', 'bar', 'club', 'gimnasio', 'yoga', 'meditación'
]

// Initial dummy data
const defaultPhotos: Photo[] = [
  {
    id: '1',
    title: 'Nuestra Primera Cita',
    date_taken: '2024-01-15',
    description: 'El día que todo comenzó. Un momento mágico que nunca olvidaremos.',
    image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop',
    file_type: 'image',
    category: 'romantico',
    tags: ['cita', 'romántico', 'especial'],
    favorite: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Viaje a la Playa',
    date_taken: '2024-02-20',
    description: 'Arena, mar y mucho amor. Un día perfecto juntos.',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    file_type: 'image',
    category: 'viajes',
    tags: ['playa', 'viaje', 'naturaleza'],
    favorite: false,
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-02-20T14:30:00Z'
  },
  {
    id: '3',
    title: 'Cena Romántica',
    date_taken: '2024-03-10',
    description: 'Una velada inolvidable con la mejor compañía.',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    file_type: 'image',
    category: 'romantico',
    tags: ['cena', 'romántico', 'restaurante'],
    favorite: false,
    created_at: '2024-03-10T20:00:00Z',
    updated_at: '2024-03-10T20:00:00Z'
  },
  {
    id: '4',
    title: 'Video del Aniversario',
    date_taken: '2024-04-05',
    description: 'Celebrando nuestro amor con risas y alegría.',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    file_type: 'video',
    category: 'romantico',
    tags: ['aniversario', 'video', 'celebración'],
    favorite: true,
    created_at: '2024-04-05T18:00:00Z',
    updated_at: '2024-04-05T18:00:00Z'
  }
]

export default function FotosSection() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'gif'>('all')
  
  // Debounce para búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [videoDurations, setVideoDurations] = useState<Record<string, number>>({})
  const [videoPosters, setVideoPosters] = useState<Record<string, string>>({})
  const [modalSize, setModalSize] = useState<'default' | 'wide' | 'tall'>('default')
  const [toast, setToast] = useState<{
    show: boolean
    title: string
    description: string
    variant?: 'default' | 'destructive'
  }>({ show: false, title: '', description: '' })

  const supabase = getBrowserClient()

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, title: '', description: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast.show])

  // Form state
  const [photoForm, setPhotoForm] = useState({
    title: '',
    date: '',
    description: '',
    tags: [] as string[],
    file_type: 'image' as 'image' | 'video' | 'gif',
    image: null as File | null
  })

  // Load photos from Supabase
  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading photos:', error)
        setToast({
          show: true,
          title: 'Error',
          description: 'Error al cargar las fotos',
          variant: 'destructive'
        })
        return
      }

      setPhotos(data || [])
      
      // Cargar duraciones de videos
      const videoPhotos = data?.filter(photo => photo.file_type === 'video') || []
      const durations: Record<string, number> = {}
      
      videoPhotos.forEach(photo => {
        const video = document.createElement('video')
        video.src = photo.image_url
        video.addEventListener('loadedmetadata', () => {
          durations[photo.id] = video.duration
          setVideoDurations(prev => ({ ...prev, [photo.id]: video.duration }))
        })
      })

      // Generar posters estáticos (thumbnail) de forma client-side
      videoPhotos.forEach(photo => {
        try {
          const video = document.createElement('video')
          video.crossOrigin = 'anonymous'
          video.src = photo.image_url
          video.preload = 'metadata'
          video.addEventListener('loadeddata', () => {
            try {
              const canvas = document.createElement('canvas')
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              const ctx = canvas.getContext('2d')
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
              setVideoPosters(prev => ({ ...prev, [photo.id]: dataUrl }))
            } catch (err) {
              // Ignorar si el navegador bloquea por CORS
            }
          })
        } catch (err) {
          // Silencioso si falla la generación
        }
      })
    } catch (error) {
      console.error('Error loading photos:', error)
      setToast({
        show: true,
        title: 'Error',
        description: 'Error al cargar las fotos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Suscripción en tiempo real con throttle
  useEffect(() => {
    let lastUpdate = 0
    const throttleDelay = 1000 // 1 segundo
    
    const channel = supabase
      .channel('photos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photos' }, 
        () => {
          const now = Date.now()
          if (now - lastUpdate > throttleDelay) {
            lastUpdate = now
            loadPhotos()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Filter and sort photos (memoizado con debounce)
  const filteredPhotos = useMemo(() => {
    let filtered = photos.filter(photo => {
      const matchesSearch = debouncedSearchTerm === '' ||
        photo.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (photo.description && photo.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        photo.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      
      const matchesType = filterType === 'all' || photo.file_type === filterType
      
      return matchesSearch && matchesType
    })

    // Sort photos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date_taken || '').getTime() - new Date(a.date_taken || '').getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'type':
          return a.file_type.localeCompare(b.file_type)
        default:
          return 0
      }
    })

    return filtered
  }, [photos, debouncedSearchTerm, sortBy, filterType])

  // Save photos to localStorage
  useEffect(() => {
    if (photos.length > 0) {
      localStorage.setItem('photos', JSON.stringify(photos))
    }
  }, [photos])

  const handleCreatePhoto = async () => {
    if (!photoForm.title || !photoForm.date || !photoForm.image) {
      setToast({
        show: true,
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive'
      })
      return
    }

    try {
      // Subir imagen a Supabase Storage
      const imageFile = photoForm.image
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '-').toLowerCase()
      const key = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(key, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(key)

      // Detectar tipo de archivo automáticamente
      const fileType = imageFile.type.startsWith('video/') ? 'video' : 
                      imageFile.type === 'image/gif' ? 'gif' : 'image'

      // Generar thumbnail para videos si es necesario
      let thumbnailUrl = null
      if (fileType === 'video') {
        try {
          const video = document.createElement('video')
          video.src = URL.createObjectURL(imageFile)
          video.currentTime = 0.1
          
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          video.addEventListener('loadeddata', () => {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx?.drawImage(video, 0, 0)
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                const thumbnailKey = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-thumb.jpg`
                await supabase.storage.from('photos').upload(thumbnailKey, blob)
                const { data: thumbData } = supabase.storage.from('photos').getPublicUrl(thumbnailKey)
                thumbnailUrl = thumbData.publicUrl
              }
            }, 'image/jpeg', 0.8)
          })
        } catch (error) {
          console.warn('No se pudo generar thumbnail del video:', error)
        }
      }

      // Crear registro en la base de datos
      const photoData: any = {
        title: photoForm.title,
        description: photoForm.description || null,
        image_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        file_type: fileType,
        category: 'otro', // Por defecto
        tags: photoForm.tags,
        location: null,
        date_taken: photoForm.date,
        favorite: false
      }

      const { data, error } = await supabase
        .from('photos')
        .insert([photoData])
        .select()
        .single()

      if (error) {
        throw error
      }

      setShowCreateModal(false)
      resetForm()
      await loadPhotos() // Recargar fotos
      setToast({
        show: true,
        title: 'Éxito',
        description: 'Foto agregada correctamente'
      })
    } catch (error) {
      console.error('Error creating photo:', error)
      setToast({
        show: true,
        title: 'Error',
        description: 'Error al crear la foto',
        variant: 'destructive'
      })
    }
  }

  const handleEditPhoto = (photo: Photo) => {
    setSelectedPhoto(photo)
    setPhotoForm({
      title: photo.title,
      date: photo.date_taken || '',
      description: photo.description || '',
      tags: photo.tags,
      file_type: photo.file_type,
      image: null
    })
    setShowCreateModal(true)
  }

  const handleUpdatePhoto = async () => {
    if (!selectedPhoto || !photoForm.title || !photoForm.date) {
      setToast({
        show: true,
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive'
      })
      return
    }

    try {
      let imageUrl = selectedPhoto.image_url

      // Si hay una nueva imagen, subirla
      if (photoForm.image) {
        // Subir nueva imagen a Supabase Storage
        const imageFile = photoForm.image
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '-').toLowerCase()
        const key = `photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`
        
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(key, imageFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw uploadError
        }

        // Obtener URL pública de la nueva imagen
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(key)

        imageUrl = urlData.publicUrl

        // Si es video, intentar generar y actualizar thumbnail_url
        if (imageFile.type.startsWith('video/')) {
          try {
            const tmpVideo = document.createElement('video')
            tmpVideo.src = URL.createObjectURL(imageFile)
            tmpVideo.currentTime = 0.1
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            tmpVideo.addEventListener('loadeddata', async () => {
              canvas.width = tmpVideo.videoWidth
              canvas.height = tmpVideo.videoHeight
              ctx?.drawImage(tmpVideo, 0, 0)
              canvas.toBlob(async (blob) => {
                if (!blob) return
                const thumbnailKey = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-thumb.jpg`
                await supabase.storage.from('photos').upload(thumbnailKey, blob)
                const { data: thumbData } = supabase.storage.from('photos').getPublicUrl(thumbnailKey)
                updateData.thumbnail_url = thumbData.publicUrl
              }, 'image/jpeg', 0.8)
            })
          } catch {}
        }
      }

      // Actualizar registro en la base de datos
      const updateData: any = {
        title: photoForm.title,
        description: photoForm.description || null,
        image_url: imageUrl,
        file_type: photoForm.file_type,
        category: selectedPhoto.category, // Mantener categoría actual
        tags: photoForm.tags,
        location: selectedPhoto.location,
        date_taken: photoForm.date,
        favorite: selectedPhoto.favorite // Mantener estado de favorito
      }

      const { data, error } = await supabase
        .from('photos')
        .update(updateData)
        .eq('id', selectedPhoto.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setShowCreateModal(false)
      setSelectedPhoto(null)
      resetForm()
      await loadPhotos() // Recargar fotos
      setToast({
        show: true,
        title: 'Éxito',
        description: 'Foto actualizada correctamente'
      })
    } catch (error) {
      console.error('Error updating photo:', error)
      setToast({
        show: true,
        title: 'Error',
        description: 'Error al actualizar la foto',
        variant: 'destructive'
      })
    }
  }

  const handleDeletePhoto = async (photo: Photo) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id)

      if (error) {
        throw error
      }

      await loadPhotos() // Recargar fotos
      setToast({
        show: true,
        title: 'Éxito',
        description: 'Foto eliminada correctamente'
      })
    } catch (error) {
      console.error('Error deleting photo:', error)
      setToast({
        show: true,
        title: 'Error',
        description: 'Error al eliminar la foto',
        variant: 'destructive'
      })
    }
  }

  const handleViewPhoto = (photo: Photo) => {
    setSelectedPhoto(photo)
    setCurrentPhotoIndex(filteredPhotos.findIndex(p => p.id === photo.id))
    setModalSize('default') // Reset modal size
    setShowDetailModal(true)
  }

  const handlePreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
      setSelectedPhoto(filteredPhotos[currentPhotoIndex - 1])
      setModalSize('default') // Reset modal size for new photo
    }
  }

  const handleNextPhoto = () => {
    if (currentPhotoIndex < filteredPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
      setSelectedPhoto(filteredPhotos[currentPhotoIndex + 1])
      setModalSize('default') // Reset modal size for new photo
    }
  }

  const handleDownload = (photo: Photo) => {
    const link = document.createElement('a')
          link.href = photo.image_url
          link.download = `${photo.title}.${photo.file_type === 'video' ? 'mp4' : 'jpg'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setToast({
      show: true,
      title: 'Descarga iniciada',
      description: 'El archivo se está descargando'
    })
  }

  const resetForm = () => {
    setPhotoForm({
      title: '',
      date: '',
      description: '',
      tags: [],
      file_type: 'image',
      image: null
    })
  }

  const handleTagToggle = (tag: string) => {
    setPhotoForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const handleAddCustomTag = (customTag: string) => {
    const trimmedTag = customTag.trim()
    if (trimmedTag && !photoForm.tags.includes(trimmedTag)) {
      setPhotoForm(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setPhotoForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nuestras Fotos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredPhotos.length} de {photos.length} fotos
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Nueva Foto
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar fotos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={(value: 'all' | 'image' | 'video' | 'gif') => setFilterType(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="image">Imágenes</SelectItem>
                              <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="gif">GIFs</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: 'date' | 'title' | 'type') => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Fecha</SelectItem>
              <SelectItem value="title">Título</SelectItem>
              <SelectItem value="type">Tipo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Photos Grid - Pinterest Style */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron fotos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterType !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Agrega tu primera foto para comenzar'
              }
            </p>
          </div>
        ) : (
          <div className="masonry-grid">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="masonry-item group relative">
                <div className="photo-card">
                  {/* Image/Video Container */}
                  <div className="relative">
                    {photo.file_type === 'video' ? (
                      <video
                        src={photo.image_url}
                        className="w-full h-auto rounded-lg object-cover"
                        preload="metadata"
                        muted
                        playsInline
                        poster={videoPosters[photo.id] || photo.thumbnail_url || `${photo.image_url}#t=0.5`}
                        onLoadedMetadata={(e) => {
                          const video = e.target as HTMLVideoElement
                          video.style.aspectRatio = `${video.videoWidth}/${video.videoHeight}`
                        }}
                      />
                    ) : (
                      <img
                        src={photo.image_url}
                        alt={photo.title}
                        className="w-full h-auto rounded-lg object-cover"
                        loading="lazy"
                      />
                    )}



                    {/* Video Duration Badge */}
                    {photo.file_type === 'video' && (
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-black/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg">
                          <span className="text-xs text-white font-semibold">
                            <Video className="w-3 h-3 inline mr-1" />
                            {videoDurations[photo.id] ? formatDuration(videoDurations[photo.id]) : 'Video'}
                          </span>
                        </div>
                      </div>
                    )}

                     {/* Favorite Badge */}
                     {photo.favorite && (
                       <div className="absolute top-3 left-3">
                         <div className="bg-red-500 rounded-full p-1.5">
                           <Heart className="w-4 h-4 text-white fill-current" />
                         </div>
                       </div>
                     )}

                     {/* Hover Overlay with Actions */}
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <div className="flex gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                         <Button
                           size="sm"
                           variant="secondary"
                           className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
                           onClick={() => handleViewPhoto(photo)}
                         >
                           <Eye className="w-4 h-4" />
                         </Button>
                         <Button
                           size="sm"
                           variant="secondary"
                           className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
                           onClick={() => handleEditPhoto(photo)}
                         >
                           <Edit className="w-4 h-4" />
                         </Button>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button 
                               size="sm" 
                               variant="destructive"
                               className="bg-red-500/95 backdrop-blur-sm hover:bg-red-600 shadow-lg"
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>¿Eliminar foto?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Esta acción no se puede deshacer. La foto se eliminará permanentemente.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancelar</AlertDialogCancel>
                               <AlertDialogAction
                                 onClick={() => handleDeletePhoto(photo)}
                                 className="bg-red-600 hover:bg-red-700"
                               >
                                 Eliminar
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </div>
                     </div>
                  </div>

                  
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPhoto ? 'Editar Foto' : 'Agregar Nueva Foto'}
              </DialogTitle>
              <DialogDescription>
                {selectedPhoto ? 'Modifica los detalles de la foto' : 'Sube una nueva foto o video y agrega los detalles'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título *</label>
                  <Input
                    value={photoForm.title}
                    onChange={(e) => setPhotoForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título de la foto"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fecha *</label>
                  <Input
                    type="date"
                    value={photoForm.date}
                    onChange={(e) => setPhotoForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Descripción</label>
                <Input
                  value={photoForm.description}
                  onChange={(e) => setPhotoForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el momento..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select
                  value={photoForm.file_type}
                                      onValueChange={(value: 'image' | 'video' | 'gif') => setPhotoForm(prev => ({ ...prev, file_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Foto</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Etiquetas</label>
                <div className="space-y-3">
                  {/* Selected tags display */}
                  {photoForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {photoForm.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="default" 
                          className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                          <span className="ml-1 text-xs">×</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Tags dropdown */}
                  <div className="relative">
                    <Select onValueChange={(value) => handleTagToggle(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar etiquetas..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <div className="grid grid-cols-1 gap-1 p-2">
                          {predefinedTags.map((tag) => (
                            <SelectItem 
                              key={tag} 
                              value={tag}
                              className={`cursor-pointer ${
                                photoForm.tags.includes(tag) 
                                  ? 'bg-primary/10 text-primary' 
                                  : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="w-3 h-3" />
                                <span>{tag}</span>
                                {photoForm.tags.includes(tag) && (
                                  <span className="text-xs text-primary">✓</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Custom tag input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar etiqueta personalizada..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          handleAddCustomTag(input.value)
                          input.value = ''
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        handleAddCustomTag(input.value)
                        input.value = ''
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {selectedPhoto ? 'Nueva imagen (opcional)' : 'Imagen/Video *'}
                </label>
                
                {/* File upload area */}
                {!photoForm.image ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file && file.size <= 100 * 1024 * 1024) { // 100MB max
                          const detectedType = file.type.startsWith('video/') ? 'video' : 
                                             file.type === 'image/gif' ? 'gif' : 'image'
                          setPhotoForm(prev => ({ 
                            ...prev, 
                            image: file, 
                            file_type: detectedType 
                          }))
                        } else if (file) {
                          alert('El archivo es demasiado grande. Máximo 100MB.')
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-3">
                        {photoForm.file_type === 'video' ? (
                          <Video className="h-12 w-12 text-gray-400 mx-auto" />
                        ) : (
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                        )}
                        <div>
                          <p className="text-lg font-medium text-gray-700">
                            Haz clic para seleccionar un archivo
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {photoForm.file_type === 'video' ? 'MP4, AVI, MOV' : 'JPG, PNG, GIF'} (máx. 100MB)
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* File preview */}
                    <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {photoForm.file_type === 'video' ? (
                            <Video className="w-8 h-8 text-green-600" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-900 truncate">
                            {photoForm.image.name}
                          </p>
                          <p className="text-xs text-green-700">
                            {formatFileSize(photoForm.image.size)} • {photoForm.file_type === 'video' ? 'Video' : 'Imagen'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setPhotoForm(prev => ({ ...prev, image: null }))}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* File preview */}
                    <div className="relative">
                      <AspectRatio ratio={4/3} className="max-h-48">
                        {photoForm.file_type === 'video' ? (
                          <video
                            src={URL.createObjectURL(photoForm.image)}
                            controls
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          <img
                            src={URL.createObjectURL(photoForm.image)}
                            alt="Preview"
                            className="w-full h-full rounded-lg object-cover"
                          />
                        )}
                      </AspectRatio>
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ✓ Subido
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCreateModal(false)
                setSelectedPhoto(null)
                resetForm()
              }}>
                Cancelar
              </Button>
              <Button onClick={selectedPhoto ? handleUpdatePhoto : handleCreatePhoto}>
                {selectedPhoto ? 'Actualizar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={(open) => {
          setShowDetailModal(open)
          if (!open) {
            // Resetear el tamaño del modal cuando se cierre
            setModalSize('default')
          }
        }}>
          <DialogContent className={`transition-all duration-300 ease-in-out ${
            modalSize === 'wide' ? 'max-w-[95vw] w-auto' :
            modalSize === 'tall' ? 'max-w-[50vw] w-auto' :
            'max-w-4xl'
          }`}>
            {selectedPhoto && (
              <div className="space-y-4">
                                <div className="relative">
                  {selectedPhoto.file_type === 'video' ? (
                    <video
                      src={selectedPhoto.image_url}
                      controls
                      autoPlay
                      className="w-full h-auto max-h-[70vh] rounded-lg object-contain"
                                              onLoadedMetadata={(e) => {
                          // Asegurar que el video se reproduzca correctamente
                          const video = e.target as HTMLVideoElement
                          video.volume = 0.5
                          // Ajustar el modal al aspect ratio del video
                          const aspectRatio = video.videoWidth / video.videoHeight
                          if (aspectRatio > 1.5) {
                            setModalSize('wide') // Video muy horizontal
                          } else if (aspectRatio < 0.7) {
                            setModalSize('tall') // Video muy vertical
                          } else {
                            setModalSize('default') // Aspect ratio normal
                          }
                        }}
                    />
                  ) : (
                    <img
                      src={selectedPhoto.image_url}
                      alt={selectedPhoto.title}
                      className="w-full h-auto max-h-[70vh] rounded-lg object-contain"
                      onLoad={(e) => {
                        // Ajustar el modal al aspect ratio de la imagen
                        const img = e.target as HTMLImageElement
                        const aspectRatio = img.naturalWidth / img.naturalHeight
                        if (aspectRatio > 1.5) {
                          setModalSize('wide') // Imagen muy horizontal
                        } else if (aspectRatio < 0.7) {
                          setModalSize('tall') // Imagen muy vertical
                        } else {
                          setModalSize('default') // Aspect ratio normal
                        }
                      }}
                    />
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(selectedPhoto)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditPhoto(selectedPhoto)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  {filteredPhotos.length > 1 && (
                    <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handlePreviousPhoto}
                        disabled={currentPhotoIndex === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {filteredPhotos.length > 1 && (
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleNextPhoto}
                        disabled={currentPhotoIndex === filteredPhotos.length - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPhoto.title}</h2>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(selectedPhoto.date_taken || '')}
                    </div>
                  </div>
                  {selectedPhoto.description && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedPhoto.description}
                    </p>
                  )}
                  {selectedPhoto.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Etiquetas</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPhoto.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                                  <div className="text-sm text-gray-500">
                  Tipo: {selectedPhoto.file_type === 'video' ? 'Video' : selectedPhoto.file_type === 'gif' ? 'GIF' : 'Imagen'}
                </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Toast */}
        {toast.show && (
          <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{toast.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{toast.description}</p>
              </div>
              <button
                onClick={() => setToast({ show: false, title: '', description: '' })}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
  )
}
