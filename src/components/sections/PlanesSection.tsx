'use client'

import { useState, useEffect } from 'react'
import { Plan } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { FileUpload } from '@/components/ui/file-upload'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useReminders } from '@/hooks/useReminders'
import { useAchievements } from '@/hooks/useAchievements'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Tag, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  PlayCircle,
  Filter,
  Search,
  Heart,
  Mountain,
  Utensils,
  BookOpen,
  Coffee,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  CalendarDays,
  Bell,
  Trophy,
  Star,
  Target,
  Award,
  X
} from 'lucide-react'

const defaultPlans: Plan[] = [
  {
    id: 1,
    title: 'Cena Romántica en el Techo',
    description: 'Una cena especial bajo las estrellas con vista a la ciudad',
    date: '2024-02-14',
    time: '20:00',
    location: 'Restaurante La Terraza',
    status: 'pendiente',
    tags: ['romántico', 'cena', 'especial'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    title: 'Escalada en Montaña',
    description: 'Aventura de escalada en las montañas cercanas',
    date: '2024-03-10',
    time: '08:00',
    location: 'Parque Nacional',
    status: 'pendiente',
    tags: ['aventura', 'naturaleza', 'deporte'],
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 3,
    title: 'Tour Gastronómico',
    description: 'Recorrido por los mejores restaurantes de la ciudad',
    date: '2024-02-28',
    time: '19:00',
    location: 'Centro Histórico',
    status: 'completado',
    tags: ['gastronomía', 'cultura', 'diversión'],
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-02-28T22:00:00Z'
  },
  {
    id: 4,
    title: 'Visita al Museo de Arte Moderno',
    description: 'Explorar las exposiciones más recientes del museo',
    date: '2024-03-15',
    time: '14:00',
    location: 'Museo de Arte Moderno',
    status: 'pendiente',
    tags: ['cultura', 'arte', 'educación'],
    createdAt: '2024-02-01T11:20:00Z',
    updatedAt: '2024-02-01T11:20:00Z'
  },
  {
    id: 5,
    title: 'Spa Day Relajante',
    description: 'Día completo de masajes y tratamientos spa',
    date: '2024-03-20',
    time: '10:00',
    location: 'Spa & Wellness Center',
    status: 'en_progreso',
    tags: ['relax', 'bienestar', 'especial'],
    createdAt: '2024-01-25T16:45:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  },
  {
    id: 6,
    title: 'Concierto al Aire Libre',
    description: 'Concierto de música clásica en el parque',
    date: '2024-04-05',
    time: '18:30',
    location: 'Parque Central',
    status: 'pendiente',
    tags: ['música', 'cultura', 'aire libre'],
    createdAt: '2024-02-05T09:30:00Z',
    updatedAt: '2024-02-05T09:30:00Z'
  },
  {
    id: 7,
    title: 'Cocina Casera Italiana',
    description: 'Preparar pasta y pizza casera juntos',
    date: '2024-03-08',
    time: '17:00',
    location: 'Casa',
    status: 'completado',
    tags: ['cocina', 'romántico', 'casero'],
    createdAt: '2024-02-10T13:15:00Z',
    updatedAt: '2024-03-08T21:00:00Z'
  },
  {
    id: 8,
    title: 'Paseo en Bicicleta por la Ciudad',
    description: 'Recorrer los lugares más bonitos de la ciudad en bicicleta',
    date: '2024-03-25',
    time: '09:00',
    location: 'Centro de la Ciudad',
    status: 'pendiente',
    tags: ['deporte', 'aire libre', 'ciudad'],
    createdAt: '2024-02-15T10:45:00Z',
    updatedAt: '2024-02-15T10:45:00Z'
  },
  {
    id: 9,
    title: 'Noche de Juegos de Mesa',
    description: 'Jugar juegos de mesa románticos y divertidos',
    date: '2024-03-12',
    time: '19:00',
    location: 'Casa',
    status: 'pendiente',
    tags: ['diversión', 'casero', 'romántico'],
    createdAt: '2024-02-20T14:20:00Z',
    updatedAt: '2024-02-20T14:20:00Z'
  },
  {
    id: 10,
    title: 'Viaje de Fin de Semana a la Playa',
    description: 'Escapada romántica de fin de semana a la playa',
    date: '2024-04-12',
    time: '08:00',
    location: 'Playa del Carmen',
    status: 'pendiente',
    tags: ['viaje', 'playa', 'romántico', 'escapada'],
    createdAt: '2024-02-25T12:00:00Z',
    updatedAt: '2024-02-25T12:00:00Z'
  }
]





const statuses = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-gray-100 text-gray-800' },
  { value: 'en_progreso', label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
  { value: 'completado', label: 'Completado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
]

// Predefined tags for plans
const predefinedTags = [
  'romántico', 'especial', 'cita', 'viaje', 'playa', 'montaña', 'restaurante',
  'cena', 'desayuno', 'naturaleza', 'ciudad', 'familia', 'amigos', 'mascota',
  'deportes', 'música', 'arte', 'cultura', 'historia', 'aventura', 'relax',
  'celebración', 'aniversario', 'cumpleaños', 'navidad', 'halloween', 'verano',
  'invierno', 'primavera', 'otoño', 'noche', 'amanecer', 'atardecer', 'lluvia',
  'nieve', 'sol', 'luna', 'estrellas', 'flores', 'árboles', 'mar', 'río',
  'cascada', 'desierto', 'bosque', 'parque', 'museo', 'teatro', 'cine',
  'shopping', 'café', 'bar', 'club', 'gimnasio', 'yoga', 'meditación',
  'fotografía', 'video', 'dibujo', 'pintura', 'escultura', 'literatura',
  'poesía', 'baile', 'canto', 'instrumento', 'cocina', 'horneado', 'jardinería',
  'manualidades', 'coleccionismo', 'juegos', 'puzzles', 'rompecabezas',
  'escalada', 'senderismo', 'bicicleta', 'natación', 'tenis', 'fútbol',
  'baloncesto', 'vóley', 'golf', 'pesca', 'caza', 'camping', 'picnic',
  'barbacoa', 'fiesta', 'reunión', 'conferencia', 'taller', 'curso',
  'seminario', 'exposición', 'concierto', 'festival', 'feria', 'mercado',
  'tienda', 'centro comercial', 'galería', 'biblioteca', 'universidad',
  'escuela', 'gimnasio', 'spa', 'masaje', 'terapia', 'medicina', 'salud',
  'bienestar', 'fitness', 'nutrición', 'dieta', 'vegetariano', 'vegano',
  'orgánico', 'local', 'tradicional', 'moderno', 'vintage', 'retro',
  'clásico', 'contemporáneo', 'minimalista', 'extravagante', 'elegante',
  'casual', 'formal', 'informal', 'íntimo', 'público', 'privado',
  'gratuito', 'pagado', 'caro', 'económico', 'lujo', 'modesto'
]

export function PlanesSection() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getBrowserClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('todos')
  const [activeTab, setActiveTab] = useState('todos')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)

  // Hooks
  const { requestNotificationPermission, isNotificationSupported, getNotificationPermission } = useReminders(plans)
  const { 
    achievements, 
    recentlyUnlocked, 
    getUnlockedAchievements, 
    getProgressPercentage: getAchievementProgress 
  } = useAchievements(plans)

  // Form state
  const [planForm, setPlanForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    status: 'pendiente' as Plan['status'],
    tags: [] as string[]
  })
  const [planImage, setPlanImage] = useState<string>('')

  // Cargar planes desde Supabase
  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('date', { ascending: true })

      if (error) {
        console.error('Error loading plans:', error)
        return
      }

      setPlans(data || [])
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoading(false)
    }
  }

  // Suscripción en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('plans_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'plans' }, 
        () => {
          loadPlans()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])



  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.value === status)
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completado':
        return CheckCircle
      case 'cancelado':
        return XCircle
      case 'en_progreso':
        return PlayCircle
      default:
        return Clock
    }
  }

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.location?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'todos' || plan.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const getPlansByStatus = (status: string) => {
    if (status === 'todos') return filteredPlans
    return filteredPlans.filter(plan => plan.status === status)
  }

  const getProgressPercentage = () => {
    if (plans.length === 0) return 0
    const completed = plans.filter(plan => plan.status === 'completado').length
    return Math.round((completed / plans.length) * 100)
  }

  const getStats = () => {
    const total = plans.length
    const pending = plans.filter(plan => plan.status === 'pendiente').length
    const inProgress = plans.filter(plan => plan.status === 'en_progreso').length
    const completed = plans.filter(plan => plan.status === 'completado').length
    const cancelled = plans.filter(plan => plan.status === 'cancelado').length

    return { total, pending, inProgress, completed, cancelled }
  }

  const resetForm = () => {
    setPlanForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      status: 'pendiente',
      tags: []
    })
    setPlanImage('')
  }

  const handleCreatePlan = async () => {
    try {
      const planData = {
        title: planForm.title,
        description: planForm.description,
        date: planForm.date,
        time: planForm.time || null,
        location: planForm.location || null,
        status: planForm.status,
        image: planImage || null,
        tags: planForm.tags.length > 0 ? planForm.tags : []
      }

      const { data, error } = await supabase
        .from('plans')
        .insert([planData])
        .select()
        .single()

      if (error) {
        console.error('Error creating plan:', error)
        alert('Error al crear el plan')
        return
      }

      setShowCreateModal(false)
      resetForm()
      await loadPlans() // Recargar planes
    } catch (error) {
      console.error('Error creating plan:', error)
      alert('Error al crear el plan')
    }
  }

  const handleEditPlan = async () => {
    if (!editingPlan) return

    try {
      const planData = {
        title: planForm.title,
        description: planForm.description,
        date: planForm.date,
        time: planForm.time || null,
        location: planForm.location || null,
        status: planForm.status,
        image: planImage || null,
        tags: planForm.tags.length > 0 ? planForm.tags : []
      }

      const { data, error } = await supabase
        .from('plans')
        .update(planData)
        .eq('id', editingPlan.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating plan:', error)
        alert('Error al actualizar el plan')
        return
      }

      setShowEditModal(false)
      setEditingPlan(null)
      resetForm()
      await loadPlans() // Recargar planes
    } catch (error) {
      console.error('Error updating plan:', error)
      alert('Error al actualizar el plan')
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      try {
        const { error } = await supabase
          .from('plans')
          .delete()
          .eq('id', planId)

        if (error) {
          console.error('Error deleting plan:', error)
          alert('Error al eliminar el plan')
          return
        }

        await loadPlans() // Recargar planes
      } catch (error) {
        console.error('Error deleting plan:', error)
        alert('Error al eliminar el plan')
      }
    }
  }



  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan)
    setPlanForm({
      title: plan.title,
      description: plan.description,
      date: plan.date,
      time: plan.time || '',
      location: plan.location || '',
      status: plan.status,
      tags: plan.tags || []
    })
    setPlanImage(plan.image || '')
    setShowEditModal(true)
  }

  const updatePlanStatus = async (planId: string, newStatus: Plan['status']) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ status: newStatus })
        .eq('id', planId)

      if (error) {
        console.error('Error updating plan status:', error)
        alert('Error al actualizar el estado del plan')
        return
      }

      await loadPlans() // Recargar planes
    } catch (error) {
      console.error('Error updating plan status:', error)
      alert('Error al actualizar el estado del plan')
    }
  }

  const stats = getStats()

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty days for the beginning of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getPlansForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return plans.filter(plan => plan.date === dateString)
  }



  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nuestros Planes</h1>
          <p className="text-gray-600 dark:text-gray-400">Organiza y gestiona tus planes especiales</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-pink-600 hover:bg-pink-700' : ''}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-pink-600 hover:bg-pink-700' : ''}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendario
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateModal(true)} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En Progreso</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completados</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Progress and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progreso General</h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getProgressPercentage()}% completado
              </span>
            </div>
            <div className="h-3">
  <Progress value={getProgressPercentage()} />
