import { useState, useEffect } from 'react'

interface MediaDimensions {
  width: number
  height: number
  aspectRatio: number
  isPortrait: boolean
  isMobileLike: boolean
}

export function useMediaDimensions(url: string | null, type: 'image' | 'video' | null): MediaDimensions {
  const [dimensions, setDimensions] = useState<MediaDimensions>({
    width: 0,
    height: 0,
    aspectRatio: 0,
    isPortrait: false,
    isMobileLike: false
  })

  useEffect(() => {
    if (!url || !type) {
      setDimensions({
        width: 0,
        height: 0,
        aspectRatio: 0,
        isPortrait: false,
        isMobileLike: false
      })
      return
    }

    const element = type === 'image' ? new Image() : document.createElement('video')
    
    const handleLoad = () => {
      const width = element.naturalWidth || element.videoWidth || 0
      const height = element.naturalHeight || element.videoHeight || 0
      const aspectRatio = width / height
      const isPortrait = height > width
      const isMobileLike = isPortrait && aspectRatio < 0.8 // Típico de fotos de celular (9:16, 3:4, etc.)

      setDimensions({
        width,
        height,
        aspectRatio,
        isPortrait,
        isMobileLike
      })
    }

    const handleError = () => {
      console.warn('Error loading media for dimension detection:', url)
      setDimensions({
        width: 0,
        height: 0,
        aspectRatio: 0,
        isPortrait: false,
        isMobileLike: false
      })
    }

    element.addEventListener('load', handleLoad)
    element.addEventListener('loadedmetadata', handleLoad) // Para videos
    element.addEventListener('error', handleError)

    if (type === 'image') {
      (element as HTMLImageElement).src = url
    } else {
      (element as HTMLVideoElement).src = url
    }

    return () => {
      element.removeEventListener('load', handleLoad)
      element.removeEventListener('loadedmetadata', handleLoad)
      element.removeEventListener('error', handleError)
    }
  }, [url, type])

  return dimensions
}
