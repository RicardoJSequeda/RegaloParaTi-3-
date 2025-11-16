'use client'

import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  showLoading?: boolean
  alt: string
}

// Data URI para placeholder (imagen transparente 1x1)
const PLACEHOLDER_DATA_URI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'

export function ImageWithFallback({
  src,
  fallbackSrc = PLACEHOLDER_DATA_URI,
  className,
  alt,
  showLoading = true,
  ...props
}: ImageWithFallbackProps) {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc)
  const [isLoading, setIsLoading] = useState(showLoading)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImageSrc(fallbackSrc)
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={cn('relative overflow-hidden w-full h-full', className)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
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
        style={{ 
          objectPosition: props.style?.objectPosition || 'center center',
          objectFit: props.style?.objectFit || 'cover',
          display: props.style?.display || 'block',
          ...props.style 
        }}
        loading="lazy"
        {...props}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}
    </div>
  )
}

