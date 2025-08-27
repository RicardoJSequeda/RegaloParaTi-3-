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
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Nuestras Canciones</h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Las canciones que cuentan nuestra historia de amor
        </p>
      </div>

      {/* Estadísticas */}
      <div className="flex overflow-x-auto gap-3 pb-2 px-4 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 scroll-horizontal">
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl flex-shrink-0 sm:flex-shrink min-w-[200px] sm:min-w-0 hover:shadow-xl transition-all duration-300 stats-card">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-pink-600 stats-number">{playlist.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Canciones</div>
            <div className="text-xs text-pink-400 mt-1 stats-subtitle">En tu biblioteca</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl flex-shrink-0 sm:flex-shrink min-w-[200px] sm:min-w-0 hover:shadow-xl transition-all duration-300 stats-card">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 stats-number">
              {calculateTotalFavorites(playlist)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Favoritas</div>
            <div className="text-xs text-purple-400 mt-1 stats-subtitle">Con ❤️ especial</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl flex-shrink-0 sm:flex-shrink min-w-[200px] sm:min-w-0 hover:shadow-xl transition-all duration-300 stats-card">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 stats-number">
              {calculateTotalDuration(playlist)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Duración Total</div>
            <div className="text-xs text-blue-400 mt-1 stats-subtitle">De música y amor</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl flex-shrink-0 sm:flex-shrink min-w-[200px] sm:min-w-0 hover:shadow-xl transition-all duration-300 stats-card">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 stats-number">
              {calculateTotalPlays(playlist)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Reproducciones</div>
            <div className="text-xs text-green-400 mt-1 stats-subtitle">Momentos compartidos</div>
          </CardContent>
        </Card>
      </div>

      {/* Reproductor Global Info */}
      {currentSong && (
        <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden ring-2 ring-white/20 song-cover flex-shrink-0 ${
                isActuallyPlaying ? 'animate-spin song-cover-playing' : ''
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
                  <div className="w-full h-full bg-white/20 flex items-center justify-center">
                    <Music className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-lg sm:text-xl">{currentSong.title}</h3>
                <p className="text-white/80 text-sm sm:text-base">{currentSong.artist}</p>
                <p className="text-sm text-white/60">{currentSong.album}</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white text-xs sm:text-sm px-3 py-1 rounded-full">
                Reproduciendo Globalmente
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playlist */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Nuestra Playlist</CardTitle>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                {playlist.length} canciones • {calculateTotalDuration(playlist)} de duración
              </p>
            </div>
            <Button
              onClick={openAddSongModal}
              className="bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-full w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Canción
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
            <div className="h-80 sm:h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-gray-100 hover:scrollbar-thumb-pink-400">
              <div className="space-y-3 pr-2">
                {playlist.map((song, index) => (
                  <div
                    key={song.id}
                    className={`group flex items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur border border-transparent hover:border-pink-200 hover:bg-white dark:hover:bg-gray-700 shadow-sm hover:shadow-md song-item ${
                    currentSong?.id === song.id ? 'ring-2 ring-pink-300 bg-pink-50 dark:bg-pink-900/20' : ''
                    }`}
                    onClick={() => selectSong(song)}
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center text-white font-bold text-sm relative flex-shrink-0 overflow-hidden ring-1 ring-black/5 song-cover ${
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
                          <span className="text-lg font-bold">{index + 1}</span>
                  </div>
                )}
                    {currentSong?.id === song.id && isActuallyPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                      )}
                </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-pink-700 transition-colors text-sm sm:text-base">
                        {song.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{song.artist}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                  <span className="truncate">{song.genre}</span>
                  <span>•</span>
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
                      <span className="text-pink-500 flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        Dedicatoria
                      </span>
                    </>
                  )}
                  {/* Indicador de canción recientemente actualizada */}
                  {recentlyUpdatedSong === song.id && (
                    <>
                      <span>•</span>
                      <span className="text-green-500 flex items-center gap-1 animate-pulse">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Actualizada
                      </span>
                    </>
                  )}
                </div>
              </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{song.duration}</span>
                        {/* Botón de edición */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditSongModal(song)
                          }}
                          className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors edit-button rounded-full"
                          title="Editar canción"
                        >
                          <Upload className="h-4 w-4" />
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
                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors dedication-button rounded-full"
                            title="Ver dedicatoria"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(song.id)
                          }}
                          className={`h-8 w-8 p-0 transition-all duration-200 rounded-full ${
                            song.isFavorite 
                              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                              : 'text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${song.isFavorite ? 'fill-current animate-pulse' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSong(song.id)
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                  </div>
                ))}
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Modal para agregar canción */}
      <Dialog open={showAddSongModal} onOpenChange={(open) => {
        if (!open) {
          clearForm()
        }
        setShowAddSongModal(open)
      }}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-0 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Agregar Nueva Canción
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Título *</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title}
                  onChange={handleInputChange}
                  required 
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="artist" className="text-sm font-medium text-gray-700 dark:text-gray-300">Artista *</Label>
                <Input 
                  id="artist" 
                  name="artist" 
                  value={formData.artist}
                  onChange={handleInputChange}
                  required 
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="album" className="text-sm font-medium text-gray-700 dark:text-gray-300">Álbum</Label>
                <Input 
                  id="album" 
                  name="album" 
                  value={formData.album}
                  onChange={handleInputChange}
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="genre" className="text-sm font-medium text-gray-700 dark:text-gray-300">Género</Label>
                <Input 
                  id="genre" 
                  name="genre" 
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="year" className="text-sm font-medium text-gray-700 dark:text-gray-300">Año</Label>
                <Input 
                  id="year" 
                  name="year" 
                  type="number" 
                  min="1900" 
                  max={new Date().getFullYear()}
                  value={formData.year}
                  onChange={handleInputChange}
                  className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dedication" className="text-sm font-medium text-gray-700 dark:text-gray-300">Dedicatoria</Label>
              <Input 
                id="dedication" 
                name="dedication" 
                placeholder="¿Por qué es especial esta canción?"
                value={formData.dedication}
                onChange={handleInputChange}
                className="border-gray-300 dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 rounded-xl"
              />
            </div>
            
            {/* Archivos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="audio" className="text-sm font-medium text-gray-700 dark:text-gray-300">Archivo de Audio *</Label>
                <input
                  id="audio"
                  name="audio"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioSelect}
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-pink-400 transition-colors file-input-hover bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {/* Preview del archivo de audio */}
                {audioPreview && (
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl upload-preview">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Music className="h-4 w-4" />
                      <span className="text-sm font-medium">{audioPreview}</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="cover" className="text-sm font-medium text-gray-700 dark:text-gray-300">Portada (opcional)</Label>
                <input
                  id="cover"
                  name="cover"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:border-pink-400 transition-colors file-input-hover bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {/* Preview de la portada */}
                {coverPreview && (
                  <div className="mt-2">
                    <img 
                      src={coverPreview} 
                      alt="Preview de portada" 
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Barra de progreso */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subiendo canción...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddSongModal(false)
                  clearForm()
                }}
                disabled={isUploading}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-pink-500 hover:bg-pink-600 rounded-xl"
              >
                {isUploading ? 'Subiendo...' : 'Agregar Canción'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para mostrar dedicatoria */}
      <Dialog open={showDedicationModal} onOpenChange={setShowDedicationModal}>
        <DialogContent className="max-w-md dedication-modal bg-white dark:bg-gray-800 border-0 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white text-center">
              💝 Dedicatoria Especial
            </DialogTitle>
          </DialogHeader>
          {selectedDedication && (
            <div className="space-y-4">
              {/* Portada y información */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden ring-2 ring-pink-200 flex-shrink-0">
                  {selectedDedication.cover && selectedDedication.cover !== '/api/placeholder/200/200' ? (
                    <img 
                      src={selectedDedication.cover} 
                      alt={`Portada de ${selectedDedication.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      🎵
                  </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{selectedDedication.title}</h3>
                  <p className="text-sm text-gray-600">{selectedDedication.artist}</p>
            </div>
          </div>

              {/* Dedicatoria */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💌</div>
                <div>
                    <h4 className="font-medium text-gray-800 mb-2">¿Por qué es especial esta canción?</h4>
                    <p className="text-gray-700 leading-relaxed italic">
                      "{selectedDedication.dedication}"
                    </p>
                </div>
                </div>
              </div>

              {/* Botón de cerrar */}
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowDedicationModal(false)}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para editar canción */}
      <Dialog open={showEditSongModal} onOpenChange={setShowEditSongModal}>
        <DialogContent className="max-w-2xl edit-modal bg-white dark:bg-gray-800 border-0 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white text-center">
              ✏️ Editar Canción
            </DialogTitle>
          </DialogHeader>
          {editingSong && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Título *</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditInputChange}
                    required
                    className="file-input-hover edit-form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-artist">Artista *</Label>
                  <Input
                    id="edit-artist"
                    name="artist"
                    value={editFormData.artist}
                    onChange={handleEditInputChange}
                    required
                    className="file-input-hover edit-form-input"
                  />
              </div>
                <div>
                  <Label htmlFor="edit-album">Álbum</Label>
                  <Input
                    id="edit-album"
                    name="album"
                    value={editFormData.album}
                    onChange={handleEditInputChange}
                    className="file-input-hover edit-form-input"
                  />
            </div>
                <div>
                  <Label htmlFor="edit-genre">Género</Label>
                  <Input
                    id="edit-genre"
                    name="genre"
                    value={editFormData.genre}
                    onChange={handleEditInputChange}
                    className="file-input-hover edit-form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-year">Año</Label>
                  <Input
                    id="edit-year"
                    name="year"
                    value={editFormData.year}
                    onChange={handleEditInputChange}
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="file-input-hover edit-form-input"
                  />
                </div>
              </div>

              {/* Dedicatoria */}
              <div>
                <Label htmlFor="edit-dedication">Dedicatoria</Label>
                <textarea
                  id="edit-dedication"
                  name="dedication"
                  value={editFormData.dedication}
                  onChange={handleEditInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md hover:border-green-400 transition-colors file-input-hover edit-form-input resize-none"
                  placeholder="¿Por qué es especial esta canción para ti?"
                />
              </div>

              {/* Archivos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-audio">Archivo de Audio (opcional)</Label>
                  <input
                    id="edit-audio"
                    name="audio"
                    type="file"
                    accept="audio/*"
                    onChange={handleEditAudioSelect}
                    className="w-full p-2 border border-gray-300 rounded-md hover:border-green-400 transition-colors file-input-hover"
                  />
                  {editAudioPreview && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md upload-preview">
                      <div className="flex items-center gap-2 text-green-700">
                  <Music className="h-4 w-4" />
                        <span className="text-sm font-medium">{editAudioPreview}</span>
              </div>
              </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Solo sube un nuevo archivo si quieres reemplazar el actual
                  </p>
            </div>
                <div>
                  <Label htmlFor="edit-cover">Portada (opcional)</Label>
                  <input
                    id="edit-cover"
                    name="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleEditCoverSelect}
                    className="w-full p-2 border border-gray-300 rounded-md hover:border-green-400 transition-colors file-input-hover"
                  />
                  {editCoverPreview && (
                    <div className="mt-2">
                      <img 
                        src={editCoverPreview} 
                        alt="Preview de nueva portada" 
                        className="w-20 h-20 object-cover rounded-md border border-gray-200"
                      />
                        </div>
                      )}
                  <p className="text-xs text-gray-500 mt-1">
                    Solo sube una nueva imagen si quieres reemplazar la actual
                  </p>
                        </div>
                    </div>

              {/* Progreso de upload */}
              {isEditUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Actualizando canción...</span>
                    <span>{editUploadProgress}%</span>
                      </div>
                  <Progress value={editUploadProgress} className="h-2 progress-animate" />
                    </div>
              )}

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                      <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditSongModal(false)
                    clearEditForm()
                  }}
                  disabled={isEditUploading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600"
                  disabled={isEditUploading}
                >
                  {isEditUploading ? 'Actualizando...' : 'Actualizar Canción'}
                      </Button>
                    </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Notificación de éxito */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg success-notification">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full notification-pulse"></div>
            <span className="font-medium">{successMessage}</span>
              </div>
            </div>
      )}
    </div>
  )
}
