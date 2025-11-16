'use client'

import { useState, useEffect } from 'react'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Plus,
  Heart,
  Trash2,
  Upload,
  Music,
  MessageCircle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  ChevronRight
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileUpload } from '@/components/ui/file-upload'
import { useGlobalPlayer, GlobalSong } from '@/hooks/useGlobalPlayer'
import { uploadPublicFile, BUCKET_AUDIO, BUCKET_COVERS } from '@/lib/supabase/storage'

// Función para formatear duración de segundos a MM:SS
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Función para convertir duración MM:SS a segundos
const durationToSeconds = (duration: string): number => {
  const [mins, secs] = duration.split(':').map(Number)
  return (mins * 60) + (secs || 0)
}

// Función para calcular total de reproducciones
const calculateTotalPlays = (songs: GlobalSong[]): number => {
  return songs.reduce((total, song) => total + (song.plays || 0), 0)
}

// Función para calcular total de canciones favoritas
const calculateTotalFavorites = (songs: GlobalSong[]): number => {
  return songs.filter(song => song.isFavorite).length
}

// Función para calcular duración total de la playlist con formato inteligente
// Data URI para placeholder de portada (imagen gris 200x200)
const PLACEHOLDER_COVER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTBlNGU5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIGltYWdlbjwvdGV4dD48L3N2Zz4='

