'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  Heart,
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
  const [mediaDimensions, setMediaDimensions] = useState<{ width: number; height: number; aspectRatio: number } | null>(null)
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
        // Si ya tiene thumbnail_url en la BD, usarlo directamente
        if (photo.thumbnail_url) {
          setVideoPosters(prev => ({ ...prev, [photo.id]: photo.thumbnail_url! }))
          return
        }

        // Si no tiene thumbnail, generar uno client-side
        try {
          const video = document.createElement('video')
          video.crossOrigin = 'anonymous'
          video.src = photo.image_url
          video.preload = 'metadata'
          video.muted = true
          
          // Establecer tiempo para capturar un frame más representativo (no el primer frame que suele ser negro)
          video.addEventListener('loadedmetadata', () => {
            // Intentar capturar en 1 segundo o 10% del video, lo que sea menor
            const seekTime = Math.min(1, video.duration * 0.1)
            video.currentTime = seekTime
          })

          // Capturar el frame cuando el video se posicione en el tiempo deseado
          video.addEventListener('seeked', () => {
            try {
              const canvas = document.createElement('canvas')
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              const ctx = canvas.getContext('2d')
              
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
                setVideoPosters(prev => ({ ...prev, [photo.id]: dataUrl }))
              }
            } catch (err) {
              console.warn('Error generando thumbnail del video:', err)
              // Si falla, usar un placeholder
            }
          })

          // Manejar errores de carga
          video.addEventListener('error', () => {
            console.warn('Error cargando video para thumbnail:', photo.id)
          })
        } catch (err) {
          console.warn('Error inicializando generación de thumbnail:', err)
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
    if (!photoForm.image) {
      setToast({
        show: true,
        title: 'Error',
        description: 'Por favor selecciona un archivo para subir',
        variant: 'destructive'
      })
      return
    }

    // Generar título automático si no existe
    const finalTitle = photoForm.title || 
      (photoForm.image ? photoForm.image.name.replace(/\.[^/.]+$/, '') : '') || 
      `Foto ${new Date().toLocaleDateString('es-ES')}`
    
    // Asegurar que la fecha esté establecida (debería estar automáticamente)
    const finalDate = photoForm.date || new Date().toISOString().split('T')[0]

    const imageFile = photoForm.image
    const fileType = imageFile.type.startsWith('video/') ? 'video' : 
                    imageFile.type === 'image/gif' ? 'gif' : 'image'
    
    // Crear URL temporal para actualización optimista
    const tempImageUrl = URL.createObjectURL(imageFile)
    
    // Crear foto temporal para actualización optimista
    const tempPhoto: Photo = {
      id: `temp-${Date.now()}`,
      title: finalTitle,
      description: photoForm.description || undefined,
      image_url: tempImageUrl,
      thumbnail_url: undefined,
      file_type: fileType,
      category: 'otro',
      tags: photoForm.tags,
      location: undefined,
      date_taken: finalDate,
      favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // ACTUALIZACIÓN OPTIMISTA: Mostrar la foto inmediatamente
    setPhotos(prev => [tempPhoto, ...prev])
    
    // Cerrar modal inmediatamente
    setShowCreateModal(false)
    resetForm()
    
    // Subir imagen a Supabase Storage en segundo plano
    try {
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

      // Generar thumbnail para videos si es necesario
      let thumbnailUrl = null
      if (fileType === 'video') {
        try {
          const video = document.createElement('video')
          video.src = tempImageUrl
          video.currentTime = 0.1
          
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          await new Promise<void>((resolve) => {
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
                resolve()
              }, 'image/jpeg', 0.8)
            })
            video.load()
          })
        } catch (error) {
          console.warn('No se pudo generar thumbnail del video:', error)
        }
      }

      // Crear registro en la base de datos
      const photoData: any = {
        title: finalTitle,
        description: photoForm.description || null,
        image_url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        file_type: fileType,
        category: 'otro',
        tags: photoForm.tags,
        location: null,
        date_taken: finalDate,
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

      // Actualizar con la foto real de la base de datos
      const realPhoto: Photo = {
        id: data.id,
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        thumbnail_url: data.thumbnail_url,
        file_type: data.file_type,
        category: data.category,
        tags: data.tags || [],
        location: data.location,
        date_taken: data.date_taken,
        favorite: data.favorite,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
      
      // Reemplazar la foto temporal con la real
      setPhotos(prev => prev.map(p => p.id === tempPhoto.id ? realPhoto : p))
      
      // Limpiar URL temporal
      URL.revokeObjectURL(tempImageUrl)
      
      setToast({
        show: true,
        title: 'Éxito',
        description: 'Foto agregada correctamente'
      })
    } catch (error) {
      console.error('Error creating photo:', error)
      // Revertir actualización optimista
      setPhotos(prev => prev.filter(p => p.id !== tempPhoto.id))
      URL.revokeObjectURL(tempImageUrl)
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
    // ACTUALIZACIÓN OPTIMISTA: Eliminar la foto inmediatamente del estado
    const photoToDelete = photo
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
    
    // Cerrar el modal inmediatamente
    setShowDetailModal(false)
    setSelectedPhoto(null)
    
    // Mostrar toast de éxito inmediatamente
    setToast({
      show: true,
      title: 'Éxito',
      description: 'Foto eliminada correctamente'
    })
    
    // Eliminar de la base de datos en segundo plano
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoToDelete.id)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      // Revertir actualización optimista en caso de error
      setPhotos(prev => {
        // Verificar si la foto ya no está en el estado antes de agregarla de nuevo
        const exists = prev.find(p => p.id === photoToDelete.id)
        if (!exists) {
          return [photoToDelete, ...prev]
        }
        return prev
      })
      setToast({
        show: true,
        title: 'Error',
        description: 'Error al eliminar la foto. Se ha restaurado.',
        variant: 'destructive'
      })
    }
  }

  const handleViewPhoto = useCallback((photo: Photo) => {
    setSelectedPhoto(photo)
    setCurrentPhotoIndex(filteredPhotos.findIndex(p => p.id === photo.id))
    setModalSize('default') // Reset modal size
    setMediaDimensions(null)
    setShowDetailModal(true)
  }, [filteredPhotos])

  // Función mejorada para calcular el tamaño del modal basado en dimensiones reales y viewport
  const calculateModalSize = useCallback((width: number, height: number, aspectRatio: number) => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080
    const isMobile = viewportWidth < 768
    
    // Considerar el espacio para controles y padding
    const availableWidth = viewportWidth * (isMobile ? 0.95 : 0.9)
    const availableHeight = viewportHeight * (isMobile ? 0.85 : 0.8)
    
    // Calcular dimensiones ideales manteniendo aspect ratio
    let idealWidth = width
    let idealHeight = height
    
    // Si es más ancho que alto, limitar por ancho
    if (aspectRatio > 1) {
      idealWidth = Math.min(width, availableWidth)
      idealHeight = idealWidth / aspectRatio
      
      // Si aún es muy alto, limitar por altura
      if (idealHeight > availableHeight) {
        idealHeight = availableHeight
        idealWidth = idealHeight * aspectRatio
      }
    } else {
      // Si es más alto que ancho, limitar por altura
      idealHeight = Math.min(height, availableHeight)
      idealWidth = idealHeight * aspectRatio
      
      // Si aún es muy ancho, limitar por ancho
      if (idealWidth > availableWidth) {
        idealWidth = availableWidth
        idealHeight = idealWidth / aspectRatio
      }
    }
    
    // Determinar el tamaño del modal basado en aspect ratio y dimensiones
    if (aspectRatio > 2.0) {
      return 'wide' // Panoramas muy anchos
    } else if (aspectRatio < 0.5) {
      return 'tall' // Imágenes muy verticales (selfies, etc.)
    } else if (aspectRatio > 1.3) {
      return 'wide' // Imágenes horizontales
    } else if (aspectRatio < 0.75) {
      return 'tall' // Imágenes verticales
    }
    
    return 'default'
  }, [])


  const handlePreviousPhoto = useCallback(() => {
    if (currentPhotoIndex > 0) {
      const newIndex = currentPhotoIndex - 1
      setCurrentPhotoIndex(newIndex)
      setSelectedPhoto(filteredPhotos[newIndex])
      setModalSize('default') // Reset modal size for new photo
      setMediaDimensions(null) // Reset dimensions
    }
  }, [currentPhotoIndex, filteredPhotos])

  const handleNextPhoto = useCallback(() => {
    if (currentPhotoIndex < filteredPhotos.length - 1) {
      const newIndex = currentPhotoIndex + 1
      setCurrentPhotoIndex(newIndex)
      setSelectedPhoto(filteredPhotos[newIndex])
      setModalSize('default') // Reset modal size for new photo
      setMediaDimensions(null) // Reset dimensions
    }
  }, [currentPhotoIndex, filteredPhotos])

  // Keyboard shortcuts para navegación
  useEffect(() => {
    if (!showDetailModal) return

    const handleKeyPress = (e: KeyboardEvent) => {
      // Navegación con flechas
      if (e.key === 'ArrowLeft' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        handlePreviousPhoto()
      } else if (e.key === 'ArrowRight' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        handleNextPhoto()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showDetailModal, handlePreviousPhoto, handleNextPhoto])

  const handleDownload = useCallback((photo: Photo) => {
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
  }, [])

  const resetForm = useCallback(() => {
    setPhotoForm({
      title: '',
      date: '',
      description: '',
      tags: [],
      file_type: 'image',
      image: null
    })
  }, [])

  const handleTagToggle = useCallback((tag: string) => {
    setPhotoForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }, [])

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
          <Button onClick={() => {
            // Establecer fecha automáticamente al abrir el modal
            const today = new Date().toISOString().split('T')[0]
            setPhotoForm({
              title: '',
              date: today,
              description: '',
              tags: [],
              file_type: 'image',
              image: null
            })
            setSelectedPhoto(null)
            setShowCreateModal(true)
          }} className="w-full sm:w-auto">
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
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleViewPhoto(photo)}
                    >
                      {photo.file_type === 'video' ? (
                        <div className="relative w-full group/video">
                          <video
                            src={photo.image_url}
                            className="w-full h-auto rounded-lg object-cover"
                            preload="metadata"
                            muted
                            playsInline
                            poster={videoPosters[photo.id] || photo.thumbnail_url || undefined}
                            onLoadedMetadata={(e) => {
                              const video = e.target as HTMLVideoElement
                              video.style.aspectRatio = `${video.videoWidth}/${video.videoHeight}`
                              // Si no hay poster y no hay thumbnail_url, intentar generar uno
                              if (!videoPosters[photo.id] && !photo.thumbnail_url) {
                                video.currentTime = Math.min(1, video.duration * 0.1)
                              }
                            }}
                            onSeeked={(e) => {
                              const video = e.target as HTMLVideoElement
                              // Si aún no hay poster generado, intentar generarlo ahora
                              if (!videoPosters[photo.id] && !photo.thumbnail_url && video.readyState >= 2) {
                                try {
                                  const canvas = document.createElement('canvas')
                                  canvas.width = video.videoWidth
                                  canvas.height = video.videoHeight
                                  const ctx = canvas.getContext('2d')
                                  if (ctx) {
                                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
                                    setVideoPosters(prev => ({ ...prev, [photo.id]: dataUrl }))
                                    video.poster = dataUrl
                                  }
                                } catch (err) {
                                  // Silencioso si falla
                                }
                              }
                            }}
                          />
                          {/* Indicador sutil de video - pequeño ícono en esquina superior */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover/video:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-black/70 backdrop-blur-sm rounded-full p-1.5">
                              <PlayCircle className="w-4 h-4 text-white" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={photo.image_url}
                          alt={photo.title}
                          className="w-full h-auto rounded-lg object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>

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
                {selectedPhoto ? 'Modifica los detalles de la foto' : 'Sube una nueva foto o video'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Solo mostrar campos adicionales cuando se está editando */}
              {selectedPhoto ? (
                <>
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
                </>
              ) : null}
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
                          // Generar título automático basado en el nombre del archivo
                          const fileName = file.name.replace(/\.[^/.]+$/, '') // Remover extensión
                          setPhotoForm(prev => ({ 
                            ...prev, 
                            image: file, 
                            file_type: detectedType,
                            // Solo establecer título si no hay uno (para nuevas fotos)
                            title: prev.title || fileName || `Foto ${new Date().toLocaleDateString('es-ES')}`
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

        {/* Detail Modal - Simplificado */}
        <Dialog open={showDetailModal} onOpenChange={(open) => {
          setShowDetailModal(open)
          if (!open) {
            // Resetear estados cuando se cierre
            setModalSize('default')
            setMediaDimensions(null)
          }
        }}>
          <DialogContent className={`transition-all duration-300 ease-in-out p-0 gap-0 ${
            modalSize === 'wide' 
              ? 'max-w-[95vw] w-auto sm:max-w-[90vw]' 
              : modalSize === 'tall' 
                ? 'max-w-[50vw] w-auto sm:max-w-[85vw]' 
                : 'max-w-4xl w-full sm:max-w-[90vw]'
          }`}>
            {selectedPhoto && (
              <div className="space-y-0">
                {/* Contenedor de media - Mejorado */}
                <div className="relative bg-gray-50 dark:bg-gray-900 rounded-t-lg overflow-hidden">
                  {selectedPhoto.file_type === 'video' ? (
                    <video
                      src={selectedPhoto.image_url}
                      controls
                      autoPlay
                      className="w-full h-auto max-h-[75vh] sm:max-h-[80vh] object-contain"
                      onLoadedMetadata={(e) => {
                        const video = e.target as HTMLVideoElement
                        video.volume = 0.5
                        const aspectRatio = video.videoWidth / video.videoHeight
                        const calculatedSize = calculateModalSize(video.videoWidth, video.videoHeight, aspectRatio)
                        setModalSize(calculatedSize)
                        setMediaDimensions({
                          width: video.videoWidth,
                          height: video.videoHeight,
                          aspectRatio
                        })
                      }}
                    />
                  ) : (
                    <img
                      src={selectedPhoto.image_url}
                      alt=""
                      className="w-full h-auto max-h-[75vh] sm:max-h-[80vh] object-contain"
                      onLoad={(e) => {
                        const img = e.target as HTMLImageElement
                        const aspectRatio = img.naturalWidth / img.naturalHeight
                        const calculatedSize = calculateModalSize(img.naturalWidth, img.naturalHeight, aspectRatio)
                        setModalSize(calculatedSize)
                        setMediaDimensions({
                          width: img.naturalWidth,
                          height: img.naturalHeight,
                          aspectRatio
                        })
                      }}
                    />
                  )}
                </div>
                
                {/* Navegación y fecha - Barra inferior mejorada */}
                <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg p-3 sm:p-4">
                  {/* Navegación entre fotos */}
                  {filteredPhotos.length > 1 && (
                    <div className="flex items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handlePreviousPhoto}
                        disabled={currentPhotoIndex === 0}
                        className="h-11 w-11 sm:h-12 sm:w-12 p-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 rounded-full"
                        title="Anterior (←)"
                      >
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                      
                      {/* Indicador de posición en galería */}
                      <div className="flex-1 text-center">
                        <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                          {currentPhotoIndex + 1} / {filteredPhotos.length}
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleNextPhoto}
                        disabled={currentPhotoIndex === filteredPhotos.length - 1}
                        className="h-11 w-11 sm:h-12 sm:w-12 p-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 rounded-full"
                        title="Siguiente (→)"
                      >
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                    </div>
                  )}
                
                  {/* Panel de información - Fecha y botón eliminar */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" />
                      <span className="font-medium">{formatDate(selectedPhoto.date_taken || '')}</span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 min-h-[44px]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
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
                            onClick={() => {
                              if (selectedPhoto) {
                                handleDeletePhoto(selectedPhoto)
                              }
                            }}
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
