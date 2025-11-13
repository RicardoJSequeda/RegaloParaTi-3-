'use client'

import { useEffect, useRef, useState } from 'react'
import { useGlobalPlayer } from '@/hooks/useGlobalPlayer'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Volume2,
  VolumeX,
  X,
  Maximize2,
  Minimize2,
  MessageCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function GlobalPlayer() {
  const {
    currentSong,
    isPlaying,
    isActuallyPlaying,
    currentTime,
    duration,
    volume,
    repeat,
    shuffle,
    playlist,
    setIsPlaying,
    setIsActuallyPlaying,
    setCurrentSong,
    setCurrentTime,
    setDuration,
    setVolume,
    setRepeat,
    setShuffle,
    togglePlay,
    nextSong,
    prevSong,
    hasValidAudio
  } = useGlobalPlayer()

  const audioRef = useRef<HTMLAudioElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDraggingProgress, setIsDraggingProgress] = useState(false)
  const [showDedicationModal, setShowDedicationModal] = useState(false)

  // UX: Controles de teclado mejorados para mejor experiencia de usuario
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // No procesar si está en un campo de texto o input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          (event.target as HTMLElement)?.isContentEditable) {
        return
      }

      switch (event.key) {
        // UX: Espacio para play/pause (estándar en reproductores)
        case ' ':
          event.preventDefault()
          if (currentSong && hasValidAudio(currentSong)) {
            togglePlay()
          }
          break
        // UX: Flechas izquierda/derecha para navegar canciones
        case 'ArrowLeft':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            prevSong()
          }
          break
        case 'ArrowRight':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            nextSong()
          }
          break
        // UX: Controles de volumen
        case 'ArrowUp':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setVolume(Math.min(1, volume + 0.1))
          }
          break
        case 'ArrowDown':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setVolume(Math.max(0, volume - 0.1))
          }
          break
        case 'm':
        case 'M':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setVolume(volume === 0 ? 1 : 0)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [volume, currentSong, hasValidAudio, togglePlay, prevSong, nextSong])

  // Sincronizar estado de reproducción con el elemento audio
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      // Sincronizar volumen
      audio.volume = volume
      
      if (isPlaying) {
        if (currentSong && hasValidAudio(currentSong)) {
          audio.play().catch((error) => {
            console.error('Error reproduciendo audio:', error)
            setIsPlaying(false)
            setIsActuallyPlaying(false)
          })
        } else {
          setIsPlaying(false)
          setIsActuallyPlaying(false)
        }
      } else {
        audio.pause()
      }
    }
  }, [isPlaying, currentSong, hasValidAudio, volume, setIsPlaying, setIsActuallyPlaying])

  // UX: Actualizar duración cuando cambia la canción con indicador de carga
  useEffect(() => {
    const audio = audioRef.current
    if (audio && currentSong) {
      setIsActuallyPlaying(false)
      setIsLoading(true) // UX: Mostrar indicador de carga
      
      if (hasValidAudio(currentSong)) {
        audio.src = currentSong.audioUrl || (currentSong as any).audio_url
        audio.currentTime = 0
        setCurrentTime(0)
        
        // UX: Manejar eventos de carga para ocultar indicador
        const handleCanPlay = () => {
          setIsLoading(false)
          if (isPlaying) {
            audio.play().catch((error) => {
              console.error('Error reproduciendo nueva canción:', error)
              setIsPlaying(false)
              setIsActuallyPlaying(false)
              setIsLoading(false)
            })
          } else {
            setIsLoading(false)
          }
        }
        
        const handleError = () => {
          setIsLoading(false)
          setIsPlaying(false)
          setIsActuallyPlaying(false)
        }
        
        audio.addEventListener('canplay', handleCanPlay, { once: true })
        audio.addEventListener('error', handleError, { once: true })
        
        if (isPlaying) {
          setTimeout(() => {
            audio.play().catch((error) => {
              console.error('Error reproduciendo nueva canción:', error)
              setIsPlaying(false)
              setIsActuallyPlaying(false)
              setIsLoading(false)
            })
          }, 100)
        } else {
          // Si no está reproduciendo, ocultar loading después de un tiempo
          setTimeout(() => setIsLoading(false), 500)
        }
        
        return () => {
          audio.removeEventListener('canplay', handleCanPlay)
          audio.removeEventListener('error', handleError)
        }
      } else {
        setIsPlaying(false)
        setIsActuallyPlaying(false)
        setIsLoading(false)
      }
    }
  }, [currentSong?.id, currentSong, isPlaying, setCurrentTime, setIsPlaying, setIsActuallyPlaying])

  // Formatear tiempo
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Manejar scroll del mouse en la barra de volumen
  const handleVolumeScroll = (event: React.WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.05 : 0.05
    const newVolume = Math.max(0, Math.min(1, volume + delta))
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    // Mostrar indicador de volumen
    setShowVolumeIndicator(true)
    setTimeout(() => setShowVolumeIndicator(false), 1000)
  }

  // Función para cambiar volumen con feedback visual
  const changeVolume = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setShowVolumeIndicator(true)
    setTimeout(() => setShowVolumeIndicator(false), 1000)
  }

  // Si no hay canción actual, no mostrar el reproductor
  if (!currentSong) return null

  return (
    <>
      {/* Elemento de audio oculto */}
      <audio
        ref={audioRef}
        src={currentSong.audioUrl || (currentSong as any).audio_url || ''}
        onLoadedMetadata={(e) => setDuration(Math.floor((e.target as HTMLAudioElement).duration || 0))}
        onTimeUpdate={(e) => setCurrentTime(Math.floor((e.target as HTMLAudioElement).currentTime || 0))}
        onPlay={() => setIsActuallyPlaying(true)}
        onPause={() => setIsActuallyPlaying(false)}
        onError={(e) => {
          console.error('Error cargando audio:', e)
          setIsPlaying(false)
          setIsActuallyPlaying(false)
        }}
        onEnded={() => {
          setIsActuallyPlaying(false)
          
          if (repeat) {
            const audio = audioRef.current
            if (audio && hasValidAudio(currentSong)) {
              audio.currentTime = 0
              setIsPlaying(true)
            }
          } else if (shuffle) {
            const randomIndex = Math.floor(Math.random() * playlist.length)
            const randomSong = playlist[randomIndex]
            // La reproducción se manejará en el useEffect
          } else {
            nextSong()
          }
        }}
      />

      {/* UX: Reproductor optimizado para móvil con safe areas y tamaños táctiles */}
      <div 
        className="fixed z-50 compact-player-enter bottom-3 right-3 sm:bottom-4 sm:right-4"
        style={{ 
          bottom: 'max(env(safe-area-inset-bottom), 0.75rem)',
          right: 'max(env(safe-area-inset-right), 0.75rem)'
        }}
      >
        {/* UX: Indicador de volumen mejorado con mejor visibilidad */}
        {showVolumeIndicator && (
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-[11px] px-3 py-2 rounded-lg shadow-xl backdrop-blur-sm border border-gray-700 animate-pulse sm:-top-12 sm:text-xs">
            <div className="flex items-center gap-2">
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 text-red-400 sm:h-5 sm:w-5" />
              ) : volume < 0.5 ? (
                <Volume2 className="h-4 w-4 text-yellow-400 sm:h-5 sm:w-5" />
              ) : (
                <Volume2 className="h-4 w-4 text-green-400 sm:h-5 sm:w-5" />
              )}
              <span className="font-mono font-semibold">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        )}
        <Card className={`compact-player bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-2xl transition-all duration-300 ${
          isExpanded ? 'w-[calc(100vw-1.5rem)] max-w-sm sm:w-80' : 'w-[calc(100vw-1.5rem)] max-w-[280px] sm:w-64'
        }`}>
          <div className="p-2.5 sm:p-3">
            {/* UX: Header con controles principales optimizados para touch */}
            <div className="flex items-center gap-2 mb-2.5 sm:gap-3 sm:mb-3">
              {/* UX: Portada con tamaño responsive */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg overflow-hidden ring-2 ring-pink-200 dark:ring-pink-700 transition-all ${
                  isActuallyPlaying ? 'animate-spin shadow-lg' : ''
                } sm:w-14 sm:h-14`} style={{ 
                  animationDuration: '20s', 
                  animationPlayState: isActuallyPlaying ? 'running' : 'paused' 
                }}>
                  {currentSong.cover && currentSong.cover !== '/api/placeholder/200/200' ? (
                    <img 
                      src={currentSong.cover} 
                      alt={`Portada de ${currentSong.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                      🎵
                    </div>
                  )}
                </div>
              </div>

              {/* UX: Información de la canción con tipografía legible */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate text-[13px] sm:text-sm">
                  {currentSong.title}
                </h4>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate sm:text-xs">
                    {currentSong.artist}
                  </p>
                  {/* UX: Indicador de dedicatoria si existe */}
                  {currentSong.dedication && (
                    <button
                      onClick={() => setShowDedicationModal(true)}
                      className="flex-shrink-0 text-pink-500 hover:text-pink-600 active:scale-95 transition-all"
                      aria-label="Ver dedicatoria"
                      title="Ver dedicatoria"
                    >
                      <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* UX: Controles principales mejorados con next/prev siempre visibles */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* UX: Botón anterior - siempre visible para mejor acceso */}
                {playlist.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevSong}
                    className="w-9 h-9 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 active:scale-95 transition-all rounded-full min-h-[44px] min-w-[44px] sm:w-8 sm:h-8 sm:min-h-0 sm:min-w-0"
                    aria-label="Canción anterior"
                    title="Canción anterior (Ctrl+←)"
                  >
                    <SkipBack className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                  </Button>
                )}
                
                {/* UX: Botón play/pause con indicador de carga */}
                <Button
                  onClick={togglePlay}
                  size="sm"
                  className={`rounded-full transition-all active:scale-95 relative ${
                    hasValidAudio(currentSong)
                      ? (isActuallyPlaying ? 'bg-pink-500 animate-pulse shadow-lg ring-2 ring-pink-300' : 'bg-pink-500 hover:bg-pink-600 shadow-md')
                      : 'bg-gray-400 cursor-not-allowed'
                  } w-11 h-11 min-h-[44px] min-w-[44px] sm:w-10 sm:h-10 sm:min-h-0 sm:min-w-0`}
                  style={{ 
                    animationPlayState: hasValidAudio(currentSong) && isActuallyPlaying ? 'running' : 'paused' 
                  }}
                  disabled={!hasValidAudio(currentSong) || isLoading}
                  aria-label={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
                  title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin sm:w-5 sm:h-5"></div>
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5 sm:h-5 sm:w-5" />
                  )}
                </Button>
                
                {/* UX: Botón siguiente - siempre visible para mejor acceso */}
                {playlist.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextSong}
                    className="w-9 h-9 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 active:scale-95 transition-all rounded-full min-h-[44px] min-w-[44px] sm:w-8 sm:h-8 sm:min-h-0 sm:min-w-0"
                    aria-label="Siguiente canción"
                    title="Siguiente canción (Ctrl+→)"
                  >
                    <SkipForward className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-10 h-10 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 active:scale-95 transition-all rounded-full min-h-[44px] min-w-[44px] sm:w-8 sm:h-8 sm:min-h-0 sm:min-w-0"
                  aria-label={isExpanded ? 'Minimizar reproductor' : 'Expandir reproductor'}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> : <Maximize2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />}
                </Button>
                
                {/* UX: Botón cerrar con mejor feedback visual */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsPlaying(false)
                    setCurrentSong(null)
                  }}
                  className="w-10 h-10 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 active:scale-95 transition-all rounded-full min-h-[44px] min-w-[44px] sm:w-8 sm:h-8 sm:min-h-0 sm:min-w-0"
                  aria-label="Cerrar reproductor"
                  title="Cerrar reproductor"
                >
                  <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>
            </div>

            {/* UX: Barra de progreso mejorada con mejor interacción táctil */}
            <div className="mb-2">
              <div className="relative group">
                {/* UX: Indicador de carga sobre la barra de progreso */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin sm:w-3 sm:h-3"></div>
                  </div>
                )}
                <Progress 
                  value={(currentTime / duration) * 100} 
                  className={`h-2 cursor-pointer transition-all duration-200 group-hover:h-2.5 sm:h-1.5 sm:group-hover:h-2 ${
                    isDraggingProgress ? 'ring-2 ring-pink-300' : ''
                  } ${isLoading ? 'opacity-60' : ''}`}
                  onValueChange={(value) => {
                    const audio = audioRef.current
                    if (audio && !isLoading) {
                      const newTime = (value / 100) * duration
                      audio.currentTime = newTime
                      setCurrentTime(newTime)
                    }
                  }}
                  onPointerDown={() => setIsDraggingProgress(true)}
                  onPointerUp={() => setIsDraggingProgress(false)}
                />
                {/* UX: Tooltip de tiempo mejorado con posición dinámica */}
                <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-[10px] px-2 py-1 rounded shadow-lg backdrop-blur-sm border border-gray-700 transition-opacity pointer-events-none z-20 sm:text-xs ${
                  isDraggingProgress ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1 sm:text-xs">
                <span className="font-medium">{formatTime(currentTime)}</span>
                <span className="font-medium">{formatTime(duration)}</span>
              </div>
            </div>

            {/* UX: Controles expandidos con mejor jerarquía visual y tamaños táctiles */}
            {isExpanded && (
              <div className="space-y-3 pt-2.5 border-t border-gray-200 dark:border-gray-700 sm:space-y-3 sm:pt-2">
                {/* UX: Controles de navegación con feedback táctil */}
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShuffle(!shuffle)}
                    className={`transition-all active:scale-95 rounded-full min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 ${
                      shuffle 
                        ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20 ring-2 ring-pink-200 dark:ring-pink-700' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    aria-label={shuffle ? 'Desactivar modo aleatorio' : 'Activar modo aleatorio'}
                    aria-pressed={shuffle}
                  >
                    <Shuffle className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevSong}
                    disabled={playlist.length <= 1}
                    className="transition-all active:scale-95 rounded-full min-h-[44px] min-w-[44px] text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed sm:min-h-0 sm:min-w-0"
                    aria-label="Canción anterior"
                  >
                    <SkipBack className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextSong}
                    disabled={playlist.length <= 1}
                    className="transition-all active:scale-95 rounded-full min-h-[44px] min-w-[44px] text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed sm:min-h-0 sm:min-w-0"
                    aria-label="Siguiente canción"
                  >
                    <SkipForward className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRepeat(!repeat)}
                    className={`transition-all active:scale-95 rounded-full min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 ${
                      repeat 
                        ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20 ring-2 ring-pink-200 dark:ring-pink-700' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    aria-label={repeat ? 'Desactivar repetición' : 'Activar repetición'}
                    aria-pressed={repeat}
                  >
                    <Repeat className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                {/* UX: Control de volumen mejorado con área táctil */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => changeVolume(volume === 0 ? 1 : 0)}
                    className={`volume-control transition-all active:scale-95 rounded-full min-h-[44px] min-w-[44px] sm:w-8 sm:h-8 sm:min-h-0 sm:min-w-0 ${
                      volume === 0 
                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                        : volume < 0.5 
                        ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                        : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    aria-label={volume === 0 ? 'Activar sonido' : 'Silenciar'}
                  >
                    {volume === 0 ? <VolumeX className="h-5 w-5 sm:h-4 sm:w-4" /> : <Volume2 className="h-5 w-5 sm:h-4 sm:w-4" />}
                  </Button>
                  <div className="flex-1 relative group" onWheel={handleVolumeScroll}>
                    <Progress 
                      value={volume * 100} 
                      className="volume-slider h-3 cursor-pointer transition-all duration-200 group-hover:h-3.5 sm:h-2 sm:group-hover:h-2.5"
                      onValueChange={(value) => changeVolume(value / 100)}
                    />
                    {/* UX: Tooltip de volumen mejorado */}
                    <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 backdrop-blur-sm border border-gray-700 sm:text-xs">
                      <div className="flex items-center gap-1.5">
                        {volume === 0 ? (
                          <VolumeX className="h-3.5 w-3.5 text-red-400" />
                        ) : volume < 0.5 ? (
                          <Volume2 className="h-3.5 w-3.5 text-yellow-400" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5 text-green-400" />
                        )}
                        <span className="font-mono font-semibold">{Math.round(volume * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 w-10 text-right font-mono font-semibold sm:text-xs sm:w-8">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                {/* UX: Información adicional mejorada con indicadores de modo */}
                <div className="space-y-2">
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 text-center sm:text-xs">
                    <span className="font-medium">{playlist.length}</span> canciones {currentSong.album && `• ${currentSong.album}`}
                  </div>
                  {/* UX: Botón de dedicatoria si existe */}
                  {currentSong.dedication && (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDedicationModal(true)}
                        className="text-[10px] px-3 py-1.5 rounded-full border-pink-200 text-pink-600 hover:bg-pink-50 dark:border-pink-700 dark:text-pink-400 dark:hover:bg-pink-900/20 active:scale-95 transition-all min-h-[36px] sm:text-xs"
                      >
                        <MessageCircle className="h-3 w-3 mr-1.5 sm:h-3.5 sm:w-3.5" />
                        Ver Dedicatoria
                      </Button>
                    </div>
                  )}
                  {/* UX: Indicadores visuales de modo activo */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {shuffle && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-medium sm:text-xs">
                        🔀 Aleatorio
                      </span>
                    )}
                    {repeat && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-medium sm:text-xs">
                        🔁 Repetir
                      </span>
                    )}
                    {playlist.length > 1 && !shuffle && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium sm:text-xs">
                        ▶️ Siguiente: {playlist[(playlist.findIndex(s => s.id === currentSong?.id) + 1) % playlist.length]?.title || '...'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* UX: Modal para mostrar dedicatoria desde el reproductor */}
      <Dialog open={showDedicationModal} onOpenChange={setShowDedicationModal}>
        <DialogContent className="max-w-md dedication-modal bg-white dark:bg-gray-800 border-0 rounded-xl shadow-2xl sm:rounded-2xl" style={{ 
          paddingTop: 'max(env(safe-area-inset-top), 1rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)'
        }}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white text-center sm:text-xl">
              💝 Dedicatoria Especial
            </DialogTitle>
          </DialogHeader>
          {currentSong && currentSong.dedication && (
            <div className="space-y-3 sm:space-y-4">
              {/* UX: Portada y información con layout responsive */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden ring-2 ring-pink-200 dark:ring-pink-700 flex-shrink-0 sm:w-16 sm:h-16">
                  {currentSong.cover && currentSong.cover !== '/api/placeholder/200/200' ? (
                    <img 
                      src={currentSong.cover} 
                      alt={`Portada de ${currentSong.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      🎵
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-white text-[14px] truncate sm:text-base">{currentSong.title}</h3>
                  <p className="text-[12px] text-gray-600 dark:text-gray-400 truncate sm:text-sm">{currentSong.artist}</p>
                </div>
              </div>

              {/* UX: Dedicatoria con tipografía legible */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-pink-200 dark:border-pink-800 sm:p-4">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="text-xl sm:text-2xl flex-shrink-0">💌</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1.5 text-[13px] sm:text-sm sm:mb-2">¿Por qué es especial esta canción?</h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic text-[12px] sm:text-sm">
                      &quot;{currentSong.dedication}&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* UX: Botón de cerrar con tamaño táctil */}
              <div className="flex justify-center pt-1 sm:pt-2">
                <Button
                  onClick={() => setShowDedicationModal(false)}
                  className="bg-pink-500 hover:bg-pink-600 active:scale-95 rounded-lg min-h-[44px] px-6 text-[12px] font-semibold sm:rounded-xl sm:text-sm md:text-base"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
