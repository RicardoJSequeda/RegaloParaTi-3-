'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  Trash2
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
  { name: 'Amor', icon: Heart, color: 'bg-red-100 text-red-800 border-red-200' },
  { name: 'Motivación', icon: Star, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { name: 'Recuerdos', icon: Briefcase, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Futuro', icon: Hash, color: 'bg-green-100 text-green-800 border-green-200' },
  { name: 'Especiales', icon: Sparkles, color: 'bg-purple-100 text-purple-800 border-purple-200' },
]

export function MensajesSection() {
  const supabase = getBrowserClient()
  const [messages, setMessages] = useState<Message[]>([])

  // cargar mensajes
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id,title,content,date,category,is_read,is_favorite,images')
        .order('date', { ascending: false })
      if (!error && data) {
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
    }
    load()

    // realtime
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => load())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [newMessage, setNewMessage] = useState({ title: '', content: '', category: 'Amor' })
  const [newImages, setNewImages] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  // Función para manejar drag & drop
  const handleDrop = (e: React.DragEvent, setImages: (files: File[]) => void) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length > 0) {
      setImages(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Estadísticas
  const totalMessages = messages.length
  const unreadMessages = messages.filter(m => !m.isRead).length
  const readMessages = messages.filter(m => m.isRead).length
  const favoriteMessages = messages.filter(m => m.isFavorite).length

  // Filtrar mensajes
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || message.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Toggle favorito
  const toggleFavorite = async (messageId: string) => {
    const current = messages.find(m => m.id === messageId)
    if (!current) return
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isFavorite: !m.isFavorite } : m))
    await supabase.from('messages').update({ is_favorite: !current.isFavorite }).eq('id', messageId)
  }

  // Marcar como leído
  const markAsRead = async (messageId: string) => {
    const current = messages.find(m => m.id === messageId)
    if (!current || current.isRead) return
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m))
    await supabase.from('messages').update({ is_read: true }).eq('id', messageId)
  }

  // Eliminar mensaje
  const deleteMessage = async (messageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) return
    setMessages(prev => prev.filter(m => m.id !== messageId))
    await supabase.from('messages').delete().eq('id', messageId)
  }

  // Abrir modal de edición
  const openEditModal = (message: Message) => {
    setEditingMessage(message)
    setNewMessage({ title: message.title, content: message.content, category: message.category })
    setNewImages([])
    setIsEditModalOpen(true)
  }

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
    } finally {
      setSaving(false)
    }
  }

  // Agregar nuevo mensaje
  const addNewMessage = async () => {
    if (!newMessage.title || !newMessage.content) return
    try {
      setSaving(true)
      let images: string[] = []
      if (newImages.length > 0) {
        const uploads = await Promise.all(
          newImages.map((file, idx) => uploadPublicFile('message-images', file, `messages/new-${Date.now()}-${idx}/`))
        )
        images = uploads.map(u => u.url)
      }
      const payload = {
        title: newMessage.title,
        content: newMessage.content,
        date: new Date().toISOString().slice(0, 10),
        category: newMessage.category,
        is_read: false,
        is_favorite: false,
        images
      }
      const { data, error } = await supabase.from('messages').insert(payload).select('id').single()
      if (!error && data) {
        setMessages(prev => [{
          id: data.id,
          title: payload.title,
          content: payload.content,
          date: payload.date,
          category: payload.category,
          isRead: false,
          isFavorite: false,
          images
        }, ...prev])
      }
      setNewMessage({ title: '', content: '', category: 'Amor' })
      setNewImages([])
      setIsWriteModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-800">Mensajes</h1>
        <p className="text-gray-600 text-lg">Comparte tus pensamientos, deseos y sentimientos más profundos.</p>
      </div>

      {/* Estadísticas y Acciones */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="stats-card rounded-lg p-4">
            <div className="text-2xl font-bold text-pink-600">{totalMessages}</div>
            <div className="text-sm text-gray-600">Mensajes totales</div>
          </div>
          <div className="stats-card rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{unreadMessages}</div>
            <div className="text-sm text-gray-600">Sin leer</div>
          </div>
          <div className="stats-card rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{readMessages}</div>
            <div className="text-sm text-gray-600">Leídos</div>
          </div>
          <div className="stats-card rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{favoriteMessages}</div>
            <div className="text-sm text-gray-600">Favoritos</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsWriteModalOpen(true)} className="bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Edit3 className="h-4 w-4 mr-2" />
            Escribir Mensaje
          </Button>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar en mensajes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 border-gray-300 focus:border-pink-500 focus:ring-pink-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={selectedCategory === '' ? 'default' : 'secondary'} className="category-badge hover:bg-pink-100" onClick={() => setSelectedCategory('')}>Todos</Badge>
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Badge key={category.name} variant={selectedCategory === category.name ? 'default' : 'secondary'} className={`category-badge ${category.color}`} onClick={() => setSelectedCategory(category.name)}>
                <Icon className="h-3 w-3 mr-1" />
                {category.name}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Mensajes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMessages.map((message, index) => {
          const category = categories.find(c => c.name === message.category)
          const Icon = category?.icon || Heart
          const rotationClass = index === 0 ? 'rotate-1' : index === 1 ? 'rotate-2' : 'rotate-3'
          return (
            <Card key={message.id} className={`message-card ${rotationClass} ${!message.isRead ? 'ring-2 ring-pink-200' : ''}`} onClick={() => markAsRead(message.id)}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{message.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {message.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toggleFavorite(message.id) }} className={`p-1 h-auto transition-all duration-200 ${message.isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}>
                      <Heart className={`h-4 w-4 ${message.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(message) }} className="p-1 h-auto text-blue-500 hover:text-blue-600 transition-all duration-200">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteMessage(message.id) }} className="p-1 h-auto text-red-500 hover:text-red-600 transition-all duration-200">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-4 mb-3 leading-relaxed">{message.content}</p>
                {message.images && message.images.length > 0 && (
                  <div className="mb-3">
                    <div className="flex gap-2 overflow-x-auto">
                      {message.images.map((imageUrl, idx) => (
                        <img 
                          key={idx}
                          src={imageUrl} 
                          alt={`Imagen ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Badge className={`${category?.color} transition-all duration-200 hover:scale-105`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {message.category}
                  </Badge>
                  {!message.isRead && (<div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal para escribir mensaje */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="modal-content bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Escribir Nuevo Mensaje</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <Input value={newMessage.title} onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))} placeholder="Título del mensaje" className="border-gray-300 focus:border-pink-500 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select value={newMessage.category} onChange={(e) => setNewMessage(prev => ({ ...prev, category: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-md focus:border-pink-500 focus:ring-pink-500">
                  {categories.map(category => (<option key={category.name} value={category.name}>{category.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea value={newMessage.content} onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))} placeholder="Escribe tu mensaje aquí..." rows={4} className="w-full p-2 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fotos (opcional)</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors"
                  onDrop={(e) => handleDrop(e, setNewImages)}
                  onDragOver={handleDragOver}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={(e) => setNewImages(Array.from(e.target.files || []))} 
                    className="hidden"
                    id="file-upload-new"
                  />
                  <label htmlFor="file-upload-new" className="cursor-pointer">
                    <div className="text-gray-600">
                      <div className="text-lg mb-2">📷</div>
                      <div className="font-medium">Haz clic para seleccionar fotos</div>
                      <div className="text-sm">o arrastra las imágenes aquí</div>
                      <div className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, GIF (máx 5MB cada una)</div>
                    </div>
                  </label>
                </div>
                {newImages.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Imágenes seleccionadas ({newImages.length}):</div>
                    <div className="flex flex-wrap gap-2">
                      {newImages.map((file, idx) => (
                        <div key={idx} className="relative">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Preview ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setIsWriteModalOpen(false)} variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50">Cancelar</Button>
              <Button onClick={addNewMessage} disabled={saving} className="flex-1 bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-xl transition-all duration-200">{saving ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar mensaje */}
      {isEditModalOpen && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="modal-content bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Editar Mensaje</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <Input value={newMessage.title} onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))} placeholder="Título del mensaje" className="border-gray-300 focus:border-pink-500 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select value={newMessage.category} onChange={(e) => setNewMessage(prev => ({ ...prev, category: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-md focus:border-pink-500 focus:ring-pink-500">
                  {categories.map(category => (<option key={category.name} value={category.name}>{category.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea value={newMessage.content} onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))} placeholder="Escribe tu mensaje aquí..." rows={4} className="w-full p-2 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fotos (opcional)</label>
                {editingMessage?.images && editingMessage.images.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Imágenes actuales:</div>
                    <div className="flex flex-wrap gap-2">
                      {editingMessage.images.map((imageUrl, idx) => (
                        <div key={idx} className="relative">
                          <img 
                            src={imageUrl} 
                            alt={`Imagen actual ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors"
                  onDrop={(e) => handleDrop(e, setNewImages)}
                  onDragOver={handleDragOver}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={(e) => setNewImages(Array.from(e.target.files || []))} 
                    className="hidden"
                    id="file-upload-edit"
                  />
                  <label htmlFor="file-upload-edit" className="cursor-pointer">
                    <div className="text-gray-600">
                      <div className="text-lg mb-2">📷</div>
                      <div className="font-medium">Haz clic para agregar más fotos</div>
                      <div className="text-sm">o arrastra las imágenes aquí</div>
                      <div className="text-xs text-gray-500 mt-1">JPG, PNG, WebP, GIF (máx 5MB cada una)</div>
                    </div>
                  </label>
                </div>
                {newImages.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Nuevas imágenes ({newImages.length}):</div>
                    <div className="flex flex-wrap gap-2">
                      {newImages.map((file, idx) => (
                        <div key={idx} className="relative">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Preview ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => { setIsEditModalOpen(false); setEditingMessage(null); setNewMessage({ title: '', content: '', category: 'Amor' }); setNewImages([]) }} variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50">Cancelar</Button>
              <Button onClick={saveEditedMessage} disabled={saving} className="flex-1 bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-xl transition-all duration-200">{saving ? 'Guardando...' : 'Guardar Cambios'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
