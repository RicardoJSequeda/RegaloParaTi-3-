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
  Minimize2
} from 'lucide-react'
import { Card } from '@/components/ui/card'

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

  // Controles de teclado para volumen
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return // No procesar si está en un campo de texto
      }

      switch (event.key) {
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
  }, [volume])

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

  // Actualizar duración cuando cambia la canción
  useEffect(() => {
    const audio = audioRef.current
    if (audio && currentSong) {
      setIsActuallyPlaying(false)
      
      if (hasValidAudio(currentSong)) {
        audio.src = currentSong.audioUrl || (currentSong as any).audio_url
        audio.currentTime = 0
        setCurrentTime(0)
        
        if (isPlaying) {
          setTimeout(() => {
            audio.play().catch((error) => {
              console.error('Error reproduciendo nueva canción:', error)
              setIsPlaying(false)
              setIsActuallyPlaying(false)
            })
          }, 100)
        }
      } else {
        setIsPlaying(false)
        setIsActuallyPlaying(false)
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

      {/* Reproductor compacto en esquina inferior derecha */}
      <div className="fixed bottom-4 right-4 z-50 compact-player-enter">
        {/* Indicador de volumen */}
        {showVolumeIndicator && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              {volume === 0 ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume2 className="h-4 w-4 text-yellow-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-green-400" />
              )}
              <span className="font-mono">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        )}
        <Card className={`compact-player bg-white/95 border border-gray-200 shadow-xl transition-all duration-300 ${
          isExpanded ? 'w-80' : 'w-64'
        }`}>
          <div className="p-3">
            {/* Header con controles principales */}
            <div className="flex items-center gap-3 mb-3">
              {/* Portada pequeña */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg overflow-hidden ring-2 ring-pink-200 ${
                  isActuallyPlaying ? 'animate-spin' : ''
                }`} style={{ 
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
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      🎵
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la canción */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 truncate text-sm">
                  {currentSong.title}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {currentSong.artist}
                </p>
              </div>

              {/* Controles principales */}
              <div className="flex items-center gap-1">
                <Button
                  onClick={togglePlay}
                  size="sm"
                  className={`w-8 h-8 rounded-full ${
                    hasValidAudio(currentSong)
                      ? (isActuallyPlaying ? 'bg-pink-500 animate-pulse' : 'bg-pink-500 hover:bg-pink-600')
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  style={{ 
                    animationPlayState: hasValidAudio(currentSong) && isActuallyPlaying ? 'running' : 'paused' 
                  }}
                  disabled={!hasValidAudio(currentSong)}
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsPlaying(false)
                    setCurrentSong(null)
                  }}
                  className="w-6 h-6 p-0 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-2">
              <Progress 
                value={(currentTime / duration) * 100} 
                className="h-1"
                onValueChange={(value) => {
                  const audio = audioRef.current
                  if (audio) {
                    const newTime = (value / 100) * duration
                    audio.currentTime = newTime
                    setCurrentTime(newTime)
                  }
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controles expandidos */}
            {isExpanded && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {/* Controles de navegación */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShuffle(!shuffle)}
                    className={shuffle ? 'text-pink-500' : 'text-gray-400'}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevSong}
                    disabled={playlist.length <= 1}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextSong}
                    disabled={playlist.length <= 1}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRepeat(!repeat)}
                    className={repeat ? 'text-pink-500' : 'text-gray-400'}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>

                                 {/* Control de volumen */}
                 <div className="flex items-center gap-2">
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => changeVolume(volume === 0 ? 1 : 0)}
                     className={`volume-control w-6 h-6 p-0 transition-colors ${
                       volume === 0 ? 'text-red-400' : volume < 0.5 ? 'text-yellow-400' : 'text-green-400'
                     }`}
                   >
                     {volume === 0 ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                   </Button>
                   <div className="flex-1 relative group" onWheel={handleVolumeScroll}>
                     <Progress 
                       value={volume * 100} 
                       className="volume-slider h-2 cursor-pointer transition-all duration-200 group-hover:h-3"
                       onValueChange={(value) => changeVolume(value / 100)}
                     />
                     {/* Tooltip de volumen */}
                     <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                       {Math.round(volume * 100)}%
                     </div>
                   </div>
                   <span className="text-xs text-gray-500 w-8 text-right font-mono">
                     {Math.round(volume * 100)}%
                   </span>
                 </div>

                {/* Información adicional */}
                <div className="text-xs text-gray-500 text-center">
                  {playlist.length} canciones • {currentSong.album}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
