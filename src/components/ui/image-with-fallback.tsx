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

export function ImageWithFallback({
  src,
  fallbackSrc = '/api/placeholder/400/600',
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
    <div className={cn('relative overflow-hidden', className)}>
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

