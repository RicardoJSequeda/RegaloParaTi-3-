'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Plus, 
  Edit, 
  Trash2, 
  Film,
  Image as ImageIcon,
  MoreVertical,
  Tv,
  Upload,
  X,
  Heart,
  Check,
  Clock,
  Eye
} from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { uploadPublicFile } from '@/lib/supabase/storage'
import { Movie, MovieForm } from '@/features/movies/types'

const genres = [
  { value: 'romantico', label: 'Romántico', icon: '💕', color: 'bg-pink-100 text-pink-800' },
  { value: 'accion', label: 'Acción', icon: '💥', color: 'bg-red-100 text-red-800' },
  { value: 'comedia', label: 'Comedia', icon: '😂', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'drama', label: 'Drama', icon: '🎭', color: 'bg-purple-100 text-purple-800' },
  { value: 'terror', label: 'Terror', icon: '👻', color: 'bg-gray-100 text-gray-800' },
  { value: 'ciencia_ficcion', label: 'Ciencia Ficción', icon: '🚀', color: 'bg-blue-100 text-blue-800' },
  { value: 'fantasia', label: 'Fantasía', icon: '🧙‍♀️', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'thriller', label: 'Thriller', icon: '😱', color: 'bg-orange-100 text-orange-800' },
  { value: 'animacion', label: 'Animación', icon: '🎨', color: 'bg-green-100 text-green-800' },
  { value: 'documental', label: 'Documental', icon: '📚', color: 'bg-teal-100 text-teal-800' },
  { value: 'biografico', label: 'Biográfico', icon: '👤', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'historico', label: 'Histórico', icon: '🏛️', color: 'bg-amber-100 text-amber-800' },
  { value: 'musical', label: 'Musical', icon: '🎵', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'western', label: 'Western', icon: '🤠', color: 'bg-orange-100 text-orange-800' },
  { value: 'policial', label: 'Policial', icon: '🚔', color: 'bg-blue-100 text-blue-800' },
  { value: 'misterio', label: 'Misterio', icon: '🔍', color: 'bg-gray-100 text-gray-800' },
  { value: 'aventura', label: 'Aventura', icon: '🗺️', color: 'bg-green-100 text-green-800' },
  { value: 'otro', label: 'Otro', icon: '🎬', color: 'bg-slate-100 text-slate-800' }
]

