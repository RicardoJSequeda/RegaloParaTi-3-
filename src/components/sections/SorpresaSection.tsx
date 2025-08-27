'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileUpload } from '@/components/ui/file-upload'
import { SurpriseCard } from '@/components/ui/surprise-card'
import { SurpriseModal } from '@/components/ui/surprise-modal'
import { EditSurpriseModal } from '@/components/ui/edit-surprise-modal'
import { DynamicContentForm } from '@/components/ui/dynamic-content-form'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { 
  Gift, 
  Sparkles, 
  Plus, 
  Search,
  Filter,
  Calendar, 
  Star,
  Key, 
  Lock,
  Heart,
  Settings,
  X,
  FileText, 
  Video, 
  Image
} from 'lucide-react'
import { SurpriseBox } from '@/types'
import confetti from 'canvas-confetti'

export default function SorpresaSection() {
  const [surprises, setSurprises] = useState<SurpriseBox[]>([])
  const [filteredSurprises, setFilteredSurprises] = useState<SurpriseBox[]>([])
  const [selectedSurprise, setSelectedSurprise] = useState<SurpriseBox | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSurprise, setEditingSurprise] = useState<SurpriseBox | null>(null)
  const [customEditPassword, setCustomEditPassword] = useState('')
  const [useCustomPassword, setUseCustomPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // Estado para nueva sorpresa
  const [newSurprise, setNewSurprise] = useState({
    title: '',
    unlock_type: 'free' as const,
    content_type: 'text' as const,
    content_title: '',
    content_description: '',
    content_text: '',
    unlock_date: '',
    unlock_time: '',
    required_key: '',
    effects: {
      confetti: true
    }
  })

  // Estado para el contenido dinámico
  const [contentData, setContentData] = useState<any>({})

  const supabase = getBrowserClient()

  // Cargar sorpresas desde Supabase
  const loadSurprises = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('surprises')
        .select('*')
        .order('order', { ascending: true })

      if (error) {
        console.error('Error loading surprises:', error)
        return
      }

      setSurprises(data || [])
      setFilteredSurprises(data || [])
    } catch (error) {
      console.error('Error in loadSurprises:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Suscripción en tiempo real
  useEffect(() => {
    loadSurprises()

    const channel = supabase
      .channel('surprises_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'surprises' },
        () => {
          loadSurprises()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Filtrar sorpresas
  useEffect(() => {
    let filtered = surprises

    // Filtro por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(surprise =>
        surprise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (surprise.content_description && surprise.content_description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filtro por tipo de contenido
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(surprise => surprise.content_type === selectedCategory)
    }

    // Filtro por estado
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'unlocked') {
        filtered = filtered.filter(surprise => surprise.is_unlocked)
      } else if (selectedStatus === 'locked') {
        filtered = filtered.filter(surprise => !surprise.is_unlocked)
      }
    }

    setFilteredSurprises(filtered)
  }, [surprises, searchQuery, selectedCategory, selectedStatus])

  // Desbloquear sorpresa con validaciones de tipo
  const handleUnlock = async (id: string) => {
    try {
      // Leer el registro actual para validar
      const { data: current, error: readError } = await supabase
        .from('surprises')
        .select('*')
        .eq('id', id)
        .single()

      if (readError) {
        console.error('Error reading surprise before unlock:', readError)
        return
      }

      if (!current || current.is_unlocked) return

      // Validar por tipo
      if (current.unlock_type === 'date') {
        const date = current.unlock_date as string | null
        const time = (current as any).unlock_time as string | null
        if (date) {
          const d = new Date(date)
          if (time) {
            const [hh, mm] = time.split(':').map(Number)
            if (!Number.isNaN(hh) && !Number.isNaN(mm)) d.setHours(hh, mm, 0, 0)
          }
          if (Date.now() < d.getTime()) return
        } else {
          return
        }
      }
      if (current.unlock_type === 'sequential' && current.depends_on) {
        const dep = surprises.find(s => s.id === current.depends_on)
        if (!dep?.is_unlocked) return
      }
      if (current.unlock_type === 'key') {
        // El flujo de llave se valida en la tarjeta antes de llamar a handleUnlock
      }

      const { error } = await supabase
        .from('surprises')
        .update({ 
          is_unlocked: true, 
          unlocked_at: new Date().toISOString() 
        })
        .eq('id', id)

      if (error) {
        console.error('Error unlocking surprise:', error)
        return
      }

      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } })
      await loadSurprises()
    } catch (error) {
      console.error('Error in handleUnlock:', error)
    }
  }

  // Abrir sorpresa
  const handleOpenSurprise = (surprise: SurpriseBox) => {
    setSelectedSurprise(surprise)
    setIsModalOpen(true)
  }

  // Solicitud de edición desde el modal protegido
  const handleRequestEdit = (surprise: SurpriseBox) => {
    setIsModalOpen(false)
    setEditingSurprise(surprise)
    setShowEditModal(true)
  }

  // Crear nueva sorpresa
  const handleSaveEdit = async (updatedSurprise: Partial<SurpriseBox>) => {
    if (!editingSurprise) return

    try {
      console.log('Actualizando sorpresa:', updatedSurprise)
      
      // Limpiar campos de fecha vacíos para evitar errores de base de datos
      const cleanData = {
        ...updatedSurprise,
        unlock_date: updatedSurprise.unlock_date || null,
        unlock_time: updatedSurprise.unlock_time || null,
        event_date: updatedSurprise.event_date || null,
        required_key: updatedSurprise.required_key || null,
        event_location: updatedSurprise.event_location || null,
        event_map_link: updatedSurprise.event_map_link || null
      }
      
      console.log('Datos limpios para actualizar:', cleanData)
      
      const { error } = await supabase
        .from('surprises')
        .update(cleanData)
        .eq('id', editingSurprise.id)

      if (error) {
        console.error('Error updating surprise:', error)
        alert(`Error al actualizar: ${error.message}`)
        return
      }

      console.log('Sorpresa actualizada exitosamente')
      setShowEditModal(false)
      setEditingSurprise(null)
      loadSurprises()
    } catch (error) {
      console.error('Error in handleSaveEdit:', error)
      alert(`Error al actualizar: ${error}`)
    }
  }

  const handleCreateSurprise = async () => {
    try {
      console.log('Iniciando creación de sorpresa...')
      setIsCreating(true)

      // Validar campos requeridos
      if (!newSurprise.title.trim()) {
        alert('Por favor ingresa un título para la sorpresa')
        return
      }

      if (!newSurprise.content_title.trim()) {
        alert('Por favor ingresa un título para el contenido')
        return
      }

      // Usar contraseña personalizada o generar automáticamente
      const editPassword = useCustomPassword && customEditPassword.trim() 
        ? customEditPassword.trim() 
        : Math.random().toString(36).substring(2, 8).toUpperCase()

      console.log('Datos de la sorpresa:', newSurprise)
      console.log('Contenido dinámico:', contentData)

      // Procesar archivos si existen
      let contentImageUrl = null
      let contentVideoUrl = null
      let contentBlocks = null

      if (contentData.files && contentData.files.length > 0) {
        console.log('Procesando archivos:', contentData.files)
        
        try {
          // Subir archivos a Supabase Storage
          const uploadedUrls = await Promise.all(
            contentData.files.map(async (file: File) => {
              const fileName = `${Date.now()}-${file.name}`
              console.log('Subiendo archivo:', fileName)
              
              const { data, error } = await supabase.storage
                .from('surprises')
                .upload(fileName, file)

              if (error) {
                console.error('Error uploading file:', error)
                return null
              }

              const { data: urlData } = supabase.storage
                .from('surprises')
                .getPublicUrl(fileName)

              console.log('Archivo subido exitosamente:', urlData.publicUrl)
              return urlData.publicUrl
            })
          )

          console.log('URLs de archivos subidos:', uploadedUrls)

          // Separar imágenes y videos
          const imageFiles = contentData.files.filter((file: File) => file.type.startsWith('image/'))
          const videoFiles = contentData.files.filter((file: File) => file.type.startsWith('video/'))

          console.log('Imágenes encontradas:', imageFiles.length)
          console.log('Videos encontrados:', videoFiles.length)

          if (imageFiles.length > 0) {
            contentImageUrl = uploadedUrls[0] // Primera imagen
            console.log('URL de imagen principal:', contentImageUrl)
          }
          if (videoFiles.length > 0) {
            contentVideoUrl = uploadedUrls.find(url => url) // Primer video
            console.log('URL de video principal:', contentVideoUrl)
          }
        } catch (error) {
          console.error('Error procesando archivos:', error)
        }
      }

      // Procesar bloques de contenido mixto
      if (contentData.blocks && contentData.blocks.length > 0) {
        contentBlocks = contentData.blocks
      }

      const surpriseData = {
        title: newSurprise.title,
        is_unlocked: newSurprise.unlock_type === 'free',
        unlock_type: newSurprise.unlock_type,
        unlock_date: newSurprise.unlock_date || null,
        unlock_time: newSurprise.unlock_time || null,
        required_key: newSurprise.required_key || null,
        content_type: newSurprise.content_type,
        content_title: newSurprise.content_title,
        content_description: newSurprise.content_description,
        content_text: newSurprise.content_text,
        content_image_url: contentImageUrl,
        content_video_url: contentVideoUrl,
        event_date: contentData.eventDate || null,
        event_location: contentData.eventLocation || null,
        event_map_link: contentData.eventMapLink || null,
        content_blocks: contentBlocks,
        edit_password: editPassword,
        order: surprises.length + 1,
        effects: newSurprise.effects
      }

      console.log('Datos a insertar:', surpriseData)

      const { data, error } = await supabase
        .from('surprises')
        .insert(surpriseData)
        .select()

      if (error) {
        console.error('Error creating surprise:', error)
        alert(`Error al crear la sorpresa: ${error.message}`)
        return
      }

      console.log('Sorpresa creada exitosamente:', data)

      // Mostrar la contraseña al usuario
      if (data && data[0]) {
        const message = useCustomPassword 
          ? `¡Sorpresa creada exitosamente! 🎉\n\nTu contraseña de edición personalizada es: ${editPassword}\n\n⚠️ Guárdala bien, solo tú podrás editar o eliminar esta sorpresa.`
          : `¡Sorpresa creada exitosamente! 🎉\n\nTu contraseña de edición generada es: ${editPassword}\n\n⚠️ Guárdala bien, solo tú podrás editar o eliminar esta sorpresa.`
        alert(message)
      }

      // Efecto de confeti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Limpiar formulario y cerrar modal
    resetForm()
      setIsCreateModalOpen(false)
      
      // Recargar sorpresas
      await loadSurprises()
    } catch (error) {
      console.error('Error in handleCreateSurprise:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Resetear formulario
  const resetForm = () => {
    setNewSurprise({
      title: '',
      unlock_type: 'free',
      content_type: 'text',
      content_title: '',
      content_description: '',
      content_text: '',
      unlock_date: '',
      unlock_time: '',
      required_key: '',
      effects: {
        confetti: true
      }
    })
    setContentData({})
    setCustomEditPassword('')
    setUseCustomPassword(false)
  }

  // Calcular días hasta desbloqueo
  const getDaysUntilUnlock = (unlockDate: string) => {
    const today = new Date()
    const unlock = new Date(unlockDate)
    const diffTime = unlock.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Verificar si una sorpresa es desbloqueable
  const isUnlockable = (surprise: SurpriseBox) => {
    if (surprise.unlock_type === 'free') return true
    if (surprise.unlock_type === 'date') {
      const daysUntil = getDaysUntilUnlock(surprise.unlock_date!)
      return daysUntil <= 0
    }
    if (surprise.unlock_type === 'sequential') {
      // Verificar si la sorpresa dependiente está desbloqueada
      if (surprise.depends_on) {
        const dependentSurprise = surprises.find(s => s.id === surprise.depends_on)
        return dependentSurprise?.is_unlocked || false
      }
      return true
    }
    return false
  }

  const categories = [
    { value: 'all', label: 'Todos los tipos', icon: Gift },
    { value: 'text', label: 'Texto', icon: FileText },
    { value: 'image', label: 'Imagen', icon: Image },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'mixed', label: 'Mixto', icon: Sparkles },
    { value: 'invitation', label: 'Invitación', icon: Calendar },
    { value: 'event', label: 'Evento', icon: Star }
  ]

  const statuses = [
    { value: 'all', label: 'Todas' },
    { value: 'unlocked', label: 'Desbloqueadas' },
    { value: 'locked', label: 'Bloqueadas' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sorpresas...</p>
              </div>
              </div>
    )
  }
          
          return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Gift className="h-8 w-8 text-pink-500" />
            Nuestras Sorpresas
          </h1>
          <p className="text-gray-600 mt-2">
            Descubre sorpresas especiales llenas de amor y magia
          </p>
                </div>

                  <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Sorpresa
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                placeholder="Buscar sorpresas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                  />
                </div>
              </div>

          {/* Filtro por categoría */}
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:border-pink-500 focus:ring-pink-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            </div>
            
          {/* Filtro por estado */}
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:border-pink-500 focus:ring-pink-500"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
                      </div>
                    </div>

        {/* Estadísticas */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Total: {surprises.length}</span>
          <span>Desbloqueadas: {surprises.filter(s => s.is_unlocked).length}</span>
          <span>Bloqueadas: {surprises.filter(s => !s.is_unlocked).length}</span>
                  </div>
            </div>

      {/* Grid de sorpresas */}
      {filteredSurprises.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' 
              ? 'No se encontraron sorpresas' 
              : 'No hay sorpresas aún'
            }
              </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : '¡Crea tu primera sorpresa especial!'
            }
          </p>
          {!searchQuery && selectedCategory === 'all' && selectedStatus === 'all' && (
              <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Sorpresa
              </Button>
          )}
                  </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredSurprises.map((surprise, index) => (
              <motion.div
                key={surprise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <SurpriseCard
                  surprise={surprise}
                  onUnlock={handleUnlock}
                  onOpen={handleOpenSurprise}
                  onRequestEdit={handleRequestEdit}
                  isUnlockable={isUnlockable(surprise)}
                  daysUntilUnlock={surprise.unlock_date ? getDaysUntilUnlock(surprise.unlock_date) : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
                </div>
              )}
              
      {/* Modal para crear sorpresa */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Sorpresa</h2>
              <Button
                  onClick={() => setIsCreateModalOpen(false)}
                  variant="outline"
                size="sm"
              >
                  <X className="h-4 w-4" />
              </Button>
            </div>
            
              <div className="space-y-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                  </label>
                  <Input
                    value={newSurprise.title}
                    onChange={(e) => setNewSurprise(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título de la sorpresa..."
                      className="w-full"
                  />
                </div>
                
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Desbloqueo
                  </label>
                  <select
                        value={newSurprise.unlock_type}
                        onChange={(e) => setNewSurprise(prev => ({ ...prev, unlock_type: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-pink-500 focus:ring-pink-500"
                  >
                        <option value="free">Gratis</option>
                    <option value="date">Por fecha</option>
                    <option value="key">Por llave</option>
                    <option value="sequential">Secuencial</option>
                  </select>
                    </div>
                  </div>
                </div>
                
                {/* Configuración de desbloqueo */}
                {newSurprise.unlock_type !== 'free' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Configuración de Desbloqueo</h3>
                    
                    {newSurprise.unlock_type === 'date' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Desbloqueo
                      </label>
                      <Input
                        type="date"
                            value={newSurprise.unlock_date}
                            onChange={(e) => setNewSurprise(prev => ({ ...prev, unlock_date: e.target.value }))}
                            className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de Desbloqueo
                      </label>
                      <Input
                        type="time"
                            value={newSurprise.unlock_time}
                            onChange={(e) => setNewSurprise(prev => ({ ...prev, unlock_time: e.target.value }))}
                            className="w-full"
                      />
                    </div>
                  </div>
                )}
                
                    {newSurprise.unlock_type === 'key' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                          Llave Requerida
                    </label>
                    <Input
                          value={newSurprise.required_key}
                          onChange={(e) => setNewSurprise(prev => ({ ...prev, required_key: e.target.value }))}
                      placeholder="Ej: AMOR2024"
                          className="w-full"
                    />
                  </div>
                )}
                  </div>
                )}

                {/* Contraseña de edición */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Contraseña de Edición</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="useCustomPassword"
                        checked={useCustomPassword}
                        onChange={(e) => setUseCustomPassword(e.target.checked)}
                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      />
                      <label htmlFor="useCustomPassword" className="text-sm font-medium text-gray-700">
                        Usar contraseña personalizada
                    </label>
                  </div>

                    {useCustomPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contraseña de edición personalizada
                  </label>
                  <Input
                          type="text"
                          value={customEditPassword}
                          onChange={(e) => setCustomEditPassword(e.target.value)}
                          placeholder="Ej: MIAMOR123, SECRETO2024..."
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Si no la configuras, se generará automáticamente
                        </p>
                      </div>
                    )}
                </div>
              </div>
              
                {/* Contenido */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Contenido</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Contenido
                  </label>
                  <select
                      value={newSurprise.content_type}
                      onChange={(e) => {
                        setNewSurprise(prev => ({ ...prev, content_type: e.target.value as any }))
                        setContentData({}) // Reset content data when type changes
                      }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:border-pink-500 focus:ring-pink-500"
                  >
                      <option value="text">Texto</option>
                    <option value="image">Imagen</option>
                    <option value="video">Video</option>
                    <option value="invitation">Invitación</option>
                    <option value="event">Evento</option>
                    <option value="mixed">Mixto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título del Contenido
                  </label>
                  <Input
                      value={newSurprise.content_title}
                      onChange={(e) => setNewSurprise(prev => ({ ...prev, content_title: e.target.value }))}
                      placeholder="Título del contenido..."
                      className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción del Contenido
                    </label>
                    <textarea
                      value={newSurprise.content_description}
                      onChange={(e) => setNewSurprise(prev => ({ ...prev, content_description: e.target.value }))}
                      placeholder="Describe el contenido..."
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>

                  {/* Formulario dinámico según el tipo de contenido */}
                  <DynamicContentForm
                    contentType={newSurprise.content_type}
                    contentData={contentData}
                    onContentChange={(data) => {
                      setContentData(data)
                      // Actualizar el contenido principal según el tipo
                      if (newSurprise.content_type === 'text') {
                        setNewSurprise(prev => ({ ...prev, content_text: data.content_text || '' }))
                      } else if (newSurprise.content_type === 'image') {
                        setNewSurprise(prev => ({ 
                          ...prev, 
                          content_image_url: data.files?.map((f: File) => f.name).join(',') || '',
                          content_text: data.imageDescription || ''
                        }))
                      } else if (newSurprise.content_type === 'video') {
                        setNewSurprise(prev => ({ 
                          ...prev, 
                          content_video_url: data.files?.map((f: File) => f.name).join(',') || '',
                          content_text: data.videoDescription || ''
                        }))
                      } else if (newSurprise.content_type === 'invitation') {
                        setNewSurprise(prev => ({ 
                          ...prev, 
                          event_date: data.eventDate || '',
                          event_location: data.eventLocation || '',
                          event_map_link: data.eventMapLink || '',
                          content_text: data.invitationMessage || '',
                          content_blocks: {
                            dressCode: data.dressCode || '',
                            rsvpInstructions: data.rsvpInstructions || ''
                          }
                        }))
                      } else if (newSurprise.content_type === 'event') {
                        setNewSurprise(prev => ({ 
                          ...prev, 
                          event_date: data.eventDate || '',
                          event_location: data.eventLocation || '',
                          event_map_link: data.eventMapLink || '',
                          content_text: data.eventDescription || '',
                          content_blocks: {
                            activities: data.activities || ''
                          }
                        }))
                      } else if (newSurprise.content_type === 'mixed') {
                        setNewSurprise(prev => ({ 
                          ...prev, 
                          content_blocks: data.blocks || []
                        }))
                      }
                    }}
                    />
                  </div>

                {/* Efectos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Efectos Especiales</h3>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="confetti"
                      checked={newSurprise.effects.confetti}
                      onChange={(e) => setNewSurprise(prev => ({
                        ...prev,
                        effects: { ...prev.effects, confetti: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                    />
                    <label htmlFor="confetti" className="text-sm text-gray-700">
                      Mostrar confeti al abrir
                    </label>
                  </div>

                  
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <Button
                onClick={() => {
                    setIsCreateModalOpen(false)
                  resetForm()
                }}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                  onClick={handleCreateSurprise}
                  disabled={isCreating}
                className="flex-1 bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                <Plus className="h-4 w-4 mr-2" />
                Crear Sorpresa
                    </>
                  )}
              </Button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para mostrar sorpresa */}
      <SurpriseModal
        surprise={selectedSurprise}
        isOpen={isModalOpen}
        onRequestEdit={handleRequestEdit}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSurprise(null)
        }}
      />

      {/* Modal de edición simple eliminado - se usa el modal completo */}

      {/* Modal de Edición Completa */}
      <EditSurpriseModal
        surprise={editingSurprise}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingSurprise(null)
        }}
        onSave={handleSaveEdit}
      />
    </div>
  )
}


