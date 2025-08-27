'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageRemove?: () => void
  selectedImage?: string | null
  placeholder?: string
  className?: string
}

export function ImageUpload({ 
  onImageSelect, 
  onImageRemove, 
  selectedImage, 
  placeholder = "Seleccionar imagen",
  className = "" 
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(selectedImage || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
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

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onImageSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onImageRemove?.()
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="image-upload">Imagen</Label>
      
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF hasta 10MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {placeholder}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id="image-upload"
      />
    </div>
  )
}
