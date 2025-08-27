'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './button'
import { Image, Video, Upload, X, Plus } from 'lucide-react'

interface MultiFileUploadProps {
  onFilesSelect: (files: File[]) => void
  accept?: string
  maxSize?: number // en MB
  maxFiles?: number
  className?: string
  placeholder?: string
  preview?: boolean
}

export function MultiFileUpload({
  onFilesSelect,
  accept = 'image/*',
  maxSize = 5,
  maxFiles = 10,
  className = '',
  placeholder = 'Haz clic para subir archivos',
  preview = true
}: MultiFileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList) => {
    setError('')
    const fileArray = Array.from(files)
    
    // Validar número máximo de archivos
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      setError(`Máximo ${maxFiles} archivos permitidos`)
      return
    }

    const validFiles: File[] = []
    
    fileArray.forEach(file => {
      // Validar tipo de archivo
      if (accept !== '*/*' && !file.type.match(accept.replace('*', '.*'))) {
        setError(`Tipo de archivo no válido: ${file.name}. Aceptados: ${accept}`)
        return
      }
      
      // Validar tamaño
      if (file.size > maxSize * 1024 * 1024) {
        setError(`Archivo demasiado grande: ${file.name}. Máximo: ${maxSize}MB`)
        return
      }
      
      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...validFiles]
      setUploadedFiles(newFiles)
      onFilesSelect(newFiles)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onFilesSelect(newFiles)
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const isImage = (file: File) => file.type.startsWith('image/')
  const isVideo = (file: File) => file.type.startsWith('video/')

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
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
          multiple
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className="flex justify-center">
            {accept.includes('image') && <Image className="h-8 w-8 text-pink-500" />}
            {accept.includes('video') && <Video className="h-8 w-8 text-pink-500" />}
            {!accept.includes('image') && !accept.includes('video') && <Upload className="h-8 w-8 text-pink-500" />}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">{placeholder}</p>
            <p className="text-xs text-gray-500 mt-1">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Máximo {maxFiles} archivos, {maxSize}MB cada uno
            </p>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Archivos subidos ({uploadedFiles.length}/{maxFiles})
            </h4>
            <Button
              onClick={() => {
                setUploadedFiles([])
                onFilesSelect([])
              }}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Limpiar todo
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <AnimatePresence>
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {isImage(file) && (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {isVideo(file) && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Video className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {!isImage(file) && !isVideo(file) && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  
                  <div className="mt-1">
                    <p className="text-xs text-gray-600 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {uploadedFiles.length < maxFiles && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleClick}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-pink-400 hover:bg-pink-50 transition-colors"
              >
                <Plus className="h-6 w-6 text-gray-400" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
