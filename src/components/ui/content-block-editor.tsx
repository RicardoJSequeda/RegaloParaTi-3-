'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { Input } from './input'
import { FileUpload } from './file-upload'
import { 
  FileText, 
  Image, 
  Video, 
  Heart, 
  X, 
  Plus, 
  Move, 
  Edit3,
  Trash2
} from 'lucide-react'

interface ContentBlock {
  id: number
  type: 'text' | 'image' | 'video' | 'quote'
  title: string
  content: string
  file?: File
}

interface ContentBlockEditorProps {
  blocks: ContentBlock[]
  onBlocksChange: (blocks: ContentBlock[]) => void
  className?: string
}

export function ContentBlockEditor({ blocks, onBlocksChange, className = '' }: ContentBlockEditorProps) {
  const [editingBlock, setEditingBlock] = useState<number | null>(null)

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now(),
      type,
      title: '',
      content: ''
    }
    onBlocksChange([...blocks, newBlock])
    setEditingBlock(newBlock.id)
  }

  const updateBlock = (id: number, field: keyof ContentBlock, value: string | File) => {
    const updatedBlocks = blocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    )
    onBlocksChange(updatedBlocks)
  }

  const removeBlock = (id: number) => {
    const updatedBlocks = blocks.filter(block => block.id !== id)
    onBlocksChange(updatedBlocks)
    if (editingBlock === id) {
      setEditingBlock(null)
    }
  }

  const moveBlock = (id: number, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(block => block.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= blocks.length) return

    const newBlocks = [...blocks]
    const [movedBlock] = newBlocks.splice(currentIndex, 1)
    newBlocks.splice(newIndex, 0, movedBlock)
    onBlocksChange(newBlocks)
  }

  const getBlockIcon = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4 text-blue-500" />
      case 'image': return <Image className="h-4 w-4 text-green-500" />
      case 'video': return <Video className="h-4 w-4 text-purple-500" />
      case 'quote': return <Heart className="h-4 w-4 text-red-500" />
    }
  }

  const getBlockTitle = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text': return 'Texto'
      case 'image': return 'Imagen'
      case 'video': return 'Video'
      case 'quote': return 'Cita Romántica'
    }
  }

  const renderBlockContent = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
            placeholder="Escribe tu mensaje especial..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500"
          />
        )
      
      case 'quote':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
            placeholder="Escribe una cita romántica especial..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:border-pink-500 focus:ring-pink-500"
          />
        )
      
      case 'image':
        return (
          <div className="space-y-3">
            <FileUpload
              onFileSelect={(file) => updateBlock(block.id, 'file', file)}
              accept="image/*"
              maxSize={5}
              className="w-full"
            />
            {block.file && (
              <div className="relative">
                <img
                  src={URL.createObjectURL(block.file)}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={() => updateBlock(block.id, 'file', undefined as any)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )
      
      case 'video':
        return (
          <div className="space-y-3">
            <FileUpload
              onFileSelect={(file) => updateBlock(block.id, 'file', file)}
              accept="video/*"
              maxSize={50}
              className="w-full"
            />
            {block.file && (
              <div className="relative">
                <div className="w-full h-32 bg-gray-200 rounded-lg border flex items-center justify-center">
                  <Video className="h-8 w-8 text-gray-400" />
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-800">{block.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(block.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => updateBlock(block.id, 'file', undefined as any)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Botones para agregar bloques */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => addBlock('text')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Agregar Texto
        </Button>
        <Button
          onClick={() => addBlock('image')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Image className="h-4 w-4" />
          Agregar Imagen
        </Button>
        <Button
          onClick={() => addBlock('video')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Video className="h-4 w-4" />
          Agregar Video
        </Button>
        <Button
          onClick={() => addBlock('quote')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Heart className="h-4 w-4" />
          Agregar Cita
        </Button>
      </div>

      {/* Lista de bloques */}
      <div className="space-y-4">
        <AnimatePresence>
          {blocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden"
            >
              {/* Header del bloque */}
              <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getBlockIcon(block.type)}
                    <span className="text-sm font-medium text-gray-700">
                      {getBlockTitle(block.type)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Bloque {index + 1}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => moveBlock(block.id, 'up')}
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    <Move className="h-3 w-3 rotate-90" />
                  </Button>
                  <Button
                    onClick={() => moveBlock(block.id, 'down')}
                    variant="ghost"
                    size="sm"
                    disabled={index === blocks.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <Move className="h-3 w-3 -rotate-90" />
                  </Button>
                  <Button
                    onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => removeBlock(block.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Contenido del bloque */}
              <AnimatePresence>
                {editingBlock === block.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título del bloque
                      </label>
                      <Input
                        value={block.title}
                        onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                        placeholder={`Título del ${getBlockTitle(block.type).toLowerCase()}...`}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contenido
                      </label>
                      {renderBlockContent(block)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Vista previa cuando no está editando */}
              {editingBlock !== block.id && (
                <div className="p-4">
                  {block.title && (
                    <h4 className="text-sm font-medium text-gray-800 mb-2">{block.title}</h4>
                  )}
                  {block.content && (
                    <p className="text-sm text-gray-600 line-clamp-2">{block.content}</p>
                  )}
                  {block.file && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Archivo: {block.file.name}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {blocks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Plus className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Agrega diferentes tipos de contenido para crear algo especial</p>
          </div>
        )}
      </div>
    </div>
  )
}
