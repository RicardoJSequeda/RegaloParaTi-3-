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
  MessageCircle
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
    playlist,
    setPlaylist,
    selectSong,
    hasValidAudio
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
        const mapped = data.map((r: any) => ({
          id: r.id,
          title: r.title,
          artist: r.artist,
          album: r.album ?? '',
          duration: r.duration ?? '3:00',
          cover: r.cover ?? '/api/placeholder/200/200',
          dedication: r.dedication ?? '',
          isFavorite: !!r.is_favorite,
          genre: r.genre ?? '',
          year: r.year ?? currentYear.toString(),
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
    album: '',
    dedication: '',
    genre: '',
    year: new Date().getFullYear().toString()
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
    album: '',
    dedication: '',
    genre: '',
    year: ''
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
      album: '',
      dedication: '',
      genre: '',
      year: new Date().getFullYear().toString()
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
      let coverUrl = '/api/placeholder/200/200'
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
          album: formData.album,
          duration,
          cover: coverUrl,
          dedication: formData.dedication,
          genre: formData.genre,
          year: formData.year,
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
      album: song.album,
      dedication: song.dedication,
      genre: song.genre,
      year: song.year
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
      album: '',
      dedication: '',
      genre: '',
      year: ''
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
          album: editFormData.album,
          dedication: editFormData.dedication,
          genre: editFormData.genre,
          year: editFormData.year,
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
        album: editFormData.album,
        dedication: editFormData.dedication,
        genre: editFormData.genre,
        year: editFormData.year,
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
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 overflow-x-hidden px-3 pb-6 pt-3 sm:gap-6 sm:px-4 sm:pb-8 sm:pt-4 md:gap-8 md:px-6">
      {/* UX: Header optimizado para móvil con tipografía escalable desde 320px */}
      <div className="flex flex-col items-center gap-1.5 text-center sm:gap-2 md:gap-3">
        <Badge
          aria-hidden="true"
          variant="secondary"
          className="w-fit rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-pink-600 shadow-sm ring-1 ring-pink-200/70 backdrop-blur sm:px-3 sm:py-1 sm:text-[11px]"
        >
          Nuestra Música
        </Badge>
        <h1 className="w-full text-wrap text-[1.5rem] font-extrabold leading-[1.2] tracking-tight text-gray-900 dark:text-white sm:text-[1.75rem] md:text-3xl lg:text-4xl">
          Nuestras Canciones
        </h1>
        <p className="w-full max-w-2xl px-1 text-[12px] leading-[1.5] text-gray-600 dark:text-gray-300 sm:text-sm sm:leading-5 md:text-base md:leading-6 lg:text-lg">
          Las canciones que cuentan nuestra historia de amor
        </p>
      </div>

      {/* UX: Estadísticas con scroll horizontal táctil optimizado para móvil */}
      <div className="flex w-full overflow-x-auto gap-2 pb-2 px-1 scrollbar-hide sm:gap-3 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-lg p-2 flex-shrink-0 min-w-[100px] transition-all duration-300 active:scale-95 stats-card hover:shadow-xl sm:rounded-xl sm:p-2.5 sm:min-w-[110px]">
          <CardContent className="p-0 text-center sm:p-0">
            <div className="text-lg font-bold text-pink-600 dark:text-pink-400 stats-number sm:text-xl">{playlist.length}</div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 sm:text-[11px]">Canciones</div>
            <div className="text-[9px] text-pink-400 mt-0.5 stats-subtitle sm:text-[10px]">En tu biblioteca</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-lg p-2 flex-shrink-0 min-w-[100px] transition-all duration-300 active:scale-95 stats-card hover:shadow-xl sm:rounded-xl sm:p-2.5 sm:min-w-[110px]">
          <CardContent className="p-0 text-center sm:p-0">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400 stats-number sm:text-xl">
              {calculateTotalFavorites(playlist)}
            </div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 sm:text-[11px]">Favoritas</div>
            <div className="text-[9px] text-purple-400 mt-0.5 stats-subtitle sm:text-[10px]">Con ❤️ especial</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-lg p-2 flex-shrink-0 min-w-[100px] transition-all duration-300 active:scale-95 stats-card hover:shadow-xl sm:rounded-xl sm:p-2.5 sm:min-w-[110px]">
          <CardContent className="p-0 text-center sm:p-0">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 stats-number sm:text-xl">
              {calculateTotalDuration(playlist)}
            </div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 sm:text-[11px]">Duración Total</div>
            <div className="text-[9px] text-blue-400 mt-0.5 stats-subtitle sm:text-[10px]">De música y amor</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-lg p-2 flex-shrink-0 min-w-[100px] transition-all duration-300 active:scale-95 stats-card hover:shadow-xl sm:rounded-xl sm:p-2.5 sm:min-w-[110px]">
          <CardContent className="p-0 text-center sm:p-0">
            <div className="text-lg font-bold text-green-600 dark:text-green-400 stats-number sm:text-xl">
              {calculateTotalPlays(playlist)}
            </div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 sm:text-[11px]">Reproducciones</div>
            <div className="text-[9px] text-green-400 mt-0.5 stats-subtitle sm:text-[10px]">Momentos compartidos</div>
          </CardContent>
        </Card>
      </div>

      {/* UX: Reproductor Global Info optimizado para móvil */}
      {currentSong && (
        <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg border-0 rounded-xl overflow-hidden sm:rounded-2xl">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <div className={`w-14 h-14 rounded-xl overflow-hidden ring-2 ring-white/20 song-cover flex-shrink-0 transition-all ${
                isActuallyPlaying ? 'animate-spin song-cover-playing shadow-lg' : ''
              } sm:w-16 sm:h-16 md:w-20 md:h-20`} style={{ 
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
                  <div className="w-full h-full bg-white/20 flex items-center justify-center">
                    <Music className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-base sm:text-lg md:text-xl">{currentSong.title}</h3>
                <p className="text-white/80 text-[13px] sm:text-sm md:text-base">{currentSong.artist}</p>
                {currentSong.album && (
                  <p className="text-[12px] text-white/60 sm:text-sm">{currentSong.album}</p>
                )}
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white text-[10px] px-2.5 py-1 rounded-full sm:text-xs sm:px-3 md:text-sm">
                Reproduciendo Globalmente
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* UX: Playlist optimizada para móvil con mejor layout */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-xl overflow-hidden sm:rounded-2xl">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="w-full sm:w-auto">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl md:text-2xl">Nuestra Playlist</CardTitle>
              <p className="text-[12px] text-gray-600 dark:text-gray-300 mt-0.5 sm:text-sm sm:mt-1 md:text-base">
                {playlist.length} canciones • {calculateTotalDuration(playlist)} de duración
              </p>
            </div>
            <Button
              onClick={openAddSongModal}
              className="bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 px-4 py-2.5 rounded-full w-full min-h-[44px] text-[12px] font-semibold sm:w-auto sm:px-6 sm:py-3 sm:text-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5 sm:h-4 sm:w-4 sm:mr-2" />
              Agregar Canción
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
            {/* UX: Lista de canciones con altura responsive y scroll optimizado */}
            <div className="h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-gray-100 hover:scrollbar-thumb-pink-400 sm:h-80 md:h-96">
              <div className="space-y-2 pr-1 sm:space-y-3 sm:pr-2">
                {playlist.map((song, index) => (
                  <div
                    key={song.id}
                    className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all duration-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur border border-transparent hover:border-pink-200 hover:bg-white dark:hover:bg-gray-700 shadow-sm hover:shadow-md active:scale-[0.98] song-item sm:gap-3 sm:p-3 md:gap-5 md:p-4 md:rounded-xl ${
                    currentSong?.id === song.id ? 'ring-2 ring-pink-300 bg-pink-50 dark:bg-pink-900/20' : ''
                    }`}
                    onClick={() => selectSong(song)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Reproducir ${song.title} de ${song.artist}`}
                    onKeyDown={(e) => e.key === 'Enter' && selectSong(song)}
                  >
                    {/* UX: Portada con tamaño responsive */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs relative flex-shrink-0 overflow-hidden ring-1 ring-black/5 song-cover sm:w-12 sm:h-12 sm:text-sm md:w-16 md:h-16 ${
                      currentSong?.id === song.id && isActuallyPlaying ? 'song-cover-playing' : ''
                    }`}>
                      {song.cover && song.cover !== '/api/placeholder/200/200' ? (
                        <img 
                          src={song.cover} 
                          alt={`Portada de ${song.title}`}
                          className="w-full h-full object-cover"
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
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-pink-700 transition-colors text-[13px] sm:text-sm md:text-base">
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate sm:text-xs md:text-sm">{song.artist}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 flex-wrap sm:gap-2 sm:mt-1 sm:text-xs">
                        {song.genre && (
                          <>
                            <span className="truncate">{song.genre}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{song.year}</span>
                        <span>•</span>
                        <span>{song.plays} reproducciones</span>
                        {song.fileName && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 truncate">{song.fileName}</span>
                          </>
                        )}
                        {song.dedication && (
                          <>
                            <span>•</span>
                            <span className="text-pink-500 flex items-center gap-0.5 sm:gap-1">
                              <MessageCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              Dedicatoria
                            </span>
                          </>
                        )}
                        {/* Indicador de canción recientemente actualizada */}
                        {recentlyUpdatedSong === song.id && (
                          <>
                            <span>•</span>
                            <span className="text-green-500 flex items-center gap-0.5 animate-pulse sm:gap-1">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full sm:w-2 sm:h-2"></div>
                              Actualizada
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* UX: Controles con áreas táctiles mínimas (44x44px en móvil) */}
                    <div className="flex items-center gap-1 flex-shrink-0 sm:gap-1.5 md:gap-2">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs md:text-sm">{song.duration}</span>
                      {/* Botón de edición */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditSongModal(song)
                        }}
                        className="h-10 w-10 p-0 text-green-500 hover:text-green-600 hover:bg-green-50 active:scale-95 dark:hover:bg-green-900/20 transition-colors edit-button rounded-full min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0"
                        title="Editar canción"
                        aria-label="Editar canción"
                      >
                        <Upload className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
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
                          className="h-10 w-10 p-0 text-blue-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 dark:hover:bg-blue-900/20 transition-colors dedication-button rounded-full min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0"
                          title="Ver dedicatoria"
                          aria-label="Ver dedicatoria"
                        >
                          <MessageCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(song.id)
                        }}
                        className={`h-10 w-10 p-0 transition-all duration-200 rounded-full active:scale-95 min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0 ${
                          song.isFavorite 
                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                            : 'text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        aria-label={song.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <Heart className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${song.isFavorite ? 'fill-current animate-pulse' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSong(song.id)
                        }}
                        className="h-10 w-10 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-95 dark:hover:bg-red-900/20 transition-colors rounded-full min-h-[44px] min-w-[44px] sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0"
                        aria-label="Eliminar canción"
                      >
                        <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
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
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-0 rounded-xl shadow-2xl sm:rounded-2xl" style={{ 
          paddingTop: 'max(env(safe-area-inset-top), 1rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)'
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
              <div>
                <Label htmlFor="album" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Álbum</Label>
                <Input 
                  id="album" 
                  name="album" 
                  value={formData.album}
                  onChange={handleInputChange}
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-lg min-h-[44px] text-[13px] sm:rounded-xl sm:text-sm md:text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div>
                <Label htmlFor="genre" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Género</Label>
                <Input 
                  id="genre" 
                  name="genre" 
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-lg min-h-[44px] text-[13px] sm:rounded-xl sm:text-sm md:text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div>
                <Label htmlFor="year" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Año</Label>
                <Input 
                  id="year" 
                  name="year" 
                  type="number" 
                  min="1900" 
                  max={new Date().getFullYear()}
                  value={formData.year}
                  onChange={handleInputChange}
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
                  {selectedDedication.cover && selectedDedication.cover !== '/api/placeholder/200/200' ? (
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
        <DialogContent className="max-w-2xl edit-modal bg-white dark:bg-gray-800 border-0 rounded-xl shadow-2xl sm:rounded-2xl" style={{ 
          paddingTop: 'max(env(safe-area-inset-top), 1rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)'
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
                <div>
                  <Label htmlFor="edit-album" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Álbum</Label>
                  <Input
                    id="edit-album"
                    name="album"
                    value={editFormData.album}
                    onChange={handleEditInputChange}
                    className="file-input-hover edit-form-input border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-lg min-h-[44px] text-[13px] sm:rounded-md sm:text-sm md:text-base"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-genre" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Género</Label>
                  <Input
                    id="edit-genre"
                    name="genre"
                    value={editFormData.genre}
                    onChange={handleEditInputChange}
                    className="file-input-hover edit-form-input border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 rounded-lg min-h-[44px] text-[13px] sm:rounded-md sm:text-sm md:text-base"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-year" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:text-sm sm:mb-2">Año</Label>
                  <Input
                    id="edit-year"
                    name="year"
                    value={editFormData.year}
                    onChange={handleEditInputChange}
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
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