</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Logros</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAchievementsModal(true)}
                className="text-pink-600 border-pink-600 hover:bg-pink-50"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Ver Todos
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getUnlockedAchievements().length} de {achievements.length} desbloqueados
                </span>
              </div>
              <div className="h-3 w-24">
  <Progress value={getAchievementProgress()} />
</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Permission Request */}
      {isNotificationSupported() && getNotificationPermission() === 'default' && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Activar Notificaciones
                  </h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Recibe recordatorios de tus planes especiales
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={requestNotificationPermission}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Activar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Unlocked Achievements */}
      {recentlyUnlocked.length > 0 && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Trophy className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                  ¡Logro Desbloqueado!
                </h4>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {recentlyUnlocked[0].title} - {recentlyUnlocked[0].description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar planes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="todos">Todos los estados</option>
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        /* Plans Tabs */
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="todos">Todos ({filteredPlans.length})</TabsTrigger>
            <TabsTrigger value="pendiente">Pendientes ({getPlansByStatus('pendiente').length})</TabsTrigger>
            <TabsTrigger value="en_progreso">En Progreso ({getPlansByStatus('en_progreso').length})</TabsTrigger>
            <TabsTrigger value="completado">Completados ({getPlansByStatus('completado').length})</TabsTrigger>
            <TabsTrigger value="cancelado">Cancelados ({getPlansByStatus('cancelado').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={() => openEditModal(plan)}
                  onDelete={() => handleDeletePlan(plan.id.toString())}
                  onStatusChange={(status) => updatePlanStatus(plan.id.toString(), status)}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          </TabsContent>

          {['pendiente', 'en_progreso', 'completado', 'cancelado'].map(status => (
            <TabsContent key={status} value={status} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getPlansByStatus(status).map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={() => openEditModal(plan)}
                    onDelete={() => handleDeletePlan(plan.id.toString())}
                    onStatusChange={(newStatus) => updatePlanStatus(plan.id.toString(), newStatus)}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        /* Calendar View */
        <CalendarView
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          plans={filteredPlans}
          getPlansForDate={getPlansForDate}
          getDaysInMonth={getDaysInMonth}
          formatDate={formatDate}
          goToPreviousMonth={goToPreviousMonth}
          goToNextMonth={goToNextMonth}
          goToToday={goToToday}
          onEditPlan={openEditModal}
          onDeletePlan={handleDeletePlan}
          onStatusChange={updatePlanStatus}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          setShowCreateModal={setShowCreateModal}
        />
      )}

      {/* Create Plan Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        if (!open) {
          setShowCreateModal(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Plan</DialogTitle>
            <DialogDescription>
              Completa los detalles de tu nuevo plan
            </DialogDescription>
          </DialogHeader>
          
          <PlanForm
            form={planForm}
            setForm={setPlanForm}
            image={planImage}
            setImage={setPlanImage}
            onSubmit={handleCreatePlan}
            onCancel={() => {
              setShowCreateModal(false)
              resetForm()
            }}
            statuses={statuses}
            predefinedTags={predefinedTags}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Plan Modal */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowEditModal(false)
          setEditingPlan(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plan</DialogTitle>
            <DialogDescription>
              Modifica los detalles del plan
            </DialogDescription>
          </DialogHeader>
          
          <PlanForm
            form={planForm}
            setForm={setPlanForm}
            image={planImage}
            setImage={setPlanImage}
            onSubmit={handleEditPlan}
            onCancel={() => {
              setShowEditModal(false)
              setEditingPlan(null)
              resetForm()
            }}
            statuses={statuses}
            predefinedTags={predefinedTags}
          />
        </DialogContent>
      </Dialog>

      {/* Achievements Modal */}
      {showAchievementsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Logros y Progreso</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAchievementsModal(false)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Progress Overview */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progreso General</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getAchievementProgress()}% completado
                    </span>
                  </div>
                  <div className="h-3">
  <Progress value={getAchievementProgress()} />
</div>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-pink-600">{getUnlockedAchievements().length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Desbloqueados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-600">{achievements.length - getUnlockedAchievements().length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{plans.length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Planes Creados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{plans.filter(p => p.status === 'completado').length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(achievement => (
                  <Card key={achievement.id} className={`transition-all duration-200 ${
                    achievement.unlocked 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`text-2xl ${achievement.unlocked ? 'opacity-100' : 'opacity-50'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            achievement.unlocked 
                              ? 'text-green-800 dark:text-green-200' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-sm ${
                            achievement.unlocked 
                              ? 'text-green-700 dark:text-green-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {achievement.description}
                          </p>
                          
                          {achievement.progress !== undefined && achievement.maxProgress && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progreso</span>
                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                              </div>
                              <div className="h-2">
                                <Progress 
                                  value={(achievement.progress / achievement.maxProgress) * 100} 
                                />
                              </div>
                            </div>
                          )}

                          {achievement.unlocked && achievement.unlockedAt && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                              Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface CalendarViewProps {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  plans: Plan[]
  getPlansForDate: (date: Date) => Plan[]
  getDaysInMonth: (date: Date) => (Date | null)[]
  formatDate: (date: Date) => string
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  goToToday: () => void
  onEditPlan: (plan: Plan) => void
  onDeletePlan: (planId: string) => void
  onStatusChange: (planId: string, status: Plan['status']) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => any
  setShowCreateModal: (show: boolean) => void
}

function CalendarView({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  plans,
  getPlansForDate,
  getDaysInMonth,
  formatDate,
  goToPreviousMonth,
  goToNextMonth,
  goToToday,
  onEditPlan,
  onDeletePlan,
  onStatusChange,
  getStatusColor,
  getStatusIcon,
  setShowCreateModal
}: CalendarViewProps) {
  const days = getDaysInMonth(currentDate)
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const today = new Date()
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="calendar-header">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-8 w-8 p-0 calendar-navigation"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentDate.toLocaleDateString('es-ES', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h2>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="h-8 w-8 p-0 calendar-navigation"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={goToToday}
              className="calendar-today-button"
            >
              Hoy
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div
                key={day}
                className="h-10 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-24 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                )
              }

              const dayPlans = getPlansForDate(day)
              const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString()
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()

              return (
                <div
                  key={day.toISOString()}
                  className={`h-24 border border-gray-200 dark:border-gray-700 p-1 cursor-pointer calendar-day ${
                    isSelected 
                      ? 'calendar-day-selected border-pink-300 dark:border-pink-600' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${!isCurrentMonth ? 'calendar-day-other-month bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'} ${isToday(day) ? 'calendar-day-today' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="calendar-day-content">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium calendar-day-number ${
                          isToday(day)
                            ? 'bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                            : isSelected
                            ? 'text-pink-700 dark:text-pink-300'
                            : !isCurrentMonth
                            ? 'text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      
                      {dayPlans.length > 0 && (
                        <span className="text-xs bg-pink-500 text-white rounded-full px-1.5 py-0.5 calendar-day-count">
                          {dayPlans.length}
                        </span>
                      )}
                    </div>

                    {/* Plan indicators */}
                    <div className="space-y-1">
                      {dayPlans.slice(0, 2).map(plan => (
                        <div
                          key={plan.id}
                          className="h-2 rounded-full calendar-plan-indicator bg-blue-500"
                          title={plan.title}
                        />
                      ))}
                      {dayPlans.length > 2 && (
                        <div className="h-2 rounded-full bg-gray-300 dark:bg-gray-600 calendar-plan-indicator" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="calendar-details-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(selectedDate)}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            {getPlansForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getPlansForDate(selectedDate).map(plan => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg calendar-plan-item"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{plan.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                        {plan.time && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {plan.time}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(plan.status)}>
                        {statuses.find(s => s.value === plan.status)?.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPlan(plan)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 calendar-empty-state rounded-lg">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay planes para este día</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface PlanCardProps {
  plan: Plan
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: Plan['status']) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => any
}

function PlanCard({
  plan,
  onEdit,
  onDelete,
  onStatusChange,
  getStatusColor,
  getStatusIcon
}: PlanCardProps) {
  const StatusIcon = getStatusIcon(plan.status)

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      {plan.image && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={plan.image}
            alt={plan.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {plan.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
              {plan.description}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-end">
          <Badge className={getStatusColor(plan.status)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statuses.find(s => s.value === plan.status)?.label}
          </Badge>
        </div>

        {/* Date and Time */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{new Date(plan.date).toLocaleDateString('es-ES')}</span>
          {plan.time && (
            <>
              <Clock className="h-4 w-4 mr-2 ml-4" />
              <span>{plan.time}</span>
            </>
          )}
        </div>

        {/* Location */}
        {plan.location && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{plan.location}</span>
          </div>
        )}



        {/* Tags */}
        {plan.tags && plan.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {plan.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Status Actions */}
        <div className="flex gap-2 pt-2">
          {plan.status === 'pendiente' && (
            <>
              <Button
                size="sm"
                onClick={() => onStatusChange('en_progreso')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
              <Button
                size="sm"
                onClick={() => onStatusChange('completado')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Completar
              </Button>
            </>
          )}
          
          {plan.status === 'en_progreso' && (
            <>
              <Button
                size="sm"
                onClick={() => onStatusChange('completado')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Completar
              </Button>
              <Button
                size="sm"
                onClick={() => onStatusChange('pendiente')}
                variant="outline"
                className="flex-1"
              >
                <Clock className="h-4 w-4 mr-1" />
                Pausar
              </Button>
            </>
          )}

          {(plan.status === 'pendiente' || plan.status === 'en_progreso') && (
            <Button
              size="sm"
              onClick={() => onStatusChange('cancelado')}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          )}

          {plan.status === 'completado' && (
            <Button
              size="sm"
              onClick={() => onStatusChange('en_progreso')}
              variant="outline"
              className="flex-1"
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Reabrir
            </Button>
          )}

          {plan.status === 'cancelado' && (
            <Button
              size="sm"
              onClick={() => onStatusChange('pendiente')}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-4 w-4 mr-1" />
              Reactivar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface PlanFormProps {
  form: any
  setForm: (form: any) => void
  image: string
  setImage: (image: string) => void
  onSubmit: () => void
  onCancel: () => void
  statuses: any[]
  predefinedTags: string[]
}

function PlanForm({
  form,
  setForm,
  image,
  setImage,
  onSubmit,
  onCancel,
  statuses,
  predefinedTags
}: PlanFormProps) {
  
  const handleTagToggle = (tag: string) => {
    setForm((prev: any) => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter((t: string) => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const handleAddCustomTag = (customTag: string) => {
    const trimmedTag = customTag.trim()
    if (trimmedTag && !form.tags.includes(trimmedTag)) {
      setForm((prev: any) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título *
          </label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Nombre del plan"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <Select
            value={form.status}
            onValueChange={(value) => setForm({ ...form, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción *
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe tu plan..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          rows={3}
          required
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha *
          </label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hora
          </label>
          <Input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ubicación
        </label>
        <Input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="Dirección o lugar"
        />
      </div>



      {/* Tags */}
      <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Etiquetas
          </label>
          <div className="space-y-3">
            {/* Selected tags display */}
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="default" 
                    className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <span className="ml-1 text-xs">×</span>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Tags dropdown */}
            <div className="relative">
              <Select onValueChange={(value) => handleTagToggle(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etiquetas..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="grid grid-cols-1 gap-1 p-2">
                    {predefinedTags.map((tag) => (
                      <SelectItem 
                        key={tag} 
                        value={tag}
                        className={`cursor-pointer ${
                          form.tags.includes(tag) 
                            ? 'bg-primary/10 text-primary' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3" />
                          <span>{tag}</span>
                          {form.tags.includes(tag) && (
                            <span className="text-xs text-primary">✓</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
            
            {/* Custom tag input */}
            <div className="flex gap-2">
              <Input
                placeholder="Agregar etiqueta personalizada..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    handleAddCustomTag(input.value)
                    input.value = ''
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  handleAddCustomTag(input.value)
                  input.value = ''
                }}
              >
                Agregar
              </Button>
            </div>
          </div>
        </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Imagen del plan
        </label>
        <div className="space-y-2">
          {image && (
            <div className="relative">
              <img 
                src={image} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setImage('')}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <FileUpload
            onFileSelect={(file, dataUrl) => setImage(dataUrl)}
            accept="image/*"
            placeholder="Subir imagen del plan"
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          className="bg-pink-600 hover:bg-pink-700"
          disabled={!form.title || !form.description || !form.date}
        >
          Guardar Plan
        </Button>
      </div>
    </div>
  )
}
