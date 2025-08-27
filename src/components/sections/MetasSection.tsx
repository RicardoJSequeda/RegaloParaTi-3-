'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { useNotifications } from '@/hooks/useNotifications'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { Goal, Dream, GoalMilestone, GoalStats } from '@/types'
import { 
  Target, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Tag,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  Trophy,
  Award,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Filter,
  Camera,
  X,
  Save,
  Eye,
  EyeOff,
  Flag,
  Home,
  Plane,
  Car,
  GraduationCap,
  Briefcase,
  PiggyBank,
  Dumbbell,
  Users2,
  Gift,
  Sparkles,
  Zap,
  Moon,
  Sun,
  Coffee,
  BookOpen,
  Music,
  Camera as CameraIcon,
  FileText,
  Settings,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

const categories = [
  { value: 'personal', label: 'Personal', icon: '👤', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'pareja', label: 'Pareja', icon: '💕', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { value: 'profesional', label: 'Profesional', icon: '💼', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'financiero', label: 'Financiero', icon: '💰', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'salud', label: 'Salud', icon: '🏃‍♀️', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'viajes', label: 'Viajes', icon: '✈️', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'hogar', label: 'Hogar', icon: '🏠', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'familia', label: 'Familia', icon: '👨‍👩‍👧‍👦', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'otro', label: 'Otro', icon: '🎯', color: 'bg-gray-100 text-gray-800 border-gray-200' }
]

const dreamCategories = [
  { value: 'viaje', label: 'Viaje', icon: '✈️' },
  { value: 'hogar', label: 'Hogar', icon: '🏠' },
  { value: 'experiencia', label: 'Experiencia', icon: '🌟' },
  { value: 'objeto', label: 'Objeto', icon: '🎁' },
  { value: 'logro', label: 'Logro', icon: '🏆' },
  { value: 'otro', label: 'Otro', icon: '💫' }
]

const predefinedTags = [
  'Urgente', 'Importante', 'Fácil', 'Difícil', 'Romántico', 'Aventura', 'Trabajo', 'Salud',
  'Dinero', 'Viaje', 'Casa', 'Familia', 'Amigos', 'Futuro', 'Presente', 'Pasado'
]

export function MetasSection() {
  const supabase = getBrowserClient()
  // Datos de ejemplo para metas
  const defaultGoals: Goal[] = [
    {
      id: 1,
      title: "Comprar Nuestra Casa",
      description: "Una casa con jardín donde podamos crear nuestra familia",
      category: "hogar",
      type: "largo_plazo",
      priority: "Alta",
      status: "en_progreso",
      targetDate: "2025-12-31",
      progress: 35,
      milestones: [
        { id: 1, goalId: 1, title: "Ahorrar el 20% del enganche", status: "completado", progress: 100, createdAt: "2024-01-15T10:00:00Z" },
        { id: 2, goalId: 1, title: "Investigar zonas y precios", status: "completado", progress: 100, createdAt: "2024-01-15T10:00:00Z" },
        { id: 3, goalId: 1, title: "Obtener pre-aprobación de crédito", status: "pendiente", progress: 0, createdAt: "2024-01-15T10:00:00Z" },
        { id: 4, goalId: 1, title: "Encontrar la casa ideal", status: "pendiente", progress: 0, createdAt: "2024-01-15T10:00:00Z" }
      ],
      budget: 250000,
      location: "Ciudad de México",
      participants: ["Mi pareja", "Familia"],
      tags: ["Urgente", "Importante", "Casa", "Futuro"],
      notes: "Priorizar zonas con buenas escuelas para el futuro",
      isPrivate: false,
      isFavorite: true,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      title: "Viajar por Europa",
      description: "Conocer 10 países europeos juntos",
      category: "viajes",
      type: "mediano_plazo",
      priority: "Media",
      status: "pendiente",
      targetDate: "2024-08-15",
      progress: 15,
      milestones: [
        { id: 1, goalId: 2, title: "Ahorrar $15,000", status: "pendiente", progress: 0, createdAt: "2024-01-10T10:00:00Z" },
        { id: 2, goalId: 2, title: "Planificar la ruta", status: "completado", progress: 100, createdAt: "2024-01-10T10:00:00Z" },
        { id: 3, goalId: 2, title: "Reservar vuelos", status: "pendiente", progress: 0, createdAt: "2024-01-10T10:00:00Z" }
      ],
      budget: 15000,
      location: "Europa",
      participants: ["Mi pareja"],
      tags: ["Viaje", "Aventura", "Romántico"],
      notes: "Incluir París, Roma, Barcelona, Amsterdam",
      isPrivate: false,
      isFavorite: true,
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-10T10:00:00Z"
    },
    {
      id: 3,
      title: "Aprender a Cocinar Juntos",
      description: "Tomar clases de cocina y preparar 20 recetas diferentes",
      category: "personal",
      type: "corto_plazo",
      priority: "Baja",
      status: "en_progreso",
      targetDate: "2024-06-30",
      progress: 60,
      milestones: [
        { id: 1, goalId: 3, title: "Inscribirse en clases", status: "completado", progress: 100, createdAt: "2024-02-01T10:00:00Z" },
        { id: 2, goalId: 3, title: "Comprar utensilios", status: "completado", progress: 100, createdAt: "2024-02-01T10:00:00Z" },
        { id: 3, goalId: 3, title: "Preparar 10 recetas", status: "completado", progress: 100, createdAt: "2024-02-01T10:00:00Z" },
        { id: 4, goalId: 3, title: "Preparar 10 recetas más", status: "pendiente", progress: 0, createdAt: "2024-02-01T10:00:00Z" }
      ],
      budget: 800,
      location: "Casa",
      participants: ["Mi pareja"],
      tags: ["Fácil", "Romántico", "Presente"],
      notes: "Enfocarse en recetas italianas y mexicanas",
      isPrivate: false,
      isFavorite: false,
      createdAt: "2024-02-01T10:00:00Z",
      updatedAt: "2024-02-01T10:00:00Z"
    },
    {
      id: 4,
      title: "Mejorar Nuestra Salud",
      description: "Hacer ejercicio 3 veces por semana y comer más saludable",
      category: "salud",
      type: "corto_plazo",
      priority: "Alta",
      status: "en_progreso",
      targetDate: "2024-12-31",
      progress: 40,
      milestones: [
        { id: 1, goalId: 4, title: "Unirse al gimnasio", status: "completado", progress: 100, createdAt: "2024-01-20T10:00:00Z" },
        { id: 2, goalId: 4, title: "Crear plan de alimentación", status: "completado", progress: 100, createdAt: "2024-01-20T10:00:00Z" },
        { id: 3, goalId: 4, title: "Mantener rutina por 3 meses", status: "pendiente", progress: 0, createdAt: "2024-01-20T10:00:00Z" }
      ],
      budget: 1200,
      location: "Gimnasio local",
      participants: ["Mi pareja"],
      tags: ["Salud", "Importante", "Presente"],
      notes: "Incluir yoga y meditación",
      isPrivate: false,
      isFavorite: false,
      createdAt: "2024-01-20T10:00:00Z",
      updatedAt: "2024-01-20T10:00:00Z"
    },
    {
      id: 5,
      title: "Ahorrar para Emergencias",
      description: "Tener 6 meses de gastos ahorrados",
      category: "financiero",
      type: "mediano_plazo",
      priority: "Alta",
      status: "en_progreso",
      targetDate: "2024-12-31",
      progress: 70,
      milestones: [
        { id: 1, goalId: 5, title: "Calcular gastos mensuales", status: "completado", progress: 100, createdAt: "2024-01-05T10:00:00Z" },
        { id: 2, goalId: 5, title: "Abrir cuenta de ahorros", status: "completado", progress: 100, createdAt: "2024-01-05T10:00:00Z" },
        { id: 3, goalId: 5, title: "Ahorrar 4 meses", status: "completado", progress: 100, createdAt: "2024-01-05T10:00:00Z" },
        { id: 4, goalId: 5, title: "Completar 6 meses", status: "pendiente", progress: 0, createdAt: "2024-01-05T10:00:00Z" }
      ],
      budget: 50000,
      location: "Banco",
      participants: ["Mi pareja"],
      tags: ["Dinero", "Urgente", "Futuro"],
      notes: "Mantener en cuenta de alto rendimiento",
      isPrivate: true,
      isFavorite: false,
      createdAt: "2024-01-05T10:00:00Z",
      updatedAt: "2024-01-05T10:00:00Z"
    },
    {
      id: 6,
      title: "Crear un Blog de Viajes",
      description: "Compartir nuestras aventuras y experiencias de viaje",
      category: "profesional",
      type: "mediano_plazo",
      priority: "Media",
      status: "pendiente",
      targetDate: "2024-09-30",
      progress: 10,
      milestones: [
        { id: 1, goalId: 6, title: "Elegir plataforma", status: "completado", progress: 100, createdAt: "2024-02-15T10:00:00Z" },
        { id: 2, goalId: 6, title: "Diseñar el blog", status: "pendiente", progress: 0, createdAt: "2024-02-15T10:00:00Z" },
        { id: 3, goalId: 6, title: "Escribir 10 posts", status: "pendiente", progress: 0, createdAt: "2024-02-15T10:00:00Z" }
      ],
      budget: 200,
      location: "Online",
      participants: ["Mi pareja"],
      tags: ["Trabajo", "Futuro", "Presente"],
      notes: "Enfocarse en destinos románticos",
      isPrivate: false,
      isFavorite: false,
      createdAt: "2024-02-15T10:00:00Z",
      updatedAt: "2024-02-15T10:00:00Z"
    },
    {
      id: 7,
      title: "Organizar Nuestra Boda",
      description: "Una boda íntima y romántica con familia y amigos cercanos",
      category: "pareja",
      type: "mediano_plazo",
      priority: "Alta",
      status: "en_progreso",
      targetDate: "2025-06-15",
      progress: 25,
      milestones: [
        { id: 1, goalId: 7, title: "Elegir fecha y lugar", status: "completado", progress: 100, createdAt: "2024-01-25T10:00:00Z" },
        { id: 2, goalId: 7, title: "Hacer lista de invitados", status: "completado", progress: 100, createdAt: "2024-01-25T10:00:00Z" },
        { id: 3, goalId: 7, title: "Contratar proveedores", status: "pendiente", progress: 0, createdAt: "2024-01-25T10:00:00Z" }
      ],
      budget: 80000,
      location: "Playa del Carmen",
      participants: ["Mi pareja", "Familia"],
      tags: ["Romántico", "Urgente", "Futuro"],
      notes: "Mantener lista de invitados pequeña",
      isPrivate: false,
      isFavorite: true,
      createdAt: "2024-01-25T10:00:00Z",
      updatedAt: "2024-01-25T10:00:00Z"
    },
    {
      id: 8,
      title: "Aprender un Nuevo Idioma",
      description: "Dominar el italiano para nuestro viaje a Italia",
      category: "personal",
      type: "corto_plazo",
      priority: "Media",
      status: "pendiente",
      targetDate: "2024-07-31",
      progress: 0,
      milestones: [
        { id: 1, goalId: 8, title: "Inscribirse en curso", status: "pendiente", progress: 0, createdAt: "2024-02-10T10:00:00Z" },
        { id: 2, goalId: 8, title: "Practicar 30 minutos diarios", status: "pendiente", progress: 0, createdAt: "2024-02-10T10:00:00Z" },
        { id: 3, goalId: 8, title: "Aprobar examen B1", status: "pendiente", progress: 0, createdAt: "2024-02-10T10:00:00Z" }
      ],
      budget: 1500,
      location: "Online/Instituto",
      participants: ["Mi pareja"],
      tags: ["Fácil", "Presente", "Viaje"],
      notes: "Usar Duolingo y clases particulares",
      isPrivate: false,
      isFavorite: false,
      createdAt: "2024-02-10T10:00:00Z",
      updatedAt: "2024-02-10T10:00:00Z"
    },
    {
      id: 9,
      title: "Crear un Jardín en Casa",
      description: "Diseñar y mantener un jardín con flores y hierbas aromáticas",
      category: "hogar",
      type: "corto_plazo",
      priority: "Baja",
      status: "pendiente",
      targetDate: "2024-05-31",
      progress: 5,
      milestones: [
        { id: 1, goalId: 9, title: "Diseñar el jardín", status: "completado", progress: 100, createdAt: "2024-02-20T10:00:00Z" },
        { id: 2, goalId: 9, title: "Comprar plantas", status: "pendiente", progress: 0, createdAt: "2024-02-20T10:00:00Z" },
        { id: 3, goalId: 9, title: "Plantar y cuidar", status: "pendiente", progress: 0, createdAt: "2024-02-20T10:00:00Z" }
      ],
      budget: 500,
      location: "Patio de casa",
      participants: ["Mi pareja"],
      tags: ["Fácil", "Presente", "Casa"],
      notes: "Incluir rosas, lavanda y albahaca",
      isPrivate: false,
      isFavorite: false,
      createdAt: "2024-02-20T10:00:00Z",
      updatedAt: "2024-02-20T10:00:00Z"
    },
    {
      id: 10,
      title: "Voluntariado Juntos",
      description: "Dedicar tiempo a ayudar a otros como pareja",
      category: "personal",
      type: "corto_plazo",
      priority: "Media",
      status: "pendiente",
      targetDate: "2024-12-31",
      progress: 0,
      milestones: [
        { id: 1, goalId: 10, title: "Investigar organizaciones", status: "pendiente", progress: 0, createdAt: "2024-02-25T10:00:00Z" },
        { id: 2, goalId: 10, title: "Inscribirse como voluntarios", status: "pendiente", progress: 0, createdAt: "2024-02-25T10:00:00Z" },
        { id: 3, goalId: 10, title: "Cumplir 50 horas", status: "pendiente", progress: 0, createdAt: "2024-02-25T10:00:00Z" }
      ],
      budget: 0,
      location: "Comunidad local",
      participants: ["Mi pareja"],
      tags: ["Fácil", "Presente", "Amigos"],
      notes: "Enfocarse en causas que nos apasionen",
      isPrivate: false,
      isFavorite: false,
      createdAt: "2024-02-25T10:00:00Z",
      updatedAt: "2024-02-25T10:00:00Z"
    }
  ]

  // Datos de ejemplo para sueños
  const defaultDreams: Dream[] = [
    {
      id: 1,
      title: "Casarnos en la Playa",
      description: "Una boda romántica al atardecer con el mar como testigo",
      category: "experiencia",
      priority: "Alta",
      estimatedCost: 120000,
      location: "Tulum, México",
      timeframe: "este_año",
      isShared: true,
      isAchieved: false,
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-01T10:00:00Z"
    },
    {
      id: 2,
      title: "Tener Nuestra Casa de Playa",
      description: "Una casa pequeña pero perfecta frente al mar",
      category: "hogar",
      priority: "Media",
      estimatedCost: 800000,
      location: "Puerto Escondido, México",
      timeframe: "futuro_lejano",
      isShared: true,
      isAchieved: false,
      createdAt: "2024-01-05T10:00:00Z",
      updatedAt: "2024-01-05T10:00:00Z"
    },
    {
      id: 3,
      title: "Viajar al Espacio",
      description: "Experimentar la ingravidez y ver la Tierra desde arriba",
      category: "experiencia",
      priority: "Baja",
      estimatedCost: 250000,
      location: "Estados Unidos",
      timeframe: "futuro_lejano",
      isShared: true,
      isAchieved: false,
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-10T10:00:00Z"
    },
    {
      id: 4,
      title: "Crear una Fundación",
      description: "Ayudar a niños con educación y oportunidades",
      category: "logro",
      priority: "Alta",
      estimatedCost: 1000000,
      location: "México",
      timeframe: "proximo_año",
      isShared: true,
      isAchieved: false,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 5,
      title: "Tener un Yate",
      description: "Navegar por el mundo en nuestro propio barco",
      category: "objeto",
      priority: "Baja",
      estimatedCost: 2000000,
      location: "Mar Mediterráneo",
      timeframe: "futuro_lejano",
      isShared: true,
      isAchieved: false,
      createdAt: "2024-01-20T10:00:00Z",
      updatedAt: "2024-01-20T10:00:00Z"
    },
    {
      id: 6,
      title: "Ver las Auroras Boreales",
      description: "Contemplar el espectáculo de luces en el cielo ártico",
      category: "experiencia",
      priority: "Media",
      estimatedCost: 15000,
      location: "Islandia",
      timeframe: "este_año",
      isShared: true,
      isAchieved: false,
      createdAt: "2024-01-25T10:00:00Z",
      updatedAt: "2024-01-25T10:00:00Z"
    },
    {
      id: 7,
      title: "Escribir un Libro Juntos",
      description: "Una novela romántica basada en nuestra historia",
      category: "logro",
      priority: "Media",
      estimatedCost: 5000,
      location: "Casa",
      timeframe: "proximo_año",
      isShared: true,
      isAchieved: false,
      createdAt: "2024-02-01T10:00:00Z",
      updatedAt: "2024-02-01T10:00:00Z"
    },
    {
      id: 8,
      title: "Tener una Familia Grande",
      description: "3 hijos y muchas mascotas en una casa llena de amor",
      category: "experiencia",
      priority: "Alta",
      estimatedCost: 500000,
      location: "Nuestra casa",
      timeframe: "proximo_año",
      isShared: true,
      isAchieved: false,
      createdAt: "2024-02-05T10:00:00Z",
      updatedAt: "2024-02-05T10:00:00Z"
    },
    {
      id: 9,
      title: "Abrir un Café Romántico",
      description: "Un lugar acogedor donde las parejas se sientan especiales",
      category: "logro",
      priority: "Media",
      estimatedCost: 300000,
      location: "Ciudad de México",
      timeframe: "proximo_año",
      isShared: true,
      isAchieved: false,
      createdAt: "2024-02-10T10:00:00Z",
      updatedAt: "2024-02-10T10:00:00Z"
    },
    {
      id: 10,
      title: "Ser Inmortales",
      description: "Vivir para siempre juntos, jóvenes y enamorados",
      category: "experiencia",
      priority: "Baja",
      estimatedCost: 10000000,
      location: "Mundo",
      timeframe: "futuro_lejano",
      isShared: true,
      isAchieved: false,
      createdAt: "2024-02-15T10:00:00Z",
      updatedAt: "2024-02-15T10:00:00Z"
    }
  ]

  const [goals, setGoals] = useState<Goal[]>([])
  const [dreams, setDreams] = useState<Dream[]>([])
  const { sendNotification } = useNotifications()

  const [activeTab, setActiveTab] = useState('metas')
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false)
  const [showAddDreamDialog, setShowAddDreamDialog] = useState(false)
  const [showEditGoalDialog, setShowEditGoalDialog] = useState(false)
  const [showEditDreamDialog, setShowEditDreamDialog] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [selectedStatus, setSelectedStatus] = useState('Todas')
  const [updatingGoal, setUpdatingGoal] = useState<Record<number, boolean>>({})
  // Animación de éxito (confetti)
  const fireConfetti = async () => {
    try {
      const mod = await import('canvas-confetti')
      const shoot = mod.default
      shoot({ particleCount: 90, spread: 70, origin: { y: 0.6 } })
    } catch (e) {
      // silencioso si la librería no está disponible
    }
  }
  // Load data
  useEffect(() => {
    loadGoals()
    loadDreams()
  }, [])

  const loadGoals = async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('id', { ascending: false })
    if (!error) setGoals(data as Goal[])
  }

  const loadDreams = async () => {
    const { data, error } = await supabase
      .from('dreams')
      .select('*')
      .order('id', { ascending: false })
    if (!error) setDreams(data as Dream[])
  }

  // Realtime subscriptions
  useEffect(() => {
    const goalsChannel = supabase
      .channel('goals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, loadGoals)
      .subscribe()

    const dreamsChannel = supabase
      .channel('dreams_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dreams' }, loadDreams)
      .subscribe()

    return () => {
      supabase.removeChannel(goalsChannel)
      supabase.removeChannel(dreamsChannel)
    }
  }, [supabase])


  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'personal' as Goal['category'],
    type: 'corto_plazo' as Goal['type'],
    priority: 'Media' as Goal['priority'],
    targetDate: '',
    budget: 0,
    location: '',
    participants: [] as string[],
    tags: [] as string[],
    notes: '',
    isPrivate: false,
    isFavorite: false
  })

  const [dreamForm, setDreamForm] = useState({
    title: '',
    description: '',
    category: 'viaje' as Dream['category'],
    priority: 'Media' as Dream['priority'],
    estimatedCost: 0,
    location: '',
    timeframe: 'este_año' as Dream['timeframe'],
    isShared: true,
    notes: ''
  })

  // Estadísticas
  const stats: GoalStats = {
    totalGoals: goals.length,
    completedGoals: goals.filter(g => g.status === 'completado').length,
    inProgressGoals: goals.filter(g => g.status === 'en_progreso').length,
    pendingGoals: goals.filter(g => g.status === 'pendiente').length,
    totalDreams: dreams.length,
    achievedDreams: dreams.filter(d => d.isAchieved).length,
    averageProgress: goals.length > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0,
    upcomingDeadlines: goals.filter(g => g.targetDate && new Date(g.targetDate) > new Date() && g.status !== 'completado').length,
    totalBudget: goals.reduce((sum, g) => sum + (g.budget || 0), 0),
    spentBudget: goals.reduce((sum, g) => sum + (g.currentSpent || 0), 0)
  }

  // Filtrar metas
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'Todas' || goal.category === selectedCategory
    const matchesStatus = selectedStatus === 'Todas' || goal.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Filtrar sueños
  const filteredDreams = dreams.filter(dream => {
    const matchesSearch = dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dream.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todas' || dream.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const addGoal = async () => {
    if (!goalForm.title) return

    const payload = {
      title: goalForm.title,
      description: goalForm.description,
      category: goalForm.category,
      type: goalForm.type,
      priority: goalForm.priority,
      status: 'pendiente',
      targetDate: goalForm.targetDate || null,
      progress: 0,
      milestones: [],
      budget: goalForm.budget || null,
      location: goalForm.location || null,
      participants: goalForm.participants,
      tags: goalForm.tags,
      notes: goalForm.notes || null,
      isPrivate: goalForm.isPrivate,
      isFavorite: goalForm.isFavorite
    }

    const { error } = await supabase.from('goals').insert([payload])
    if (error) {
      console.error('Supabase insert goals error:', error.message, error.details)
      sendNotification({
        title: 'Error al crear meta',
        body: 'No se pudo crear la meta: ' + (error.message || 'Solicitud inválida')
      })
      return
    }
    await loadGoals()
    setGoalForm({
      title: '',
      description: '',
      category: 'personal',
      type: 'corto_plazo',
      priority: 'Media',
      targetDate: '',
      budget: 0,
      location: '',
      participants: [],
      tags: [],
      notes: '',
      isPrivate: false,
      isFavorite: false
    })
    setShowAddGoalDialog(false)

    sendNotification({
      title: 'Nueva meta creada',
      body: `Se ha creado la meta: ${payload.title}`
    })
  }

  const addDream = async () => {
    if (!dreamForm.title) return

    const payload = {
      title: dreamForm.title,
      description: dreamForm.description,
      category: dreamForm.category,
      priority: dreamForm.priority,
      estimatedCost: dreamForm.estimatedCost || null,
      location: dreamForm.location || null,
      timeframe: dreamForm.timeframe,
      isShared: dreamForm.isShared,
      isAchieved: false,
      notes: dreamForm.notes || null
    }

    const { error } = await supabase.from('dreams').insert([payload])
    if (error) {
      console.error('Supabase insert dreams error:', error.message, error.details)
      sendNotification({
        title: 'Error al crear sueño',
        body: 'No se pudo crear el sueño: ' + (error.message || 'Solicitud inválida')
      })
      return
    }
    await loadDreams()
    setDreamForm({
      title: '',
      description: '',
      category: 'viaje',
      priority: 'Media',
      estimatedCost: 0,
      location: '',
      timeframe: 'este_año',
      isShared: true,
      notes: ''
    })
    setShowAddDreamDialog(false)

    sendNotification({
      title: 'Nuevo sueño agregado',
      body: `Se ha agregado el sueño: ${payload.title}`
    })
  }

  const updateGoalProgress = async (goalId: number, progress: number) => {
    if (updatingGoal[goalId]) return
    setUpdatingGoal(prev => ({ ...prev, [goalId]: true }))
    
    const goal = goals.find(g => g.id === goalId)
    if (!goal) {
      setUpdatingGoal(prev => ({ ...prev, [goalId]: false }))
      return
    }
    
    const status = progress >= 100 ? 'completado' : progress > 0 ? 'en_progreso' : 'pendiente'
    
    try {
      // Intentar actualización simple primero
      const { error } = await supabase
        .from('goals')
        .update({ 
          progress: progress,
          status: status,
          completedDate: progress >= 100 ? new Date().toISOString() : null
        })
        .eq('id', goalId)
      
      if (error) {
        console.error('Error updating goal progress:', error)
        sendNotification({
          title: 'Error al actualizar',
          body: 'No se pudo actualizar el progreso de la meta'
        })
        setUpdatingGoal(prev => ({ ...prev, [goalId]: false }))
        return
      }
      
      await loadGoals()
      setUpdatingGoal(prev => ({ ...prev, [goalId]: false }))
      
      if (progress >= 100) {
        fireConfetti()
        sendNotification({
          title: '¡Meta completada! 🎉',
          body: `Has completado: ${goal.title}`
        })
      } else if (progress > goal.progress) {
        sendNotification({
          title: 'Progreso actualizado',
          body: `Progreso de "${goal.title}": ${progress}%`
        })
      } else if (progress < goal.progress) {
        sendNotification({
          title: 'Progreso retrocedido',
          body: `Progreso de "${goal.title}": ${progress}%`
        })
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      sendNotification({
        title: 'Error inesperado',
        body: 'Ocurrió un error al actualizar la meta'
      })
      setUpdatingGoal(prev => ({ ...prev, [goalId]: false }))
    }
  }

  const toggleDreamAchieved = async (dreamId: number) => {
    const dream = dreams.find(d => d.id === dreamId)
    if (!dream) return
    
    const newIsAchieved = !dream.isAchieved
    
    try {
      const { error } = await supabase
        .from('dreams')
        .update({
          isAchieved: newIsAchieved,
          achievedDate: newIsAchieved ? new Date().toISOString() : null
        })
        .eq('id', dreamId)
      
      if (error) {
        console.error('Error updating dream:', error)
        sendNotification({
          title: 'Error al actualizar',
          body: 'No se pudo actualizar el estado del sueño'
        })
        return
      }
      
      await loadDreams()
      
      if (newIsAchieved) {
        fireConfetti()
        sendNotification({
          title: '¡Sueño cumplido! 🎉',
          body: `Has logrado: ${dream.title}`
        })
      } else {
        sendNotification({
          title: 'Sueño desmarcado',
          body: `Has desmarcado: ${dream.title}`
        })
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      sendNotification({
        title: 'Error inesperado',
        body: 'Ocurrió un error al actualizar el sueño'
      })
    }
  }

  const deleteGoal = async (goalId: number) => {
    await supabase.from('goals').delete().eq('id', goalId)
    await loadGoals()
  }

  const deleteDream = async (dreamId: number) => {
    await supabase.from('dreams').delete().eq('id', dreamId)
    await loadDreams()
  }

  const editGoal = async () => {
    if (!selectedGoal || !goalForm.title) return

    const updates = {
      title: goalForm.title,
      description: goalForm.description,
      category: goalForm.category,
      type: goalForm.type,
      priority: goalForm.priority,
      targetDate: goalForm.targetDate || null,
      budget: goalForm.budget || null,
      location: goalForm.location || null,
      participants: goalForm.participants,
      tags: goalForm.tags,
      notes: goalForm.notes || null,
      isPrivate: goalForm.isPrivate,
      isFavorite: goalForm.isFavorite
    }

    const { error } = await supabase.from('goals').update(updates).eq('id', selectedGoal.id)
    if (error) {
      console.error('Error updating goal:', error)
      return
    }
    
    await loadGoals()
    setShowEditGoalDialog(false)
    setSelectedGoal(null)

    sendNotification({
      title: 'Meta actualizada',
      body: `Se ha actualizado la meta: ${goalForm.title}`
    })
  }

  const editDream = async () => {
    if (!selectedDream || !dreamForm.title) return

    const updates = {
      title: dreamForm.title,
      description: dreamForm.description,
      category: dreamForm.category,
      priority: dreamForm.priority,
      estimatedCost: dreamForm.estimatedCost || null,
      location: dreamForm.location || null,
      timeframe: dreamForm.timeframe,
      isShared: dreamForm.isShared,
      notes: dreamForm.notes || null
    }

    const { error } = await supabase.from('dreams').update(updates).eq('id', selectedDream.id)
    if (error) {
      console.error('Error updating dream:', error)
      return
    }
    
    await loadDreams()
    setShowEditDreamDialog(false)
    setSelectedDream(null)

    sendNotification({
      title: 'Sueño actualizado',
      body: `Se ha actualizado el sueño: ${dreamForm.title}`
    })
  }

  const openEditGoalDialog = (goal: Goal) => {
    setSelectedGoal(goal)
    setGoalForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      type: goal.type,
      priority: goal.priority,
      targetDate: goal.targetDate || '',
      budget: goal.budget || 0,
      location: goal.location || '',
      participants: goal.participants,
      tags: goal.tags,
      notes: goal.notes || '',
      isPrivate: goal.isPrivate,
      isFavorite: goal.isFavorite
    })
    setShowEditGoalDialog(true)
  }

  const openEditDreamDialog = (dream: Dream) => {
    setSelectedDream(dream)
    setDreamForm({
      title: dream.title,
      description: dream.description,
      category: dream.category,
      priority: dream.priority,
      estimatedCost: dream.estimatedCost || 0,
      location: dream.location || '',
      timeframe: dream.timeframe || 'este_año',
      isShared: dream.isShared,
      notes: dream.notes || ''
    })
    setShowEditDreamDialog(true)
  }

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.value === category)?.icon || '🎯'
  }

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200'
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Baja': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado': return 'bg-green-100 text-green-800 border-green-200'
      case 'en_progreso': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pausado': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <Target className="h-10 w-10 text-primary" />
          Nuestras Metas y Sueños
        </h1>
        <p className="text-gray-600 text-lg">
          Planifica tu futuro juntos y haz realidad tus sueños
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Metas</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalGoals}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completadas</p>
                <p className="text-2xl font-bold text-green-700">{stats.completedGoals}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Sueños</p>
                <p className="text-2xl font-bold text-purple-700">{stats.totalDreams}</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Progreso</p>
                <p className="text-2xl font-bold text-orange-700">{stats.averageProgress.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600 font-medium">Próximas</p>
                <p className="text-2xl font-bold text-pink-700">{stats.upcomingDeadlines}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metas" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="sueños" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Sueños
          </TabsTrigger>
        </TabsList>

        {/* Tab: Metas */}
        <TabsContent value="metas" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Input
                placeholder="Buscar metas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddGoalDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Meta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`hover:shadow-lg transition-all duration-200 ${
                  goal.isFavorite ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {goal.title}
                          {goal.isPrivate && <EyeOff className="h-4 w-4 text-gray-400" />}
                          {goal.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {goal.description}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCategoryColor(goal.category)}>
                        {getCategoryIcon(goal.category)} {categories.find(c => c.value === goal.category)?.label}
                      </Badge>
                      <Badge className={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status === 'completado' ? 'Completado' : 
                         goal.status === 'en_progreso' ? 'En Progreso' : 
                         goal.status === 'pendiente' ? 'Pendiente' : 
                         goal.status === 'pausado' ? 'Pausado' : 'Cancelado'}
                      </Badge>
                    </div>

                    {/* Progreso */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="h-2">
  <Progress value={goal.progress} />
</div>
                    </div>

                    {/* Información adicional */}
                    <div className="space-y-2 text-sm text-gray-600">
                      {goal.targetDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Meta: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {goal.budget && goal.budget > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Presupuesto: ${goal.budget.toLocaleString()}</span>
                        </div>
                      )}
                      {goal.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{goal.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (updatingGoal[goal.id]) return
                          const newProgress = Math.min(goal.progress + 25, 100)
                          updateGoalProgress(goal.id, newProgress)
                        }}
                        disabled={goal.status === 'completado'}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Avanzar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (updatingGoal[goal.id]) return
                          const newProgress = Math.max(goal.progress - 25, 0)
                          updateGoalProgress(goal.id, newProgress)
                        }}
                        disabled={goal.progress === 0}
                      >
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Retroceder
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (updatingGoal[goal.id]) return
                          updateGoalProgress(goal.id, 0)
                        }}
                        disabled={goal.progress === 0}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Resetear
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditGoalDialog(goal)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Sueños */}
        <TabsContent value="sueños" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Input
                placeholder="Buscar sueños..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas las categorías</SelectItem>
                  {dreamCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddDreamDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Sueño
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDreams.map((dream) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`hover:shadow-lg transition-all duration-200 ${
                  dream.isAchieved ? 'ring-2 ring-green-200 bg-green-50' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {dream.title}
                          {dream.isAchieved && <Trophy className="h-4 w-4 text-green-500" />}
                          {dream.isShared && <Users2 className="h-4 w-4 text-blue-500" />}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {dream.description}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDream(dream.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        {dreamCategories.find(c => c.value === dream.category)?.icon} {dreamCategories.find(c => c.value === dream.category)?.label}
                      </Badge>
                      <Badge className={getPriorityColor(dream.priority)}>
                        {dream.priority}
                      </Badge>
                      {dream.isAchieved && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          ¡Logrado!
                        </Badge>
                      )}
                    </div>

                    {/* Información adicional */}
                    <div className="space-y-2 text-sm text-gray-600">
                      {dream.estimatedCost && dream.estimatedCost > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Costo estimado: ${dream.estimatedCost.toLocaleString()}</span>
                        </div>
                      )}
                      {dream.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{dream.location}</span>
                        </div>
                      )}
                      {dream.timeframe && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Plazo: {dream.timeframe === 'pronto' ? 'Pronto' : 
                                       dream.timeframe === 'este_año' ? 'Este año' : 
                                       dream.timeframe === 'proximo_año' ? 'Próximo año' : 'Futuro lejano'}</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDreamAchieved(dream.id)}
                      >
                        {dream.isAchieved ? (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Desmarcar
                          </>
                        ) : (
                          <>
                            <Trophy className="h-4 w-4 mr-1" />
                            ¡Logrado!
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDreamDialog(dream)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Agregar Meta */}
      <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Meta</DialogTitle>
            <DialogDescription>
              Define una nueva meta personal o de pareja.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title">Título *</label>
              <Input
                id="title"
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                placeholder="Ej: Comprar nuestra casa"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                placeholder="Describe tu meta..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="category">Categoría</label>
                                 <Select value={goalForm.category} onValueChange={(value: string) => setGoalForm({ ...goalForm, category: value as Goal['category'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="type">Tipo</label>
                                 <Select value={goalForm.type} onValueChange={(value: string) => setGoalForm({ ...goalForm, type: value as Goal['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corto_plazo">Corto Plazo</SelectItem>
                    <SelectItem value="mediano_plazo">Mediano Plazo</SelectItem>
                    <SelectItem value="largo_plazo">Largo Plazo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="priority">Prioridad</label>
                                 <Select value={goalForm.priority} onValueChange={(value: string) => setGoalForm({ ...goalForm, priority: value as Goal['priority'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="targetDate">Fecha Meta</label>
                <Input
                  id="targetDate"
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="budget">Presupuesto</label>
                <Input
                  id="budget"
                  type="number"
                  value={goalForm.budget}
                  onChange={(e) => setGoalForm({ ...goalForm, budget: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="location">Ubicación</label>
                <Input
                  id="location"
                  value={goalForm.location}
                  onChange={(e) => setGoalForm({ ...goalForm, location: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                value={goalForm.notes}
                onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={goalForm.isPrivate}
                  onChange={(e) => setGoalForm({ ...goalForm, isPrivate: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isPrivate">Meta privada</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFavorite"
                  checked={goalForm.isFavorite}
                  onChange={(e) => setGoalForm({ ...goalForm, isFavorite: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isFavorite">Favorita</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGoalDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addGoal} disabled={!goalForm.title}>
              Crear Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Agregar Sueño */}
      <Dialog open={showAddDreamDialog} onOpenChange={setShowAddDreamDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuevo Sueño</DialogTitle>
            <DialogDescription>
              Agrega un sueño que quieras hacer realidad.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="dream-title">Título *</label>
              <Input
                id="dream-title"
                value={dreamForm.title}
                onChange={(e) => setDreamForm({ ...dreamForm, title: e.target.value })}
                placeholder="Ej: Viajar a Japón"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="dream-description">Descripción</label>
              <textarea
                id="dream-description"
                value={dreamForm.description}
                onChange={(e) => setDreamForm({ ...dreamForm, description: e.target.value })}
                placeholder="Describe tu sueño..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="dream-category">Categoría</label>
                                 <Select value={dreamForm.category} onValueChange={(value: string) => setDreamForm({ ...dreamForm, category: value as Dream['category'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dreamCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="dream-priority">Prioridad</label>
                                 <Select value={dreamForm.priority} onValueChange={(value: string) => setDreamForm({ ...dreamForm, priority: value as Dream['priority'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="dream-cost">Costo Estimado</label>
                <Input
                  id="dream-cost"
                  type="number"
                  value={dreamForm.estimatedCost}
                  onChange={(e) => setDreamForm({ ...dreamForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="dream-timeframe">Plazo</label>
                                 <Select value={dreamForm.timeframe} onValueChange={(value: string) => setDreamForm({ ...dreamForm, timeframe: value as Dream['timeframe'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pronto">Pronto</SelectItem>
                    <SelectItem value="este_año">Este año</SelectItem>
                    <SelectItem value="proximo_año">Próximo año</SelectItem>
                    <SelectItem value="futuro_lejano">Futuro lejano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="dream-location">Ubicación</label>
              <Input
                id="dream-location"
                value={dreamForm.location}
                onChange={(e) => setDreamForm({ ...dreamForm, location: e.target.value })}
                placeholder="Opcional"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="dream-notes">Notas</label>
              <textarea
                id="dream-notes"
                value={dreamForm.notes}
                onChange={(e) => setDreamForm({ ...dreamForm, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isShared"
                checked={dreamForm.isShared}
                onChange={(e) => setDreamForm({ ...dreamForm, isShared: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isShared">Sueño compartido con mi pareja</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDreamDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addDream} disabled={!dreamForm.title}>
              Agregar Sueño
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Meta */}
      <Dialog open={showEditGoalDialog} onOpenChange={setShowEditGoalDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la meta.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title">Título *</label>
              <Input
                id="edit-title"
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                placeholder="Ej: Comprar nuestra casa"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description">Descripción</label>
              <textarea
                id="edit-description"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                placeholder="Describe tu meta..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-category">Categoría</label>
                                 <Select value={goalForm.category} onValueChange={(value: string) => setGoalForm({ ...goalForm, category: value as Goal['category'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-type">Tipo</label>
                                 <Select value={goalForm.type} onValueChange={(value: string) => setGoalForm({ ...goalForm, type: value as Goal['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corto_plazo">Corto Plazo</SelectItem>
                    <SelectItem value="mediano_plazo">Mediano Plazo</SelectItem>
                    <SelectItem value="largo_plazo">Largo Plazo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-priority">Prioridad</label>
                                 <Select value={goalForm.priority} onValueChange={(value: string) => setGoalForm({ ...goalForm, priority: value as Goal['priority'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-targetDate">Fecha Meta</label>
                <Input
                  id="edit-targetDate"
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-budget">Presupuesto</label>
                <Input
                  id="edit-budget"
                  type="number"
                  value={goalForm.budget}
                  onChange={(e) => setGoalForm({ ...goalForm, budget: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-location">Ubicación</label>
                <Input
                  id="edit-location"
                  value={goalForm.location}
                  onChange={(e) => setGoalForm({ ...goalForm, location: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-notes">Notas</label>
              <textarea
                id="edit-notes"
                value={goalForm.notes}
                onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isPrivate"
                  checked={goalForm.isPrivate}
                  onChange={(e) => setGoalForm({ ...goalForm, isPrivate: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="edit-isPrivate">Meta privada</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isFavorite"
                  checked={goalForm.isFavorite}
                  onChange={(e) => setGoalForm({ ...goalForm, isFavorite: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="edit-isFavorite">Favorita</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditGoalDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={editGoal} disabled={!goalForm.title}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Sueño */}
      <Dialog open={showEditDreamDialog} onOpenChange={setShowEditDreamDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Sueño</DialogTitle>
            <DialogDescription>
              Modifica los detalles del sueño.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-dream-title">Título *</label>
              <Input
                id="edit-dream-title"
                value={dreamForm.title}
                onChange={(e) => setDreamForm({ ...dreamForm, title: e.target.value })}
                placeholder="Ej: Viajar a Japón"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-dream-description">Descripción</label>
              <textarea
                id="edit-dream-description"
                value={dreamForm.description}
                onChange={(e) => setDreamForm({ ...dreamForm, description: e.target.value })}
                placeholder="Describe tu sueño..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-dream-category">Categoría</label>
                                 <Select value={dreamForm.category} onValueChange={(value: string) => setDreamForm({ ...dreamForm, category: value as Dream['category'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dreamCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-dream-priority">Prioridad</label>
                                 <Select value={dreamForm.priority} onValueChange={(value: string) => setDreamForm({ ...dreamForm, priority: value as Dream['priority'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="edit-dream-cost">Costo Estimado</label>
                <Input
                  id="edit-dream-cost"
                  type="number"
                  value={dreamForm.estimatedCost}
                  onChange={(e) => setDreamForm({ ...dreamForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-dream-timeframe">Plazo</label>
                                 <Select value={dreamForm.timeframe} onValueChange={(value: string) => setDreamForm({ ...dreamForm, timeframe: value as Dream['timeframe'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pronto">Pronto</SelectItem>
                    <SelectItem value="este_año">Este año</SelectItem>
                    <SelectItem value="proximo_año">Próximo año</SelectItem>
                    <SelectItem value="futuro_lejano">Futuro lejano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-dream-location">Ubicación</label>
              <Input
                id="edit-dream-location"
                value={dreamForm.location}
                onChange={(e) => setDreamForm({ ...dreamForm, location: e.target.value })}
                placeholder="Opcional"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-dream-notes">Notas</label>
              <textarea
                id="edit-dream-notes"
                value={dreamForm.notes}
                onChange={(e) => setDreamForm({ ...dreamForm, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isShared"
                checked={dreamForm.isShared}
                onChange={(e) => setDreamForm({ ...dreamForm, isShared: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="edit-isShared">Sueño compartido con mi pareja</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDreamDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={editDream} disabled={!dreamForm.title}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
