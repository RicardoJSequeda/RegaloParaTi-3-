// Tipos de autenticación
export interface AuthState {
  isLoggedIn: boolean
  anniversaryDate: string | null
}

// Tipos de tema
export interface ThemeState {
  isDarkMode: boolean
}

export interface UserPreferences {
  showFloatingHearts: boolean
  floatingHeartsInDarkMode: boolean
}

// Tipos de navegación
export type Section = 'inicio' | 'recuerdos' | 'mensajes' | 'musica' | 'recetas' | 'planes' | 'peliculas' | 'fotos' | 'mascotas'

export interface NavigationItem {
  id: Section
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// Tipos de recuerdos
export interface Memory {
  id: string
  title: string
  description?: string
  image_url?: string
  date_taken?: string
  type: 'aniversario' | 'viajes' | 'eventos' | 'otros'
  location?: string
  coordinates?: { x: number; y: number }
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  title: string
  description?: string
  image_url?: string
  date_taken: string
  type: 'aniversario' | 'viajes' | 'eventos' | 'otros'
  location?: string
  coordinates?: { x: number; y: number }
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface MemoryPlace {
  id: string
  name: string
  address?: string
  lat?: number
  lng?: number
  type: 'parque' | 'restaurante' | 'playa' | 'ciudad' | 'museo' | 'teatro' | 'café' | 'bar' | 'club' | 'gimnasio' | 'otro'
  status: 'visitado' | 'pendiente'
  visit_date?: string
  description?: string
  image_url?: string
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface Curiosity {
  id: string
  text: string
  category?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Tipos de línea de tiempo
export interface TimelineEvent {
  id: number
  date: string
  title: string
  description: string
  image: string
  type: 'first-meeting' | 'first-date' | 'beach-trip' | 'anniversary' | 'other'
  location: string
}

// Tipos de galería de fotos
export interface GalleryPhoto {
  id: string
  title: string
  date: string
  image: string
}

// Tipos de lugares
export interface Place {
  id: number
  name: string
  location: string
  date?: string
  type: string
  priority?: 'Alta' | 'Media' | 'Baja'
}

export interface PlacesData {
  visited: Place[]
  toVisit: Place[]
}

// Tipos para el mapa de Google Maps
export interface MapPlace {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  type: string
  visited: boolean
}

// Tipos de música
export interface Song {
  id: number
  title: string
  artist: string
  description: string
  image: string
}

// Tipos de fotos y videos
export interface Photo {
  id: string
  title: string
  description?: string
  image_url: string
  thumbnail_url?: string
  file_type: 'image' | 'video' | 'gif'
  category: 'romantico' | 'familia' | 'amigos' | 'viajes' | 'eventos' | 'mascotas' | 'comida' | 'naturaleza' | 'arte' | 'otro'
  tags: string[]
  location?: string
  date_taken?: string
  favorite: boolean
  created_at: string
  updated_at: string
}

// Tipos de planes
export interface Plan {
  id: number
  title: string
  description: string
  date: string
  time?: string
  location?: string
  status: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado'
  image?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

// Tipos de logros
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'plans' | 'dates' | 'special' | 'milestone'
  condition: {
    type: 'plans_completed' | 'plans_created' | 'streak' | 'special_date' | 'custom' | 
           'romantic_plans_completed' | 'adventure_plans_completed' | 'gastronomic_plans_completed' |
           'cultural_plans_completed' | 'relax_plans_completed' | 'high_priority_completed' |
           'plans_with_reminders' | 'plans_with_participants' | 'on_time_completed' |
           'different_locations' | 'different_categories' | 'weekly_streak' | 'all_achievements'
    value: number | string
  }
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

// Tipos de corazones flotantes
export interface FloatingHeart {
  id: number
  x: number
  y: number
}

// Props de componentes
export interface LoginFormProps {
  onLogin: (date: string) => void
  onToggleDarkMode: () => void
  isDarkMode: boolean
}

export interface DashboardProps {
  onLogout: () => void
  onToggleDarkMode: () => void
  isDarkMode: boolean
}

export interface ContentSectionProps {
  section: Section
}

// Tipos de eventos
export interface AuthEvents {
  login: (date: string) => void
  logout: () => void
}

export interface ThemeEvents {
  toggleDarkMode: () => void
}

// Tipos de mascotas
export interface Pet {
  id: number
  name: string
  type: 'perro' | 'gato' | 'pajaro' | 'pez' | 'hamster' | 'conejo' | 'otro'
  breed?: string
  birthDate?: string
  weight?: number
  color?: string
  image?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PetCareTask {
  id: number
  petId: number
  title: string
  description: string
  type: 'alimentacion' | 'ejercicio' | 'limpieza' | 'veterinario' | 'medicina' | 'otro'
  frequency: 'diario' | 'semanal' | 'mensual' | 'personalizado'
  lastCompleted?: string
  nextDue: string
  priority: 'Alta' | 'Media' | 'Baja'
  status: 'pendiente' | 'completado' | 'atrasado'
  reminder?: {
    enabled: boolean
    time: string
    type: 'notification' | 'email' | 'both'
  }
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PetHealthRecord {
  id: number
  petId: number
  date: string
  type: 'vacuna' | 'desparasitacion' | 'revision' | 'tratamiento' | 'otro'
  title: string
  description: string
  veterinarian?: string
  clinic?: string
  cost?: number
  nextDue?: string
  notes?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface PetExpense {
  id: number
  petId: number
  date: string
  category: 'alimentacion' | 'veterinario' | 'accesorios' | 'juguetes' | 'limpieza' | 'medicina' | 'servicios' | 'otro'
  title: string
  amount: number
  description?: string
  receipt?: string
  recurring?: boolean
  frequency?: 'mensual' | 'trimestral' | 'semestral' | 'anual'
  createdAt: string
  updatedAt: string
}

// Tipos para fotos de mascotas
export interface PetPhoto {
  id: number
  petId: number
  title: string
  description?: string
  image: string
  date: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

// Tipos para inventario de mascotas
export interface PetInventory {
  id: number
  petId: number
  name: string
  category: 'alimentacion' | 'juguetes' | 'accesorios' | 'limpieza' | 'medicina' | 'otro'
  description?: string
  quantity: number
  unit?: string
  price?: number
  purchaseDate?: string
  expiryDate?: string
  image?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Tipos para medicamentos de mascotas
export interface PetMedication {
  id: number
  petId: number
  name: string
  description: string
  dosage: string
  frequency: 'una_vez' | 'diario' | 'cada_12h' | 'cada_8h' | 'cada_6h' | 'personalizado'
  startDate: string
  endDate?: string
  timesPerDay: number
  specificTimes?: string[] // Horarios específicos
  status: 'activo' | 'pausado' | 'completado'
  veterinarian?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Tipos para seguimiento de peso y medidas
export interface PetWeightRecord {
  id: number
  petId: number
  date: string
  weight: number
  notes?: string
  createdAt: string
}

// Tipos para comportamiento de mascotas
export interface PetBehaviorRecord {
  id: number
  petId: number
  date: string
  type: 'positivo' | 'negativo' | 'neutro'
  title: string
  description: string
  severity?: 'leve' | 'moderado' | 'grave'
  notes?: string
  createdAt: string
}

// Tipos para gastos detallados de mascotas
export interface PetExpense {
  id: number
  petId: number
  date: string
  category: 'alimentacion' | 'veterinario' | 'accesorios' | 'juguetes' | 'limpieza' | 'medicina' | 'servicios' | 'otro'
  title: string
  amount: number
  description?: string
  receipt?: string
  recurring?: boolean
  frequency?: 'mensual' | 'trimestral' | 'semestral' | 'anual'
  createdAt: string
  updatedAt: string
}

// Tipos para reportes y estadísticas
export interface PetStats {
  totalExpenses: number
  monthlyExpenses: number
  tasksCompleted: number
  tasksPending: number
  healthRecords: number
  photosCount: number
  inventoryItems: number
  medicationsActive: number
}

// Tipos para recordatorios mejorados
export interface PetReminder {
  id: number
  petId: number
  title: string
  description: string
  date: string
  time: string
  type: 'task' | 'medication' | 'health' | 'custom'
  priority: 'Alta' | 'Media' | 'Baja'
  status: 'pending' | 'completed' | 'dismissed'
  notificationSent: boolean
  createdAt: string
  updatedAt: string
}

// Tipos para Metas y Sueños
export interface Goal {
  id: number
  title: string
  description: string
  category: 'personal' | 'pareja' | 'profesional' | 'financiero' | 'salud' | 'viajes' | 'hogar' | 'familia' | 'otro'
  type: 'corto_plazo' | 'mediano_plazo' | 'largo_plazo'
  priority: 'Alta' | 'Media' | 'Baja'
  status: 'pendiente' | 'en_progreso' | 'completado' | 'pausado' | 'cancelado'
  targetDate?: string
  completedDate?: string
  progress: number // 0-100
  milestones: GoalMilestone[]
  budget?: number
  currentSpent?: number
  location?: string
  participants: string[]
  tags: string[]
  images?: string[]
  notes?: string
  isPrivate: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface GoalMilestone {
  id: number
  goalId: number
  title: string
  description?: string
  targetDate?: string
  completedDate?: string
  status: 'pendiente' | 'completado'
  progress: number
  notes?: string
  createdAt: string
}

export interface Dream {
  id: number
  title: string
  description: string
  category: 'viaje' | 'hogar' | 'experiencia' | 'objeto' | 'logro' | 'otro'
  priority: 'Alta' | 'Media' | 'Baja'
  estimatedCost?: number
  location?: string
  timeframe?: 'pronto' | 'este_año' | 'proximo_año' | 'futuro_lejano'
  isShared: boolean
  isAchieved: boolean
  achievedDate?: string
  images?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface GoalStats {
  totalGoals: number
  completedGoals: number
  inProgressGoals: number
  pendingGoals: number
  totalDreams: number
  achievedDreams: number
  averageProgress: number
  upcomingDeadlines: number
  totalBudget: number
  spentBudget: number
}
