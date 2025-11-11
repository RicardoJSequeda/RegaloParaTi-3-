'use client'

import { useState, useEffect } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  showLoading?: boolean
  alt: string
  // Opcional: dimensiones para evitar layout shift
  width?: number | string
  height?: number | string
}

export function ImageWithFallback({
  src,
  fallbackSrc = '/api/placeholder/400/600',
  className,
  alt,
  showLoading = true,
  width,
  height,
  ...props
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc)
  const [isLoading, setIsLoading] = useState(showLoading && !!src)
  const [hasError, setHasError] = useState(false)

  // Actualizar imagen cuando cambia el src
  useEffect(() => {
    if (src && src !== imageSrc) {
      setImageSrc(src)
      setIsLoading(showLoading)
      setHasError(false)
    }
  }, [src, showLoading, imageSrc])

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setHasError(true)
      setImageSrc(fallbackSrc)
      setIsLoading(false)
    } else if (hasError) {
      // Si el fallback también falla, mostrar placeholder
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const containerStyle: React.CSSProperties = {}
  if (width) containerStyle.width = typeof width === 'number' ? `${width}px` : width
  if (height) containerStyle.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      style={containerStyle}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full z-10" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError && 'bg-gray-100 dark:bg-gray-800'
        )}
        loading="lazy"
        decoding="async"
        {...props}
      />
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-20">
          <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
        </div>
      )}
    </div>
  )
}

