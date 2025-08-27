'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileUpload } from '@/components/ui/file-upload'
import { MultiFileUpload } from '@/components/ui/multi-file-upload'
import { MiniMap } from '@/components/ui/mini-map'
import { ContentBlockEditor } from '@/components/ui/content-block-editor'
import { 
  Image, 
  Video, 
  MapPin, 
  Calendar, 
  Clock, 
  Link, 
  Plus, 
  X, 
  Upload,
  Music,
  Heart,
  Gift,
  Star,
  Camera,
  FileText
} from 'lucide-react'

interface DynamicContentFormProps {
  contentType: string
  contentData: any
  onContentChange: (data: any) => void
}

export function DynamicContentForm({ contentType, contentData, onContentChange }: DynamicContentFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [eventMapLink, setEventMapLink] = useState('')
  const [invitationMessage, setInvitationMessage] = useState('')
  const [invitationLocation, setInvitationLocation] = useState('')
  const [invitationDate, setInvitationDate] = useState('')
  const [invitationTime, setInvitationTime] = useState('')
  const [invitationDressCode, setInvitationDressCode] = useState('')
  const [invitationRSVP, setInvitationRSVP] = useState('')
  const [mixedBlocks, setMixedBlocks] = useState<any[]>([])

  // Convertir mixedBlocks a formato ContentBlock
  const contentBlocks = mixedBlocks.map(block => ({
    id: block.id,
    type: block.type,
    title: block.title,
    content: block.content,
    file: block.file
  }))

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar estado local con contentData cuando cambia
  useEffect(() => {
    if (contentData) {
      setUploadedFiles(contentData.files || [])
      setEventDate(contentData.eventDate || '')
      setEventTime(contentData.eventTime || '')
      setEventLocation(contentData.eventLocation || '')
      setEventMapLink(contentData.eventMapLink || '')
      setInvitationMessage(contentData.invitationMessage || '')
      setInvitationLocation(contentData.invitationLocation || '')
      setInvitationDate(contentData.invitationDate || '')
      setInvitationTime(contentData.invitationTime || '')
      setInvitationDressCode(contentData.invitationDressCode || '')
      setInvitationRSVP(contentData.invitationRSVP || '')
      setMixedBlocks(contentData.blocks || contentData.mixedBlocks || [])
    }
  }, [contentData])

  const handleFileUpload = (file: File, dataUrl: string) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev, file]
      onContentChange({
        ...contentData,
        files: newFiles
      })
      return newFiles
    })
  }

  const handleMultipleFilesUpload = (files: File[]) => {
    console.log('Archivos seleccionados en DynamicContentForm:', files)
    setUploadedFiles(files)
    onContentChange({
      ...contentData,
      files: files
    })
    console.log('ContentData actualizado:', { ...contentData, files: files })
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index)
      onContentChange({
        ...contentData,
        files: newFiles
      })
      return newFiles
    })
  }

  const addMixedBlock = (type: string) => {
    setMixedBlocks(prev => {
      const newBlock = {
        id: Date.now(),
        type,
        content: '',
        title: ''
      }
      const newBlocks = [...prev, newBlock]
      onContentChange({
        ...contentData,
        blocks: newBlocks
      })
      return newBlocks
    })
  }

  const updateMixedBlock = (id: number, field: string, value: string) => {
    const updatedBlocks = mixedBlocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    )
    setMixedBlocks(updatedBlocks)
    onContentChange({
      ...contentData,
      blocks: updatedBlocks
    })
  }

  const removeMixedBlock = (id: number) => {
    const updatedBlocks = mixedBlocks.filter(block => block.id !== id)
    setMixedBlocks(updatedBlocks)
    onContentChange({
      ...contentData,
      blocks: updatedBlocks
    })
  }

  const renderImageForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-5 w-5 text-pink-500" />
          <h4 className="font-semibold text-gray-800">Subir Imágenes</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Puedes subir múltiples imágenes. Se mostrarán en una galería hermosa.
        </p>
        
        <MultiFileUpload
          onFilesSelect={handleMultipleFilesUpload}
          accept="image/*"
          maxSize={5}
          maxFiles={10}
          placeholder="Sube múltiples imágenes para tu sorpresa"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción de las imágenes
        </label>
        <textarea
          value={contentData.imageDescription || ''}
          onChange={(e) => onContentChange({ ...contentData, imageDescription: e.target.value })}
          placeholder="Describe el momento, la historia detrás de las imágenes..."
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500"
        />
      </div>
    </motion.div>
  )

  const renderVideoForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Video className="h-5 w-5 text-blue-500" />
          <h4 className="font-semibold text-gray-800">Subir Videos</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Sube videos especiales. Se generarán miniaturas automáticamente.
        </p>
        
        <MultiFileUpload
          onFilesSelect={handleMultipleFilesUpload}
          accept="video/*"
          maxSize={50}
          maxFiles={5}
          placeholder="Sube videos especiales para tu sorpresa"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción del video
        </label>
        <textarea
          value={contentData.videoDescription || ''}
          onChange={(e) => onContentChange({ ...contentData, videoDescription: e.target.value })}
          placeholder="Cuenta la historia detrás del video..."
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500"
        />
      </div>
    </motion.div>
  )

  const renderInvitationForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-green-500" />
          <h4 className="font-semibold text-gray-800">Invitación Especial</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Crea una invitación hermosa con todos los detalles importantes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha del evento
          </label>
          <Input
            type="date"
            value={invitationDate}
            onChange={(e) => {
              setInvitationDate(e.target.value)
              onContentChange({ ...contentData, eventDate: e.target.value })
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora del evento
          </label>
          <Input
            type="time"
            value={invitationTime}
            onChange={(e) => {
              setInvitationTime(e.target.value)
              onContentChange({ ...contentData, eventTime: e.target.value })
            }}
            className="w-full"
          />
        </div>
      </div>

      <MiniMap
        location={invitationLocation}
        onLocationChange={(location) => {
          setInvitationLocation(location)
          onContentChange({ ...contentData, eventLocation: location })
        }}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código de vestimenta
        </label>
        <Input
          value={invitationDressCode}
          onChange={(e) => {
            setInvitationDressCode(e.target.value)
            onContentChange({ ...contentData, dressCode: e.target.value })
          }}
          placeholder="Ej: Elegante casual, Formal, Temático..."
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje de la invitación
        </label>
        <textarea
          value={invitationMessage}
          onChange={(e) => {
            setInvitationMessage(e.target.value)
            onContentChange({ ...contentData, invitationMessage: e.target.value })
          }}
          placeholder="Escribe un mensaje especial para la invitación..."
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instrucciones RSVP
        </label>
        <Input
          value={invitationRSVP}
          onChange={(e) => {
            setInvitationRSVP(e.target.value)
            onContentChange({ ...contentData, rsvpInstructions: e.target.value })
          }}
          placeholder="Ej: Confirmar antes del 15 de diciembre"
          className="w-full"
        />
      </div>
    </motion.div>
  )

  const renderEventForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-purple-500" />
          <h4 className="font-semibold text-gray-800">Evento Especial</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Planifica un evento inolvidable con todos los detalles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha del evento
          </label>
          <Input
            type="date"
            value={eventDate}
            onChange={(e) => {
              setEventDate(e.target.value)
              onContentChange({ ...contentData, eventDate: e.target.value })
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora del evento
          </label>
          <Input
            type="time"
            value={eventTime}
            onChange={(e) => {
              setEventTime(e.target.value)
              onContentChange({ ...contentData, eventTime: e.target.value })
            }}
            className="w-full"
          />
        </div>
      </div>

      <MiniMap
        location={eventLocation}
        onLocationChange={(location) => {
          setEventLocation(location)
          onContentChange({ ...contentData, eventLocation: location })
        }}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción del evento
        </label>
        <textarea
          value={contentData.eventDescription || ''}
          onChange={(e) => onContentChange({ ...contentData, eventDescription: e.target.value })}
          placeholder="Describe qué pasará en el evento, actividades especiales..."
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lista de actividades
        </label>
        <textarea
          value={contentData.activities || ''}
          onChange={(e) => onContentChange({ ...contentData, activities: e.target.value })}
          placeholder="1. Recepción\n2. Cena romántica\n3. Baile especial\n4. Sorpresa final..."
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500"
        />
      </div>
    </motion.div>
  )

    const renderMixedForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-5 w-5 text-yellow-500" />
          <h4 className="font-semibold text-gray-800">Contenido Mixto</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Combina diferentes tipos de contenido para crear algo único y especial.
        </p>
      </div>

      <ContentBlockEditor
        blocks={contentBlocks}
        onBlocksChange={(blocks) => {
          setMixedBlocks(blocks)
          onContentChange({ ...contentData, blocks })
        }}
        className="w-full"
      />
    </motion.div>
  )

  const renderTextForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-blue-500" />
          <h4 className="font-semibold text-gray-800">Mensaje Especial</h4>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Escribe un mensaje que toque el corazón de tu ser querido.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tu mensaje especial
        </label>
        <textarea
          value={contentData.content_text || ''}
          onChange={(e) => onContentChange({ ...contentData, content_text: e.target.value })}
          placeholder="Escribe desde el corazón... ¿Qué quieres decirle? ¿Qué significa para ti esta persona? ¿Qué recuerdos especiales quieres compartir?"
          rows={8}
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estilo del mensaje
        </label>
        <select
          value={contentData.textStyle || 'romantic'}
          onChange={(e) => onContentChange({ ...contentData, textStyle: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:border-pink-500 focus:ring-pink-500"
        >
          <option value="romantic">Romántico</option>
          <option value="poetic">Poético</option>
          <option value="funny">Divertido</option>
          <option value="nostalgic">Nostálgico</option>
          <option value="adventurous">Aventurero</option>
        </select>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {contentType === 'image' && renderImageForm()}
        {contentType === 'video' && renderVideoForm()}
        {contentType === 'invitation' && renderInvitationForm()}
        {contentType === 'event' && renderEventForm()}
        {contentType === 'mixed' && renderMixedForm()}
        {contentType === 'text' && renderTextForm()}
      </AnimatePresence>
    </div>
  )
}