const calculateTotalDuration = (songs: GlobalSong[]): string => {
  const totalSeconds = songs.reduce((total, song) => {
    return total + durationToSeconds(song.duration)
  }, 0)
  
  // Formatear de manera inteligente: horas y minutos o solo minutos
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  
  if (hours > 0) {
    if (minutes === 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`
    } else {
      return `${hours} hora${hours > 1 ? 's' : ''} y ${minutes} minuto${minutes > 1 ? 's' : ''}`
    }
  } else {
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`
  }
}

export default function MusicaSection() {
  const supabase = getBrowserClient()
  const [isUploading, setIsUploading] = useState(false)
  const [showAddSongModal, setShowAddSongModal] = useState(false)
  
  // Usar el reproductor global
  const {
    currentSong,
    isActuallyPlaying,
    isPlaying,
    playlist,
    setPlaylist,
    selectSong,
    setCurrentSong,
    setCurrentTime,
    hasValidAudio,
    togglePlay,
    nextSong,
    prevSong,
    currentTime,
    duration,
    volume,
    setVolume,
    repeat,
    setRepeat,
    shuffle,
    setShuffle
  } = useGlobalPlayer()

  // Cargar canciones desde Supabase
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando canciones:', error)
        return
      }

      if (data) {
        const currentYear = new Date().getFullYear()
        const mapped: GlobalSong[] = data.map((r: any) => ({
          id: r.id,
          title: r.title,
          artist: r.artist,
          duration: r.duration ?? '3:00',
          cover: r.cover ?? PLACEHOLDER_COVER,
          dedication: r.dedication ?? '',
          isFavorite: !!r.is_favorite,
          plays: r.plays ?? 0,
          fileName: r.file_name ?? '',
          audioUrl: r.audio_url ?? ''
        }))
        setPlaylist(mapped)
      }
    }
    load()
    const channel = supabase
      .channel('songs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'songs' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, setPlaylist])

  // Detectar cuando una canción termina para incrementar reproducciones
  useEffect(() => {
    if (currentSong && isActuallyPlaying) {
      // Crear un temporizador basado en la duración de la canción
      const durationInSeconds = durationToSeconds(currentSong.duration)
      const timer = setTimeout(() => {
        // Solo incrementar si la canción sigue siendo la actual
        if (currentSong && isActuallyPlaying) {
          incrementPlays(currentSong.id)
        }
      }, durationInSeconds * 1000)

      return () => clearTimeout(timer)
    }
  }, [currentSong, isActuallyPlaying])

  // Manejar favoritos
  const toggleFavorite = async (songId: string) => {
    const { error } = await supabase
      .from('songs')
      .update({ is_favorite: !playlist.find(s => s.id === songId)?.isFavorite })
      .eq('id', songId)

    if (error) {
      console.error('Error actualizando favorito:', error)
      return
    }

    // Actualizar playlist local
    setPlaylist(playlist.map(song => 
      song.id === songId 
        ? { ...song, isFavorite: !song.isFavorite }
        : song
    ))
  }

  // Eliminar canción
  const deleteSong = async (songId: string) => {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)

    if (error) {
      console.error('Error eliminando canción:', error)
      return
    }

    // Actualizar playlist local
    setPlaylist(playlist.filter(song => song.id !== songId))
  }

  // Incrementar reproducciones de una canción
  const incrementPlays = async (songId: string) => {
    try {
      // Obtener reproducciones actuales
      const currentSong = playlist.find(song => song.id === songId)
      if (!currentSong) return

      const newPlays = (currentSong.plays || 0) + 1

      // Actualizar en Supabase
      const { error } = await supabase
        .from('songs')
        .update({ plays: newPlays })
        .eq('id', songId)

      if (error) {
        console.error('Error actualizando reproducciones:', error)
        return
      }

      // Actualizar playlist local
      setPlaylist(playlist.map(song => 
        song.id === songId 
          ? { ...song, plays: newPlays }
          : song
      ))

    } catch (error) {
      console.error('Error incrementando reproducciones:', error)
    }
  }

  // Estados para el modal
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    dedication: ''
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string>('')
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showDedicationModal, setShowDedicationModal] = useState(false)
  const [selectedDedication, setSelectedDedication] = useState<{title: string, artist: string, dedication: string, cover: string} | null>(null)
  const [showEditSongModal, setShowEditSongModal] = useState(false)
  const [editingSong, setEditingSong] = useState<GlobalSong | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    artist: '',
    dedication: ''
  })
  const [editAudioFile, setEditAudioFile] = useState<File | null>(null)
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null)
  const [editAudioPreview, setEditAudioPreview] = useState<string>('')
  const [editCoverPreview, setEditCoverPreview] = useState<string>('')
  const [editUploadProgress, setEditUploadProgress] = useState(0)
  const [isEditUploading, setIsEditUploading] = useState(false)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [recentlyUpdatedSong, setRecentlyUpdatedSong] = useState<string | null>(null)

  // Limpiar formulario
  const clearForm = () => {
    setFormData({
      title: '',
      artist: '',
      dedication: ''
    })
    setAudioFile(null)
    setCoverFile(null)
    setAudioPreview('')
    setCoverPreview('')
    setUploadProgress(0)
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Manejar selección de archivo de audio
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      // Crear preview del nombre del archivo
      setAudioPreview(file.name)
    }
  }

  // Manejar selección de portada
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      // Crear preview de la imagen
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Subir nueva canción
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.artist || !audioFile) {
      alert('Por favor completa los campos requeridos')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Subir archivo de audio
      const audioResult = await uploadPublicFile(BUCKET_AUDIO, audioFile)
      const audioUrl = audioResult.url
      
      // Subir portada si se proporcionó
      let coverUrl = PLACEHOLDER_COVER
      if (coverFile) {
        const coverResult = await uploadPublicFile(BUCKET_COVERS, coverFile)
        coverUrl = coverResult.url
      }

      // Calcular duración del audio
      const audio = new Audio()
      audio.src = URL.createObjectURL(audioFile)
      const duration = await new Promise<string>((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          const minutes = Math.floor(audio.duration / 60)
          const seconds = Math.floor(audio.duration % 60)
          resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        })
      })

      // Guardar en Supabase
      const { error } = await supabase
        .from('songs')
        .insert({
          title: formData.title,
          artist: formData.artist,
          duration,
          cover: coverUrl,
          dedication: formData.dedication,
          audio_url: audioUrl,
          file_name: audioFile.name,
          plays: 0,
          is_favorite: false
        })

      if (error) {
        console.error('Error guardando canción:', error)
        alert('Error al guardar la canción')
        return
      }

      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Cerrar modal y limpiar formulario
      setTimeout(() => {
        setShowAddSongModal(false)
        clearForm()
        alert('Canción agregada exitosamente')
      }, 500)

    } catch (error) {
      console.error('Error subiendo canción:', error)
      alert('Error al subir la canción')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const openAddSongModal = () => setShowAddSongModal(true)

  // Mostrar dedicatoria
  const showDedication = (song: GlobalSong) => {
    if (song.dedication) {
      setSelectedDedication({
        title: song.title,
        artist: song.artist,
        dedication: song.dedication,
        cover: song.cover
      })
      setShowDedicationModal(true)
    }
  }

  // Abrir modal de edición
  const openEditSongModal = (song: GlobalSong) => {
    setEditingSong(song)
    setEditFormData({
      title: song.title,
      artist: song.artist,
      dedication: song.dedication
    })
    setEditAudioPreview('')
    setEditCoverPreview('')
    setEditAudioFile(null)
    setEditCoverFile(null)
    setShowEditSongModal(true)
  }

  // Limpiar formulario de edición
  const clearEditForm = () => {
    setEditFormData({
      title: '',
      artist: '',
      dedication: ''
    })
    setEditAudioFile(null)
    setEditCoverFile(null)
    setEditAudioPreview('')
    setEditCoverPreview('')
    setEditUploadProgress(0)
    setEditingSong(null)
  }

  // Manejar cambios en el formulario de edición
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Seleccionar archivo de audio para edición
  const handleEditAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditAudioFile(file)
      setEditAudioPreview(file.name)
    }
  }

  // Seleccionar archivo de portada para edición
  const handleEditCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditCoverFile(file)
      setEditCoverPreview(URL.createObjectURL(file))
    }
  }

  // Mostrar notificación de éxito
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessNotification(true)
    setTimeout(() => {
      setShowSuccessNotification(false)
    }, 3000)
  }

  // Guardar cambios de la canción
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingSong || !editFormData.title || !editFormData.artist) {
      alert('Por favor completa los campos requeridos')
      return
    }

    setIsEditUploading(true)
    setEditUploadProgress(0)
    
    try {
      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setEditUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      let audioUrl = editingSong.audioUrl
      let coverUrl = editingSong.cover
      let duration = editingSong.duration

      // Subir nuevo archivo de audio si se seleccionó
      if (editAudioFile) {
        const audioResult = await uploadPublicFile(BUCKET_AUDIO, editAudioFile)
        audioUrl = audioResult.url
        
        // Calcular nueva duración
        const audio = new Audio()
        audio.src = URL.createObjectURL(editAudioFile)
        duration = await new Promise<string>((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            const minutes = Math.floor(audio.duration / 60)
            const seconds = Math.floor(audio.duration % 60)
            resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`)
          })
        })
      }
      
      // Subir nueva portada si se seleccionó
      if (editCoverFile) {
        const coverResult = await uploadPublicFile(BUCKET_COVERS, editCoverFile)
        coverUrl = coverResult.url
      }

      // Actualizar en Supabase
      const { error } = await supabase
        .from('songs')
        .update({
          title: editFormData.title,
          artist: editFormData.artist,
          dedication: editFormData.dedication,
          duration,
          cover: coverUrl,
          audio_url: audioUrl,
          file_name: editAudioFile ? editAudioFile.name : editingSong.fileName
        })
        .eq('id', editingSong.id)

      if (error) {
        console.error('Error actualizando canción:', error)
        alert('Error al actualizar la canción')
        return
      }

      clearInterval(progressInterval)
      setEditUploadProgress(100)
      
      // Actualizar el estado local inmediatamente
      const updatedSong: GlobalSong = {
        ...editingSong,
        title: editFormData.title,
        artist: editFormData.artist,
        dedication: editFormData.dedication,
        duration,
        cover: coverUrl,
        audioUrl,
        fileName: editAudioFile ? editAudioFile.name : editingSong.fileName
      }

      // Actualizar la playlist global
      setPlaylist(playlist.map(song => 
        song.id === editingSong.id ? updatedSong : song
      ))

      // Marcar la canción como recientemente actualizada
      setRecentlyUpdatedSong(editingSong.id)
      setTimeout(() => {
        setRecentlyUpdatedSong(null)
      }, 3000)

      // Si es la canción actual, actualizarla también
      if (currentSong?.id === editingSong.id) {
        // La canción actual se actualiza automáticamente a través del estado global
        // No es necesario hacer nada adicional aquí
      }
      
      setTimeout(() => {
        setShowEditSongModal(false)
        clearEditForm()
        // Mostrar notificación de éxito
        showSuccessMessage('Canción actualizada exitosamente')
      }, 500)
      
    } catch (error) {
      console.error('Error actualizando canción:', error)
      alert('Error al actualizar la canción')
    } finally {
      setIsEditUploading(false)
      setEditUploadProgress(0)
    }
  }

  return (
    <section className="relative mx-auto flex w-full flex-col gap-2 overflow-x-hidden px-0 pb-20 pt-3 sm:gap-4 sm:px-4 sm:pb-8 sm:pt-4 md:gap-6 md:px-6 md:pt-4 md:max-w-6xl" style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 5rem)', minWidth: 0, maxWidth: '100%', width: '100%', boxSizing: 'border-box', contain: 'layout style', willChange: 'auto', paddingLeft: '0', paddingRight: '0' }}>
      {/* UX: Header optimizado para móvil con tipografía escalable desde 320px */}
      <div className="flex flex-col items-center gap-0.5 text-center sm:gap-1.5 md:gap-2" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <Badge
          aria-hidden="true"
          variant="secondary"
          className="w-fit rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-pink-600 shadow-sm ring-1 ring-pink-200/70 backdrop-blur sm:px-2.5 sm:py-0.5 sm:text-[10px] md:px-3 md:py-1 md:text-[11px]"
        >
          Nuestras Canciones
        </Badge>
        <h1 className="w-full text-wrap text-lg font-extrabold leading-[1.2] tracking-tight text-gray-900 dark:text-white sm:text-xl md:text-2xl lg:text-3xl">
          Nuestras Canciones
        </h1>
        <p className="w-full max-w-2xl text-[10px] leading-[1.3] text-gray-600 dark:text-gray-300 sm:text-xs sm:leading-4 md:text-sm md:leading-5 lg:text-base" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          Las canciones que cuentan nuestra historia de amor
        </p>
      </div>

      {/* UX: Estadísticas - Tarjetas más compactas */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3" style={{ contain: 'layout style', willChange: 'auto', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
        <Card className="bg-white dark:bg-gray-800 shadow-md border-0 rounded-lg p-1.5 transition-all duration-300 active:scale-95 stats-card hover:shadow-lg sm:rounded-xl sm:p-3 md:p-4" style={{ minWidth: 0, maxWidth: '100%', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <CardContent className="p-0 text-center">
            <div className="text-lg font-bold text-pink-600 dark:text-pink-400 stats-number tabular-nums sm:text-2xl md:text-3xl lg:text-4xl">{playlist.length}</div>
            <div className="text-[9px] text-gray-600 dark:text-gray-400 mt-0.5 sm:text-xs md:text-sm font-medium">Canciones</div>
            <div className="text-[8px] text-pink-400 mt-0.5 stats-subtitle sm:text-[10px] md:text-xs">En tu biblioteca</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-md border-0 rounded-lg p-1.5 transition-all duration-300 active:scale-95 stats-card hover:shadow-lg sm:rounded-xl sm:p-3 md:p-4" style={{ minWidth: 0, maxWidth: '100%', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <CardContent className="p-0 text-center" style={{ minWidth: 0, maxWidth: '100%', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400 stats-number tabular-nums sm:text-2xl md:text-3xl lg:text-4xl" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {calculateTotalFavorites(playlist)}
            </div>
            <div className="text-[9px] text-gray-600 dark:text-gray-400 mt-0.5 sm:text-xs md:text-sm font-medium" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>Favoritas</div>
            <div className="text-[8px] text-purple-400 mt-0.5 stats-subtitle sm:text-[10px] md:text-xs" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>Con ❤️ especial</div>
          </CardContent>
        </Card>
      </div>

      {/* UX: Reproductor Global mejorado con controles completos */}
      {currentSong && (
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 rounded-xl overflow-hidden sm:rounded-2xl" style={{ contain: 'layout style', willChange: 'auto', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
          <CardContent className="p-2.5 sm:p-3 md:p-4 lg:p-6" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
            {/* Header con información de la canción */}
            <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 mb-2 sm:mb-3">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-lg sm:rounded-xl overflow-hidden ring-2 ring-pink-200 dark:ring-pink-800 flex-shrink-0 transition-all ${
                isActuallyPlaying ? 'animate-pulse' : ''
              }`}>
                {currentSong.cover && currentSong.cover !== PLACEHOLDER_COVER ? (
                  <img 
                    src={currentSong.cover} 
                    alt={`Portada de ${currentSong.title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                    <Music className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-white line-clamp-1">
                  {currentSong.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-1 mt-0.5">
                  {currentSong.artist}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSong(null)}
                className="h-9 w-9 p-0 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 rounded-full transition-all active:scale-95 flex-shrink-0"
                aria-label="Cerrar reproductor"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Controles principales de reproducción */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3">
              <Button
                variant="ghost"
                size="sm"
                className={`h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-full min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 transition-all ${shuffle ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setShuffle(!shuffle)}
                aria-label="Shuffle"
              >
                <Shuffle className="h-5 w-5 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 sm:h-11 sm:w-11 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 rounded-full transition-all active:scale-95"
                onClick={prevSong}
                aria-label="Canción anterior"
              >
                <SkipBack className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <Button
                variant="default"
                size="lg"
                className="h-14 w-14 sm:h-16 sm:w-16 p-0 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transition-all active:scale-95 min-h-[56px] min-w-[56px] sm:min-h-0 sm:min-w-0"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 sm:h-7 sm:w-7" />
                ) : (
                  <Play className="h-6 w-6 sm:h-7 sm:w-7 ml-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 sm:h-11 sm:w-11 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 rounded-full transition-all active:scale-95"
                onClick={nextSong}
                aria-label="Siguiente canción"
              >
                <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-full min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 transition-all ${repeat ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setRepeat(!repeat)}
                aria-label="Repetir"
              >
                <Repeat className="h-5 w-5 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Barra de progreso */}
            <div className="mb-2 sm:mb-3">
              <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-1.5 font-medium">
                <span className="tabular-nums">{formatDuration(Math.floor(currentTime))}</span>
                <span className="tabular-nums">{currentSong.duration || '0:00'}</span>
              </div>
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer group">
                <div 
                  className="absolute h-full bg-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="1"
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value)
                    setCurrentTime(newTime)
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Controles secundarios: Volumen */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 rounded-full transition-all active:scale-95"
                onClick={() => setVolume(volume > 0 ? 0 : 1)}
                aria-label={volume > 0 ? 'Silenciar' : 'Activar sonido'}
              >
                {volume > 0 ? (
                  <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
              <div className="flex-1 relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-pink-500 rounded-full transition-all"
                  style={{ width: `${volume * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-right font-medium tabular-nums">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Información adicional */}
            <div className="pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5 sm:space-y-2">
              {currentSong.dedication && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 min-h-[44px] text-sm font-medium transition-all active:scale-95"
                  onClick={() => {
                    setSelectedDedication({
                      title: currentSong.title,
                      artist: currentSong.artist,
                      dedication: currentSong.dedication,
                      cover: currentSong.cover
                    })
                    setShowDedicationModal(true)
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ver Dedicatoria
                </Button>
              )}
              {(() => {
                const currentIndex = playlist.findIndex(song => song.id === currentSong.id)
                const nextIndex = repeat ? (currentIndex + 1) % playlist.length : (currentIndex + 1 >= playlist.length ? 0 : currentIndex + 1)
                const nextSong = playlist[nextIndex]
                return nextSong ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 min-h-[44px] text-sm font-medium transition-all active:scale-95"
                    onClick={() => selectSong(nextSong)}
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Siguiente: <span className="truncate max-w-[150px] inline-block">{nextSong.title}</span>
                  </Button>
                ) : null
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* UX: Playlist optimizada para móvil con mejor layout */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-lg overflow-hidden sm:rounded-xl md:rounded-2xl" style={{ contain: 'layout style', willChange: 'auto', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
        <CardHeader className="p-2 sm:p-3 md:p-4 lg:p-6" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 md:gap-4">
            <div className="w-full sm:w-auto" style={{ minWidth: 0, maxWidth: '100%' }}>
              <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Nuestra Playlist</CardTitle>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-0.5 sm:mt-1">
                {playlist.length} canciones • {calculateTotalDuration(playlist)} de duración
              </p>
            </div>
            <Button
              onClick={openAddSongModal}
              className="bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 px-3 py-2 rounded-full w-full min-h-[40px] text-[11px] font-semibold sm:w-auto sm:px-5 sm:py-2.5 sm:text-xs md:px-6 md:py-3 md:text-sm"
              style={{ minWidth: 0, maxWidth: '100%' }}
            >
              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1.5 sm:mr-2" />
              Agregar Canción
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-2.5 md:p-4 lg:p-6" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
            {/* UX: Lista de canciones con altura responsive y scroll optimizado */}
            <div className={`overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-gray-100 hover:scrollbar-thumb-pink-400 ${
              currentSong 
                ? 'max-h-[calc(100vh-480px)] min-h-[200px]' // Con reproductor visible
                : 'max-h-[calc(100vh-280px)] min-h-[250px]'  // Sin reproductor
            } sm:max-h-[calc(100vh-420px)] sm:min-h-[250px] md:max-h-[calc(100vh-460px)] md:min-h-[300px] lg:max-h-[600px]`} style={{ minWidth: 0, maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
              <div className="space-y-1.5 sm:space-y-3" style={{ minWidth: 0, maxWidth: '100%', width: '100%' }}>
                {playlist.map((song, index) => (
                  <div
                    key={song.id}
                    className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur border border-transparent hover:border-pink-200 hover:bg-white dark:hover:bg-gray-700 shadow-sm hover:shadow-md active:scale-[0.98] song-item sm:gap-3 sm:p-3 md:gap-5 md:p-4 md:rounded-xl ${
                    currentSong?.id === song.id ? 'ring-2 ring-pink-300 bg-pink-50 dark:bg-pink-900/20' : ''
                    }`}
                    onClick={() => selectSong(song)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Reproducir ${song.title} de ${song.artist}`}
                    onKeyDown={(e) => e.key === 'Enter' && selectSong(song)}
                    style={{ contain: 'layout style', willChange: 'auto', minWidth: 0, maxWidth: '100%', width: '100%', boxSizing: 'border-box', overflow: 'hidden', paddingLeft: '0.25rem', paddingRight: '0.25rem' }}
                  >
                    {/* UX: Portada con tamaño responsive */}
                    <div className={`w-12 h-12 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-white font-bold text-xs relative flex-shrink-0 overflow-hidden ring-1 ring-black/5 song-cover sm:text-sm ${
                      currentSong?.id === song.id && isActuallyPlaying ? 'song-cover-playing' : ''
                    }`} style={{ flexShrink: 0, minWidth: '3rem', maxWidth: '3rem', width: '3rem', height: '3rem' }}>
                      {song.cover && song.cover !== PLACEHOLDER_COVER ? (
                        <img 
                          src={song.cover} 
                          alt={`Portada de ${song.title}`}
                          className="w-full h-full object-cover"
                          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                          <span className="text-sm font-bold sm:text-base md:text-lg">{index + 1}</span>
                  </div>
                )}
                    {currentSong?.id === song.id && isActuallyPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse sm:w-2 sm:h-2" />
                  </div>
                      )}
                </div>
                    {/* UX: Información de la canción con tipografía escalable */}
                    <div className="flex-1 min-w-0 pr-1" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-pink-700 transition-colors text-sm sm:text-sm md:text-base mb-0.5" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {song.title}
                      </h4>
                      <p className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate mb-0.5" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.artist}</p>
                  {/* Indicador de canción recientemente actualizada */}
                  {recentlyUpdatedSong === song.id && (
                        <div className="flex items-center gap-0.5 text-[10px] sm:text-xs text-green-500 animate-pulse sm:gap-1 whitespace-nowrap">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full sm:w-2 sm:h-2 flex-shrink-0"></div>
                          <span>Actualizada</span>
                        </div>
                  )}
                </div>
                    {/* UX: Controles con áreas táctiles mínimas (36px en móvil) */}
                    <div className="flex items-center gap-0.5 flex-shrink-0 sm:gap-1.5 md:gap-2" style={{ flexShrink: 0, minWidth: 0 }}>
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:inline flex-shrink-0">{song.duration}</span>
                        {/* Botón de edición */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditSongModal(song)
                          }}
                        className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50 active:scale-95 dark:hover:bg-green-900/20 transition-colors edit-button rounded-full min-h-[32px] min-w-[32px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 flex-shrink-0"
                        style={{ flexShrink: 0, minWidth: '32px', maxWidth: '32px', width: '32px', height: '32px' }}
                          title="Editar canción"
                        aria-label="Editar canción"
                        >
                        <Upload className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
                        </Button>
                        {/* Botón de dedicatoria */}
                        {song.dedication && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              showDedication(song)
                            }}
                          className="h-8 w-8 p-0 text-blue-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 dark:hover:bg-blue-900/20 transition-colors dedication-button rounded-full min-h-[32px] min-w-[32px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 flex-shrink-0"
                          style={{ flexShrink: 0, minWidth: '32px', maxWidth: '32px', width: '32px', height: '32px' }}
                            title="Ver dedicatoria"
                          aria-label="Ver dedicatoria"
                          >
                          <MessageCircle className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(song.id)
                          }}
                        className={`h-8 w-8 p-0 transition-all duration-200 rounded-full active:scale-95 min-h-[32px] min-w-[32px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 flex-shrink-0 ${
                            song.isFavorite 
                              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                              : 'text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        style={{ flexShrink: 0, minWidth: '32px', maxWidth: '32px', width: '32px', height: '32px' }}
                        aria-label={song.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        >
                        <Heart className={`h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 ${song.isFavorite ? 'fill-current animate-pulse' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSong(song.id)
                          }}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-95 dark:hover:bg-red-900/20 transition-colors rounded-full min-h-[32px] min-w-[32px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 flex-shrink-0"
                        style={{ flexShrink: 0, minWidth: '32px', maxWidth: '32px', width: '32px', height: '32px' }}
                        aria-label="Eliminar canción"
                        >
                        <Trash2 className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
                        </Button>
                      </div>
                  </div>
                ))}
              </div>
            </div>
        </CardContent>
      </Card>

      {/* UX: Modal para agregar canción optimizado para móvil */}
      <Dialog open={showAddSongModal} onOpenChange={(open) => {
        if (!open) {
          clearForm()
        }
        setShowAddSongModal(open)
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl bg-white dark:bg-gray-800 border-0 rounded-xl shadow-2xl sm:rounded-2xl" style={{ 
          paddingTop: 'max(env(safe-area-inset-top), 1rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          width: '100%',
          maxWidth: '95vw',
          boxSizing: 'border-box'
        }}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl md:text-2xl">
              Agregar Nueva Canción
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <Label htmlFor="title" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Título *</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title}
                  onChange={handleInputChange}
                  required 
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-lg min-h-[44px] text-[13px] sm:rounded-xl sm:text-sm md:text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div>
                <Label htmlFor="artist" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Artista *</Label>
                <Input 
                  id="artist" 
                  name="artist" 
                  value={formData.artist}
                  onChange={handleInputChange}
                  required 
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-lg min-h-[44px] text-[13px] sm:rounded-xl sm:text-sm md:text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>
              </div>
              <div>
              <Label htmlFor="dedication" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Dedicatoria</Label>
              <Input 
                id="dedication" 
                name="dedication" 
                placeholder="¿Por qué es especial esta canción?"
                value={formData.dedication}
                onChange={handleInputChange}
                className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-lg min-h-[44px] text-[13px] sm:rounded-xl sm:text-sm md:text-base"
                style={{ fontSize: '16px' }}
              />
            </div>
            
            {/* UX: Archivos con inputs táctiles optimizados */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <Label htmlFor="audio" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Archivo de Audio *</Label>
                <input
                  id="audio"
                  name="audio"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioSelect}
                  required
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-400 transition-colors file-input-hover bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-[13px] min-h-[44px] sm:p-3 sm:rounded-xl sm:text-sm md:text-base"
                />
                {/* Preview del archivo de audio */}
                {audioPreview && (
                  <div className="mt-2 p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg upload-preview sm:p-3 sm:rounded-xl">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-[12px] font-medium sm:text-sm">{audioPreview}</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="cover" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Portada (opcional)</Label>
                <input
                  id="cover"
                  name="cover"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-pink-400 transition-colors file-input-hover bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-[13px] min-h-[44px] sm:p-3 sm:rounded-xl sm:text-sm md:text-base"
                />
                {/* Preview de la portada */}
                {coverPreview && (
                  <div className="mt-2">
                    <img 
                      src={coverPreview} 
                      alt="Preview de portada" 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600 sm:w-20 sm:h-20 sm:rounded-xl md:w-24 md:h-24"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* UX: Barra de progreso con tipografía responsive */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-[12px] text-gray-600 dark:text-gray-400 sm:text-sm">
                  <span>Subiendo canción...</span>
                  <span className="font-semibold">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2 sm:h-2.5" />
              </div>
            )}

            {/* UX: Botones con tamaños táctiles */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddSongModal(false)
                  clearForm()
                }}
                disabled={isUploading}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 rounded-lg min-h-[44px] text-[12px] sm:rounded-xl sm:text-sm md:text-base"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-pink-500 hover:bg-pink-600 active:scale-95 rounded-lg min-h-[44px] text-[12px] font-semibold sm:rounded-xl sm:text-sm md:text-base"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white sm:h-4 sm:w-4"></div>
                    Subiendo...
                  </div>
                ) : (
                  'Agregar Canción'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* UX: Modal para mostrar dedicatoria optimizado para móvil */}
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
          {selectedDedication && (
            <div className="space-y-3 sm:space-y-4">
              {/* UX: Portada y información con layout responsive */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden ring-2 ring-pink-200 dark:ring-pink-700 flex-shrink-0 sm:w-16 sm:h-16">
                  {selectedDedication.cover && selectedDedication.cover !== PLACEHOLDER_COVER ? (
                    <img 
                      src={selectedDedication.cover} 
                      alt={`Portada de ${selectedDedication.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      🎵
                  </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-white text-[14px] truncate sm:text-base">{selectedDedication.title}</h3>
                  <p className="text-[12px] text-gray-600 dark:text-gray-400 truncate sm:text-sm">{selectedDedication.artist}</p>
            </div>
          </div>

              {/* UX: Dedicatoria con tipografía legible */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-pink-200 dark:border-pink-800 sm:p-4">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="text-xl sm:text-2xl flex-shrink-0">💌</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1.5 text-[13px] sm:text-sm sm:mb-2">¿Por qué es especial esta canción?</h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic text-[12px] sm:text-sm">
                      &quot;{selectedDedication.dedication}&quot;
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

      {/* UX: Modal para editar canción optimizado para móvil */}
      <Dialog open={showEditSongModal} onOpenChange={setShowEditSongModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl edit-modal bg-white dark:bg-gray-800 border-0 rounded-xl shadow-2xl sm:rounded-2xl" style={{ 
          paddingTop: 'max(env(safe-area-inset-top), 1rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          width: '100%',
          maxWidth: '95vw',
          boxSizing: 'border-box'
        }}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white text-center sm:text-xl">
              ✏️ Editar Canción
            </DialogTitle>
          </DialogHeader>
          {editingSong && (
            <form onSubmit={handleEditSubmit} className="space-y-3 sm:space-y-4">
              {/* UX: Información básica con grid responsive */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <Label htmlFor="edit-title" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Título *</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditInputChange}
                    required
                    className="file-input-hover edit-form-input border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-lg min-h-[44px] text-[13px] sm:rounded-md sm:text-sm md:text-base"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-artist" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Artista *</Label>
                  <Input
                    id="edit-artist"
                    name="artist"
                    value={editFormData.artist}
                    onChange={handleEditInputChange}
                    required
                    className="file-input-hover edit-form-input border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-lg min-h-[44px] text-[13px] sm:rounded-md sm:text-sm md:text-base"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              {/* UX: Dedicatoria con textarea táctil */}
              <div>
                <Label htmlFor="edit-dedication" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Dedicatoria</Label>
                <textarea
                  id="edit-dedication"
                  name="dedication"
                  value={editFormData.dedication}
                  onChange={handleEditInputChange}
                  rows={3}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 focus:border-green-500 focus:ring-green-500 transition-colors file-input-hover edit-form-input resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-[13px] min-h-[100px] sm:rounded-md sm:text-sm md:text-base"
                  style={{ fontSize: '16px' }}
                  placeholder="¿Por qué es especial esta canción para ti?"
                />
              </div>

              {/* UX: Archivos con inputs táctiles */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <Label htmlFor="edit-audio" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Archivo de Audio (opcional)</Label>
                  <input
                    id="edit-audio"
                    name="audio"
                    type="file"
                    accept="audio/*"
                    onChange={handleEditAudioSelect}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 transition-colors file-input-hover bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-[13px] min-h-[44px] sm:p-2 sm:rounded-md sm:text-sm md:text-base"
                  />
                  {editAudioPreview && (
                    <div className="mt-2 p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg upload-preview sm:p-2 sm:rounded-md">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-[12px] font-medium sm:text-sm">{editAudioPreview}</span>
              </div>
              </div>
                  )}
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 sm:text-xs">
                    Solo sube un nuevo archivo si quieres reemplazar el actual
                  </p>
            </div>
                <div>
                  <Label htmlFor="edit-cover" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Portada (opcional)</Label>
                  <input
                    id="edit-cover"
                    name="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleEditCoverSelect}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 transition-colors file-input-hover bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-[13px] min-h-[44px] sm:p-2 sm:rounded-md sm:text-sm md:text-base"
                  />
                  {editCoverPreview && (
                    <div className="mt-2">
                      <img 
                        src={editCoverPreview} 
                        alt="Preview de nueva portada" 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600 sm:w-20 sm:h-20 sm:rounded-md"
                      />
                        </div>
                      )}
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 sm:text-xs">
                    Solo sube una nueva imagen si quieres reemplazar la actual
                  </p>
                        </div>
                    </div>

              {/* UX: Progreso de upload con tipografía responsive */}
              {isEditUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px] text-gray-600 dark:text-gray-400 sm:text-sm">
                    <span>Actualizando canción...</span>
                    <span className="font-semibold">{editUploadProgress}%</span>
                      </div>
                  <Progress value={editUploadProgress} className="h-2 progress-animate sm:h-2.5" />
                    </div>
              )}

              {/* UX: Botones con tamaños táctiles */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 sm:pt-4">
                      <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditSongModal(false)
                    clearEditForm()
                  }}
                  disabled={isEditUploading}
                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 rounded-lg min-h-[44px] text-[12px] sm:rounded-md sm:text-sm md:text-base"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 active:scale-95 rounded-lg min-h-[44px] text-[12px] font-semibold sm:rounded-md sm:text-sm md:text-base"
                  disabled={isEditUploading}
                >
                  {isEditUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white sm:h-4 sm:w-4"></div>
                      Actualizando...
                    </div>
                  ) : (
                    'Actualizar Canción'
                  )}
                      </Button>
                    </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* UX: Notificación de éxito optimizada para móvil con safe areas */}
      {showSuccessNotification && (
        <div 
          className="fixed z-50 bg-green-500 text-white px-4 py-2.5 rounded-lg shadow-xl success-notification backdrop-blur-sm border border-green-400 top-3 right-3 sm:top-4 sm:right-4 sm:px-6 sm:py-3"
          style={{ 
            top: 'max(env(safe-area-inset-top), 0.75rem)',
            right: 'max(env(safe-area-inset-right), 0.75rem)'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full notification-pulse sm:w-2.5 sm:h-2.5"></div>
            <span className="font-medium text-[12px] sm:text-sm">{successMessage}</span>
              </div>
            </div>
      )}
    </section>
  )
}
