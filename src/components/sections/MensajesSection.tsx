'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Edit3, 
  Heart, 
  Star, 
  Briefcase, 
  Hash, 
  Sparkles,
  Calendar,
  Edit,
  Trash2,
  X,
  Plus,
  Check,
  Image as ImageIcon
} from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { uploadPublicFile } from '@/lib/supabase/storage'

interface Message {
  id: string
  title: string
  content: string
  date: string
  category: string
  isRead: boolean
  isFavorite: boolean
  images?: string[]
}

const categories = [
  { name: 'Amor', icon: Heart, color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' },
  { name: 'Motivación', icon: Star, color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' },
  { name: 'Recuerdos', icon: Briefcase, color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' },
  { name: 'Futuro', icon: Hash, color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' },
  { name: 'Especiales', icon: Sparkles, color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' },
]

// Animaciones optimizadas para 60fps
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] // ease-out cubic-bezier
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
}

const fabVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  },
  tap: { scale: 0.9 }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.2 }
  }
}

export function MensajesSection() {
  const supabase = getBrowserClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [newMessage, setNewMessage] = useState({ title: '', content: '', category: 'Amor' })
  const [newImages, setNewImages] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Debounce para búsqueda
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Cargar mensajes directamente desde Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('date', { ascending: false })
        
        if (error) {
          console.error('Error loading messages:', error)
          return
        }
        
        if (data) {
          setMessages(
            data.map((m: any) => ({
              id: m.id,
              title: m.title,
              content: m.content,
              date: m.date,
              category: m.category,
              isRead: !!m.is_read,
              isFavorite: !!m.is_favorite,
              images: m.images || []
            }))
          )
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }
    load()

    // Realtime con throttle
    let lastUpdate = 0
    const throttleDelay = 1000
    
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        const now = Date.now()
        if (now - lastUpdate > throttleDelay) {
          lastUpdate = now
          load()
        }
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Función para manejar drag & drop
  const handleDrop = useCallback((e: React.DragEvent, setImages: (files: File[]) => void) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length > 0) {
      setImages(files)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // Estadísticas (memoizadas)
  const stats = useMemo(() => ({
    totalMessages: messages.length,
    unreadMessages: messages.filter(m => !m.isRead).length,
    readMessages: messages.filter(m => m.isRead).length,
    favoriteMessages: messages.filter(m => m.isFavorite).length
  }), [messages])
  
  const { totalMessages, unreadMessages, readMessages, favoriteMessages } = stats

  // Filtrar mensajes (memoizado con debounce)
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      const matchesSearch = debouncedSearchQuery === '' ||
        message.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        message.content.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || message.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [messages, debouncedSearchQuery, selectedCategory])

  // Toggle favorito con feedback visual
  const toggleFavorite = useCallback(async (messageId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const current = messages.find(m => m.id === messageId)
    if (!current) return
    
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isFavorite: !m.isFavorite } : m))
    
    try {
      await supabase.from('messages').update({ is_favorite: !current.isFavorite }).eq('id', messageId)
    } catch (error) {
      // Revert on error
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isFavorite: current.isFavorite } : m))
    }
  }, [messages, supabase])

  // Marcar como leído
  const markAsRead = useCallback(async (messageId: string) => {
    const current = messages.find(m => m.id === messageId)
    if (!current || current.isRead) return
    
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m))
    
    try {
      await supabase.from('messages').update({ is_read: true }).eq('id', messageId)
    } catch (error) {
      // Revert on error
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: false } : m))
    }
  }, [messages, supabase])

  // Eliminar mensaje con confirmación mejorada
  const deleteMessage = useCallback(async (messageId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const message = messages.find(m => m.id === messageId)
    if (!message || !confirm(`¿Estás seguro de que quieres eliminar "${message.title}"?`)) return
    
    // Optimistic update
    setMessages(prev => prev.filter(m => m.id !== messageId))
    
    try {
      await supabase.from('messages').delete().eq('id', messageId)
    } catch (error) {
      // Revert on error
      setMessages(prev => [...prev, message])
    }
  }, [messages, supabase])

  // Abrir modal de edición
  const openEditModal = useCallback((message: Message, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingMessage(message)
    setNewMessage({ title: message.title, content: message.content, category: message.category })
    setNewImages([])
    setIsEditModalOpen(true)
  }, [])

  // Guardar mensaje editado
  const saveEditedMessage = async () => {
    if (!editingMessage || !newMessage.title || !newMessage.content) return
    try {
      setSaving(true)
      let uploadedUrls: string[] = []
      if (newImages.length > 0) {
        const uploads = await Promise.all(
          newImages.map((file, idx) => uploadPublicFile('message-images', file, `messages/${editingMessage!.id}-${Date.now()}-${idx}/`))
        )
        uploadedUrls = uploads.map(u => u.url)
      }
      const updated = {
        title: newMessage.title,
        content: newMessage.content,
        category: newMessage.category,
        date: new Date().toISOString().slice(0, 10),
        images: uploadedUrls.length > 0 ? uploadedUrls : editingMessage.images || []
      }
      setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, ...updated } as Message : m))
      await supabase.from('messages').update({
        title: updated.title,
        content: updated.content,
        category: updated.category,
        date: updated.date,
        images: updated.images
      }).eq('id', editingMessage.id)
      setIsEditModalOpen(false)
      setEditingMessage(null)
      setNewMessage({ title: '', content: '', category: 'Amor' })
      setNewImages([])
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error saving message:', error)
      alert('Error al guardar el mensaje')
    } finally {
      setSaving(false)
    }
  }

  // Agregar nuevo mensaje
  const addNewMessage = async () => {
    if (!newMessage.title || !newMessage.content) return
    
    const messageDate = new Date().toISOString().slice(0, 10)
    
    // Crear URLs temporales para las imágenes (actualización optimista)
    const tempImageUrls = newImages.map(file => URL.createObjectURL(file))
    
    // Crear mensaje temporal para actualización optimista
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      title: newMessage.title,
      content: newMessage.content,
      date: messageDate,
      category: newMessage.category,
      isRead: false,
      isFavorite: false,
      images: tempImageUrls
    }
    
    // ACTUALIZACIÓN OPTIMISTA: Mostrar el mensaje inmediatamente
    setMessages(prev => [tempMessage, ...prev])
    
    // Cerrar modal y limpiar formulario inmediatamente
    setNewMessage({ title: '', content: '', category: 'Amor' })
    const imagesToUpload = [...newImages]
    setNewImages([])
    setIsWriteModalOpen(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
    
    // Subir imágenes a Supabase Storage en segundo plano
    try {
      let images: string[] = []
      if (imagesToUpload.length > 0) {
        const uploads = await Promise.all(
          imagesToUpload.map((file, idx) => uploadPublicFile('message-images', file, `messages/new-${Date.now()}-${idx}/`))
        )
        images = uploads.map(u => u.url)
      }
      
      const payload = {
        title: tempMessage.title,
        content: tempMessage.content,
        date: messageDate,
        category: tempMessage.category,
        is_read: false,
        is_favorite: false,
        images
      }
      
      const { data, error } = await supabase.from('messages').insert(payload).select('id').single()
      
      if (!error && data) {
        // Actualizar con el mensaje real de la base de datos
        const realMessage: Message = {
          id: data.id,
          title: payload.title,
          content: payload.content,
          date: payload.date,
          category: payload.category,
          isRead: false,
          isFavorite: false,
          images
        }
        
        // Reemplazar el mensaje temporal con el real
        setMessages(prev => prev.map(m => m.id === tempMessage.id ? realMessage : m))
        
        // Limpiar URLs temporales
        tempImageUrls.forEach(url => URL.revokeObjectURL(url))
      } else {
        throw error || new Error('Error al guardar el mensaje')
      }
    } catch (error) {
      console.error('Error adding message:', error)
      // Revertir actualización optimista
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
      // Limpiar URLs temporales
      tempImageUrls.forEach(url => URL.revokeObjectURL(url))
      alert('Error al agregar el mensaje')
    }
  }

  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 overflow-x-hidden px-3 pb-20 pt-3 sm:gap-6 sm:px-4 sm:pb-6 sm:pt-4 md:gap-8 md:px-6" style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}>
      {/* UX: Header optimizado para móvil con tipografía escalable desde 320px */}
      <motion.div 
        className="flex flex-col items-center gap-1.5 text-center sm:gap-2 md:gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Badge
          aria-hidden="true"
          variant="secondary"
          className="w-fit rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-pink-600 shadow-sm ring-1 ring-pink-200/70 backdrop-blur sm:px-3 sm:py-1 sm:text-[11px]"
        >
          Nuestros Pensamientos
        </Badge>
        <h1 className="w-full text-wrap text-[1.5rem] font-extrabold leading-[1.2] tracking-tight text-gray-900 dark:text-white sm:text-[1.75rem] md:text-3xl lg:text-4xl">
          Mensajes Especiales
        </h1>
        <p className="w-full max-w-2xl px-1 text-[12px] leading-[1.5] text-gray-600 dark:text-gray-300 sm:text-sm sm:leading-5 md:text-base md:leading-6 lg:text-lg">
          Comparte tus pensamientos, deseos y sentimientos más profundos.
        </p>
      </motion.div>

      {/* UX: Estadísticas con scroll horizontal táctil optimizado para móvil */}
      <motion.div 
        className="flex w-full overflow-x-auto gap-2 pb-2 px-1 scrollbar-hide sm:gap-3 sm:px-0 sm:pb-0 sm:overflow-visible sm:flex-wrap sm:justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="stats-card bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border-0 rounded-lg p-2 flex-shrink-0 min-w-[90px] transition-all duration-200 active:scale-95 sm:rounded-xl sm:p-2.5 sm:min-w-[100px]">
          <div className="text-lg font-bold text-pink-600 dark:text-pink-400 sm:text-xl">{totalMessages}</div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 sm:text-[11px]">Total</div>
        </div>
        <div className="stats-card bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border-0 rounded-lg p-2 flex-shrink-0 min-w-[90px] transition-all duration-200 active:scale-95 sm:rounded-xl sm:p-2.5 sm:min-w-[100px]">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 sm:text-xl">{unreadMessages}</div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 sm:text-[11px]">Sin leer</div>
        </div>
        <div className="stats-card bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border-0 rounded-lg p-2 flex-shrink-0 min-w-[90px] transition-all duration-200 active:scale-95 sm:rounded-xl sm:p-2.5 sm:min-w-[100px]">
          <div className="text-lg font-bold text-green-600 dark:text-green-400 sm:text-xl">{readMessages}</div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 sm:text-[11px]">Leídos</div>
        </div>
        <div className="stats-card bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border-0 rounded-lg p-2 flex-shrink-0 min-w-[90px] transition-all duration-200 active:scale-95 sm:rounded-xl sm:p-2.5 sm:min-w-[100px]">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 sm:text-xl">{favoriteMessages}</div>
          <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 sm:text-[11px]">Favoritos</div>
        </div>
      </motion.div>

      {/* UX: Búsqueda y filtros optimizados para móvil con input táctil */}
      <motion.div 
        className="flex w-full flex-col gap-2.5 sm:gap-3 md:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500 sm:left-4 sm:h-4 sm:w-4" aria-hidden="true" />
          <Input 
            placeholder="Buscar en mensajes..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar mensajes"
            className="pl-9 pr-4 py-2.5 border-gray-200 dark:border-gray-700 focus:border-pink-500 focus:ring-pink-500 text-[13px] rounded-lg min-h-[44px] sm:pl-12 sm:py-3 sm:text-sm md:text-base sm:rounded-xl"
            style={{ fontSize: '16px' }}
          />
        </div>
        {/* UX: Filtros con scroll horizontal táctil */}
        <div className="flex w-full overflow-x-auto gap-1.5 pb-2 px-1 scrollbar-hide sm:gap-2 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0 sm:px-0">
          <Badge 
            variant={selectedCategory === '' ? 'default' : 'secondary'} 
            className="category-badge hover:bg-pink-100 dark:hover:bg-pink-900/20 flex-shrink-0 px-3 py-2.5 rounded-full text-[11px] font-semibold min-h-[44px] touch-target cursor-pointer transition-all duration-200 active:scale-95 sm:px-4 sm:py-2 sm:text-xs md:text-sm"
            onClick={() => setSelectedCategory('')}
            role="button"
            tabIndex={0}
            aria-label="Filtrar todos los mensajes"
            onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory('')}
          >
            Todos
          </Badge>
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.name
            return (
              <Badge 
                key={category.name} 
                variant={isSelected ? 'default' : 'secondary'} 
                className={`category-badge ${category.color} flex-shrink-0 px-3 py-2.5 rounded-full text-[11px] font-semibold min-h-[44px] touch-target cursor-pointer transition-all duration-200 active:scale-95 sm:px-4 sm:py-2 sm:text-xs md:text-sm ${
                  isSelected ? 'ring-2 ring-pink-500 dark:ring-pink-400' : ''
                }`}
                onClick={() => setSelectedCategory(category.name)}
                role="button"
                tabIndex={0}
                aria-label={`Filtrar mensajes de categoría ${category.name}`}
                aria-pressed={isSelected}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory(category.name)}
              >
                <Icon className="h-3 w-3 mr-1 sm:h-3.5 sm:w-3.5 sm:mr-1.5 md:h-4 md:w-4" aria-hidden="true" />
                {category.name}
              </Badge>
            )
          })}
        </div>
      </motion.div>

      {/* UX: Mensajes con grid responsive optimizado para móvil */}
      <AnimatePresence mode="popLayout">
        {filteredMessages.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full text-center py-8 sm:py-12 md:py-16"
          >
            <div className="text-gray-400 dark:text-gray-500 mb-3 sm:mb-4">
              <Heart className="h-10 w-10 mx-auto sm:h-12 sm:w-12 md:h-16 md:w-16" />
            </div>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 sm:text-sm md:text-base lg:text-lg">
              {searchQuery || selectedCategory 
                ? 'No se encontraron mensajes con estos filtros' 
                : 'Aún no hay mensajes. ¡Escribe el primero!'}
            </p>
          </motion.div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-3">
            {filteredMessages.map((message, index) => {
              const category = categories.find(c => c.name === message.category)
              const Icon = category?.icon || Heart
              return (
                <motion.div
                  key={message.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Card 
                    className={`message-card ${!message.isRead ? 'ring-2 ring-pink-300 dark:ring-pink-700' : ''} bg-white dark:bg-gray-800 shadow-md hover:shadow-xl border-0 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer active:scale-[0.98] sm:rounded-2xl`}
                    onClick={() => markAsRead(message.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Mensaje: ${message.title}. ${message.isRead ? 'Leído' : 'No leído'}. ${message.isFavorite ? 'Favorito' : ''}`}
                    onKeyDown={(e) => e.key === 'Enter' && markAsRead(message.id)}
                  >
                    <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                      <div className="flex justify-between items-start mb-2.5 gap-1.5 sm:mb-3 sm:gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-1 truncate sm:text-base sm:mb-1.5 md:text-lg lg:text-xl">
                            {message.title}
                          </h3>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs md:text-sm sm:gap-1.5">
                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                            <span>{message.date}</span>
                          </div>
                        </div>
                        {/* UX: Controles con áreas táctiles mínimas (44x44px en móvil) */}
                        <div className="flex items-center gap-1 flex-shrink-0 sm:gap-1.5 md:gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => toggleFavorite(message.id, e)} 
                            className={`h-10 w-10 p-0 rounded-full transition-all duration-200 active:scale-95 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 touch-target ${
                              message.isFavorite 
                                ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20' 
                                : 'text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            aria-label={message.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                          >
                            <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${message.isFavorite ? 'fill-current' : ''}`} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => openEditModal(message, e)} 
                            className="h-10 w-10 p-0 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-50 active:scale-95 dark:hover:bg-blue-900/20 transition-all duration-200 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 touch-target"
                            aria-label="Editar mensaje"
                          >
                            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => deleteMessage(message.id, e)} 
                            className="h-10 w-10 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 active:scale-95 dark:hover:bg-red-900/20 transition-all duration-200 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 touch-target"
                            aria-label="Eliminar mensaje"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-[12px] text-gray-600 dark:text-gray-300 line-clamp-4 mb-2.5 leading-relaxed sm:text-sm sm:mb-3 md:text-base">
                        {message.content}
                      </p>
                      {message.images && message.images.length > 0 && (
                        <div className="mb-2.5 sm:mb-3">
                          <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-0.5 px-0.5 sm:gap-2 sm:-mx-1 sm:px-1">
                            {message.images.map((imageUrl, idx) => (
                              <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 sm:w-20 sm:h-20 sm:rounded-xl md:w-24 md:h-24">
                                <img
                                  src={imageUrl}
                                  alt={`Imagen ${idx + 1} de ${message.title}`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=Imagen'
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2.5 sm:mt-3">
                        <Badge className={`${category?.color} transition-all duration-200 text-[10px] px-2 py-0.5 rounded-full sm:text-xs sm:px-2.5 sm:py-1 md:text-sm md:px-3`}>
                          <Icon className="h-2.5 w-2.5 mr-1 sm:h-3 sm:w-3 sm:mr-1.5 md:h-3.5 md:w-3.5" aria-hidden="true" />
                          {message.category}
                        </Badge>
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse sm:w-2.5 sm:h-2.5" aria-label="Mensaje no leído" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>

      {/* UX: FAB optimizado para móvil con tamaño táctil mínimo (56x56px) */}
      <motion.button
        variants={fabVariants}
        initial="hidden"
        animate="visible"
        whileTap="tap"
        onClick={() => setIsWriteModalOpen(true)}
        className="fixed z-40 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-700 h-14 w-14 bottom-4 right-4 sm:h-16 sm:w-16 sm:bottom-6 sm:right-6"
        aria-label="Escribir nuevo mensaje"
        style={{ 
          bottom: 'max(env(safe-area-inset-bottom), 1rem)',
          right: 'max(env(safe-area-inset-right), 1rem)'
        }}
      >
        <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
      </motion.button>

      {/* Toast de éxito */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
            style={{ bottom: 'max(calc(env(safe-area-inset-bottom) + 5rem), 6rem)' }}
          >
            <Check className="h-5 w-5" />
            <span className="text-sm font-medium">¡Guardado exitosamente!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para escribir mensaje */}
      <AnimatePresence>
        {isWriteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => setIsWriteModalOpen(false)}
            style={{ 
              paddingTop: 'max(env(safe-area-inset-top), 0.75rem)',
              paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)'
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="write-modal-title"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 id="write-modal-title" className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  Escribir Nuevo Mensaje
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="h-9 w-9 sm:h-8 sm:w-8 p-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                  aria-label="Cerrar modal"
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
                    value={newMessage.title} 
                    onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="Título del mensaje" 
                    className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl min-h-[44px] text-base"
                    style={{ fontSize: '16px' }}
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Categoría
                  </label>
                  <select 
                    value={newMessage.category} 
                    onChange={(e) => setNewMessage(prev => ({ ...prev, category: e.target.value }))} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-pink-500 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px] text-base"
                    style={{ fontSize: '16px' }}
                    aria-label="Seleccionar categoría"
                  >
                    {categories.map(category => (
                      <option key={category.name} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Mensaje
                  </label>
                  <textarea 
                    value={newMessage.content} 
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))} 
                    placeholder="Escribe tu mensaje aquí..." 
                    rows={4} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:border-pink-500 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                    style={{ fontSize: '16px', minHeight: '120px' }}
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Fotos (opcional)
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 sm:p-6 text-center hover:border-pink-400 transition-colors bg-gray-50 dark:bg-gray-700/50 min-h-[120px] flex items-center justify-center"
                    onDrop={(e) => handleDrop(e, setNewImages)}
                    onDragOver={handleDragOver}
                    role="button"
                    tabIndex={0}
                    aria-label="Área para arrastrar y soltar imágenes"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        document.getElementById('file-upload-new')?.click()
                      }
                    }}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={(e) => setNewImages(Array.from(e.target.files || []))} 
                      className="hidden"
                      id="file-upload-new"
                      aria-label="Seleccionar imágenes"
                    />
                    <label htmlFor="file-upload-new" className="cursor-pointer w-full">
                      <div className="text-gray-600 dark:text-gray-300">
                        <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-gray-400" />
                        <div className="font-medium text-sm sm:text-base">Haz clic para seleccionar fotos</div>
                        <div className="text-xs sm:text-sm mt-1 text-gray-500 dark:text-gray-400">o arrastra las imágenes aquí</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">JPG, PNG, WebP, GIF (máx 5MB cada una)</div>
                      </div>
                    </label>
                  </div>
                  {newImages.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Imágenes seleccionadas ({newImages.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newImages.map((file, idx) => (
                          <div key={idx} className="relative">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm hover:bg-red-600 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-target"
                              aria-label={`Eliminar imagen ${idx + 1}`}
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Button 
                  onClick={() => setIsWriteModalOpen(false)} 
                  variant="outline" 
                  className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl min-h-[44px] text-base"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={addNewMessage} 
                  disabled={saving || !newMessage.title || !newMessage.content} 
                  className="flex-1 bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para editar mensaje */}
      <AnimatePresence>
        {isEditModalOpen && editingMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => {
              setIsEditModalOpen(false)
              setEditingMessage(null)
              setNewMessage({ title: '', content: '', category: 'Amor' })
              setNewImages([])
            }}
            style={{ 
              paddingTop: 'max(env(safe-area-inset-top), 0.75rem)',
              paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)'
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="edit-modal-title"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 id="edit-modal-title" className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  Editar Mensaje
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingMessage(null)
                    setNewMessage({ title: '', content: '', category: 'Amor' })
                    setNewImages([])
                  }}
                  className="h-9 w-9 sm:h-8 sm:w-8 p-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                  aria-label="Cerrar modal"
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
                    value={newMessage.title} 
                    onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))} 
                    placeholder="Título del mensaje" 
                    className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl min-h-[44px] text-base"
                    style={{ fontSize: '16px' }}
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Categoría
                  </label>
                  <select 
                    value={newMessage.category} 
                    onChange={(e) => setNewMessage(prev => ({ ...prev, category: e.target.value }))} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:border-pink-500 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px] text-base"
                    style={{ fontSize: '16px' }}
                    aria-label="Seleccionar categoría"
                  >
                    {categories.map(category => (
                      <option key={category.name} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Mensaje
                  </label>
                  <textarea 
                    value={newMessage.content} 
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))} 
                    placeholder="Escribe tu mensaje aquí..." 
                    rows={4} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:border-pink-500 focus:ring-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                    style={{ fontSize: '16px', minHeight: '120px' }}
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Fotos (opcional)
                  </label>
                  {editingMessage.images && editingMessage.images.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imágenes actuales:</div>
                      <div className="flex flex-wrap gap-2">
                        {editingMessage.images.map((imageUrl, idx) => (
                          <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                            <img
                              src={imageUrl}
                              alt={`Imagen actual ${idx + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Imagen'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 sm:p-6 text-center hover:border-pink-400 transition-colors bg-gray-50 dark:bg-gray-700/50 min-h-[120px] flex items-center justify-center"
                    onDrop={(e) => handleDrop(e, setNewImages)}
                    onDragOver={handleDragOver}
                    role="button"
                    tabIndex={0}
                    aria-label="Área para arrastrar y soltar imágenes"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        document.getElementById('file-upload-edit')?.click()
                      }
                    }}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={(e) => setNewImages(Array.from(e.target.files || []))} 
                      className="hidden"
                      id="file-upload-edit"
                      aria-label="Seleccionar imágenes"
                    />
                    <label htmlFor="file-upload-edit" className="cursor-pointer w-full">
                      <div className="text-gray-600 dark:text-gray-300">
                        <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-gray-400" />
                        <div className="font-medium text-sm sm:text-base">Haz clic para agregar más fotos</div>
                        <div className="text-xs sm:text-sm mt-1 text-gray-500 dark:text-gray-400">o arrastra las imágenes aquí</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">JPG, PNG, WebP, GIF (máx 5MB cada una)</div>
                      </div>
                    </label>
                  </div>
                  {newImages.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nuevas imágenes ({newImages.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newImages.map((file, idx) => (
                          <div key={idx} className="relative">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm hover:bg-red-600 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 touch-target"
                              aria-label={`Eliminar imagen ${idx + 1}`}
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Button 
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingMessage(null)
                    setNewMessage({ title: '', content: '', category: 'Amor' })
                    setNewImages([])
                  }} 
                  variant="outline" 
                  className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl min-h-[44px] text-base"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={saveEditedMessage} 
                  disabled={saving || !newMessage.title || !newMessage.content} 
                  className="flex-1 bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
