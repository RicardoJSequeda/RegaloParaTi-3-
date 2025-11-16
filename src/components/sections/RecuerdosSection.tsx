'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { LeafletMap } from '@/components/ui/leaflet-map'
import { Heart, Calendar, MapPin, Image, Clock, Star, Map, Camera, Plane, Search, Edit, Trash2, ChevronRight, AlertCircle, X, Save, Plus, Upload } from 'lucide-react'
import { Milestone, MemoryPlace } from '@/types'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export function RecuerdosSection() {
  const supabase = getBrowserClient()
  
  // Estados para datos de Supabase
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [places, setPlaces] = useState<MemoryPlace[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para UI
  const [selectedPlaceFilter, setSelectedPlaceFilter] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<MemoryPlace[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showMapResults, setShowMapResults] = useState(false)
  
  // Debounce para búsqueda (optimización de rendimiento)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingMilestone, setViewingMilestone] = useState<Milestone | null>(null)
  const [isEditPlaceModalOpen, setIsEditPlaceModalOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState<MemoryPlace | null>(null)
  const [isDeletePlaceModalOpen, setIsDeletePlaceModalOpen] = useState(false)
  const [deletingPlace, setDeletingPlace] = useState<MemoryPlace | null>(null)
  
  // Estados para upload de imágenes
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Estados para mapPlaces (mantener compatibilidad con FreeMap)
  const [mapPlaces, setMapPlaces] = useState([
    {
      id: 1,
      name: "Parque Central",
      address: "Calle Principal 123, Ciudad",
      lat: 19.4326,
      lng: -99.1332,
      type: "Parque",
      visited: true
    },
    {
      id: 2,
      name: "Restaurante El Amor",
      address: "Av. Romántica 456, Ciudad",
      lat: 19.4426,
      lng: -99.1432,
      type: "Restaurante",
      visited: true
    },
    {
      id: 3,
      name: "Playa del Amor",
      address: "Costa del Pacífico, México",
      lat: 19.4226,
      lng: -99.1232,
      type: "Playa",
      visited: true
    },
    {
      id: 4,
      name: "París",
      address: "Francia",
      lat: 48.8566,
      lng: 2.3522,
      type: "Ciudad",
      visited: false
    },
    {
      id: 5,
      name: "Venecia",
      address: "Italia",
      lat: 45.4408,
      lng: 12.3155,
      type: "Ciudad",
      visited: false
    },
    {
      id: 6,
      name: "Casa de Montería",
      address: "Tv. 3 #21-7, Montería, Córdoba",
      lat: 8.7505,
      lng: -75.8786,
      type: "Casa",
      visited: true
    },
    {
      id: 7,
      name: "Centro Comercial Montería",
      address: "Calle 30 #15-45, Montería, Córdoba",
      lat: 8.7512,
      lng: -75.8791,
      type: "Centro Comercial",
      visited: false
    },
    {
      id: 8,
      name: "Universidad de Córdoba",
      address: "Carrera 6 #76-103, Montería, Córdoba",
      lat: 8.7520,
      lng: -75.8800,
      type: "Universidad",
      visited: true
    }
  ])

  // Cargar datos desde Supabase
  useEffect(() => {
    loadData()
  }, [])

  // Suscripción en tiempo real con throttle
  useEffect(() => {
    let lastMilestonesUpdate = 0
    let lastPlacesUpdate = 0
    const throttleDelay = 1000 // 1 segundo
    
    const channel = supabase
      .channel('memories_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'milestones' }, 
        () => {
          const now = Date.now()
          if (now - lastMilestonesUpdate > throttleDelay) {
            lastMilestonesUpdate = now
            loadMilestones()
          }
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'places' }, 
        () => {
          const now = Date.now()
          if (now - lastPlacesUpdate > throttleDelay) {
            lastPlacesUpdate = now
            loadPlaces()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadMilestones(),
        loadPlaces()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('date_taken', { ascending: false })

      if (error) {
        console.error('Error loading milestones:', error)
        return
      }

      setMilestones(data || [])
    } catch (error) {
      console.error('Error in loadMilestones:', error)
    }
  }

  const loadPlaces = async () => {
    try {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading places:', error)
        return
      }

      setPlaces(data || [])
    } catch (error) {
      console.error('Error in loadPlaces:', error)
    }
  }

  // Filtrar hitos (sin filtro de categoría)
  const filteredMilestones = useMemo(() => {
    return milestones
  }, [milestones])

  // Función de búsqueda avanzada (memoizada)
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowMapResults(false)
      return
    }

    setIsSearching(true)
    
    // Búsqueda local avanzada en lugares existentes
    const results = places.filter(place => {
      const searchLower = query.toLowerCase()
      const searchTerms = searchLower.split(' ').filter(term => term.length > 0)
      
      // Búsqueda por términos múltiples
      return searchTerms.every(term => {
        return (
          place.name.toLowerCase().includes(term) ||
          (place.address && place.address.toLowerCase().includes(term)) ||
          (place.description && place.description.toLowerCase().includes(term)) ||
          (place.tags && place.tags.some(tag => tag.toLowerCase().includes(term))) ||
          (place.type && place.type.toLowerCase().includes(term))
        )
      })
    })

    // Ordenar resultados por relevancia
    const sortedResults = results.sort((a, b) => {
      const aScore = getRelevanceScore(a, query)
      const bScore = getRelevanceScore(b, query)
      return bScore - aScore
    })

    setSearchResults(sortedResults)
    setShowMapResults(sortedResults.length > 0)
    setIsSearching(false)
  }, [places])

  // Función para calcular relevancia de búsqueda
  const getRelevanceScore = (place: MemoryPlace, query: string): number => {
    const queryLower = query.toLowerCase()
    let score = 0
    
    // Puntuación por coincidencia exacta en nombre
    if (place.name.toLowerCase().includes(queryLower)) {
      score += 10
    }
    
    // Puntuación por coincidencia en dirección
    if (place.address && place.address.toLowerCase().includes(queryLower)) {
      score += 8
    }
    
    // Puntuación por coincidencia en descripción
    if (place.description && place.description.toLowerCase().includes(queryLower)) {
      score += 5
    }
    
    // Puntuación por coincidencia en tags
    if (place.tags && place.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
      score += 3
    }
    
    // Puntuación por tipo
    if (place.type && place.type.toLowerCase().includes(queryLower)) {
      score += 2
    }
    
    return score
  }

  // Búsqueda con debounce optimizado
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      performSearch(debouncedSearchTerm)
    } else {
      setSearchResults([])
      setShowMapResults(false)
    }
  }, [debouncedSearchTerm, performSearch])

  // Filtrar lugares según el filtro seleccionado (memoizado)
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      const matchesFilter = selectedPlaceFilter === 'Todos' ||
                           (selectedPlaceFilter === 'Visitados' && place.status === 'visitado') ||
                           (selectedPlaceFilter === 'Pendientes' && place.status === 'pendiente')
      return matchesFilter
    })
  }, [places, selectedPlaceFilter])

  // Función para agregar lugar desde el mapa
  const handleAddPlaceFromMap = async (newPlace: any) => {
    try {
      console.log('🗺️ Agregando lugar desde el mapa:', newPlace)
      
      // Validar datos del lugar
      if (!newPlace.name || !newPlace.address || !newPlace.lat || !newPlace.lng) {
        console.error('❌ Datos del lugar incompletos:', newPlace)
        alert('Error: Datos del lugar incompletos')
        return
      }

      const placeData = {
        name: newPlace.name,
        address: newPlace.address,
        lat: newPlace.lat,
        lng: newPlace.lng,
        type: newPlace.type.toLowerCase(),
        status: 'pendiente',
        tags: [newPlace.type.toLowerCase()]
      }

      console.log('📝 Enviando datos a Supabase:', placeData)

      const { data, error } = await supabase
        .from('places')
        .insert([placeData])
        .select()
        .single()

      if (error) {
        console.error('❌ Error al agregar lugar en Supabase:', error)
        alert('Error al guardar el lugar en la base de datos')
        return
      }

      console.log('✅ Lugar agregado exitosamente:', data)

      // Actualizar mapPlaces para compatibilidad
      const newMapPlace = {
        id: mapPlaces.length + 1,
        name: newPlace.name,
        address: newPlace.address,
        lat: newPlace.lat,
        lng: newPlace.lng,
        type: newPlace.type,
        visited: false
      }
      setMapPlaces(prev => [...prev, newMapPlace])
      
      // Recargar lugares y limpiar búsqueda si está activa
      await loadPlaces()
      if (showMapResults) {
        setShowMapResults(false)
        setSearchResults([])
        setSearchTerm('')
      }

      // Mostrar mensaje de éxito
      alert(`✅ Lugar "${newPlace.name}" agregado exitosamente!`)
      
    } catch (error) {
      console.error('❌ Error in handleAddPlaceFromMap:', error)
      alert('Error inesperado al agregar el lugar')
    }
  }

  // Funciones para editar hitos
  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setIsEditModalOpen(true)
  }

  const handleSaveMilestone = async () => {
    if (!editingMilestone) return

    try {
      let imageUrl = editingMilestone.image_url

      // Si hay una nueva imagen seleccionada, subirla
      if (selectedImageFile) {
        try {
          imageUrl = await uploadImageToSupabase(selectedImageFile)
          if (!imageUrl) {
            alert('Error al subir la imagen')
            return
          }
        } catch (error) {
          alert('Error al subir la imagen: ' + (error as Error).message)
          return
        }
      }

      // Guardar valores antes de actualizar
      const milestoneId = editingMilestone.id
      const milestoneData = {
        title: editingMilestone.title,
        description: editingMilestone.description,
        image_url: imageUrl,
        date_taken: editingMilestone.date_taken,
        type: editingMilestone.type,
        location: editingMilestone.location,
        tags: editingMilestone.tags,
        is_favorite: editingMilestone.is_favorite
      }

      const { data, error } = await supabase
        .from('milestones')
        .update(milestoneData)
        .eq('id', milestoneId)
        .select()
        .single()

      if (error) {
        console.error('Error updating milestone:', error)
        alert('Error al actualizar el hito: ' + (error.message || 'Error desconocido'))
        return
      }

      if (!data) {
        throw new Error('No se recibieron datos de la base de datos')
      }

      // Actualizar estado local con los datos de la BD
      const updatedMilestone: Milestone = {
        id: data.id,
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        date_taken: data.date_taken,
        type: data.type,
        location: data.location,
        tags: data.tags || [],
        is_favorite: data.is_favorite || false,
        created_at: data.created_at,
        updated_at: data.updated_at
      }

      setMilestones(prev => prev.map(m => m.id === milestoneId ? updatedMilestone : m))

      setIsEditModalOpen(false)
      setEditingMilestone(null)
      clearImageSelection()
    } catch (error) {
      console.error('Error in handleSaveMilestone:', error)
      alert('Error al guardar el hito: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditingMilestone(null)
    clearImageSelection()
  }

  // Funciones para eliminar hitos
  const handleDeleteMilestone = (milestone: Milestone) => {
    setDeletingMilestone(milestone)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingMilestone) return

    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', deletingMilestone.id)

      if (error) {
        console.error('Error deleting milestone:', error)
        return
      }

      setIsDeleteModalOpen(false)
      setDeletingMilestone(null)
      await loadMilestones()
    } catch (error) {
      console.error('Error in handleConfirmDelete:', error)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeletingMilestone(null)
  }

  // Funciones para editar lugares
  const handleEditPlace = (place: MemoryPlace) => {
    setEditingPlace(place)
    setIsEditPlaceModalOpen(true)
  }

  const handleSavePlace = async () => {
    if (!editingPlace) return

    try {
      let imageUrl = editingPlace.image_url

      // Si hay una nueva imagen seleccionada, subirla
      if (selectedImageFile) {
        try {
          imageUrl = await uploadImageToSupabase(selectedImageFile)
          if (!imageUrl) {
            alert('Error al subir la imagen')
            return
          }
        } catch (error) {
          alert('Error al subir la imagen: ' + (error as Error).message)
          return
        }
      }

      const { error } = await supabase
        .from('places')
        .update({
          name: editingPlace.name,
          address: editingPlace.address,
          lat: editingPlace.lat,
          lng: editingPlace.lng,
          type: editingPlace.type,
          status: editingPlace.status,
          visit_date: editingPlace.visit_date,
          description: editingPlace.description,
          image_url: imageUrl,
          tags: editingPlace.tags,
          is_favorite: editingPlace.is_favorite
        })
        .eq('id', editingPlace.id)

      if (error) {
        console.error('Error updating place:', error)
        return
      }

      setIsEditPlaceModalOpen(false)
      setEditingPlace(null)
      clearImageSelection()
      await loadPlaces()
    } catch (error) {
      console.error('Error in handleSavePlace:', error)
    }
  }

  const handleCancelEditPlace = () => {
    setIsEditPlaceModalOpen(false)
    setEditingPlace(null)
    clearImageSelection()
  }

  // Funciones para eliminar lugares
  const handleDeletePlace = (place: MemoryPlace) => {
    setDeletingPlace(place)
    setIsDeletePlaceModalOpen(true)
  }

  const handleConfirmDeletePlace = async () => {
    if (!deletingPlace) return

    try {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', deletingPlace.id)

      if (error) {
        console.error('Error deleting place:', error)
        return
      }

      setIsDeletePlaceModalOpen(false)
      setDeletingPlace(null)
      await loadPlaces()
    } catch (error) {
      console.error('Error in handleConfirmDeletePlace:', error)
    }
  }

  const handleCancelDeletePlace = () => {
    setIsDeletePlaceModalOpen(false)
    setDeletingPlace(null)
  }

  // Funciones para upload de imágenes
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido')
        return
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen debe ser menor a 10MB')
        return
      }
      
      setSelectedImageFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true)
      
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
      const filePath = `memories/${fileName}`
      
      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file)
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        throw new Error('Error al subir la imagen')
      }
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)
      
      return urlData.publicUrl
    } catch (error) {
      console.error('Error in uploadImageToSupabase:', error)
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const clearImageSelection = () => {
    setSelectedImageFile(null)
    setImagePreview(null)
    // Limpiar ambos inputs de imagen
    const imageUpload = document.getElementById('image-upload') as HTMLInputElement
    const placeImageUpload = document.getElementById('place-image-upload') as HTMLInputElement
    
    if (imageUpload) imageUpload.value = ''
    if (placeImageUpload) placeImageUpload.value = ''
  }

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  const timelineVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Recuerdos</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando recuerdos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div 
        className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 overflow-x-hidden px-3 pb-6 pt-3 sm:gap-6 sm:px-4 sm:pb-8 sm:pt-4 md:gap-8 md:px-6 lg:gap-10 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* UX: Header optimizado para móvil con tipografía escalable desde 320px */}
        <motion.div className="flex flex-col items-center gap-1.5 text-center sm:gap-2 md:gap-3" variants={itemVariants}>
          <Badge
            aria-hidden="true"
            variant="secondary"
            className="w-fit rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-pink-600 shadow-sm ring-1 ring-pink-200/70 backdrop-blur sm:px-3 sm:py-1 sm:text-[11px]"
          >
            Nuestra Historia
          </Badge>
          <h1 className="w-full text-wrap text-[1.5rem] font-extrabold leading-[1.2] tracking-tight text-gray-900 dark:text-white sm:text-[1.75rem] md:text-3xl lg:text-4xl">
            Recuerdos
          </h1>
          <p className="w-full max-w-2xl px-1 text-[12px] leading-[1.5] text-gray-600 dark:text-gray-300 sm:text-sm sm:leading-5 md:text-base md:leading-6 lg:text-lg">
            Revive los momentos más especiales de nuestra historia juntos
          </p>
        </motion.div>

        {/* UX: Sección de hitos optimizada para móvil con filtros táctiles */}
        <motion.div className="flex w-full flex-col gap-4 sm:gap-6 md:gap-8" variants={itemVariants}>
          {/* Header con estadísticas responsive */}
          <div className="flex flex-col items-center gap-2 text-center sm:gap-3 md:gap-4">
            <h2 className="w-full text-wrap text-lg font-bold text-pink-700 dark:text-pink-400 sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
              Hitos de Nuestro Amor 💖
            </h2>
            <p className="text-[12px] text-gray-600 dark:text-gray-400 sm:text-sm md:text-base lg:text-lg">
              {filteredMilestones.length} de {milestones.length} hitos especiales
            </p>
            
          </div>

          {/* UX: Timeline optimizado para móvil con mejor espaciado y legibilidad */}
          <motion.div 
            className="relative w-full timeline-container"
            variants={timelineVariants}
          >
            {/* Línea central mejorada - solo visible en desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 timeline-line transform -translate-x-1/2"></div>
            
            <div className="flex w-full flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16">
              {filteredMilestones.length === 0 ? (
                <motion.div 
                  className="w-full text-center rounded-xl py-6 timeline-empty px-3 sm:rounded-2xl sm:py-8 md:rounded-3xl md:py-12 lg:py-16 sm:px-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-14 h-14 timeline-empty-icon rounded-full flex items-center justify-center mx-auto mb-3 sm:w-16 sm:h-16 sm:mb-4 md:w-20 md:h-20 md:mb-6">
                    <Heart className="w-7 h-7 text-pink-500 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 sm:text-lg sm:mb-2 md:text-xl md:mb-3 lg:text-2xl">
                    ¡Comienza tu historia de amor!
                  </h3>
                  <p className="text-[12px] text-gray-600 dark:text-gray-400 mb-3 max-w-md mx-auto leading-relaxed sm:text-sm sm:mb-4 md:text-base md:mb-6">
                    Agrega tu primer hito para comenzar a documentar los momentos más especiales de vuestra relación
                  </p>
                  <Button 
                    className="bg-pink-500 text-white rounded-full shadow-lg min-h-[44px] px-4 py-2.5 text-[12px] font-semibold active:scale-95 hover:bg-pink-600 sm:px-5 sm:py-3 sm:text-sm md:text-base"
                    onClick={() => {/* Aquí podrías abrir un modal para agregar hito */}}
                  >
                      <Plus className="w-3.5 h-3.5 mr-1.5 sm:w-4 sm:h-4 sm:mr-2 md:w-5 md:h-5" />
                      Agregar Primer Hito
                    </Button>
                </motion.div>
              ) : (
                filteredMilestones.map((milestone, index) => {
                  const isLeft = index % 2 === 0;
                  
                  return (
                    <motion.div 
                      key={milestone.id} 
                      className={`flex ${isLeft ? 'justify-start' : 'justify-end'} w-full items-center ${isLeft ? 'timeline-item-left' : 'timeline-item-right'}`}
                      initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                    >
                      {/* Espaciador para desktop */}
                      {isLeft ? (
                        <div className="w-3/10 hidden md:block"></div>
                      ) : null}
                      
                      <div className={`relative w-full max-w-[95%] sm:max-w-[90%] mx-auto md:w-2/5 ${isLeft ? 'md:ml-6' : 'md:mr-6'}`}>
                        {/* Punto de la línea de tiempo */}
                        <motion.div 
                          className={`absolute ${isLeft ? '-left-10' : '-right-10'} top-8 hidden md:block`}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <div className="w-5 h-5 rounded-full timeline-dot"></div>
                        </motion.div>

                        {/* UX: Número en móvil con tamaño táctil */}
                        <div className="mb-3 text-center md:hidden sm:mb-4 md:mb-6">
                          <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto shadow-lg sm:w-12 sm:h-12 sm:text-base md:text-lg">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                        </div>

                        {/* UX: Tarjeta del hito optimizada para móvil con feedback táctil */}
                        <motion.div
                          className="group w-full"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="timeline-card w-full overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl sm:rounded-2xl">
                            {/* Imagen del hito con altura responsive */}
                            <div className="relative w-full">
                              <div 
                                className="w-full h-36 overflow-hidden sm:h-44 md:h-52 lg:h-56 cursor-pointer"
                                onClick={() => {
                                  setViewingMilestone(milestone)
                                  setIsViewModalOpen(true)
                                }}
                              >
                                <img
                                  src={milestone.image_url || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop&crop=center'}
                                  alt={milestone.title}
                                  className="w-full h-full object-cover timeline-image rounded-t-xl sm:rounded-t-2xl"
                                />
                              </div>

                              {/* Badge de fecha con tipografía responsive */}
                              <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 md:bottom-3 md:left-3">
                                <Badge className="timeline-date-badge text-gray-800 dark:text-gray-200 border-0 shadow-md text-[10px] px-1.5 py-0.5 sm:text-xs sm:px-2 sm:py-1 md:text-sm md:px-3">
                                  <Calendar className="h-2.5 w-2.5 mr-0.5 sm:h-3 sm:w-3 sm:mr-1 md:h-3.5 md:w-3.5" />
                                  {new Date(milestone.date_taken).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </Badge>
                              </div>
                            </div>

                            {/* UX: Contenido del hito con padding responsive y tipografía escalable */}
                            <div className="p-3 timeline-card-content sm:p-4 md:p-5 lg:p-6">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-base font-bold text-gray-800 dark:text-white timeline-title sm:text-lg md:text-xl lg:text-2xl flex-1">
                                  {milestone.title}
                                </h3>
                                {/* Botones de acción fuera de la imagen */}
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50 active:scale-95 dark:hover:bg-blue-900/20 min-h-[44px] min-w-[44px] sm:h-7 sm:w-7 sm:min-h-0 sm:min-w-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditMilestone(milestone)
                                    }}
                                    aria-label="Editar hito"
                                  >
                                    <Edit className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 active:scale-95 dark:hover:bg-red-900/20 min-h-[44px] min-w-[44px] sm:h-7 sm:w-7 sm:min-h-0 sm:min-w-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteMilestone(milestone)
                                    }}
                                    aria-label="Eliminar hito"
                                  >
                                    <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2 sm:text-sm sm:mb-4 sm:line-clamp-3 md:text-base">
                                {milestone.description}
                              </p>

                              {/* UX: Botón ver más detalles mejorado */}
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-medium text-[12px] active:scale-95 min-h-[44px] sm:text-sm sm:min-h-0 md:text-base"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setViewingMilestone(milestone)
                                  setIsViewModalOpen(true)
                                }}
                              >
                                Ver más detalles
                                <ChevronRight className="h-3.5 w-3.5 ml-0.5 sm:h-4 sm:w-4 sm:ml-1" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Espaciador para desktop */}
                      {!isLeft ? (
                        <div className="w-3/10 hidden md:block"></div>
                      ) : null}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* UX: Sección del mapa optimizada para móvil con altura responsive */}
        <motion.div className="flex w-full max-w-6xl flex-col gap-3 mx-auto sm:gap-4" variants={itemVariants}>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h2 className="w-full text-wrap text-base font-bold text-pink-700 dark:text-pink-400 sm:text-lg md:text-xl lg:text-2xl">
              {showMapResults ? 'Resultados de Búsqueda en el Mapa' : 'Mapa de Lugares Especiales'}
            </h2>
            {showMapResults && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowMapResults(false)
                  setSearchResults([])
                }}
                className="text-pink-600 border-pink-300 hover:bg-pink-50 active:scale-95 dark:border-pink-600 dark:text-pink-400 dark:hover:bg-pink-900/20 text-[11px] min-h-[44px] px-3 sm:text-xs sm:px-4 md:text-sm"
              >
                <X className="h-3.5 w-3.5 mr-1 sm:h-4 sm:w-4" />
                Limpiar búsqueda
              </Button>
            )}
          </div>
          
          {/* UX: Información de resultados con tipografía responsive */}
          {showMapResults && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5 sm:rounded-xl sm:p-3">
              <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 sm:gap-2">
                <Search className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                <span className="font-medium text-[12px] sm:text-sm md:text-base">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
                </span>
              </div>
              <p className="text-blue-600 dark:text-blue-400 text-[11px] mt-1 sm:text-xs md:text-sm sm:mt-1.5">
                Los resultados se muestran en el mapa. Haz clic en los marcadores para ver detalles.
              </p>
            </div>
          )}
          
          {/* UX: Mapa con altura optimizada para móvil (320px+) */}
          <div className="relative w-full max-w-6xl mx-auto">
            <LeafletMap 
              places={showMapResults ? searchResults.map(place => ({
                id: parseInt(place.id.replace(/\D/g, '') || '0'),
                name: place.name,
                address: place.address || '',
                lat: place.lat || 0,
                lng: place.lng || 0,
                type: place.type,
                visited: place.status === 'visitado'
              })) : mapPlaces} 
              className="h-[280px] w-full rounded-xl border-0 shadow-lg sm:h-[350px] sm:rounded-2xl md:h-[450px] lg:h-[550px] xl:h-[600px]" 
              onAddPlace={handleAddPlaceFromMap}
            />
          </div>
        </motion.div>

        {/* UX: Sección de lugares optimizada para móvil con buscador táctil */}
        <motion.div className="flex w-full max-w-5xl flex-col gap-3 mx-auto sm:gap-4" variants={itemVariants}>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 md:gap-4">
            <h2 className="w-full text-wrap text-base font-bold text-pink-700 dark:text-pink-400 sm:text-lg md:text-xl lg:text-2xl">
              Lista de Lugares Guardados
            </h2>
            {/* UX: Filtros con scroll horizontal táctil */}
            <div className="flex w-full overflow-x-auto gap-1.5 pb-2 px-1 scrollbar-hide sm:w-auto sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0 sm:px-0">
              {["Todos", "Visitados", "Pendientes", "Eventos"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedPlaceFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlaceFilter(filter)}
                  className={`flex-shrink-0 rounded-full border-2 px-3 py-2.5 text-[11px] font-semibold transition-all active:scale-95 sm:flex-shrink sm:px-4 sm:py-2 sm:text-xs md:text-sm min-h-[44px] touch-target ${
                    selectedPlaceFilter === filter 
                      ? "bg-pink-500 text-white shadow-lg hover:bg-pink-600 border-pink-500" 
                      : "border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 dark:border-pink-600 dark:text-pink-400 dark:hover:bg-pink-900/20"
                  }`}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
          
          {/* UX: Buscador optimizado para móvil con input táctil */}
          <div className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-xl p-3 max-w-4xl mx-auto sm:rounded-2xl sm:p-4 md:p-6">
            <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-pink-400 sm:left-4 sm:h-4 sm:w-4" />
                <Input
                  placeholder="Buscar lugares... (ej: Montería, restaurante)"
                  className="pl-9 pr-4 py-2.5 border-gray-200 dark:border-gray-700 focus:border-pink-500 focus:ring-pink-500 text-[13px] rounded-lg min-h-[44px] sm:pl-12 sm:py-3 sm:text-sm md:text-base sm:rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 sm:right-4">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-pink-500 sm:h-4 sm:w-4"></div>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowMapResults(false)
                  setSearchResults([])
                  setSearchTerm('')
                }}
                className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 active:scale-95 dark:hover:bg-gray-700 text-[12px] px-3 py-2.5 rounded-lg min-h-[44px] w-full sm:text-sm sm:px-4 sm:py-3 sm:rounded-xl sm:w-auto"
              >
                <X className="h-3.5 w-3.5 mr-1.5 sm:h-4 sm:w-4 sm:mr-2" />
                Limpiar
              </Button>
            </div>
            {searchTerm && (
              <div className="mt-2 text-[11px] text-pink-600 dark:text-pink-400 sm:mt-2.5 sm:text-xs md:mt-3 md:text-sm">
                <Search className="h-3 w-3 inline mr-1 sm:h-3.5 sm:w-3.5 sm:mr-1.5 md:h-4 md:w-4 md:mr-2" />
                Buscando: &quot;{searchTerm}&quot;
              </div>
            )}
          </div>

          {/* UX: Lista de lugares con grid responsive optimizado para móvil */}
          <motion.div 
            className="grid w-full grid-cols-1 gap-3 max-w-6xl mx-auto sm:gap-4 md:gap-6 lg:grid-cols-2"
            variants={containerVariants}
          >
            {/* Información de búsqueda con tipografía responsive */}
            {showMapResults && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2.5 mb-2.5 col-span-full sm:rounded-xl sm:p-3 sm:mb-3 md:mb-4">
                <div className="flex items-center gap-1.5 text-yellow-800 dark:text-yellow-300 sm:gap-2">
                  <Map className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                  <span className="font-medium text-[12px] sm:text-sm md:text-base">Búsqueda activa</span>
                </div>
                <p className="text-yellow-600 dark:text-yellow-400 text-[11px] mt-1 sm:text-xs md:text-sm sm:mt-1.5">
                  Los resultados de búsqueda se muestran en el mapa arriba. Aquí puedes ver todos los lugares guardados.
                </p>
              </div>
            )}
            {filteredPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full"
              >
                <Card className="cursor-pointer overflow-hidden rounded-xl border-0 bg-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-[0.98] dark:bg-gray-800 sm:rounded-2xl">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3 md:gap-4">
                      {/* UX: Imagen del lugar con tamaño responsive */}
                      {place.image_url && (
                        <div className="flex-shrink-0 w-full sm:w-auto">
                          <img 
                            src={place.image_url} 
                            alt={place.name}
                            className="w-full h-28 object-cover rounded-lg border shadow-sm sm:w-20 sm:h-20 sm:h-auto md:w-24 md:h-24"
                          />
                        </div>
                      )}
                      
                      {/* UX: Contenido con tipografía escalable */}
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <h3 className="font-bold text-[15px] text-gray-900 dark:text-white truncate mb-0.5 sm:text-base sm:mb-1 md:text-lg lg:text-xl">
                          {place.name}
                        </h3>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 mb-0.5 sm:text-xs sm:mb-1 md:text-sm lg:text-base">
                          {place.visit_date || 'Próximamente'}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate sm:text-xs md:text-sm">
                          {place.address}
                        </p>
                      </div>
                      
                      {/* UX: Controles con áreas táctiles mínimas */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto sm:gap-2 md:gap-3 justify-between sm:justify-end">
                        <Badge 
                          variant="secondary" 
                          className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 sm:text-xs sm:px-2.5 sm:py-1 md:text-sm md:px-3 ${
                            place.status === 'visitado' 
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                              : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                          }`}
                        >
                          {place.status === 'visitado' ? 'Visitado' : 'Pendiente'}
                        </Badge>
                        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-10 w-10 p-0 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-700 rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                            onClick={() => handleEditPlace(place)}
                            aria-label="Editar lugar"
                          >
                            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-10 w-10 p-0 hover:bg-red-100 hover:text-red-600 active:scale-95 dark:hover:bg-red-900/20 rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                            onClick={() => handleDeletePlace(place)}
                            aria-label="Eliminar lugar"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block md:h-5 md:w-5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Modal de Edición */}
      {isEditModalOpen && editingMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Editar Hito</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-9 w-9 sm:h-8 sm:w-8 p-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Título
                </label>
                <Input
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone(prev => prev ? {...prev, title: e.target.value} : null)}
                  placeholder="Título del hito"
                  className="min-h-[44px] text-sm sm:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Fecha
                </label>
                <Input
                  type="date"
                  value={editingMilestone.date_taken}
                  onChange={(e) => setEditingMilestone(prev => prev ? {...prev, date_taken: e.target.value} : null)}
                  placeholder="Fecha del evento"
                  className="min-h-[44px] text-sm sm:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Descripción
                </label>
                <textarea
                  value={editingMilestone.description || ''}
                  onChange={(e) => setEditingMilestone(prev => prev ? {...prev, description: e.target.value} : null)}
                  placeholder="Descripción del evento"
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base min-h-[100px]"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen del Hito
                </label>
                
                {/* Preview de imagen actual */}
                {editingMilestone.image_url && !imagePreview && (
                  <div className="mb-3">
                    <img 
                      src={editingMilestone.image_url} 
                      alt="Imagen actual" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                {/* Preview de nueva imagen */}
                {imagePreview && (
                  <div className="mb-3 relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearImageSelection}
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {/* Input para subir imagen */}
                <div className="space-y-2">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="w-full"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                        Subiendo...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
                      </div>
                    )}
                  </Button>
                  
                  {/* URL manual como alternativa */}
                  <div className="text-xs text-gray-500">
                    O ingresa una URL:
                  </div>
                  <Input
                    value={editingMilestone.image_url || ''}
                    onChange={(e) => setEditingMilestone(prev => prev ? {...prev, image_url: e.target.value} : null)}
                    placeholder="URL de la imagen (opcional)"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={editingMilestone.type}
                  onChange={(e) => setEditingMilestone(prev => prev ? {...prev, type: e.target.value as any} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="eventos">Eventos</option>
                  <option value="viajes">Viajes</option>
                  <option value="aniversario">Aniversario</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="flex-1 min-h-[44px] text-sm sm:text-base"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveMilestone}
                className="flex-1 bg-pink-500 hover:bg-pink-600 min-h-[44px] text-sm sm:text-base"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && deletingMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Eliminar Hito</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
              ¿Estás seguro de que quieres eliminar el hito <strong>&quot;{deletingMilestone.title}&quot;</strong>?
            </p>
            
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="flex-1 min-h-[44px] text-sm sm:text-base"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 min-h-[44px] text-sm sm:text-base"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Ver Más Detalles */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {viewingMilestone?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                {viewingMilestone && new Date(viewingMilestone.date_taken).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {viewingMilestone?.location && (
                <>
                  <span>•</span>
                  <MapPin className="h-4 w-4" />
                  <span>{viewingMilestone.location}</span>
                </>
              )}
              {viewingMilestone?.type && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {viewingMilestone.type}
                  </Badge>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {viewingMilestone && (
            <div className="space-y-4 mt-4">
              {/* Imagen principal */}
              {viewingMilestone.image_url && (
                <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={viewingMilestone.image_url}
                    alt={viewingMilestone.title}
                    className="w-full h-auto max-h-[500px] object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop&crop=center'
                    }}
                  />
                </div>
              )}

              {/* Descripción completa */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </h4>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {viewingMilestone.description || 'Sin descripción'}
                </p>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {viewingMilestone.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ubicación</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{viewingMilestone.location}</p>
                    </div>
                  </div>
                )}
                {viewingMilestone.type && (
                  <div className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-pink-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{viewingMilestone.type}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags si existen */}
              {viewingMilestone.tags && viewingMilestone.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Etiquetas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingMilestone.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
            >
              Cerrar
            </Button>
            {viewingMilestone && (
              <Button
                variant="default"
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEditMilestone(viewingMilestone)
                }}
                className="bg-pink-500 hover:bg-pink-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edición de Lugar */}
      {isEditPlaceModalOpen && editingPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Editar Lugar</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEditPlace}
                className="h-9 w-9 sm:h-8 sm:w-8 p-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Nombre del Lugar
                </label>
                <Input
                  value={editingPlace.name}
                  onChange={(e) => setEditingPlace(prev => prev ? {...prev, name: e.target.value} : null)}
                  placeholder="Nombre del lugar"
                  className="min-h-[44px] text-sm sm:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Fecha de Visita
                </label>
                <Input
                  type="date"
                  value={editingPlace.visit_date || ''}
                  onChange={(e) => setEditingPlace(prev => prev ? {...prev, visit_date: e.target.value} : null)}
                  placeholder="Fecha de visita o planificación"
                  className="min-h-[44px] text-sm sm:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Dirección
                </label>
                <Input
                  value={editingPlace.address || ''}
                  onChange={(e) => setEditingPlace(prev => prev ? {...prev, address: e.target.value} : null)}
                  placeholder="Dirección del lugar"
                  className="min-h-[44px] text-sm sm:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen del Lugar
                </label>
                
                {/* Preview de imagen actual */}
                {editingPlace.image_url && !imagePreview && (
                  <div className="mb-3">
                    <img 
                      src={editingPlace.image_url} 
                      alt="Imagen actual" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                {/* Preview de nueva imagen */}
                {imagePreview && (
                  <div className="mb-3 relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearImageSelection}
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {/* Input para subir imagen */}
                <div className="space-y-2">
                  <input
                    id="place-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('place-image-upload')?.click()}
                    className="w-full"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                        Subiendo...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
                      </div>
                    )}
                  </Button>
                  
                  {/* URL manual como alternativa */}
                  <div className="text-xs text-gray-500">
                    O ingresa una URL:
                  </div>
                  <Input
                    value={editingPlace.image_url || ''}
                    onChange={(e) => setEditingPlace(prev => prev ? {...prev, image_url: e.target.value} : null)}
                    placeholder="URL de la imagen (opcional)"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={editingPlace.status}
                  onChange={(e) => setEditingPlace(prev => prev ? {...prev, status: e.target.value as any} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="visitado">Visitado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button
                variant="outline"
                onClick={handleCancelEditPlace}
                className="flex-1 min-h-[44px] text-sm sm:text-base"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePlace}
                className="flex-1 bg-pink-500 hover:bg-pink-600 min-h-[44px] text-sm sm:text-base"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación de Lugar */}
      {isDeletePlaceModalOpen && deletingPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Eliminar Lugar</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
              ¿Estás seguro de que quieres eliminar el lugar <strong>&quot;{deletingPlace.name}&quot;</strong>?
            </p>
            
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDeletePlace}
                className="flex-1 min-h-[44px] text-sm sm:text-base"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDeletePlace}
                className="flex-1 bg-red-500 hover:bg-red-600 min-h-[44px] text-sm sm:text-base"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
