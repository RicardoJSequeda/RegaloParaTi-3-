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
import { uploadPublicFile } from '@/lib/supabase/storage'
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
    status: 'pendiente' as Plan['status'],
    date: '' // Fecha opcional para el calendario
  })
  const [planImage, setPlanImage] = useState<string>('')
  const [planImageFile, setPlanImageFile] = useState<File | null>(null)

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
        .order('created_at', { ascending: false })

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

  const filteredPlans = plans

  const getPlansByStatus = (status: string) => {
    if (status === 'todos') return filteredPlans
    return filteredPlans.filter(plan => plan.status === status)
  }

  const getProgressPercentage = () => {
    if (plans.length === 0) return 0
    const completed = plans.filter(plan => plan.status === 'completado').length
    return Math.round((completed / plans.length) * 100)
  }

  const resetForm = () => {
    setPlanForm({
      title: '',
      description: '',
      status: 'pendiente',
      date: ''
    })
    setPlanImage('')
    setPlanImageFile(null)
  }

  const handleCreatePlan = async () => {
    // Usar fecha del formulario si existe, sino usar fecha actual como valor por defecto (formato YYYY-MM-DD)
    const planDate = planForm.date || new Date().toISOString().split('T')[0]
    const tempImageUrl = planImage || null

    // ACTUALIZACIÓN OPTIMISTA: Crear plan temporal
    const tempPlan: Plan = {
      id: -Date.now(), // ID temporal negativo
      title: planForm.title,
      description: planForm.description,
      date: planDate,
      status: planForm.status,
      image: tempImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Agregar plan temporal inmediatamente
    setPlans(prev => [tempPlan, ...prev])

    // Cerrar modal y limpiar formulario inmediatamente
    setShowCreateModal(false)
    resetForm()

    // Subir imagen y guardar en BD en segundo plano
    try {
      let imageUrl = tempImageUrl

      // Si hay un archivo nuevo, subirlo a Supabase Storage
      if (planImageFile) {
        try {
          const uploadResult = await uploadPublicFile('plan-images', planImageFile, `plans/${Date.now()}/`)
          if (uploadResult && uploadResult.url) {
            imageUrl = uploadResult.url
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          // Continuar sin imagen si falla la subida
        }
      }

      const planData = {
        title: planForm.title,
        description: planForm.description,
        status: planForm.status,
        date: planDate,
        image: imageUrl
      }

      const { data, error } = await supabase
        .from('plans')
        .insert([planData])
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('No se recibieron datos de la base de datos')
      }

      // Reemplazar plan temporal con el real
      const realPlan: Plan = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        status: data.status,
        image: data.image || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      setPlans(prev => prev.map(p => p.id === tempPlan.id ? realPlan : p))
    } catch (error: any) {
      console.error('❌ Error creating plan:', error)
      // Revertir actualización optimista
      setPlans(prev => prev.filter(p => p.id !== tempPlan.id))
      const errorMessage = error?.message || error?.toString() || 'Error desconocido'
      alert(`Error al crear el plan: ${errorMessage}. Se ha revertido.`)
    }
  }

  const handleEditPlan = async () => {
    if (!editingPlan) return

    // Guardar valores antes de limpiar el formulario
    const planId = editingPlan.id
    const planTitle = planForm.title
    const planDescription = planForm.description
    const planStatus = planForm.status
    // Usar fecha del formulario si existe, sino mantener la fecha del plan o usar la actual
    const planDate = planForm.date || editingPlan.date || new Date().toISOString().split('T')[0]
    const tempImageUrl = planImage || editingPlan.image || null
    const originalPlan = plans.find(p => p.id === planId)

    // ACTUALIZACIÓN OPTIMISTA: Actualizar plan inmediatamente
    const tempPlan: Plan = {
      ...editingPlan,
      title: planTitle,
      description: planDescription,
      status: planStatus,
      date: planDate,
      image: tempImageUrl,
      updatedAt: new Date().toISOString()
    }

    setPlans(prev => prev.map(p => p.id === planId ? tempPlan : p))

    // Cerrar modal y limpiar formulario inmediatamente
    setShowEditModal(false)
    setEditingPlan(null)
    resetForm()

    // Subir imagen y actualizar en BD en segundo plano
    try {
      let imageUrl = tempImageUrl

      // Si hay un archivo nuevo, subirlo a Supabase Storage
      if (planImageFile) {
        try {
          const uploadResult = await uploadPublicFile('plan-images', planImageFile, `plans/${Date.now()}/`)
          if (uploadResult && uploadResult.url) {
            imageUrl = uploadResult.url
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          // Mantener la imagen anterior si falla la subida
          imageUrl = editingPlan.image || null
        }
      }

      const planData = {
        title: planTitle,
        description: planDescription,
        status: planStatus,
        date: planDate,
        image: imageUrl
      }

      const { data, error } = await supabase
        .from('plans')
        .update(planData)
        .eq('id', planId)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('No se recibieron datos de la base de datos')
      }

      // Actualizar con los datos reales de la BD
      const realPlan: Plan = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        status: data.status,
        image: data.image || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      setPlans(prev => prev.map(p => p.id === planId ? realPlan : p))
    } catch (error: any) {
      console.error('❌ Error updating plan:', error)
      // Revertir actualización optimista
      if (originalPlan) {
        setPlans(prev => prev.map(p => p.id === planId ? originalPlan : p))
      }
      const errorMessage = error?.message || error?.toString() || 'Error desconocido'
      alert(`Error al actualizar el plan: ${errorMessage}. Se ha revertido.`)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      return
    }

    // Guardar el plan antes de eliminarlo para poder revertir si hay error
    const planToDelete = plans.find(p => p.id.toString() === planId)

    // ACTUALIZACIÓN OPTIMISTA: Eliminar plan inmediatamente
    setPlans(prev => prev.filter(p => p.id.toString() !== planId))

    // Eliminar de la BD en segundo plano
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId)

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('❌ Error deleting plan:', error)
      // Revertir actualización optimista
      if (planToDelete) {
        setPlans(prev => {
          // Verificar si el plan ya no está en el estado antes de agregarlo de nuevo
          const exists = prev.find(p => p.id === planToDelete.id)
          if (!exists) {
            return [...prev, planToDelete]
          }
          return prev
        })
      }
      const errorMessage = error?.message || error?.toString() || 'Error desconocido'
      alert(`Error al eliminar el plan: ${errorMessage}. Se ha revertido.`)
    }
  }



  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan)
    setPlanForm({
      title: plan.title,
      description: plan.description,
      status: plan.status,
      date: plan.date || ''
    })
    setPlanImage(plan.image || '')
    setPlanImageFile(null) // Limpiar archivo al editar
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
    if (!date) return []
    
    // Formatear la fecha a YYYY-MM-DD para comparar
    const dateString = date.toISOString().split('T')[0]
    
    // Filtrar planes que coincidan con esta fecha
    return plans.filter(plan => {
      if (!plan.date) return false
      // Comparar solo la parte de fecha (YYYY-MM-DD)
      const planDate = plan.date.split('T')[0] // Por si viene con hora
      return planDate === dateString
    })
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
    <div className="w-full min-h-screen p-0 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-3 px-4 sm:px-0">
        <div className="text-center sm:text-left space-y-3 sm:space-y-3 w-full sm:w-auto">
          <h1 className="text-[clamp(1.8rem,6vw,2.5rem)] font-bold text-gray-900 dark:text-white leading-tight">Nuestros Planes</h1>
          <p className="text-[clamp(1rem,3.5vw,1.1rem)] text-gray-600 dark:text-gray-300 max-w-full sm:max-w-2xl mx-auto sm:mx-0">
            Organiza y gestiona tus planes especiales
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1.5 w-full sm:w-auto justify-center">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`${viewMode === 'list' ? 'bg-pink-600 hover:bg-pink-700' : ''} text-[clamp(0.85rem,2.5vw,0.9rem)] px-3 sm:px-3 py-2 sm:py-2`}
            >
              <Grid3X3 className="h-4 w-4 sm:h-4 sm:w-4 mr-2 sm:mr-2" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={`${viewMode === 'calendar' ? 'bg-pink-600 hover:bg-pink-700' : ''} text-[clamp(0.85rem,2.5vw,0.9rem)] px-3 sm:px-3 py-2 sm:py-2`}
            >
              <CalendarDays className="h-4 w-4 sm:h-4 sm:w-4 mr-2 sm:mr-2" />
              Calendario
            </Button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={() => setShowCreateModal(true)} className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto text-[clamp(0.85rem,2.5vw,0.9rem)] px-4 sm:px-4 py-2.5 sm:py-2.5">
              <Plus className="h-4 w-4 sm:h-4 sm:w-4 mr-2 sm:mr-2" />
              Nuevo Plan
            </Button>
          </div>
        </div>
      </div>


      {/* Progress and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-0">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-[clamp(1.1rem,3vw,1.1rem)] font-semibold text-gray-900 dark:text-white">Progreso General</h3>
              <span className="text-[clamp(0.9rem,2.5vw,0.9rem)] text-gray-600 dark:text-gray-400">
                {getProgressPercentage()}% completado
              </span>
            </div>
            <div className="h-3">
              <Progress value={getProgressPercentage()} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-[clamp(1.1rem,3vw,1.1rem)] font-semibold text-gray-900 dark:text-white">Logros</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAchievementsModal(true)}
                className="text-pink-600 border-pink-600 hover:bg-pink-50 text-[clamp(0.9rem,2.5vw,0.9rem)] px-3 sm:px-3 py-2 sm:py-2"
              >
                <Trophy className="h-4 w-4 sm:h-4 sm:w-4 mr-2 sm:mr-2" />
                Ver Todos
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 sm:h-6 sm:w-6 text-yellow-500" />
                <span className="text-[clamp(0.9rem,2.5vw,0.9rem)] text-gray-600 dark:text-gray-400">
                  {getUnlockedAchievements().length} de {achievements.length} desbloqueados
                </span>
              </div>
              <div className="h-3 w-24 sm:w-24">
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


      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        /* Plans Tabs */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 sm:px-0">
          <TabsList className="grid w-full grid-cols-5 gap-1.5 sm:gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 sm:p-2 rounded-lg">
            <TabsTrigger 
              value="todos" 
              className="text-[clamp(0.7rem,2vw,0.75rem)] sm:text-xs font-medium px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-semibold">{filteredPlans.length}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="pendiente" 
              className="text-[clamp(0.7rem,2vw,0.75rem)] sm:text-xs font-medium px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-yellow-600 dark:data-[state=active]:text-yellow-400 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-semibold">{getPlansByStatus('pendiente').length}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="en_progreso" 
              className="text-[clamp(0.7rem,2vw,0.75rem)] sm:text-xs font-medium px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
                <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-semibold">{getPlansByStatus('en_progreso').length}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="completado" 
              className="text-[clamp(0.7rem,2vw,0.75rem)] sm:text-xs font-medium px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-semibold">{getPlansByStatus('completado').length}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="cancelado" 
              className="text-[clamp(0.7rem,2vw,0.75rem)] sm:text-xs font-medium px-2 sm:px-3 py-2 sm:py-2.5 rounded-md transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-semibold">{getPlansByStatus('cancelado').length}</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
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
            setImageFile={setPlanImageFile}
            onSubmit={handleCreatePlan}
            onCancel={() => {
              setShowCreateModal(false)
              resetForm()
            }}
            statuses={statuses}
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
            setImageFile={setPlanImageFile}
            onSubmit={handleEditPlan}
            onCancel={() => {
              setShowEditModal(false)
              setEditingPlan(null)
              resetForm()
            }}
            statuses={statuses}
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
    <Card className="hover:shadow-lg transition-shadow duration-200 w-full overflow-hidden">
      {/* Header con imagen y título */}
      <div className="relative">
        {plan.image && (
          <div className="relative h-52 sm:h-48 overflow-hidden">
            <img
              src={plan.image}
              alt={plan.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay para el título */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 sm:bottom-3 left-4 sm:left-3 right-4 sm:right-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[clamp(1.2rem,3vw,1.2rem)] font-bold text-white line-clamp-2 drop-shadow-lg">
                  {plan.title}
                </CardTitle>
                <div className="flex items-center gap-2 sm:gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="h-8 w-8 sm:h-7 sm:w-7 p-0 bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Edit className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-8 w-8 sm:h-7 sm:w-7 p-0 bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Título sin imagen */}
        {!plan.image && (
          <CardHeader className="pb-2 p-4 sm:p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-[clamp(1.2rem,3vw,1.2rem)] font-bold text-gray-900 dark:text-white line-clamp-2">
                  {plan.title}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 sm:gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 w-8 sm:h-7 sm:w-7 p-0"
                >
                  <Edit className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
        )}
      </div>
      
      {/* Contenido principal */}
      <CardContent className="p-4 sm:p-4 space-y-4">
        {/* Estado */}
        <div className="flex items-center">
          <Badge className={`${getStatusColor(plan.status)} text-[clamp(0.8rem,2.5vw,0.8rem)] px-3 py-1.5`}>
            <StatusIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-2 sm:mr-1.5" />
            {statuses.find(s => s.value === plan.status)?.label}
          </Badge>
        </div>
        
        {/* Descripción - Movida abajo para aprovechar el espacio */}
        <CardDescription className="text-[clamp(0.9rem,2.5vw,0.9rem)] text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed pt-2">
          {plan.description}
        </CardDescription>

        {/* Botones de Acción - Optimizados para Móvil */}
        <div className="pt-3 border-t border-gray-100">
          {plan.status === 'pendiente' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  size="sm"
                  onClick={() => onStatusChange('en_progreso')}
                  className="bg-blue-600 hover:bg-blue-700 text-[clamp(0.85rem,2.2vw,0.8rem)] py-2 px-3 h-10 sm:h-9"
                >
                  <PlayCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1" />
                  Iniciar
                </Button>
                <Button
                  size="sm"
                  onClick={() => onStatusChange('completado')}
                  className="bg-green-600 hover:bg-green-700 text-[clamp(0.85rem,2.2vw,0.8rem)] py-2 px-3 h-10 sm:h-9"
                >
                  <CheckCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1" />
                  Completar
                </Button>
              </div>
            </div>
          )}
          
          {plan.status === 'en_progreso' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  size="sm"
                  onClick={() => onStatusChange('completado')}
                  className="bg-green-600 hover:bg-green-700 text-[clamp(0.85rem,2.2vw,0.8rem)] py-2 px-3 h-10 sm:h-9"
                >
                  <CheckCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1" />
                  Completar
                </Button>
                <Button
                  size="sm"
                  onClick={() => onStatusChange('pendiente')}
                  variant="outline"
                  className="text-[clamp(0.85rem,2.2vw,0.8rem)] py-2 px-3 h-10 sm:h-9"
                >
                  <Clock className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-2 sm:mr-1.5" />
                  Pausar
                </Button>
              </div>
            </div>
          )}

          {(plan.status === 'pendiente' || plan.status === 'en_progreso') && (
            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => onStatusChange('cancelado')}
                variant="outline"
                className="w-full text-red-600 border-red-600 hover:bg-red-50 text-[clamp(0.85rem,2.2vw,0.8rem)] py-2 px-3 h-10 sm:h-9"
              >
                <XCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1" />
                Cancelar
              </Button>
            </div>
          )}

          {plan.status === 'completado' && (
            <Button
              size="sm"
              onClick={() => onStatusChange('en_progreso')}
              variant="outline"
              className="w-full text-[clamp(0.85rem,2.2vw,0.8rem)] py-2 px-3 h-10 sm:h-9"
            >
              <PlayCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1" />
              Reabrir
            </Button>
          )}

          {plan.status === 'cancelado' && (
            <Button
              size="sm"
              onClick={() => onStatusChange('pendiente')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-[clamp(0.85rem,2.2vw,0.8rem)] py-2 px-3 h-10 sm:h-9"
            >
              <Clock className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1" />
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
  setImageFile: (file: File | null) => void
  onSubmit: () => void
  onCancel: () => void
  statuses: any[]
}

function PlanForm({
  form,
  setForm,
  image,
  setImage,
  setImageFile,
  onSubmit,
  onCancel,
  statuses
}: PlanFormProps) {

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

      {/* Fecha opcional para el calendario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Fecha (opcional)
        </label>
        <Input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Si seleccionas una fecha, el plan aparecerá en el calendario
        </p>
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
                onClick={() => {
                  setImage('')
                  setImageFile(null)
                }}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <FileUpload
            onFileSelect={(file, dataUrl) => {
              setImage(dataUrl)
              setImageFile(file)
            }}
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
          disabled={!form.title || !form.description}
        >
          Guardar Plan
        </Button>
      </div>
    </div>
  )
}
