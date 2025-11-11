'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
  const [selectedFilter, setSelectedFilter] = useState('Todos')
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

  // Filtrar hitos según el filtro seleccionado (memoizado)
  const filteredMilestones = useMemo(() => {
    return selectedFilter === 'Todos' 
      ? milestones 
      : milestones.filter(milestone => milestone.type === selectedFilter.toLowerCase())
  }, [milestones, selectedFilter])

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

      const { error } = await supabase
        .from('milestones')
        .update({
          title: editingMilestone.title,
          description: editingMilestone.description,
          image_url: imageUrl,
          date_taken: editingMilestone.date_taken,
          type: editingMilestone.type,
          location: editingMilestone.location,
          tags: editingMilestone.tags,
          is_favorite: editingMilestone.is_favorite
        })
        .eq('id', editingMilestone.id)

      if (error) {
        console.error('Error updating milestone:', error)
        return
      }

      setIsEditModalOpen(false)
      setEditingMilestone(null)
      clearImageSelection()
      await loadMilestones()
    } catch (error) {
      console.error('Error in handleSaveMilestone:', error)
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
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="space-y-3 text-center" variants={itemVariants}>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Recuerdos</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Revive los momentos más especiales de nuestra historia juntos
          </p>
        </motion.div>

        {/* Sección "Hitos de Nuestro Amor" - Rediseñada */}
        <motion.div className="space-y-8" variants={itemVariants}>
          {/* Header con estadísticas */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-pink-700">
              Hitos de Nuestro Amor 💖
            </h2>
            <p className="text-gray-600 text-lg">
              {filteredMilestones.length} de {milestones.length} hitos especiales
            </p>
            
            {/* Filtros mejorados con scroll horizontal en móvil */}
            <div className="flex overflow-x-auto gap-3 pb-2 px-4 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible scroll-horizontal">
              {["Todos", "Aniversario", "Viajes", "Eventos", "Otros"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className={`text-sm px-4 py-2 rounded-full flex-shrink-0 sm:flex-shrink ${
                    selectedFilter === filter 
                      ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg" 
                      : "border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                  }`}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Timeline Rediseñado */}
          <motion.div 
            className="relative timeline-container"
            variants={timelineVariants}
          >
            {/* Línea central mejorada */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 timeline-line transform -translate-x-1/2"></div>
            
            <div className="space-y-12 sm:space-y-16 md:space-y-20">
              {filteredMilestones.length === 0 ? (
                <motion.div 
                  className="text-center py-16 timeline-empty rounded-3xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-20 h-20 timeline-empty-icon rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-pink-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {selectedFilter !== 'Todos' 
                      ? 'No hay hitos con este filtro'
                      : '¡Comienza tu historia de amor!'
                    }
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {selectedFilter !== 'Todos' 
                      ? 'Intenta cambiar los filtros para ver más hitos especiales'
                      : 'Agrega tu primer hito para comenzar a documentar los momentos más especiales de vuestra relación'
                    }
                  </p>
                  {selectedFilter === 'Todos' && (
                    <Button 
                      className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg"
                      onClick={() => {/* Aquí podrías abrir un modal para agregar hito */}}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Primer Hito
                    </Button>
                  )}
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
                      
                      <div className={`relative w-full max-w-[90%] mx-auto md:w-2/5 ${isLeft ? 'md:ml-6' : 'md:mr-6'}`}>
                        {/* Punto de la línea de tiempo */}
                        <motion.div 
                          className={`absolute ${isLeft ? '-left-10' : '-right-10'} top-8 hidden md:block`}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <div className="w-5 h-5 rounded-full timeline-dot"></div>
                        </motion.div>

                        {/* Número en móvil */}
                        <div className="md:hidden mb-6 text-center">
                          <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto shadow-lg">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                        </div>

                        {/* Tarjeta del hito */}
                        <motion.div
                          className="group"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="timeline-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                            {/* Imagen del hito */}
                            <div className="relative">
                              <div className="w-full h-48 sm:h-56 overflow-hidden">
                                <img
                                  src={milestone.image_url || 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop&crop=center'}
                                  alt={milestone.title}
                                  className="w-full h-full object-cover timeline-image rounded-t-2xl"
                                />
                              </div>
                              
                              {/* Overlay con controles */}
                              <div className="absolute inset-0 timeline-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute top-3 right-3 flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-10 w-10 p-0 timeline-controls"
                                    onClick={() => handleEditMilestone(milestone)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-10 w-10 p-0 timeline-controls"
                                    onClick={() => handleDeleteMilestone(milestone)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Badge de fecha */}
                              <div className="absolute bottom-3 left-3">
                                <Badge className="timeline-date-badge text-gray-800 border-0 shadow-md">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(milestone.date_taken).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </Badge>
                              </div>
                            </div>

                            {/* Contenido del hito */}
                            <div className="p-6 timeline-card-content">
                              <h3 className="text-xl font-bold text-gray-800 mb-2 timeline-title">
                                {milestone.title}
                              </h3>
                              <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                                {milestone.description}
                              </p>
                              
                              {/* Tags del hito */}
                              {milestone.tags && milestone.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4 timeline-tags">
                                  {milestone.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <Badge 
                                      key={tagIndex} 
                                      variant="secondary" 
                                      className="text-xs timeline-tag"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {milestone.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{milestone.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Botón ver más */}
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-pink-600 hover:text-pink-700 font-medium"
                              >
                                Ver más detalles
                                <ChevronRight className="h-4 w-4 ml-1" />
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

        {/* Sección "Mapa de Lugares Especiales" */}
        <motion.div className="space-y-3 max-w-6xl mx-auto" variants={itemVariants}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-pink-700">
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
                className="text-pink-600 border-pink-300 hover:bg-pink-50 text-xs sm:text-sm"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar búsqueda
              </Button>
            )}
          </div>
          
          {/* Información de resultados */}
          {showMapResults && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <Search className="h-4 w-4" />
                <span className="font-medium">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''} para "{searchTerm}"
                </span>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                Los resultados se muestran en el mapa. Haz clic en los marcadores para ver detalles.
              </p>
            </div>
          )}
          
          {/* Mapa con altura mejorada para móvil */}
          <div className="relative max-w-6xl mx-auto">
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
              className="h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] w-full rounded-2xl border-0 shadow-lg" 
              onAddPlace={handleAddPlaceFromMap}
            />
          </div>
        </motion.div>

        {/* Sección "Lista de Lugares Guardados" */}
        <motion.div className="space-y-4 max-w-5xl mx-auto" variants={itemVariants}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-pink-700">Lista de Lugares Guardados</h2>
            <div className="flex overflow-x-auto gap-2 pb-2 px-4 sm:px-0 sm:flex-wrap sm:overflow-visible scroll-horizontal">
              {["Todos", "Visitados", "Pendientes", "Eventos"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedPlaceFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlaceFilter(filter)}
                  className={`text-xs sm:text-sm flex-shrink-0 sm:flex-shrink px-3 py-2 rounded-full ${
                    selectedPlaceFilter === filter 
                      ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg" 
                      : "border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                  }`}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Buscador mejorado */}
          <div className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-400" />
                <Input
                  placeholder="Buscar lugares... (ej: Montería, restaurante)"
                  className="pl-12 pr-4 py-3 border-gray-200 dark:border-gray-700 focus:border-pink-500 focus:ring-pink-500 text-sm sm:text-base rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
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
                className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm px-4 py-3 rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
            {searchTerm && (
              <div className="mt-3 text-sm text-pink-600 dark:text-pink-400">
                <Search className="h-4 w-4 inline mr-2" />
                Buscando: "{searchTerm}"
              </div>
            )}
          </div>

          {/* Lista de lugares con grid responsive */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto"
            variants={containerVariants}
          >
            {/* Información de búsqueda */}
            {showMapResults && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Map className="h-4 w-4" />
                  <span className="font-medium">Búsqueda activa</span>
                </div>
                <p className="text-yellow-600 text-sm mt-1">
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
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Imagen del lugar */}
                      {place.image_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={place.image_url} 
                            alt={place.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border shadow-sm"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white truncate mb-1">{place.name}</h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-1">{place.visit_date || 'Próximamente'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{place.address}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <Badge 
                          variant="secondary" 
                          className={`text-sm px-3 py-1 rounded-full ${
                            place.status === 'visitado' 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }`}
                        >
                          {place.status === 'visitado' ? 'Visitado' : 'Pendiente'}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
                            onClick={() => handleEditPlace(place)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-10 w-10 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 rounded-full transition-all duration-300"
                            onClick={() => handleDeletePlace(place)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Editar Hito</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <Input
                  value={editingMilestone.title}
                  onChange={(e) => setEditingMilestone(prev => prev ? {...prev, title: e.target.value} : null)}
                  placeholder="Título del hito"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <Input
                  type="date"
                  value={editingMilestone.date_taken}
                  onChange={(e) => setEditingMilestone(prev => prev ? {...prev, date_taken: e.target.value} : null)}
                  placeholder="Fecha del evento"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editingMilestone.description || ''}
                  onChange={(e) => setEditingMilestone(prev => prev ? {...prev, description: e.target.value} : null)}
                  placeholder="Descripción del evento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveMilestone}
                className="flex-1 bg-pink-500 hover:bg-pink-600"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Eliminar Hito</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar el hito <strong>"{deletingMilestone.title}"</strong>?
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Edición de Lugar */}
      {isEditPlaceModalOpen && editingPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Editar Lugar</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEditPlace}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Lugar
                </label>
                <Input
                  value={editingPlace.name}
                  onChange={(e) => setEditingPlace(prev => prev ? {...prev, name: e.target.value} : null)}
                  placeholder="Nombre del lugar"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Visita
                </label>
                <Input
                  type="date"
                  value={editingPlace.visit_date || ''}
                  onChange={(e) => setEditingPlace(prev => prev ? {...prev, visit_date: e.target.value} : null)}
                  placeholder="Fecha de visita o planificación"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <Input
                  value={editingPlace.address || ''}
                  onChange={(e) => setEditingPlace(prev => prev ? {...prev, address: e.target.value} : null)}
                  placeholder="Dirección del lugar"
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
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleCancelEditPlace}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePlace}
                className="flex-1 bg-pink-500 hover:bg-pink-600"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Eliminar Lugar</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar el lugar <strong>"{deletingPlace.name}"</strong>?
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDeletePlace}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDeletePlace}
                className="flex-1 bg-red-500 hover:bg-red-600"
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