export function PeliculasSection() {
  const supabase = getBrowserClient()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)


  // Estado del formulario
  const [movieForm, setMovieForm] = useState<MovieForm>({
    title: '',
    description: '',
    type: 'pelicula',
    genre: 'romantico',
    image: '',
    watchLink: '',
    season: undefined,
    episode: undefined,
    status: 'pendiente',
    isFavorite: false
  })

  // Estados para carga de imágenes
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Cargar películas desde Supabase
  useEffect(() => {
    loadMovies()
  }, [])

  const loadMovies = async () => {
    try {
      setLoading(true)
      console.log('🔄 Cargando películas desde Supabase...')
      
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading movies:', error)
        alert(`Error al cargar películas: ${error.message}`)
        return
      }

      console.log('✅ Películas cargadas:', data?.length || 0, 'registros')
      console.log('📊 Datos:', data)
      
      setMovies(data || [])
    } catch (error) {
      console.error('❌ Error loading movies:', error)
      alert(`Error inesperado: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // Suscripción en tiempo real con throttle
  useEffect(() => {
    let lastUpdate = 0
    const throttleDelay = 1000 // 1 segundo
    
    const channel = supabase
      .channel('movies_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'movies' }, 
        () => {
          const now = Date.now()
          if (now - lastUpdate > throttleDelay) {
            lastUpdate = now
            loadMovies()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Todas las películas sin filtros
  const filteredMovies = movies

  // Agrupar por estado (memoizado)
  const peliculasVistas = useMemo(() => filteredMovies.filter(m => m.status === 'visto'), [filteredMovies])
  const peliculasPendientes = useMemo(() => filteredMovies.filter(m => m.status === 'pendiente'), [filteredMovies])
  const peliculasEnProgreso = useMemo(() => filteredMovies.filter(m => m.status === 'en_progreso'), [filteredMovies])
  const peliculasFavoritas = useMemo(() => filteredMovies.filter(m => m.isFavorite), [filteredMovies])

  // Agrupar por tipo (memoizado)
  const peliculas = useMemo(() => filteredMovies.filter(m => m.type === 'pelicula'), [filteredMovies])
  const series = useMemo(() => filteredMovies.filter(m => m.type === 'serie'), [filteredMovies])

  // Funciones para manejar imágenes
  const handleImageUpload = (file: File) => {
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setMovieForm(prev => ({ ...prev, image: '' }))
  }

  // Funciones para modales
  const openAddModal = useCallback(() => {
    setMovieForm({
      title: '',
      description: '',
      type: 'pelicula',
      genre: 'romantico',
      image: '',
      watchLink: '',
      season: undefined,
      episode: undefined,
      status: 'pendiente',
      isFavorite: false
    })
    setImageFile(null)
    setImagePreview('')
    setShowAddModal(true)
  }, [])

  const openEditModal = useCallback((movie: Movie) => {
    setSelectedMovie(movie)
    setMovieForm({
      title: movie.title,
      description: movie.description,
      type: movie.type,
      genre: movie.genre,
      image: movie.image || '',
      watchLink: movie.watchLink || '',
      season: movie.season,
      episode: movie.episode,
      status: movie.status,
      isFavorite: movie.isFavorite
    })
    setImagePreview(movie.image || '')
    setImageFile(null)
    setShowEditModal(true)
  }, [])

  const openDeleteModal = useCallback((movie: Movie) => {
    setSelectedMovie(movie)
    setShowDeleteModal(true)
  }, [])

  // Funciones CRUD
  const handleSaveMovie = useCallback(async () => {
    if (!movieForm.title) return

    try {
      setSaving(true)
      let imageUrl = movieForm.image

      // Subir imagen si hay un archivo nuevo
      if (imageFile) {
        const uploadResult = await uploadPublicFile('movie-images', imageFile)
        if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url
        }
      }

      // Preparar datos para Supabase (snake_case)
      const movieData: any = {
        title: movieForm.title,
        description: movieForm.description || null,
        type: movieForm.type,
        genre: movieForm.genre,
        image: imageUrl || null,
        watch_link: movieForm.watchLink || null,
        season: movieForm.season || null,
        episode: movieForm.episode || null,
        status: movieForm.status,
        is_favorite: movieForm.isFavorite || false
      }

      if (showEditModal && selectedMovie) {
        // Actualizar película existente
        const { data, error } = await supabase
          .from('movies')
          .update(movieData)
          .eq('id', selectedMovie.id)
          .select()
          .single()

        if (error) {
          throw new Error(error.message || 'Error al actualizar la película')
        }

        // Actualizar estado local optimísticamente
        if (data) {
          setMovies(prev => prev.map(m => m.id === selectedMovie.id ? data as Movie : m))
        }

        setShowEditModal(false)
      } else {
        // Crear nueva película
        const { data, error } = await supabase
          .from('movies')
          .insert([movieData])
          .select()
          .single()

        if (error) {
          throw new Error(error.message || 'Error al crear la película')
        }

        // Agregar al estado local optimísticamente
        if (data) {
          setMovies(prev => [data as Movie, ...prev])
        }

        setShowAddModal(false)
      }

      // Limpiar formulario
      setMovieForm({
        title: '',
        description: '',
        type: 'pelicula',
        genre: 'romantico',
        image: '',
        watchLink: '',
        season: undefined,
        episode: undefined,
        status: 'pendiente',
        isFavorite: false
      })
      setImageFile(null)
      setImagePreview('')
    } catch (error) {
      console.error('Error saving movie:', error)
      alert(error instanceof Error ? error.message : 'Error al guardar la película')
      // Recargar en caso de error
      await loadMovies()
    } finally {
      setSaving(false)
    }
  }, [movieForm, imageFile, showEditModal, selectedMovie, supabase, loadMovies])

  const handleDeleteMovie = useCallback(async () => {
    if (!selectedMovie) return

    try {
      setSaving(true)
      
      // Eliminar de Supabase
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', selectedMovie.id)

      if (error) {
        throw new Error(error.message || 'Error al eliminar la película')
      }

      // Actualizar estado local optimísticamente
      setMovies(prev => prev.filter(m => m.id !== selectedMovie.id))

      setShowDeleteModal(false)
      setSelectedMovie(null)
    } catch (error) {
      console.error('Error deleting movie:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar la película')
      // Recargar en caso de error
      await loadMovies()
    } finally {
      setSaving(false)
    }
  }, [selectedMovie, supabase, loadMovies])

  const getGenreIcon = useCallback((genre: string) => {
    return genres.find(g => g.value === genre)?.icon || '🎬'
  }, [])

  const getGenreColor = useCallback((genre: string) => {
    return genres.find(g => g.value === genre)?.color || 'bg-gray-100 text-gray-800'
  }, [])

  // Funciones para cambiar estado
  const toggleFavorite = useCallback(async (movieId: string) => {
    try {
      const movie = movies.find(m => m.id === movieId)
      if (!movie) return

      // Actualización optimista
      setMovies(prev => prev.map(m => 
        m.id === movieId ? { ...m, isFavorite: !m.isFavorite } : m
      ))

      // Actualizar en Supabase
      const { error } = await supabase
        .from('movies')
        .update({ is_favorite: !movie.isFavorite })
        .eq('id', movieId)

      if (error) {
        // Revertir en caso de error
        setMovies(prev => prev.map(m => 
          m.id === movieId ? { ...m, isFavorite: movie.isFavorite } : m
        ))
        throw new Error('Error al actualizar favorito')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Error al actualizar favorito')
    }
  }, [movies, supabase])

  const changeStatus = useCallback(async (movieId: string, newStatus: Movie['status']) => {
    try {
      const movie = movies.find(m => m.id === movieId)
      if (!movie) return

      // Actualización optimista
      setMovies(prev => prev.map(m => 
        m.id === movieId ? { ...m, status: newStatus } : m
      ))

      // Actualizar en Supabase
      const { error } = await supabase
        .from('movies')
        .update({ status: newStatus })
        .eq('id', movieId)

      if (error) {
        // Revertir en caso de error
        setMovies(prev => prev.map(m => 
          m.id === movieId ? { ...m, status: movie.status } : m
        ))
        throw new Error('Error al cambiar estado')
      }
    } catch (error) {
      console.error('Error changing status:', error)
      alert('Error al cambiar el estado')
    }
  }, [movies, supabase])

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <div className="relative group">
      <Card className="movie-card overflow-hidden min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl">
        <CardContent className="p-0 h-full">
          <div className="movie-card-content relative w-full min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] flex flex-col">
            {/* Background Image with Enhanced Overlay */}
            {movie.image ? (
              <>
                <div className="absolute inset-0 z-0">
                  <img 
                    src={movie.image} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-0" />
              </>
            ) : (
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Film className="h-14 w-14 sm:h-16 sm:w-16 mx-auto mb-3 opacity-50" />
                  <p className="text-sm sm:text-sm">Sin imagen</p>
                </div>
              </div>
            )}
            
            {/* Top Section - Status and Favorite */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between">
              {/* Status Badge */}
              <Badge className={`text-[clamp(0.7rem,2vw,0.75rem)] font-semibold px-2.5 sm:px-3 py-1.5 shadow-lg backdrop-blur-sm border border-black/20 ${
                movie.status === 'visto' ? 'bg-emerald-500/90 text-white shadow-emerald-500/30' :
                movie.status === 'en_progreso' ? 'bg-blue-500/90 text-white shadow-blue-500/30' :
                movie.status === 'pendiente' ? 'bg-amber-500/90 text-white shadow-amber-500/30' : 
                'bg-purple-500/90 text-white shadow-purple-500/30'
              }`}>
                {movie.status === 'visto' ? '✓ Visto' :
                 movie.status === 'en_progreso' ? '▶ En Progreso' :
                 movie.status === 'pendiente' ? '⏳ Pendiente' : '⭐ Favorito'}
              </Badge>

              {/* Favorite Button */}
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-all duration-300 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(movie.id)
                }}
                aria-label={movie.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart className={`h-4 w-4 transition-all duration-300 ${movie.isFavorite ? 'fill-current text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Bottom Section - Content and Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white z-20 mt-auto">
              {/* Title */}
              <h3 className="text-[clamp(1.1rem,3vw,1.4rem)] font-bold line-clamp-2 mb-3 leading-tight text-shadow-lg">
                {movie.title}
              </h3>

              {/* Series Progress Info */}
              {movie.type === 'serie' && movie.season && movie.episode && (
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-[clamp(0.7rem,2vw,0.75rem)] text-white border-white/40 bg-white/10 backdrop-blur-sm px-2.5 py-1">
                    S{movie.season} • E{movie.episode}
                  </Badge>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Change Buttons */}
                {movie.status === 'pendiente' && (
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-8 px-3 text-xs shadow-md hover:shadow-blue-500/30 transition-all duration-300 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation()
                      changeStatus(movie.id, movie.type === 'serie' ? 'en_progreso' : 'visto')
                    }}
                    aria-label={movie.type === 'serie' ? 'Marcar en progreso' : 'Marcar como visto'}
                  >
                    {movie.type === 'serie' ? (
                      <>
                        <Play className="h-3 w-3 mr-1.5" />
                        Progreso
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1.5" />
                        Visto
                      </>
                    )}
                  </Button>
                )}

                {movie.status === 'en_progreso' && (
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-8 px-3 text-xs shadow-md hover:shadow-emerald-500/30 transition-all duration-300 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation()
                      changeStatus(movie.id, 'visto')
                    }}
                    aria-label="Marcar como visto"
                  >
                    <Check className="h-3 w-3 mr-1.5" />
                    Visto
                  </Button>
                )}

                {movie.status === 'visto' && (
                  <Button 
                    size="sm" 
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium h-8 px-3 text-xs shadow-md hover:shadow-amber-500/30 transition-all duration-300 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation()
                      changeStatus(movie.id, 'pendiente')
                    }}
                    aria-label="Marcar como pendiente"
                  >
                    <Clock className="h-3 w-3 mr-1.5" />
                    Pendiente
                  </Button>
                )}

                {/* Edit and Delete Buttons */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-all duration-300 active:scale-95 hover:bg-blue-500/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(movie)
                    }}
                    aria-label="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-all duration-300 active:scale-95 hover:bg-red-500/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      openDeleteModal(movie)
                    }}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Film className="h-8 w-8 text-primary" />
            Nuestro Cine de Amor
          </h1>
          <p className="text-muted-foreground">
            Descubre, comparte y disfruta juntos las mejores películas y series
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando películas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-0 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-3 px-4 sm:px-2">
        <h1 className="text-[clamp(1.8rem,6vw,2.5rem)] font-bold text-gray-900 dark:text-white flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3">
          <Film className="h-9 w-9 sm:h-10 sm:w-10 text-primary" />
          Nuestro Cine de Amor
        </h1>
        <p className="text-[clamp(1rem,3.5vw,1.1rem)] text-gray-600 dark:text-gray-300 max-w-full sm:max-w-2xl mx-auto px-2">
          Descubre, comparte y disfruta juntos las mejores películas y series
        </p>
      </div>

      <Separator />


      {/* Botón de Agregar */}
      <div className="flex justify-end px-4 sm:px-0">
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium px-4 sm:px-4 py-2.5 sm:py-2.5 shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 rounded-full text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>

      {/* Contenido Principal Mejorado */}
      <Tabs defaultValue="pendientes" className="w-full px-4 sm:px-0">
        <TabsList className="grid w-full grid-cols-4 gap-1.5 sm:gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 sm:p-2 rounded-lg">
          <TabsTrigger 
            value="vistas" 
            className="text-[clamp(0.7rem,2vw,0.75rem)] sm:text-xs font-medium px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-semibold">{peliculasVistas.length}</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="en_progreso" 
            className="text-[clamp(0.7rem,2vw,0.75rem)] sm:text-xs font-medium px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-semibold">{peliculasEnProgreso.length}</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="pendientes" 
            className="text-[clamp(0.7rem,2vw,0.75rem)] sm:text-xs font-medium px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-semibold">{peliculasPendientes.length}</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="favoritas" 
            className="text-[clamp(0.7rem,2vw,0.75rem)] sm:text-xs font-medium px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-semibold">{peliculasFavoritas.length}</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vistas" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 px-4 sm:px-0">
            {peliculasVistas.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="en_progreso" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 px-4 sm:px-0">
            {peliculasEnProgreso.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pendientes" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 px-4 sm:px-0">
            {peliculasPendientes.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favoritas" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 px-4 sm:px-0">
            {peliculasFavoritas.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal para Agregar/Editar Película */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={() => {
        setShowAddModal(false)
        setShowEditModal(false)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              {showEditModal ? 'Editar Película/Serie' : 'Agregar Nueva Película/Serie'}
            </DialogTitle>
            <DialogDescription>
              Comparte tu próxima película o serie favorita
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <Input
                  value={movieForm.title}
                  onChange={(e) => setMovieForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: La La Land"
                  className="min-h-[44px]"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <Select value={movieForm.type} onValueChange={(value: 'pelicula' | 'serie') => setMovieForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pelicula">🎬 Película</SelectItem>
                    <SelectItem value="serie">📺 Serie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Género y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género *
                </label>
                <Select value={movieForm.genre} onValueChange={(value: Movie['genre']) => setMovieForm(prev => ({ ...prev, genre: value }))}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map(genre => (
                      <SelectItem key={genre.value} value={genre.value}>
                        {genre.icon} {genre.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <Select value={movieForm.status} onValueChange={(value: Movie['status']) => setMovieForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
                    <SelectItem value="en_progreso">▶️ En Progreso</SelectItem>
                    <SelectItem value="visto">✅ Visto</SelectItem>
                    <SelectItem value="favorito">⭐ Favorito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Información de series */}
            {movieForm.type === 'serie' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temporada
                  </label>
                  <Input
                    type="number"
                    value={movieForm.season || ''}
                    onChange={(e) => setMovieForm(prev => ({ ...prev, season: parseInt(e.target.value) || undefined }))}
                    min="1"
                    placeholder="1"
                    className="min-h-[44px]"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Episodio
                  </label>
                  <Input
                    type="number"
                    value={movieForm.episode || ''}
                    onChange={(e) => setMovieForm(prev => ({ ...prev, episode: parseInt(e.target.value) || undefined }))}
                    min="1"
                    placeholder="1"
                    className="min-h-[44px]"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
            )}

            {/* Imagen de Portada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <ImageIcon className="inline h-4 w-4 mr-1" />
                Imagen de Portada
              </label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                  className="cursor-pointer min-h-[44px]"
                />
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 min-h-[44px] min-w-[44px] p-0 active:scale-95 transition-transform"
                      onClick={removeImage}
                      aria-label="Eliminar imagen"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveMovie}
              disabled={!movieForm.title || saving}
              className="bg-primary hover:bg-primary/90 min-h-[44px] active:scale-95 transition-transform"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
              <Plus className="h-4 w-4 mr-2" />
              Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Eliminar Película/Serie
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar &quot;{selectedMovie?.title}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteMovie}
              disabled={saving}
              className="bg-red-500 hover:bg-red-600"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


