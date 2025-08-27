'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from './dialog'
import { Button } from './button'
import { 
  X, 
  Heart, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Download,
  Share2
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { SurpriseBox } from '@/types'
import { useMediaDimensions } from '@/hooks/useMediaDimensions'

interface SurpriseModalProps {
  surprise: SurpriseBox | null
  isOpen: boolean
  onClose: () => void
  onRequestEdit?: (surprise: SurpriseBox) => void
}

export function SurpriseModal({ surprise, isOpen, onClose, onRequestEdit }: SurpriseModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [mapSrc, setMapSrc] = useState<string | null>(null)
  const [mapLabel, setMapLabel] = useState<string | null>(null)
  const [mapLatLon, setMapLatLon] = useState<{ lat: number, lon: number } | null>(null)

  // Detectar dimensiones del contenido principal
  const getMainMediaUrl = () => {
    if (!surprise) return null
    if (surprise.content_type === 'image' && surprise.content_image_url) {
      return surprise.content_image_url
    }
    if (surprise.content_type === 'video' && surprise.content_video_url) {
      return surprise.content_video_url
    }
    return null
  }

  const mainMediaUrl = getMainMediaUrl()
  const mainMediaType = surprise?.content_type === 'image' ? 'image' : 
                       surprise?.content_type === 'video' ? 'video' : null
  const mediaDimensions = useMediaDimensions(mainMediaUrl, mainMediaType)

  // Determinar el tamaño del modal basado en las dimensiones
  const getModalSize = () => {
    if (!mediaDimensions.isMobileLike) {
      return 'max-w-4xl' // Tamaño estándar para contenido landscape
    }
    
    // Para contenido mobile-like (portrait), usar un ancho más estrecho
    return 'max-w-md sm:max-w-lg md:max-w-xl'
  }

  const modalSize = getModalSize()

  // Log para debugging
  useEffect(() => {
    if (mediaDimensions.isMobileLike && mainMediaUrl) {
      console.log('📱 Modal ajustado para contenido mobile-like:', {
        dimensions: mediaDimensions,
        modalSize,
        url: mainMediaUrl
      })
    }
  }, [mediaDimensions.isMobileLike, modalSize, mainMediaUrl])

  useEffect(() => {
    if (isOpen && surprise?.effects?.confetti) {
      // Efecto de confeti al abrir
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.3 }
        })
      }, 500)
    }
  }, [isOpen, surprise])

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [isOpen])

  const handleVideoLoad = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    setDuration(video.duration)
  }

  const handleVideoTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    setCurrentTime(video.currentTime)
  }

  const handleVideoToggle = () => {
    const video = document.querySelector('video') as HTMLVideoElement
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    const video = document.querySelector('video') as HTMLVideoElement
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Construye src del iframe del mapa priorizando coordenadas guardadas
  const getMapIframeSrc = (s: SurpriseBox | null): string | null => {
    if (!s) return null
    
    // Si tenemos un enlace de mapa guardado, usarlo directamente
    if (s.event_map_link) {
      return s.event_map_link
    }
    
    // Si tenemos una ubicación guardada, crear un mapa con esa ubicación
    if (s.event_location) {
      // Usar OpenStreetMap con la ubicación
      return `https://www.openstreetmap.org/export/embed.html?bbox=-0.1,51.5,0.1,51.6&layer=mapnik&marker=${encodeURIComponent(s.event_location)}`
    }
    
    // Intentar leer coordenadas desde content_blocks
    const blocks: any = (s as any).content_blocks || {}
    const latFromBlocks = blocks.lat ?? blocks.latitude ?? blocks.event_lat
    const lonFromBlocks = blocks.lng ?? blocks.lon ?? blocks.longitude ?? blocks.event_lng

    const toNumber = (v: any) => (typeof v === 'string' ? parseFloat(v) : (typeof v === 'number' ? v : NaN))
    const lat = toNumber(latFromBlocks)
    const lon = toNumber(lonFromBlocks)

    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      const bbox = `${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}`
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
    }

    // Intentar extraer mlat/mlon de event_map_link
    if (s.event_map_link) {
      try {
        const url = new URL(s.event_map_link)
        const mlat = parseFloat(url.searchParams.get('mlat') || url.searchParams.get('lat') || '')
        const mlon = parseFloat(url.searchParams.get('mlon') || url.searchParams.get('lon') || '')
        if (!Number.isNaN(mlat) && !Number.isNaN(mlon)) {
          const bbox = `${mlon - 0.01},${mlat - 0.01},${mlon + 0.01},${mlat + 0.01}`
          return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mlat},${mlon}`
        }
      } catch (_) {
        // Ignorar errores de URL
      }
    }

    // Fallback: búsqueda por texto de la ubicación
    if (s.event_location) {
      return `https://www.openstreetmap.org/export/embed.html?search=${encodeURIComponent(s.event_location)}`
    }
    return null
  }

  // Resolver y fijar la URL del mapa cuando se abre el modal
  useEffect(() => {
    const resolve = async () => {
      if (!isOpen || !surprise) {
        setMapSrc(null)
        setMapLabel(null)
        setMapLatLon(null)
        return
      }
      // 1) Intento directo (coords en content_blocks o en link)
      const direct = getMapIframeSrc(surprise)
      if (direct && !direct.includes('search=')) {
        setMapSrc(direct)
        const blocks: any = (surprise as any).content_blocks || {}
        const lat = blocks.lat ?? blocks.latitude ?? blocks.event_lat
        const lon = blocks.lng ?? blocks.lon ?? blocks.longitude ?? blocks.event_lng
        const toNumber = (v: any) => (typeof v === 'string' ? parseFloat(v) : (typeof v === 'number' ? v : NaN))
        const nlat = toNumber(lat)
        const nlon = toNumber(lon)
        if (!Number.isNaN(nlat) && !Number.isNaN(nlon)) {
          setMapLatLon({ lat: nlat, lon: nlon })
        } else if (surprise.event_map_link) {
          try {
            const url = new URL(surprise.event_map_link)
            const mlat = parseFloat(url.searchParams.get('mlat') || url.searchParams.get('lat') || '')
            const mlon = parseFloat(url.searchParams.get('mlon') || url.searchParams.get('lon') || '')
            if (!Number.isNaN(mlat) && !Number.isNaN(mlon)) {
              setMapLatLon({ lat: mlat, lon: mlon })
            }
          } catch {}
        }
        setMapLabel(
          blocks.placeName || blocks.name || surprise.event_location || 'Ubicación'
        )
        return
      }
      // 2) Si quedó como search=... o no hay nada, geocodificar event_location
      if (surprise.event_location) {
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(surprise.event_location)}&limit=1`)
          const json = await resp.json()
          if (Array.isArray(json) && json.length > 0) {
            const lat = parseFloat(json[0].lat)
            const lon = parseFloat(json[0].lon)
            if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
              const bbox = `${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}`
              setMapSrc(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`)
              setMapLatLon({ lat, lon })
              setMapLabel(json[0].display_name || surprise.event_location)
              return
            }
          }
        } catch {
          // Ignorar errores de red
        }
      }
      // 3) Fallback: lo que haya
      setMapSrc(direct)
      setMapLabel(surprise.event_location || null)
    }
    resolve()
  }, [isOpen, surprise])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: surprise?.title || 'Sorpresa Especial',
          text: surprise?.content_description || '¡Mira esta sorpresa especial!',
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href)
      // Aquí podrías mostrar un toast de confirmación
    }
  }

  // Función para renderizar bloques de contenido mixto
  const renderMixedBlocks = (blocks: any[]) => {
    if (!blocks || !Array.isArray(blocks)) return null

    return (
      <div className={`masonry-grid ${mediaDimensions.isMobileLike ? 'max-w-sm mx-auto' : ''}`}>
        {blocks.map((block, index) => (
          <div key={index} className="masonry-item group relative">
            {block.type === 'image' && block.url && (
              <div className="photo-card cursor-pointer" onClick={() => window.open(block.url, '_blank')}>
                <img
                  src={block.url}
                  alt={`Imagen ${index + 1}`}
                  className={`w-full h-auto rounded-lg object-cover transition-transform duration-200 group-hover:scale-105 ${
                    mediaDimensions.isMobileLike ? 'max-h-[60vh]' : ''
                  }`}
                  style={{
                    objectFit: mediaDimensions.isMobileLike ? 'contain' : 'cover'
                  }}
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(block.url, '_blank')
                      }}
                      size="sm"
                      variant="secondary"
                      className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {block.type === 'text' && block.content && (
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {block.content}
                </p>
              </div>
            )}
            
            {block.type === 'video' && block.url && (
              <div className="photo-card cursor-pointer" onClick={() => window.open(block.url, '_blank')}>
                <video
                  src={block.url}
                  className={`w-full h-auto rounded-lg object-cover transition-transform duration-200 group-hover:scale-105 ${
                    mediaDimensions.isMobileLike ? 'max-h-[60vh]' : ''
                  }`}
                  style={{
                    objectFit: mediaDimensions.isMobileLike ? 'contain' : 'cover'
                  }}
                  preload="metadata"
                  muted
                  playsInline
                />
                
                {/* Video Duration Badge */}
                <div className="absolute bottom-3 right-3">
                  <div className="bg-black/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg">
                    <span className="text-xs text-white font-semibold">
                      <Play className="w-3 h-3 inline mr-1" />
                      Video
                    </span>
                  </div>
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(block.url, '_blank')
                      }}
                      size="sm"
                      variant="secondary"
                      className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderContent = () => {
    if (!surprise) return null

    switch (surprise.content_type) {
      case 'text':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {surprise.content_title}
              </h2>
              <p className="text-gray-600 text-lg">
                {surprise.content_description}
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-xl border border-pink-200"
            >
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                  {surprise.content_text}
                </div>
              </div>
            </motion.div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {surprise.content_title}
              </h2>
              <p className="text-gray-600 text-lg">
                {surprise.content_description}
              </p>
            </div>
            
            {surprise.content_image_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative group cursor-pointer"
                onClick={() => window.open(surprise.content_image_url, '_blank')}
              >
                <div className={`photo-card ${mediaDimensions.isMobileLike ? 'max-w-sm mx-auto' : ''}`}>
                  <img
                    src={surprise.content_image_url}
                    alt={surprise.content_title}
                    className={`w-full h-auto rounded-lg object-cover transition-transform duration-200 group-hover:scale-105 ${
                      mediaDimensions.isMobileLike ? 'max-h-[70vh]' : ''
                    }`}
                    style={{
                      maxWidth: mediaDimensions.isMobileLike ? '100%' : undefined,
                      objectFit: mediaDimensions.isMobileLike ? 'contain' : 'cover'
                    }}
                  />
                  
                  {/* Hover Overlay with Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare()
                        }}
                        size="sm"
                        variant="secondary"
                        className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(surprise.content_image_url, '_blank')
                        }}
                        size="sm"
                        variant="secondary"
                        className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )

      case 'video':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {surprise.content_title}
              </h2>
              <p className="text-gray-600 text-lg">
                {surprise.content_description}
              </p>
            </div>
            
            {surprise.content_video_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className={`relative rounded-xl overflow-hidden bg-black ${mediaDimensions.isMobileLike ? 'max-w-sm mx-auto' : ''}`}>
                  <video
                    src={surprise.content_video_url}
                    className={`w-full h-auto ${
                      mediaDimensions.isMobileLike ? 'max-h-[70vh]' : ''
                    }`}
                    style={{
                      maxWidth: mediaDimensions.isMobileLike ? '100%' : undefined,
                      objectFit: mediaDimensions.isMobileLike ? 'contain' : 'cover'
                    }}
                    onLoadedMetadata={handleVideoLoad}
                    onTimeUpdate={handleVideoTimeUpdate}
                    muted={isMuted}
                  />
                  
                  {/* Controles de video */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleVideoToggle}
                        size="sm"
                        variant="outline"
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        onClick={handleMuteToggle}
                        size="sm"
                        variant="outline"
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      
                      <div className="flex-1 text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                      
                      <Button
                        onClick={handleShare}
                        size="sm"
                        variant="outline"
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )

      case 'invitation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {surprise.content_title}
              </h2>
              <p className="text-gray-600 text-lg">
                {surprise.content_description}
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-xl border border-pink-200"
            >
              <div className="space-y-4">
                <p className="text-gray-800 text-lg leading-relaxed">
                  {surprise.content_text}
                </p>
                
                {surprise.event_date && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-pink-500" />
                    <span className="font-medium">
                      {new Date(surprise.event_date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {surprise.event_location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-pink-500" />
                    <span className="font-medium">{surprise.event_location}</span>
                  </div>
                )}

                {(surprise.event_location || surprise.event_map_link) && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-pink-200 bg-white">
                    <iframe
                      src={mapSrc || ''}
                      width="100%"
                      height="220"
                      frameBorder="0"
                      scrolling="no"
                      className="w-full"
                      title="Mapa de la invitación"
                    />
                    {(mapLabel || mapLatLon) && (
                      <div className="flex items-center gap-2 px-3 py-2 border-t border-pink-100 text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 text-pink-500" />
                        <span className="font-medium text-gray-800">
                          {mapLabel || 'Ubicación'}
                        </span>
                        {mapLatLon && (
                          <span className="ml-auto text-xs text-gray-500">
                            {mapLatLon.lat.toFixed(5)}, {mapLatLon.lon.toFixed(5)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {surprise.event_map_link && (
                  <Button
                    onClick={() => window.open(surprise.event_map_link, '_blank')}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver en Mapa
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )

      case 'event':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {surprise.content_title}
              </h2>
              <p className="text-gray-600 text-lg">
                {surprise.content_description}
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200"
            >
              <div className="space-y-4">
                <p className="text-gray-800 text-lg leading-relaxed">
                  {surprise.content_text}
                </p>
                
                {surprise.event_date && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">
                      {new Date(surprise.event_date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {surprise.event_location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">{surprise.event_location}</span>
                  </div>
                )}

                {(surprise.event_location || surprise.event_map_link) && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-blue-200 bg-white">
                    <iframe
                      src={mapSrc || ''}
                      width="100%"
                      height="220"
                      frameBorder="0"
                      scrolling="no"
                      className="w-full"
                      title="Mapa del evento"
                    />
                    {(mapLabel || mapLatLon) && (
                      <div className="flex items-center gap-2 px-3 py-2 border-t border-blue-100 text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-800">
                          {mapLabel || 'Ubicación'}
                        </span>
                        {mapLatLon && (
                          <span className="ml-auto text-xs text-gray-500">
                            {mapLatLon.lat.toFixed(5)}, {mapLatLon.lon.toFixed(5)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {surprise.event_map_link && (
                  <Button
                    onClick={() => window.open(surprise.event_map_link, '_blank')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver en Mapa
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )

             case 'mixed':
         return (
           <div className="space-y-6">
             <div className="text-center">
               <h2 className="text-3xl font-bold text-gray-900 mb-2">
                 {surprise.content_title}
               </h2>
               <p className="text-gray-600 text-lg">
                 {surprise.content_description}
               </p>
             </div>
             
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="space-y-6"
             >
               {surprise.content_text && (
                 <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl border border-pink-200">
                   <div className="prose prose-lg max-w-none">
                     <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                       {surprise.content_text}
                     </div>
                   </div>
                 </div>
               )}
               
               {/* Renderizar bloques de contenido mixto si existen */}
               {surprise.content_blocks && renderMixedBlocks(surprise.content_blocks.blocks)}
               
               {/* Contenido individual si no hay bloques */}
               {!surprise.content_blocks && (
                 <>
                   {surprise.content_image_url && (
                     <div className="relative group cursor-pointer" onClick={() => window.open(surprise.content_image_url, '_blank')}>
                       <div className={`photo-card ${mediaDimensions.isMobileLike ? 'max-w-sm mx-auto' : ''}`}>
                         <img
                           src={surprise.content_image_url}
                           alt={surprise.content_title}
                           className={`w-full h-auto rounded-lg object-cover transition-transform duration-200 group-hover:scale-105 ${
                             mediaDimensions.isMobileLike ? 'max-h-[70vh]' : ''
                           }`}
                           style={{
                             maxWidth: mediaDimensions.isMobileLike ? '100%' : undefined,
                             objectFit: mediaDimensions.isMobileLike ? 'contain' : 'cover'
                           }}
                         />
                         
                         {/* Hover Overlay */}
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                           <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                             <Button
                               onClick={(e) => {
                                 e.stopPropagation()
                                 window.open(surprise.content_image_url, '_blank')
                               }}
                               size="sm"
                               variant="secondary"
                               className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
                             >
                               <Download className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                   
                   {surprise.content_video_url && (
                     <div className="relative group cursor-pointer" onClick={() => window.open(surprise.content_video_url, '_blank')}>
                       <div className={`photo-card ${mediaDimensions.isMobileLike ? 'max-w-sm mx-auto' : ''}`}>
                         <video
                           src={surprise.content_video_url}
                           className={`w-full h-auto rounded-lg object-cover transition-transform duration-200 group-hover:scale-105 ${
                             mediaDimensions.isMobileLike ? 'max-h-[70vh]' : ''
                           }`}
                           style={{
                             maxWidth: mediaDimensions.isMobileLike ? '100%' : undefined,
                             objectFit: mediaDimensions.isMobileLike ? 'contain' : 'cover'
                           }}
                           onLoadedMetadata={handleVideoLoad}
                           onTimeUpdate={handleVideoTimeUpdate}
                           muted={isMuted}
                         />
                         
                         {/* Video Duration Badge */}
                         <div className="absolute bottom-3 right-3">
                           <div className="bg-black/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg">
                             <span className="text-xs text-white font-semibold">
                               <Play className="w-3 h-3 inline mr-1" />
                               {formatTime(duration)}
                             </span>
                           </div>
                         </div>
                         
                         {/* Hover Overlay with Controls */}
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                           <div className="flex gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                             <Button
                               onClick={(e) => {
                                 e.stopPropagation()
                                 handleVideoToggle()
                               }}
                               size="sm"
                               variant="secondary"
                               className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
                             >
                               {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                             </Button>
                             <Button
                               onClick={(e) => {
                                 e.stopPropagation()
                                 handleMuteToggle()
                               }}
                               size="sm"
                               variant="secondary"
                               className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
                             >
                               {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                             </Button>
                             <Button
                               onClick={(e) => {
                                 e.stopPropagation()
                                 window.open(surprise.content_video_url, '_blank')
                               }}
                               size="sm"
                               variant="secondary"
                               className="bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
                             >
                               <Download className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                 </>
               )}
             </motion.div>
           </div>
         )

      default:
        return (
          <div className="text-center">
            <p className="text-gray-600">Contenido no disponible</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${modalSize} max-h-[90vh] overflow-y-auto transition-all duration-300`}>
        <div className="relative">
          {/* Botón de cerrar */}
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Contenido */}
          <div className="pt-8">
            {renderContent()}
          </div>
          
          {/* Footer con botones de acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3 mt-8 pt-6 border-t border-gray-200"
          >
                         <div className="flex justify-center gap-4">
               <Button
                 onClick={handleShare}
                 variant="outline"
                 className="flex items-center gap-2"
               >
                 <Share2 className="h-4 w-4" />
                 Compartir
               </Button>
               <Button
                 onClick={onClose}
                 className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
               >
                 <Heart className="h-4 w-4 mr-2" />
                 ¡Gracias!
               </Button>
             </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
