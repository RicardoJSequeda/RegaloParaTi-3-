'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { 
  X, 
  Save,
  Upload,
  MapPin,
  Calendar,
  Video,
  Image,
  FileText,
  Plus,
  Trash2,
  Eye,
  Edit
} from 'lucide-react'
import { SurpriseBox } from '@/types'
import { DynamicContentForm } from './dynamic-content-form'
import { MultiFileUpload } from './multi-file-upload'
import { createClient } from '@supabase/supabase-js'

interface EditSurpriseModalProps {
  surprise: SurpriseBox | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSurprise: Partial<SurpriseBox>) => Promise<void>
}

export function EditSurpriseModal({ surprise, isOpen, onClose, onSave }: EditSurpriseModalProps) {
  const [formData, setFormData] = useState<Partial<SurpriseBox>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [contentData, setContentData] = useState<any>({})
  const [showPreview, setShowPreview] = useState(false)

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (surprise && isOpen) {
      // Solo inicializar si no se ha hecho antes o si es una sorpresa diferente
      setFormData({
        title: surprise.title || '',
        unlock_type: surprise.unlock_type || 'free',
        unlock_date: surprise.unlock_date || '',
        unlock_time: surprise.unlock_time || '',
        required_key: surprise.required_key || '',
        content_type: surprise.content_type || 'text',
        content_title: surprise.content_title || '',
        content_description: surprise.content_description || '',
        content_text: surprise.content_text || '',
        content_image_url: surprise.content_image_url || '',
        content_video_url: surprise.content_video_url || '',
        event_date: surprise.event_date || '',
        event_location: surprise.event_location || '',
        event_map_link: surprise.event_map_link || '',
        content_blocks: surprise.content_blocks || null,
        edit_password: surprise.edit_password || '',
        "order": surprise.order || 0,
        effects: surprise.effects || { confetti: true }
      })

      // Inicializar contentData para el formulario dinámico
      setContentData({
        files: [],
        blocks: surprise.content_blocks?.blocks || [],
        imageDescription: '',
        videoDescription: '',
        eventDate: surprise.event_date || '',
        eventTime: '',
        eventLocation: surprise.event_location || '',
        eventMapLink: surprise.event_map_link || '',
        invitationMessage: '',
        invitationLocation: '',
        invitationDate: '',
        invitationTime: '',
        invitationDressCode: '',
        invitationRSVP: '',
        mixedBlocks: surprise.content_blocks?.blocks || []
      })
    }
  }, [surprise?.id, isOpen]) // Solo dependencia del ID de la sorpresa

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleContentChange = (data: any) => {
    setContentData(data)
  }

  const handleSave = async () => {
    if (!surprise) return

    setIsSaving(true)
    try {
      // Procesar archivos si existen
      let contentImageUrl = formData.content_image_url
      let contentVideoUrl = formData.content_video_url
      let updatedContentBlocks = contentData.blocks ? { blocks: contentData.blocks } : formData.content_blocks

      if (contentData.files && contentData.files.length > 0) {
        console.log('Procesando archivos nuevos:', contentData.files)
        console.log('Bloques existentes:', contentData.blocks)
        
        try {
          // Crear cliente de Supabase
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )

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
            console.log('URL de imagen principal actualizada:', contentImageUrl)
          }
          if (videoFiles.length > 0) {
            contentVideoUrl = uploadedUrls.find(url => url) // Primer video
            console.log('URL de video principal actualizada:', contentVideoUrl)
          }

          // Actualizar content_blocks con las nuevas URLs
          if (contentData.blocks && contentData.blocks.length > 0) {
            let urlIndex = 0
            const updatedBlocks = contentData.blocks.map((block: any) => {
              console.log('Procesando bloque:', block)
              
              // Si el bloque es de tipo imagen o video y no tiene URL (es nuevo)
              if ((block.type === 'image' || block.type === 'video') && !block.url && uploadedUrls[urlIndex]) {
                const updatedBlock = { ...block, url: uploadedUrls[urlIndex] }
                console.log('Bloque nuevo actualizado con URL:', updatedBlock)
                urlIndex++
                return updatedBlock
              }
              
              // Si el bloque ya tiene URL, mantenerlo
              console.log('Bloque existente mantenido:', block)
              return block
            })
            updatedContentBlocks = { blocks: updatedBlocks }
            console.log('Bloques finales actualizados:', updatedBlocks)
          }

        } catch (uploadError) {
          console.error('Error en subida de archivos:', uploadError)
          alert('Error al subir archivos. Los cambios se guardarán sin los archivos nuevos.')
        }
      }

      // Limpiar campos de fecha vacíos para evitar errores de base de datos
      const cleanFormData = {
        ...formData,
        unlock_date: formData.unlock_date || null,
        unlock_time: formData.unlock_time || null,
        event_date: (contentData.eventDate || formData.event_date) || null,
        content_image_url: contentImageUrl,
        content_video_url: contentVideoUrl,
        content_blocks: updatedContentBlocks,
        event_location: contentData.eventLocation || formData.event_location || null,
        event_map_link: contentData.eventMapLink || formData.event_map_link || null,
        required_key: formData.required_key || null
      }

      console.log('Datos finales a guardar:', cleanFormData)

      await onSave(cleanFormData)
      onClose()
    } catch (error) {
      console.error('Error saving surprise:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    setShowPreview(!showPreview)
  }

  const renderPreview = () => {
    if (!showPreview) return null

    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">Vista Previa:</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Título:</strong> {formData.title}</p>
          <p><strong>Tipo de Contenido:</strong> {formData.content_type}</p>
          <p><strong>Título del Contenido:</strong> {formData.content_title}</p>
          {formData.content_image_url && (
            <div>
              <p><strong>Imagen:</strong></p>
              <img 
                src={formData.content_image_url} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}
          {formData.content_video_url && (
            <div>
              <p><strong>Video:</strong> {formData.content_video_url}</p>
            </div>
          )}
          {formData.event_location && (
            <p><strong>Ubicación:</strong> {formData.event_location}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Sorpresa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título de la Sorpresa *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Título de la sorpresa"
              />
            </div>

            <div>
              <Label htmlFor="unlock_type">Tipo de Desbloqueo</Label>
              <Select
                value={formData.unlock_type || 'free'}
                onValueChange={(value) => handleInputChange('unlock_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Libre</SelectItem>
                  <SelectItem value="date">Por Fecha</SelectItem>
                  <SelectItem value="key">Por Llave</SelectItem>
                  <SelectItem value="sequential">Secuencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.unlock_type === 'date' && (
              <>
                <div>
                  <Label htmlFor="unlock_date">Fecha de Desbloqueo</Label>
                  <Input
                    id="unlock_date"
                    type="date"
                    value={formData.unlock_date || ''}
                    onChange={(e) => handleInputChange('unlock_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="unlock_time">Hora de Desbloqueo</Label>
                  <Input
                    id="unlock_time"
                    type="time"
                    value={formData.unlock_time || ''}
                    onChange={(e) => handleInputChange('unlock_time', e.target.value)}
                  />
                </div>
              </>
            )}

            {formData.unlock_type === 'key' && (
              <div>
                <Label htmlFor="required_key">Llave Requerida</Label>
                <Input
                  id="required_key"
                  value={formData.required_key || ''}
                  onChange={(e) => handleInputChange('required_key', e.target.value)}
                  placeholder="Llave para desbloquear"
                />
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="content_type">Tipo de Contenido</Label>
              <Select
                value={formData.content_type || 'text'}
                onValueChange={(value) => handleInputChange('content_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="image">Imagen</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="mixed">Contenido Mixto</SelectItem>
                  <SelectItem value="invitation">Invitación</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="content_title">Título del Contenido</Label>
                <Input
                  id="content_title"
                  value={formData.content_title || ''}
                  onChange={(e) => handleInputChange('content_title', e.target.value)}
                  placeholder="Título del contenido"
                />
              </div>

              <div>
                <Label htmlFor="content_description">Descripción</Label>
                <Input
                  id="content_description"
                  value={formData.content_description || ''}
                  onChange={(e) => handleInputChange('content_description', e.target.value)}
                  placeholder="Descripción del contenido"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content_text">Texto del Contenido</Label>
              <textarea
                id="content_text"
                value={formData.content_text || ''}
                onChange={(e) => handleInputChange('content_text', e.target.value)}
                placeholder="Texto del contenido..."
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Formulario Dinámico de Contenido */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Contenido Dinámico</h3>
            <DynamicContentForm
              contentType={formData.content_type || 'text'}
              contentData={contentData}
              onContentChange={handleContentChange}
            />
          </div>

          {/* Configuración Adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_password">Contraseña de Edición</Label>
              <Input
                id="edit_password"
                value={formData.edit_password || ''}
                onChange={(e) => handleInputChange('edit_password', e.target.value)}
                placeholder="Contraseña para editar"
              />
            </div>

            <div>
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                value={formData.order || 0}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
                placeholder="Orden de aparición"
              />
            </div>
          </div>

          {/* Vista Previa */}
          <div className="border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
            </Button>
            {renderPreview()}
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.title}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
