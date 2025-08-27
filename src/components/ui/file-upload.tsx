'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { Image, Upload, X } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File, dataUrl: string) => void
  accept?: string
  maxSize?: number // en MB
  className?: string
  placeholder?: string
  preview?: boolean
}

export function FileUpload({
  onFileSelect,
  accept = 'image/*',
  maxSize = 5,
  className = '',
  placeholder = 'Haz clic para subir archivo',
  preview = true
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setError('')
    
    // Validar tipo de archivo
    if (accept !== '*/*' && !file.type.match(accept.replace('*', '.*'))) {
      setError(`Tipo de archivo no válido. Aceptados: ${accept}`)
      return
    }
    
    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Archivo demasiado grande. Máximo: ${maxSize}MB`)
      return
    }
    
    // Convertir a base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onFileSelect(file, result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          dragActive 
            ? 'border-pink-500 bg-pink-50' 
            : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="space-y-2">
          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600">{placeholder}</p>
          <p className="text-xs text-gray-500">
            Arrastra y suelta o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-400">
            Máximo {maxSize}MB
          </p>
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}

interface ImageUploadProps extends Omit<FileUploadProps, 'accept'> {
  currentImage?: string
  onRemove?: () => void
}

export function ImageUpload({
  currentImage,
  onRemove,
  onFileSelect,
  ...props
}: ImageUploadProps) {
  return (
    <div className="space-y-4">
      {currentImage && (
        <div className="space-y-3">
          {/* File info */}
          <div className="border-2 border-dashed border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Image className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 truncate">
                  Imagen cargada
                </p>
                <p className="text-xs text-green-700">
                  Imagen del plan
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Image preview */}
          <div className="relative">
            <img 
              src={currentImage} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            <div className="absolute top-2 right-2">
              <Button
                size="sm"
                variant="destructive"
                className="h-6 w-6 p-0"
                onClick={onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <FileUpload
        {...props}
        onFileSelect={onFileSelect}
        accept="image/*"
        placeholder="Haz clic para subir imagen"
      />
    </div>
  )
}
