'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Pet, 
  PetCareTask, 
  PetHealthRecord, 
  PetPhoto, 
  PetStats
} from '@/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { getBrowserClient } from '@/lib/supabase/browser-client'
import { useNotifications } from '@/hooks/useNotifications'
import { FormValidation, validators, validateForm } from '@/components/ui/form-validation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ImageUpload } from '@/components/ui/image-upload'
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
import { 
  Plus, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  Heart,
  PawPrint,
  Stethoscope,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  CalendarDays,
  Trophy,
  Star,
  Target,
  Award,
  Dog,
  Cat,
  Bird,
  Fish,
  Mouse,
  Rabbit,
  Activity,
  Droplets,
  Pill,
  Syringe,
  Scissors,
  Bone,
  Shirt,
  Camera,
  Image,
  UserPlus,
  Settings,
  Info,
  X
} from 'lucide-react'

const initialPets: Pet[] = [
  {
    id: 1,
    name: 'Don Estrella',
    type: 'gato',
    breed: 'Siamés',
    birthDate: '2023-09-15',

    color: 'Crema con puntos marrones',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&crop=center',
    notes: 'Muy elegante y curioso, le encanta explorar y dormir en lugares altos',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
]

const initialTasks: PetCareTask[] = [
  {
    id: 1,
    petId: 1,
    title: 'Alimentación de Don Estrella',
    description: 'Dar comida húmeda y seca para gatos',
    type: 'alimentacion',
    frequency: 'diario',
    lastCompleted: '2024-01-20T08:00:00Z',
    nextDue: '2024-01-21T08:00:00Z',
    priority: 'Alta',
    status: 'pendiente',
    reminder: {
      enabled: true,
      time: '1h',
      type: 'notification'
    },
    notes: 'Usar comida premium para gatitos',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    petId: 1,
    title: 'Juego con Don Estrella',
    description: 'Sesión de juego con juguetes',
    type: 'ejercicio',
    frequency: 'diario',
    lastCompleted: '2024-01-20T18:00:00Z',
    nextDue: '2024-01-21T18:00:00Z',
    priority: 'Alta',
    status: 'pendiente',
    reminder: {
      enabled: true,
      time: '30m',
      type: 'notification'
    },
    notes: 'Usar juguetes con plumas y ratones',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 3,
    petId: 1,
    title: 'Cepillado de Don Estrella',
    description: 'Cepillado del pelaje suave',
    type: 'limpieza',
    frequency: 'semanal',
    lastCompleted: '2024-01-18T10:00:00Z',
    nextDue: '2024-01-25T10:00:00Z',
    priority: 'Media',
    status: 'pendiente',
    reminder: {
      enabled: true,
      time: '2h',
      type: 'notification'
    },
    notes: 'Usar cepillo suave para gatos',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 4,
    petId: 1,
    title: 'Limpieza de arenero',
    description: 'Cambiar arena y limpiar arenero',
    type: 'limpieza',
    frequency: 'diario',
    lastCompleted: '2024-01-20T16:00:00Z',
    nextDue: '2024-01-21T16:00:00Z',
    priority: 'Alta',
    status: 'pendiente',
    reminder: {
      enabled: true,
      time: '1h',
      type: 'notification'
    },
    notes: 'Usar arena aglomerante',
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-01T09:15:00Z'
  },
  {
    id: 5,
    petId: 1,
    title: 'Revisión veterinaria',
    description: 'Chequeo de salud del gatito',
    type: 'veterinario',
    frequency: 'mensual',
    lastCompleted: '2024-01-17T17:00:00Z',
    nextDue: '2024-02-17T17:00:00Z',
    priority: 'Media',
    status: 'pendiente',
    reminder: {
      enabled: true,
      time: '1d',
      type: 'notification'
    },
    notes: 'Llevar cartilla de vacunación',
    createdAt: '2024-01-25T16:45:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  },
  {
    id: 6,
    petId: 1,
    title: 'Corte de uñas',
    description: 'Corte de uñas delanteras',
    type: 'limpieza',
    frequency: 'mensual',
    lastCompleted: '2024-01-19T09:00:00Z',
    nextDue: '2024-02-19T09:00:00Z',
    priority: 'Media',
    status: 'pendiente',
    reminder: {
      enabled: true,
      time: '1h',
      type: 'notification'
    },
    notes: 'Usar cortaúñas para gatos',
    createdAt: '2024-02-05T11:20:00Z',
    updatedAt: '2024-02-05T11:20:00Z'
  },
  {
    id: 7,
    petId: 1,
    title: 'Vacunación',
    description: 'Vacuna triple felina',
    type: 'veterinario',
    frequency: 'mensual',
    lastCompleted: '2024-01-15T11:00:00Z',
    nextDue: '2024-02-15T11:00:00Z',
    priority: 'Alta',
    status: 'pendiente',
    reminder: {
      enabled: true,
      time: '1d',
      type: 'notification'
    },
    notes: 'Llevar a veterinaria especializada',
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-02-10T14:00:00Z'
  },
  {
    id: 8,
    petId: 1,
    title: 'Desparasitación',
    description: 'Tratamiento antiparasitario',
    type: 'veterinario',
    frequency: 'mensual',
    lastCompleted: '2024-01-20T08:00:00Z',
    nextDue: '2024-02-20T08:00:00Z',
    priority: 'Alta',
    status: 'pendiente',
    reminder: {
      enabled: true,
      time: '1d',
      type: 'notification'
    },
    notes: 'Aplicar pipeta antiparasitaria',
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-02-15T10:30:00Z'
  },
  {
    id: 9,
    petId: 1,
    title: 'Limpieza de ojos',
    description: 'Limpieza de ojos y cara',
    type: 'limpieza',
    frequency: 'semanal',
    lastCompleted: '2024-01-17T17:00:00Z',
    nextDue: '2024-01-24T17:00:00Z',
    priority: 'Media',
    status: 'pendiente',
    reminder: {
      enabled: true,
      time: '1h',
      type: 'notification'
    },
    notes: 'Usar toallitas húmedas especiales',
    createdAt: '2024-01-30T13:20:00Z',
    updatedAt: '2024-01-30T13:20:00Z'
  },
  {
    id: 10,
    petId: 1,
    title: 'Ejercicio mental',
    description: 'Juegos de estimulación mental',
    type: 'ejercicio',
    frequency: 'diario',
    lastCompleted: '2024-01-15T11:00:00Z',
    nextDue: '2024-01-16T11:00:00Z',
    priority: 'Media',
    status: 'pendiente',
    reminder: {
      enabled: true,
      time: '1h',
      type: 'notification'
    },
    notes: 'Usar puzzles y juguetes interactivos',
    createdAt: '2024-02-08T15:45:00Z',
    updatedAt: '2024-02-08T15:45:00Z'
  }
]

const initialHealthRecords: PetHealthRecord[] = [
  {
    id: 1,
    petId: 1,
    date: '2024-01-15',
    type: 'vacuna',
    title: 'Vacuna Triple Felina',
    description: 'Vacuna contra panleucopenia, calicivirus y rinotraqueitis',
    veterinarian: 'Dr. García',
    clinic: 'Clínica Veterinaria Felina',
    cost: 45,
    nextDue: '2025-01-15',
    notes: 'Don Estrella se portó muy bien durante la vacunación',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    petId: 1,
    date: '2024-01-10',
    type: 'revision',
    title: 'Revisión General',
    description: 'Chequeo de salud general y peso del gatito',
    veterinarian: 'Dra. Martínez',
    clinic: 'Clínica Veterinaria Felina',
    cost: 35,
    notes: 'Don Estrella está en perfecto estado de salud',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: 3,
    petId: 1,
    date: '2024-02-01',
    type: 'vacuna',
    title: 'Vacuna contra la Leucemia',
    description: 'Vacuna contra leucemia felina',
    veterinarian: 'Dr. López',
    clinic: 'Clínica Veterinaria Moderna',
    cost: 30,
    nextDue: '2025-02-01',
    notes: 'Don Estrella fue muy valiente durante la vacunación',
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-01T09:15:00Z'
  },
  {
    id: 4,
    petId: 1,
    date: '2024-01-25',
    type: 'tratamiento',
    title: 'Desparasitación',
    description: 'Tratamiento antiparasitario interno y externo',
    veterinarian: 'Dra. Rodríguez',
    clinic: 'Centro Veterinario Especializado',
    cost: 25,
    notes: 'Don Estrella toleró bien el tratamiento',
    createdAt: '2024-01-25T16:45:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  },
  {
    id: 5,
    petId: 1,
    date: '2024-02-05',
    type: 'revision',
    title: 'Chequeo de Peso',
    description: 'Control de peso y crecimiento del gatito',
    veterinarian: 'Dr. García',
    clinic: 'Clínica Veterinaria Felina',
    cost: 25,
    notes: 'Don Estrella mantiene un peso saludable para su edad',
    createdAt: '2024-02-05T11:20:00Z',
    updatedAt: '2024-02-05T11:20:00Z'
  },
  {
    id: 6,
    petId: 1,
    date: '2024-02-10',
    type: 'revision',
    title: 'Revisión de Ojos',
    description: 'Chequeo de la vista y ojos del gatito',
    veterinarian: 'Dr. Oftalmólogo',
    clinic: 'Clínica Veterinaria Especializada',
    cost: 40,
    notes: 'Los ojos de Don Estrella están perfectos',
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-02-10T14:00:00Z'
  },
  {
    id: 7,
    petId: 1,
    date: '2024-02-15',
    type: 'vacuna',
    title: 'Vacuna contra la Rabia',
    description: 'Vacuna contra la rabia',
    veterinarian: 'Dra. García',
    clinic: 'Clínica Veterinaria Felina',
    cost: 35,
    nextDue: '2025-02-15',
    notes: 'Don Estrella se portó muy bien',
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-02-15T10:30:00Z'
  },
  {
    id: 8,
    petId: 1,
    date: '2024-01-30',
    type: 'revision',
    title: 'Chequeo de Corazón',
    description: 'Control cardíaco y pulso del gatito',
    veterinarian: 'Dr. Cardiólogo',
    clinic: 'Clínica Veterinaria Felina',
    cost: 50,
    notes: 'El corazón de Don Estrella funciona perfectamente',
    createdAt: '2024-01-30T13:20:00Z',
    updatedAt: '2024-01-30T13:20:00Z'
  },
  {
    id: 9,
    petId: 1,
    date: '2024-02-08',
    type: 'tratamiento',
    title: 'Esterilización',
    description: 'Procedimiento de esterilización',
    veterinarian: 'Dra. Martínez',
    clinic: 'Clínica Veterinaria Felina',
    cost: 120,
    notes: 'Don Estrella se recuperó muy bien',
    createdAt: '2024-02-08T15:45:00Z',
    updatedAt: '2024-02-08T15:45:00Z'
  },
  {
    id: 10,
    petId: 1,
    date: '2024-02-20',
    type: 'revision',
    title: 'Revisión de Piel',
    description: 'Chequeo de la piel y pelaje del gatito',
    veterinarian: 'Dr. Dermatólogo',
    clinic: 'Clínica Veterinaria Especializada',
    cost: 45,
    notes: 'La piel y pelaje de Don Estrella están saludables',
    createdAt: '2024-02-20T12:00:00Z',
    updatedAt: '2024-02-20T12:00:00Z'
  }
]



const initialPhotos: PetPhoto[] = [
  {
    id: 1,
    petId: 1,
    title: 'Don Estrella durmiendo',
    description: 'Descansando en su lugar favorito',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&crop=center',
    date: '2024-01-15',
    tags: ['descanso', 'hogar'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    petId: 1,
    title: 'Don Estrella jugando',
    description: 'Jugando con su juguete favorito',
    image: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&h=400&fit=crop&crop=center',
    date: '2024-01-16',
    tags: ['juego', 'actividad'],
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z'
  },
  {
    id: 3,
    petId: 1,
    title: 'Don Estrella explorando',
    description: 'Investigando su nuevo territorio',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&crop=center',
    date: '2024-01-17',
    tags: ['exploración', 'curiosidad'],
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z'
  },
  {
    id: 4,
    petId: 1,
    title: 'Don Estrella en la ventana',
    description: 'Observando el mundo exterior',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop&crop=center',
    date: '2024-02-01',
    tags: ['ventana', 'observación'],
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-01T09:15:00Z'
  },
  {
    id: 5,
    petId: 1,
    title: 'Don Estrella comiendo',
    description: 'Disfrutando de su comida',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop&crop=center',
    date: '2024-01-25',
    tags: ['alimentación', 'comida'],
    createdAt: '2024-01-25T16:45:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  },
  {
    id: 6,
    petId: 1,
    title: 'Don Estrella feliz',
    description: 'Mostrando su alegría',
    image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&h=400&fit=crop&crop=center',
    date: '2024-02-05',
    tags: ['felicidad', 'alegría'],
    createdAt: '2024-02-05T11:20:00Z',
    updatedAt: '2024-02-05T11:20:00Z'
  },
  {
    id: 7,
    petId: 1,
    title: 'Don Estrella cazando',
    description: 'Persiguiendo su presa',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop&crop=center',
    date: '2024-02-10',
    tags: ['caza', 'instinto'],
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-02-10T14:00:00Z'
  },
  {
    id: 8,
    petId: 1,
    title: 'Don Estrella acicalándose',
    description: 'Limpiándose el pelaje',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=center',
    date: '2024-02-15',
    tags: ['limpieza', 'acicalamiento'],
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-02-15T10:30:00Z'
  },
  {
    id: 9,
    petId: 1,
    title: 'Don Estrella trepando',
    description: 'Escalando su árbol para gatos',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&crop=center',
    date: '2024-01-30',
    tags: ['trepar', 'ejercicio'],
    createdAt: '2024-01-30T13:20:00Z',
    updatedAt: '2024-01-30T13:20:00Z'
  },
  {
    id: 10,
    petId: 1,
    title: 'Don Estrella descansando',
    description: 'Relajado en su cama',
    image: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&h=400&fit=crop&crop=center',
    date: '2024-02-08',
    tags: ['descanso', 'relajación'],
    createdAt: '2024-02-08T15:45:00Z',
    updatedAt: '2024-02-08T15:45:00Z'
  }
]

// Medicamentos removidos



export function MascotasSection() {
  // Estado local ahora vacío; se cargará desde Supabase
  const [pets, setPets] = useState<Pet[]>([])
  const [tasks, setTasks] = useState<PetCareTask[]>([])
  const [healthRecords, setHealthRecords] = useState<PetHealthRecord[]>([])
  const [photos, setPhotos] = useState<PetPhoto[]>([])
  // Eliminado módulo de medicamentos

  const [loading, setLoading] = useState(true)
  const supabase = getBrowserClient()

  // Normalizadores snake_case -> camelCase
  const normalizePet = (row: any): Pet => ({
    id: row.id,
    name: row.name,
    type: row.type,
    breed: row.breed ?? undefined,
    birthDate: row.birth_date ?? undefined,
    weight: row.weight ?? undefined,
    color: row.color ?? undefined,
    image: row.image ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })

  const normalizeTask = (row: any): PetCareTask => ({
    id: row.id,
    petId: row.pet_id,
    title: row.title,
    description: row.description,
    type: row.type,
    frequency: row.frequency,
    lastCompleted: row.last_completed ?? undefined,
    nextDue: row.next_due,
    priority: row.priority,
    status: row.status,
    reminder: row.reminder ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })

  const normalizeHealth = (row: any): PetHealthRecord => ({
    id: row.id,
    petId: row.pet_id,
    date: row.date,
    type: row.type,
    title: row.title,
    description: row.description,
    veterinarian: row.veterinarian ?? undefined,
    clinic: row.clinic ?? undefined,
    cost: row.cost ?? undefined,
    nextDue: row.next_due ?? undefined,
    notes: row.notes ?? undefined,
    attachments: row.attachments ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })

  const normalizePhoto = (row: any): PetPhoto => ({
    id: row.id,
    petId: row.pet_id,
    title: row.title,
    description: row.description ?? undefined,
    image: row.image,
    date: row.date,
    tags: row.tags ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })

  // Medicamentos removidos

  // Cargar desde Supabase (lectura inicial)
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true)
        console.log('🔄 Iniciando carga de datos de mascotas...')
        
        const [petsRes, tasksRes, healthRes, photosRes] = await Promise.all([
          supabase.from('pets').select('*').order('created_at', { ascending: true }),
          supabase.from('pet_tasks').select('*').order('created_at', { ascending: true }),
          supabase.from('pet_health_records').select('*').order('date', { ascending: false }),
          supabase.from('pet_photos').select('*').order('date', { ascending: false })
        ])

        console.log('📊 Resultados de las consultas:')
        console.log('Pets:', petsRes)
        console.log('Tasks:', tasksRes)
        console.log('Health:', healthRes)
        console.log('Photos:', photosRes)
        // Medicamentos removidos

        if (!petsRes.error && petsRes.data) setPets((petsRes.data as any[]).map(normalizePet))
        if (!tasksRes.error && tasksRes.data) setTasks((tasksRes.data as any[]).map(normalizeTask))
        if (!healthRes.error && healthRes.data) setHealthRecords((healthRes.data as any[]).map(normalizeHealth))
        if (!photosRes.error && photosRes.data) setPhotos((photosRes.data as any[]).map(normalizePhoto))
        
        console.log('✅ Carga completada')
      } catch (e) {
        console.error('❌ Error cargando datos de mascotas:', e)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [supabase])

  // Hook de notificaciones
  const { sendNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('mascotas')
  const [showAddPetDialog, setShowAddPetDialog] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [showAddHealthDialog, setShowAddHealthDialog] = useState(false)
  const [showAddPhotoDialog, setShowAddPhotoDialog] = useState(false)
  // Dialog de medicamentos eliminado

  const [isEditingTask, setIsEditingTask] = useState(false)
  // Edición de medicamentos eliminada
  const [isEditingHealth, setIsEditingHealth] = useState(false)
  const [isEditingPhoto, setIsEditingPhoto] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('todos')
  const [validationErrors, setValidationErrors] = useState<any[]>([])

  // Estados para formularios
  const [newPet, setNewPet] = useState<Partial<Pet>>({})
  const [newTask, setNewTask] = useState<any>({})
  const [newHealthRecord, setNewHealthRecord] = useState<any>({})
  const [newPhoto, setNewPhoto] = useState<any>({})
  // Estado de medicamentos eliminado


  const petTypeIcons = {
    perro: Dog,
    gato: Cat,
    pajaro: Bird,
    pez: Fish,
    hamster: Mouse,
    conejo: Rabbit,
    otro: PawPrint
  }

  const taskTypeIcons = {
    alimentacion: Bone,
    ejercicio: Activity,
    limpieza: Droplets,
    veterinario: Stethoscope,
    medicina: Pill,
    otro: PawPrint
  }

  const getPetTypeIcon = (type: string) => {
    const IconComponent = petTypeIcons[type as keyof typeof petTypeIcons] || PawPrint
    return <IconComponent className="h-4 w-4" />
  }

  const getTaskTypeIcon = (type: string) => {
    const IconComponent = taskTypeIcons[type as keyof typeof taskTypeIcons] || PawPrint
    return <IconComponent className="h-4 w-4" />
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
      case 'pendiente': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'atrasado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredPets = pets.filter(pet => 
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'todos' || pet.type === filterType)
  )

  const filteredTasks = tasks.filter(task => {
    const pet = pets.find(p => `${p.id}` === `${task.petId}`)
    return pet && pet.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getPetById = (id: any) => pets.find(pet => `${pet.id}` === `${id}`)

  // Función de validación para mascotas
  const validatePet = (pet: Partial<Pet>) => {
    const rules = {
      name: [validators.required],
      type: [validators.required]
    }
    return validateForm(pet, rules)
  }

  const addPet = () => {
    console.log('🔄 Iniciando addPet con datos:', newPet)
    
    const errors = validatePet(newPet)
    if (errors.length > 0) {
      console.log('❌ Errores de validación:', errors)
      setValidationErrors(errors)
      return
    }

    if (!newPet.name || !newPet.type) {
      console.log('❌ Datos faltantes:', { name: newPet.name, type: newPet.type })
      return
    }

    const upsert = async () => {
      if (selectedPet) {
        console.log('🔄 Actualizando mascota existente:', selectedPet.id)
        const { data, error } = await supabase
          .from('pets')
          .update({
            name: newPet.name,
            type: newPet.type,
            breed: newPet.breed || null,
            birth_date: newPet.birthDate || null,
            color: newPet.color || null,
            image: newPet.image || null,
            notes: newPet.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedPet.id)
          .select()
        
        console.log('📊 Resultado actualización:', { data, error })
        
        if (!error && data) {
          const updated = normalizePet(data[0])
          setPets(prev => prev.map(p => p.id === selectedPet.id ? updated : p))
        sendNotification({ title: 'Mascota actualizada', body: `Se ha actualizado la información de ${newPet.name}` })
      } else {
          console.error('❌ Error actualizando mascota:', error)
          sendNotification({ title: 'Error', body: 'No se pudo actualizar la mascota' })
        }
      } else {
        console.log('🔄 Creando nueva mascota')
        const { data, error } = await supabase
          .from('pets')
          .insert([{
            name: newPet.name,
            type: newPet.type,
            breed: newPet.breed || null,
            birth_date: newPet.birthDate || null,
            color: newPet.color || null,
            image: newPet.image || null,
            notes: newPet.notes || null
          }])
          .select()
        
        console.log('📊 Resultado inserción:', { data, error })
        
        if (!error && data) {
          const inserted = normalizePet(data[0])
          setPets(prev => [...prev, inserted])
        sendNotification({ title: 'Nueva mascota agregada', body: `Se ha agregado ${newPet.name} a tu familia de mascotas` })
        } else {
          console.error('❌ Error creando mascota:', error)
          sendNotification({ title: 'Error', body: 'No se pudo crear la mascota' })
        }
      }
    }

    upsert().finally(() => {
      setNewPet({})
      setSelectedPet(null)
      setShowAddPetDialog(false)
      setValidationErrors([])
    })
  }

  const addTask = async () => {
    if (!(newTask.title && newTask.petId && newTask.type)) return
    const petId = typeof newTask.petId === 'string' ? newTask.petId : `${newTask.petId}`

    if (isEditingTask && newTask.id) {
      const { data, error } = await supabase
        .from('pet_tasks')
        .update({
          pet_id: petId,
          title: newTask.title || '',
          description: newTask.description || '',
          type: newTask.type as any,
          frequency: (newTask.frequency as any) || 'diario',
          next_due: newTask.nextDue || new Date().toISOString(),
          priority: (newTask.priority as any) || 'Media',
          reminder: newTask.reminder || null,
          notes: newTask.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', newTask.id)
        .select()
      if (!error && data) {
        const updated = normalizeTask(data[0])
        setTasks(prev => prev.map(t => t.id === newTask.id ? updated : t))
        sendNotification({ title: 'Tarea actualizada', body: 'La tarea se actualizó correctamente' })
      } else {
        console.error('❌ Error actualizando tarea:', error)
        sendNotification({ title: 'Error', body: 'No se pudo actualizar la tarea' })
      }
    } else {
      const { data, error } = await supabase
        .from('pet_tasks')
        .insert([{ 
          pet_id: petId,
          title: newTask.title,
          description: newTask.description || '',
          type: newTask.type as any,
          frequency: (newTask.frequency as any) || 'diario',
          next_due: newTask.nextDue || new Date().toISOString(),
          priority: (newTask.priority as any) || 'Media',
          status: 'pendiente',
          reminder: newTask.reminder || null,
          notes: newTask.notes || null
        }])
        .select()
        .single()
      if (!error && data) {
        const inserted = normalizeTask(data)
        setTasks(prev => [...prev, inserted])
        sendNotification({ title: 'Tarea creada', body: 'La tarea se agregó correctamente' })
      } else {
        console.error('❌ Error creando tarea:', error)
        sendNotification({ title: 'Error', body: 'No se pudo crear la tarea' })
      }
    }
    setNewTask({})
    setShowAddTaskDialog(false)
    setIsEditingTask(false)
  }

  const addHealthRecord = async () => {
    if (newHealthRecord.title && newHealthRecord.petId && newHealthRecord.type) {
      const petId = typeof newHealthRecord.petId === 'string' ? newHealthRecord.petId : `${newHealthRecord.petId}`
      let data: any, error: any
      if (isEditingHealth && newHealthRecord.id) {
        ({ data, error } = await supabase
          .from('pet_health_records')
          .update({
            pet_id: petId,
            date: newHealthRecord.date || new Date().toISOString().split('T')[0],
            type: newHealthRecord.type as 'vacuna' | 'desparasitacion' | 'revision' | 'tratamiento' | 'otro',
            title: newHealthRecord.title,
            description: newHealthRecord.description || '',
            veterinarian: newHealthRecord.veterinarian,
            clinic: newHealthRecord.clinic,
            cost: newHealthRecord.cost,
            next_due: newHealthRecord.nextDue,
            notes: newHealthRecord.notes,
            attachments: newHealthRecord.attachments,
            updated_at: new Date().toISOString()
          })
          .eq('id', newHealthRecord.id)
          .select()
          .single())
      } else {
        ({ data, error } = await supabase
        .from('pet_health_records')
        .insert([{
            pet_id: petId,
        date: newHealthRecord.date || new Date().toISOString().split('T')[0],
        type: newHealthRecord.type as 'vacuna' | 'desparasitacion' | 'revision' | 'tratamiento' | 'otro',
        title: newHealthRecord.title,
        description: newHealthRecord.description || '',
        veterinarian: newHealthRecord.veterinarian,
        clinic: newHealthRecord.clinic,
        cost: newHealthRecord.cost,
            next_due: newHealthRecord.nextDue,
        notes: newHealthRecord.notes,
          attachments: newHealthRecord.attachments
        }])
        .select()
          .single())
      }
      
      if (!error && data) {
        const record = normalizeHealth(data)
        if (isEditingHealth && newHealthRecord.id) {
          setHealthRecords(prev => prev.map(r => r.id === newHealthRecord.id ? record : r))
          sendNotification({ title: 'Registro de salud actualizado', body: 'Se actualizó correctamente' })
        } else {
          setHealthRecords(prev => [...prev, record])
        sendNotification({ title: 'Nuevo registro de salud', body: 'Se ha agregado el registro correctamente' })
        }
      } else {
        console.error('❌ Error creando registro de salud:', error)
        sendNotification({ title: 'Error', body: 'No se pudo crear el registro de salud' })
      }
      
      setNewHealthRecord({})
      setShowAddHealthDialog(false)
      setIsEditingHealth(false)
    }
  }



  const completeTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completado', lastCompleted: new Date().toISOString() }
        : task
    ))
  }

  const toggleTaskStatus = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    const newStatus = task.status === 'completado' ? 'pendiente' : 'completado'
    const lastCompleted = task.status === 'pendiente' ? new Date().toISOString() : undefined
    
    const { data, error } = await supabase
      .from('pet_tasks')
      .update({
        status: newStatus,
        last_completed: lastCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
    
    if (!error && data) {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
              status: newStatus, 
              lastCompleted,
            updatedAt: new Date().toISOString() 
          }
        : task
    ))
      sendNotification({ 
        title: 'Estado actualizado', 
        body: `La tarea ahora está ${newStatus === 'completado' ? 'completada' : 'pendiente'}` 
      })
    }
  }

  const deleteTask = async (taskId: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return
    const { error } = await supabase
      .from('pet_tasks')
      .delete()
      .eq('id', taskId)
    
    if (!error) {
    setTasks(tasks.filter(task => task.id !== taskId))
      sendNotification({ title: 'Tarea eliminada', body: 'La tarea se ha eliminado correctamente' })
    } else {
      sendNotification({ title: 'Error', body: 'No se pudo eliminar la tarea' })
    }
  }

  const deleteHealthRecord = async (recordId: number) => {
    if (!confirm('¿Seguro que deseas eliminar este registro de salud?')) return
    const { error } = await supabase
      .from('pet_health_records')
      .delete()
      .eq('id', recordId)
    if (!error) {
      setHealthRecords(prev => prev.filter(r => r.id !== recordId))
      sendNotification({ title: 'Registro eliminado', body: 'Se eliminó el registro de salud' })
    } else {
      sendNotification({ title: 'Error', body: 'No se pudo eliminar el registro' })
    }
  }

  const deletePhoto = async (photoId: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta foto?')) return
    const { error } = await supabase
      .from('pet_photos')
      .delete()
      .eq('id', photoId)
    if (!error) {
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      sendNotification({ title: 'Foto eliminada', body: 'Se eliminó la foto correctamente' })
    } else {
      sendNotification({ title: 'Error', body: 'No se pudo eliminar la foto' })
    }
  }

  const editTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setNewTask({
        id: task.id,
        petId: task.petId,
        title: task.title,
        description: task.description,
        type: task.type,
        frequency: task.frequency,
        nextDue: task.nextDue,
        priority: task.priority,
        reminder: task.reminder,
        notes: task.notes
      })
      setIsEditingTask(true)
      setShowAddTaskDialog(true)
    }
  }

  const editPet = (petId: any) => {
    const pet = pets.find(p => `${p.id}` === `${petId}`)
    if (pet) {
      setSelectedPet(pet)
      setNewPet({
        id: pet.id as any,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        birthDate: pet.birthDate,
        color: pet.color,
        image: pet.image,
        notes: pet.notes
      } as any)
      setShowAddPetDialog(true)
    }
  }

  const deletePet = async (petId: any) => {
    if (!confirm('¿Seguro que deseas eliminar esta mascota?')) return
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId)
    if (!error) {
      setPets(prev => prev.filter(p => `${p.id}` !== `${petId}`))
      sendNotification({ title: 'Mascota eliminada', body: 'La mascota se ha eliminado correctamente' })
    } else {
      sendNotification({ title: 'Error', body: 'No se pudo eliminar la mascota' })
    }
  }

  // Funciones de medicamentos eliminadas

  // Edición de medicamentos eliminada

  const addPhoto = async () => {
    if (newPhoto.image && newPhoto.petId) {
      const petId = typeof newPhoto.petId === 'string' ? newPhoto.petId : `${newPhoto.petId}`
      let data: any, error: any
      if (isEditingPhoto && newPhoto.id) {
        ({ data, error } = await supabase
          .from('pet_photos')
          .update({
            pet_id: petId,
            title: newPhoto.description ? `Foto: ${newPhoto.description}` : 'Nueva Foto',
            description: newPhoto.description,
            image: newPhoto.image,
            date: newPhoto.date || new Date().toISOString().split('T')[0],
            tags: newPhoto.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', newPhoto.id)
          .select()
          .single())
      } else {
        ({ data, error } = await supabase
        .from('pet_photos')
        .insert([{
            pet_id: petId,
        title: newPhoto.description ? `Foto: ${newPhoto.description}` : 'Nueva Foto',
        description: newPhoto.description,
        image: newPhoto.image,
          date: newPhoto.date || new Date().toISOString().split('T')[0],
          tags: newPhoto.tags
        }])
        .select()
          .single())
      }
      
      if (!error && data) {
        const photo = normalizePhoto(data)
        if (isEditingPhoto && newPhoto.id) {
          setPhotos(prev => prev.map(p => p.id === newPhoto.id ? photo : p))
          sendNotification({ title: 'Foto actualizada', body: 'La foto se actualizó correctamente' })
        } else {
          setPhotos(prev => [...prev, photo])
        sendNotification({ title: 'Nueva foto', body: 'Se ha agregado la foto correctamente' })
        }
      } else {
        console.error('❌ Error creando foto:', error)
        sendNotification({ title: 'Error', body: 'No se pudo crear la foto' })
      }
      
      setNewPhoto({})
      setShowAddPhotoDialog(false)
      setIsEditingPhoto(false)
    }
  }

  // Creación/edición de medicamentos eliminada

  

  // Cálculo de estadísticas
  const pendingTasks = tasks.filter(task => task.status === 'pendiente').length
  const completedTasks = tasks.filter(task => task.status === 'completado').length
  const totalPhotos = photos.length
  // Medicamentos eliminados




  return (
    <div className="w-full min-h-screen p-0 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden">
      {/* Header */}
      <div className="space-y-3 sm:space-y-2 px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
        <h1 className="text-[clamp(1.8rem,6vw,2.5rem)] font-bold tracking-tight flex flex-col sm:flex-row items-center gap-3 sm:gap-2 text-center sm:text-left">
          <PawPrint className="h-9 w-9 sm:h-8 sm:w-8 text-primary" />
          Cuidado de Mascotas
        </h1>
        <p className="text-[clamp(1rem,3.5vw,1.1rem)] text-muted-foreground text-center sm:text-left mt-2">
          Gestiona el cuidado y salud de tus mascotas de manera organizada.
        </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="flex overflow-x-auto gap-4 pb-2 px-4 sm:px-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 sm:gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 min-w-[140px] sm:min-w-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[clamp(0.8rem,2.5vw,0.875rem)] font-medium text-muted-foreground">Mascotas</p>
                <p className="text-[clamp(1.6rem,4.5vw,1.5rem)] font-bold text-primary">{pets.length}</p>
              </div>
              <PawPrint className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 min-w-[140px] sm:min-w-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[clamp(0.8rem,2.5vw,0.875rem)] font-medium text-muted-foreground">Tareas Pendientes</p>
                <p className="text-[clamp(1.6rem,4.5vw,1.5rem)] font-bold text-blue-600">{pendingTasks}</p>
              </div>
              <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 min-w-[140px] sm:min-w-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tareas Completadas</p>
                <p className="text-[clamp(1.6rem,4.5vw,1.5rem)] font-bold text-green-600">{completedTasks}</p>
              </div>
              <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 min-w-[140px] sm:min-w-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[clamp(0.8rem,2.5vw,0.875rem)] font-medium text-muted-foreground">Fotos</p>
                <p className="text-[clamp(1.6rem,4.5vw,1.5rem)] font-bold text-purple-600">{totalPhotos}</p>
              </div>
              <Camera className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta de medicamentos eliminada */}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 px-4 sm:px-0">
        <TabsList className="grid w-full grid-cols-3 gap-2">
          <TabsTrigger value="mascotas" className="flex items-center gap-2 py-2.5 px-3 text-[clamp(0.75rem,2.5vw,0.875rem)]">
            <PawPrint className="h-4 w-4" />
            Mascotas
          </TabsTrigger>
          <TabsTrigger value="tareas" className="flex items-center gap-2 py-2.5 px-3 text-[clamp(0.75rem,2.5vw,0.875rem)]">
            <Activity className="h-4 w-4" />
            Tareas
          </TabsTrigger>

          {/* Tab de medicamentos eliminado */}

          <TabsTrigger value="fotos" className="flex items-center gap-2 py-2.5 px-3 text-[clamp(0.75rem,2.5vw,0.875rem)]">
            <Camera className="h-4 w-4" />
            Fotos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Mascotas */}
        <TabsContent value="mascotas" className="space-y-6 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <Input
                placeholder="Buscar mascotas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 py-3 text-[clamp(0.95rem,2.5vw,1rem)]"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-40 py-3 text-[clamp(0.95rem,2.5vw,1rem)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="perro">Perros</SelectItem>
                  <SelectItem value="gato">Gatos</SelectItem>
                  <SelectItem value="pajaro">Aves</SelectItem>
                  <SelectItem value="pez">Peces</SelectItem>
                  <SelectItem value="hamster">Hamsters</SelectItem>
                  <SelectItem value="conejo">Conejos</SelectItem>
                  <SelectItem value="otro">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setShowAddPetDialog(true)} className="flex items-center gap-2 w-full sm:w-auto py-3 px-4 text-[clamp(0.9rem,2.5vw,0.875rem)]">
              <Plus className="h-4 w-4" />
              Agregar Mascota
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] relative bg-gradient-to-br from-primary/10 to-secondary/10">
                  {pet.image ? (
                  <img
                      src={pet.image}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <PawPrint className="h-12 w-12 sm:h-10 sm:w-10 text-primary/40 mx-auto mb-2" />
                        <p className="text-[clamp(0.8rem,2vw,0.75rem)] text-muted-foreground">Sin foto</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[clamp(0.7rem,1.8vw,0.75rem)] px-2 py-1">
                      {getPetTypeIcon(pet.type)}
                      {pet.type}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Button size="sm" variant="outline" onClick={() => editPet(pet.id)} className="bg-white/80 h-7 w-7 p-0">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-[clamp(0.7rem,1.8vw,0.75rem)] px-2 py-1">
                    {pet.name}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2 px-4 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-[clamp(1rem,2.5vw,1rem)]">{pet.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => editPet(pet.id)} className="py-1.5 px-2 text-[clamp(0.75rem,2vw,0.75rem)] h-7">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deletePet(pet.id)} className="text-red-500 hover:text-red-700 py-1.5 px-2 text-[clamp(0.75rem,2vw,0.75rem)] h-7">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-[clamp(0.8rem,2vw,0.75rem)]">
                    {pet.breed && `${pet.breed} • `}
                    {pet.birthDate && `Nacido: ${new Date(pet.birthDate).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  {pet.notes && (
                    <p className="text-[clamp(0.8rem,2vw,0.75rem)] text-muted-foreground">{pet.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Tareas */}
        <TabsContent value="tareas" className="space-y-6 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <Input
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 py-3 text-[clamp(0.95rem,2.5vw,1rem)]"
            />
            <Button onClick={() => setShowAddTaskDialog(true)} className="flex items-center gap-2 w-full sm:w-auto py-3 px-4 text-[clamp(0.9rem,2.5vw,0.875rem)]">
              <Plus className="h-4 w-4" />
              Agregar Tarea
            </Button>
          </div>

          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const pet = getPetById(task.petId)
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getTaskTypeIcon(task.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {pet?.name}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => toggleTaskStatus(task.id)}
                          className={task.status === 'pendiente' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}
                        >
                          {task.status === 'pendiente' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editTask(task.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>





        {/* Sección de medicamentos eliminada */}





        {/* Tab: Fotos */}
        <TabsContent value="fotos" className="space-y-6 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="text-[clamp(1.2rem,3vw,1.125rem)] font-semibold text-center sm:text-left">Biblioteca de Fotos</h3>
            <Button onClick={() => setShowAddPhotoDialog(true)} className="flex items-center gap-2 w-full sm:w-auto py-3 px-4 text-[clamp(0.9rem,2.5vw,0.875rem)]">
              <Plus className="h-4 w-4" />
              Agregar Foto
            </Button>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {photos.map((photo) => {
              const pet = getPetById(photo.petId)
              return (
                <Card key={photo.id} className="overflow-hidden break-inside-avoid mb-3 inline-block w-full">
                  <div className="relative">
                    <img
                      src={photo.image}
                      alt={photo.description || 'Foto de mascota'}
                      loading="lazy"
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const p = photos.find(ph => ph.id === photo.id)
                          if (p) {
                            setNewPhoto({
                              id: p.id,
                              petId: `${p.petId}`,
                              description: p.description,
                              image: p.image,
                              date: p.date,
                              tags: p.tags
                            })
                            setIsEditingPhoto(true)
                            setShowAddPhotoDialog(true)
                          }
                        }}
                        className="bg-white/80 h-7 w-7 p-0"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePhoto(photo.id)}
                        className="h-7 w-7 p-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    {photo.description && (
                      <p className="text-[clamp(0.8rem,2vw,0.75rem)] text-muted-foreground">
                        {photo.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Agregar Mascota */}
      <Dialog open={showAddPetDialog} onOpenChange={setShowAddPetDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2 sm:mx-0 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-[clamp(1.2rem,3vw,1.25rem)]">{selectedPet ? 'Editar Mascota' : 'Agregar Nueva Mascota'}</DialogTitle>
            <DialogDescription className="text-[clamp(0.95rem,2.5vw,1rem)]">
              {selectedPet ? 'Modifica la información de tu mascota.' : 'Completa la información de tu nueva mascota.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormValidation errors={validationErrors} />
            <div className="grid gap-2">
              <label htmlFor="name" className="text-[clamp(0.9rem,2.5vw,0.875rem)] font-medium">Nombre</label>
              <Input
                id="name"
                value={newPet.name || ''}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                placeholder="Nombre de la mascota"
                className="py-3 text-[clamp(0.95rem,2.5vw,1rem)]"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="type">Tipo</label>
              <Select value={newPet.type || ''} onValueChange={(value: 'perro' | 'gato' | 'pajaro' | 'pez' | 'hamster' | 'conejo' | 'otro') => setNewPet({ ...newPet, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perro">Perro</SelectItem>
                  <SelectItem value="gato">Gato</SelectItem>
                  <SelectItem value="pajaro">Ave</SelectItem>
                  <SelectItem value="pez">Pez</SelectItem>
                  <SelectItem value="hamster">Hamster</SelectItem>
                  <SelectItem value="conejo">Conejo</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="breed">Raza</label>
              <Input
                id="breed"
                value={newPet.breed || ''}
                onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                placeholder="Raza (opcional)"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="birthDate">Fecha de Nacimiento</label>
              <Input
                id="birthDate"
                type="date"
                value={newPet.birthDate || ''}
                onChange={(e) => setNewPet({ ...newPet, birthDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="notes">Notas</label>
              <Input
                id="notes"
                value={newPet.notes || ''}
                onChange={(e) => setNewPet({ ...newPet, notes: e.target.value })}
                placeholder="Notas adicionales"
              />
            </div>
            <div className="grid gap-2">
              <label>Foto de la Mascota</label>
              <div className="space-y-2">
                {newPet.image ? (
                  <div className="relative">
                    <img
                      src={newPet.image}
                      alt="Vista previa"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => setNewPet({ ...newPet, image: undefined })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            setNewPet({ ...newPet, image: e.target?.result as string })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                      id="pet-image"
                    />
                    <label htmlFor="pet-image" className="cursor-pointer">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Haz clic para agregar una foto</p>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
            <Button variant="outline" onClick={() => {
              setShowAddPetDialog(false)
              setSelectedPet(null)
              setNewPet({})
              setValidationErrors([])
            }} className="w-full sm:w-auto py-3 px-6 text-[clamp(0.95rem,2.5vw,1rem)]">
              Cancelar
            </Button>
            <Button onClick={addPet} className="w-full sm:w-auto py-3 px-6 text-[clamp(0.95rem,2.5vw,1rem)] bg-primary hover:bg-primary/90">
              {selectedPet ? 'Guardar Cambios' : 'Agregar Mascota'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Agregar Tarea */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditingTask ? 'Editar Tarea' : 'Agregar Nueva Tarea'}</DialogTitle>
            <DialogDescription>
              {isEditingTask ? 'Modifica la información de la tarea.' : 'Crea una nueva tarea de cuidado para tu mascota.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="taskPet">Mascota</label>
              <Select value={(newTask.petId as any)?.toString() || ''} onValueChange={(value) => setNewTask({ ...newTask, petId: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mascota" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="taskTitle">Título</label>
              <Input
                id="taskTitle"
                value={newTask.title || ''}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Título de la tarea"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="taskDescription">Descripción</label>
              <Input
                id="taskDescription"
                value={newTask.description || ''}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Descripción de la tarea"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="taskType">Tipo</label>
              <Select value={newTask.type || ''} onValueChange={(value: 'alimentacion' | 'ejercicio' | 'limpieza' | 'veterinario' | 'medicina' | 'otro') => setNewTask({ ...newTask, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alimentacion">Alimentación</SelectItem>
                  <SelectItem value="ejercicio">Ejercicio</SelectItem>
                  <SelectItem value="limpieza">Limpieza</SelectItem>
                  <SelectItem value="veterinario">Veterinario</SelectItem>
                  <SelectItem value="medicina">Medicina</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="taskFrequency">Frecuencia</label>
              <Select value={newTask.frequency || ''} onValueChange={(value: 'diario' | 'semanal' | 'mensual' | 'personalizado') => setNewTask({ ...newTask, frequency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diario</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="taskPriority">Prioridad</label>
              <Select value={newTask.priority || ''} onValueChange={(value: 'Alta' | 'Media' | 'Baja') => setNewTask({ ...newTask, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddTaskDialog(false)
              setIsEditingTask(false)
              setNewTask({})
            }}>
              Cancelar
            </Button>
            <Button onClick={addTask}>{isEditingTask ? 'Guardar Cambios' : 'Agregar Tarea'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Agregar Registro de Salud */}
      <Dialog open={showAddHealthDialog} onOpenChange={setShowAddHealthDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Registro de Salud</DialogTitle>
            <DialogDescription>
              Registra una visita al veterinario o tratamiento médico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="healthPet">Mascota</label>
              <Select value={(newHealthRecord.petId as any)?.toString() || ''} onValueChange={(value) => setNewHealthRecord({ ...newHealthRecord, petId: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mascota" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="healthTitle">Título</label>
              <Input
                id="healthTitle"
                value={newHealthRecord.title || ''}
                onChange={(e) => setNewHealthRecord({ ...newHealthRecord, title: e.target.value })}
                placeholder="Título del registro"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="healthType">Tipo</label>
              <Select value={newHealthRecord.type || ''} onValueChange={(value: 'vacuna' | 'desparasitacion' | 'revision' | 'tratamiento' | 'otro') => setNewHealthRecord({ ...newHealthRecord, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacuna">Vacuna</SelectItem>
                  <SelectItem value="desparasitacion">Desparasitación</SelectItem>
                  <SelectItem value="revision">Revisión</SelectItem>
                  <SelectItem value="tratamiento">Tratamiento</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="healthDate">Fecha</label>
              <Input
                id="healthDate"
                type="date"
                value={newHealthRecord.date || ''}
                onChange={(e) => setNewHealthRecord({ ...newHealthRecord, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="healthDescription">Descripción</label>
              <Input
                id="healthDescription"
                value={newHealthRecord.description || ''}
                onChange={(e) => setNewHealthRecord({ ...newHealthRecord, description: e.target.value })}
                placeholder="Descripción del tratamiento"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="healthCost">Costo</label>
              <Input
                id="healthCost"
                type="number"
                value={newHealthRecord.cost || ''}
                onChange={(e) => setNewHealthRecord({ ...newHealthRecord, cost: parseFloat(e.target.value) || undefined })}
                placeholder="Costo del tratamiento"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddHealthDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addHealthRecord}>Agregar Registro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de medicamentos eliminado */}






      {/* Dialog: Agregar Foto */}
      <Dialog open={showAddPhotoDialog} onOpenChange={setShowAddPhotoDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Foto</DialogTitle>
            <DialogDescription>
              Sube una foto de tu mascota con información adicional.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="photoDescription">Descripción</label>
              <Input
                id="photoDescription"
                value={newPhoto.description || ''}
                onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                placeholder="Descripción de la foto (opcional)"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="photoPet">Mascota</label>
              <Select value={newPhoto.petId?.toString() || ''} onValueChange={(value) => setNewPhoto({ ...newPhoto, petId: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mascota" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ImageUpload
              onImageSelect={(file) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                  setNewPhoto({ ...newPhoto, image: e.target?.result as string })
                }
                reader.readAsDataURL(file)
              }}
              placeholder="Seleccionar foto de la mascota"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPhotoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addPhoto}>Agregar Foto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
