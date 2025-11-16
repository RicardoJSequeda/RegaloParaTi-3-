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
import { uploadPublicFile } from '@/lib/supabase/storage'
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
  const [selectedPhotoView, setSelectedPhotoView] = useState<PetPhoto | null>(null)
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
  const [photoFile, setPhotoFile] = useState<File | null>(null)
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

  const getPetTypeIcon = (type: string) => {
    const IconComponent = petTypeIcons[type as keyof typeof petTypeIcons] || PawPrint
    return <IconComponent className="h-4 w-4" />
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

  // Función de validación para mascotas - Solo campos obligatorios
  const validatePet = (pet: Partial<Pet>) => {
    const rules = {
      name: [validators.required],
      type: [validators.required],
      birthDate: [validators.required],
      image: [validators.required]
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

    if (!newPet.name || !newPet.type || !newPet.birthDate || !newPet.image) {
      console.log('❌ Datos faltantes:', { name: newPet.name, type: newPet.type, birthDate: newPet.birthDate, image: newPet.image })
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
            birth_date: newPet.birthDate,
            image: newPet.image,
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
            birth_date: newPet.birthDate,
            image: newPet.image
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
    if (!(newTask.title && newTask.petId)) return
    // pet_id es UUID en la BD, mantener como string
    const petId = typeof newTask.petId === 'string' ? newTask.petId : `${newTask.petId}`
    const nextDueDate = newTask.nextDue || new Date().toISOString()

    if (isEditingTask && newTask.id) {
      // Guardar valores antes de limpiar el formulario
      const taskId = newTask.id
      const taskTitle = newTask.title || ''
      const taskDescription = newTask.description || ''
      const taskType = newTask.type || 'otro'
      const taskFrequency = newTask.frequency || 'diario'
      const taskPriority = newTask.priority || 'Media'
      const taskStatus = newTask.status || 'pendiente'
      const taskReminder = newTask.reminder || null
      const taskNotes = newTask.notes || null
      const taskLastCompleted = newTask.lastCompleted
      const taskCreatedAt = newTask.createdAt || new Date().toISOString()
      const originalTask = tasks.find(t => t.id === taskId)
      
      // Para edición, actualizar optimistamente
      // Nota: petId puede ser UUID (string) pero el tipo espera number, usar cast temporal
      const tempTask: PetCareTask = {
        id: taskId,
        petId: petId as any, // pet_id es UUID en BD pero el tipo espera number
        title: taskTitle,
        description: taskDescription,
        type: taskType,
        frequency: taskFrequency,
        nextDue: nextDueDate,
        priority: taskPriority,
        status: taskStatus,
        reminder: taskReminder || undefined,
        notes: taskNotes || undefined,
        lastCompleted: taskLastCompleted,
        createdAt: taskCreatedAt,
        updatedAt: new Date().toISOString()
      }
      
      setTasks(prev => prev.map(t => t.id === taskId ? tempTask : t))
      setNewTask({})
      setShowAddTaskDialog(false)
      setIsEditingTask(false)
      sendNotification({ title: 'Tarea actualizada', body: 'La tarea se actualizó correctamente' })
      
      // Actualizar en la base de datos en segundo plano
      try {
        const { data, error } = await supabase
          .from('pet_tasks')
          .update({
            pet_id: petId,
            title: taskTitle,
            description: taskDescription,
            next_due: nextDueDate,
            reminder: taskReminder,
            notes: taskNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId)
          .select()
        if (!error && data) {
          const updated = normalizeTask(data[0])
          setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
        } else {
          throw error
        }
      } catch (error) {
        console.error('❌ Error actualizando tarea:', error)
        // Revertir actualización optimista
        if (originalTask) {
          setTasks(prev => prev.map(t => t.id === taskId ? originalTask : t))
        }
        sendNotification({ title: 'Error', body: 'No se pudo actualizar la tarea. Se ha revertido.' })
      }
    } else {
      // ACTUALIZACIÓN OPTIMISTA: Crear tarea temporal
      // Nota: petId puede ser UUID (string) pero el tipo espera number, usar cast temporal
      const tempTask: PetCareTask = {
        id: -Date.now(), // ID temporal negativo
        petId: petId as any, // pet_id es UUID en BD pero el tipo espera number
        title: newTask.title,
        description: newTask.description || '',
        type: newTask.type || 'otro',
        frequency: newTask.frequency || 'diario',
        nextDue: nextDueDate,
        priority: newTask.priority || 'Media',
        status: 'pendiente',
        reminder: newTask.reminder || undefined,
        notes: newTask.notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Agregar tarea temporal inmediatamente
      setTasks(prev => [...prev, tempTask])
      
      // Cerrar modal y limpiar formulario inmediatamente
      setNewTask({})
      setShowAddTaskDialog(false)
      setIsEditingTask(false)
      sendNotification({ title: 'Tarea creada', body: 'La tarea se agregó correctamente' })
      
      // Insertar en la base de datos en segundo plano
      try {
        const insertData = { 
          pet_id: petId,
          title: tempTask.title,
          description: tempTask.description,
          type: tempTask.type,
          frequency: tempTask.frequency,
          next_due: tempTask.nextDue,
          priority: tempTask.priority,
          status: 'pendiente',
          reminder: tempTask.reminder ? (typeof tempTask.reminder === 'object' ? JSON.stringify(tempTask.reminder) : tempTask.reminder) : null,
          notes: tempTask.notes || null
        }
        
        console.log('📝 Insertando tarea en BD:', insertData)
        
        const { data, error } = await supabase
          .from('pet_tasks')
          .insert([insertData])
          .select()
          .single()
        if (error) {
          console.error('❌ Error de Supabase al crear tarea:', error)
          throw new Error(error.message || 'Error al crear la tarea en la base de datos')
        }
        
        if (!data) {
          throw new Error('No se recibieron datos de la base de datos')
        }
        
        const inserted = normalizeTask(data)
        // Reemplazar tarea temporal con la real
        setTasks(prev => prev.map(t => t.id === tempTask.id ? inserted : t))
      } catch (error: any) {
        console.error('❌ Error creando tarea:', error)
        // Revertir actualización optimista
        setTasks(prev => prev.filter(t => t.id !== tempTask.id))
        const errorMessage = error?.message || error?.toString() || 'Error desconocido'
        sendNotification({ 
          title: 'Error', 
          body: `No se pudo crear la tarea: ${errorMessage}. Se ha revertido.` 
        })
      }
    }
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
        nextDue: task.nextDue,
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
        birthDate: pet.birthDate,
        image: pet.image
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
    if ((newPhoto.image || photoFile) && newPhoto.petId) {
      const petId = typeof newPhoto.petId === 'string' ? newPhoto.petId : `${newPhoto.petId}`
      const photoDate = newPhoto.date || new Date().toISOString().split('T')[0]
      
      // Crear URL temporal para actualización optimista
      const tempImageUrl = newPhoto.image || (photoFile ? URL.createObjectURL(photoFile) : '')
      
      // Crear foto temporal para actualización optimista
      // Usar un ID temporal negativo que nunca será un ID real de la base de datos
      const tempPhoto: PetPhoto = {
        id: -Date.now(), // ID temporal negativo
        petId: typeof petId === 'string' ? parseInt(petId) || 0 : petId,
        title: 'Nueva Foto',
        description: undefined,
        image: tempImageUrl,
        date: photoDate,
        tags: newPhoto.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // ACTUALIZACIÓN OPTIMISTA: Mostrar la foto inmediatamente
      if (isEditingPhoto && newPhoto.id) {
        // Para edición, actualizar la foto existente con la nueva imagen temporal
        setPhotos(prev => prev.map(p => p.id === newPhoto.id ? { ...p, image: tempImageUrl } : p))
      } else {
        // Para nueva foto, agregar inmediatamente
        setPhotos(prev => [...prev, tempPhoto])
      }
      
      // Cerrar modal inmediatamente
      setNewPhoto({})
      setPhotoFile(null)
      setShowAddPhotoDialog(false)
      setIsEditingPhoto(false)
      
      // Subir imagen a Supabase Storage en segundo plano
      try {
        let imageUrl = newPhoto.image // Si ya es una URL, usarla
        
        // Si hay un archivo nuevo, subirlo a Storage
        if (photoFile) {
          const uploadResult = await uploadPublicFile('photos', photoFile, `pet-photos/${petId}/`)
          if (uploadResult && uploadResult.url) {
            imageUrl = uploadResult.url
          }
        }
        // Si no hay photoFile, imageUrl ya tiene el valor correcto (URL existente o base64 temporal)
        
        // Actualizar en la base de datos
        let data: any, error: any
        if (isEditingPhoto && newPhoto.id) {
          ({ data, error } = await supabase
            .from('pet_photos')
            .update({
              pet_id: petId,
              title: 'Nueva Foto',
              description: null,
              image: imageUrl,
              date: photoDate,
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
              title: 'Nueva Foto',
              description: null,
              image: imageUrl,
              date: photoDate,
              tags: newPhoto.tags
            }])
            .select()
            .single())
        }
        
        if (!error && data) {
          const photo = normalizePhoto(data)
          // Actualizar con la foto real de la base de datos
          if (isEditingPhoto && newPhoto.id) {
            setPhotos(prev => prev.map(p => p.id === newPhoto.id ? photo : p))
          } else {
            // Reemplazar la foto temporal con la real
            setPhotos(prev => prev.map(p => p.id === tempPhoto.id ? photo : p))
          }
          sendNotification({ 
            title: isEditingPhoto ? 'Foto actualizada' : 'Nueva foto', 
            body: isEditingPhoto ? 'La foto se actualizó correctamente' : 'Se ha agregado la foto correctamente' 
          })
        } else {
          console.error('❌ Error guardando foto:', error)
          // Revertir actualización optimista en caso de error
          if (isEditingPhoto && newPhoto.id) {
            // Recargar la foto original
            const { data: originalData } = await supabase
              .from('pet_photos')
              .select('*')
              .eq('id', newPhoto.id)
              .single()
            if (originalData) {
              const originalPhoto = normalizePhoto(originalData)
              setPhotos(prev => prev.map(p => p.id === newPhoto.id ? originalPhoto : p))
            }
          } else {
            // Eliminar la foto temporal
            setPhotos(prev => prev.filter(p => p.id !== tempPhoto.id))
          }
          sendNotification({ title: 'Error', body: 'No se pudo guardar la foto' })
        }
      } catch (error) {
        console.error('❌ Error subiendo imagen:', error)
        // Revertir actualización optimista
        if (isEditingPhoto && newPhoto.id) {
          const { data: originalData } = await supabase
            .from('pet_photos')
            .select('*')
            .eq('id', newPhoto.id)
            .single()
          if (originalData) {
            const originalPhoto = normalizePhoto(originalData)
            setPhotos(prev => prev.map(p => p.id === newPhoto.id ? originalPhoto : p))
          }
        } else {
          setPhotos(prev => prev.filter(p => p.id !== tempPhoto.id))
        }
        sendNotification({ title: 'Error', body: 'Error al subir la imagen' })
      }
    }
  }

  // Creación/edición de medicamentos eliminada





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
                </div>
                <CardHeader className="pb-2 px-4 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-[clamp(1rem,2.5vw,1rem)]">{pet.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => editPet(pet.id)} 
                        className="min-h-[44px] min-w-[44px] p-0 active:scale-95 transition-transform"
                        aria-label="Editar mascota"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deletePet(pet.id)} 
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-600 min-h-[44px] min-w-[44px] p-0 active:scale-95 transition-transform"
                        aria-label="Eliminar mascota"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                  </div>
                  <CardDescription className="text-[clamp(0.8rem,2vw,0.75rem)]">
                    {pet.birthDate && `Nacido: ${new Date(pet.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                  </CardDescription>
                </CardHeader>
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

          <div className="space-y-3 sm:space-y-4">
            {filteredTasks.map((task) => {
              const pet = getPetById(task.petId)
              return (
                <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[clamp(1rem,2.5vw,1.125rem)] font-semibold text-foreground mb-2 leading-tight">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-[clamp(0.875rem,2vw,0.9375rem)] text-muted-foreground mb-3 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          {pet?.name && (
                            <Badge variant="outline" className="text-[clamp(0.75rem,1.8vw,0.8125rem)] px-2.5 py-1 border-primary/30 bg-primary/5">
                              {pet.name}
                            </Badge>
                          )}
                          <Badge className={`text-[clamp(0.75rem,1.8vw,0.8125rem)] px-2.5 py-1 font-medium ${getStatusColor(task.status)}`}>
                            {task.status === 'pendiente' ? 'Pendiente' : 'Completado'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`min-h-[44px] min-w-[44px] p-0 rounded-full active:scale-95 transition-transform ${
                            task.status === 'pendiente' 
                              ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg' 
                              : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg'
                          }`}
                          aria-label={task.status === 'pendiente' ? 'Marcar como completado' : 'Marcar como pendiente'}
                        >
                          {task.status === 'pendiente' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editTask(task.id)}
                          className="min-h-[44px] min-w-[44px] p-0 rounded-full active:scale-95 transition-transform border-2 hover:border-primary hover:bg-primary/5"
                          aria-label="Editar tarea"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="min-h-[44px] min-w-[44px] p-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-transform"
                          aria-label="Eliminar tarea"
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
                <Card 
                  key={photo.id} 
                  className="overflow-hidden break-inside-avoid mb-3 inline-block w-full group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30"
                  onClick={() => setSelectedPhotoView(photo)}
                >
                  <div className="relative">
                    <img
                      src={photo.image}
                      alt={pet?.name || 'Foto de mascota'}
                      loading="lazy"
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          const p = photos.find(ph => ph.id === photo.id)
                          if (p) {
                            setNewPhoto({
                              id: p.id,
                              petId: `${p.petId}`,
                              image: p.image,
                              date: p.date,
                              tags: p.tags
                            })
                            setPhotoFile(null) // Limpiar archivo al editar
                            setIsEditingPhoto(true)
                            setShowAddPhotoDialog(true)
                          }
                        }}
                        className="bg-white/90 backdrop-blur-sm min-h-[44px] min-w-[44px] p-0 active:scale-95 transition-transform shadow-md"
                        aria-label="Editar foto"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePhoto(photo.id)
                        }}
                        className="bg-white/90 backdrop-blur-sm min-h-[44px] min-w-[44px] p-0 active:scale-95 transition-transform shadow-md"
                        aria-label="Eliminar foto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {pet?.name && (
                      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Badge className="bg-white/90 backdrop-blur-sm text-[clamp(0.75rem,1.8vw,0.8125rem)] px-2.5 py-1 shadow-md">
                          {pet.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Agregar Mascota - Simplificado */}
      <Dialog open={showAddPetDialog} onOpenChange={setShowAddPetDialog}>
        <DialogContent 
          className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2 sm:mx-0 p-4 sm:p-6"
          style={{
            paddingTop: 'max(env(safe-area-inset-top), 1rem)',
            paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[clamp(1.2rem,3vw,1.25rem)]">{selectedPet ? 'Editar Mascota' : 'Agregar Nueva Mascota'}</DialogTitle>
            <DialogDescription className="text-[clamp(0.95rem,2.5vw,1rem)]">
              {selectedPet ? 'Modifica la información de tu mascota.' : 'Completa la información básica de tu nueva mascota.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormValidation errors={validationErrors} />
            
            {/* Nombre - Obligatorio */}
            <div className="grid gap-2">
              <label htmlFor="name" className="text-[clamp(0.9rem,2.5vw,0.875rem)] font-medium">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={newPet.name || ''}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                placeholder="Nombre de la mascota"
                className="min-h-[44px] py-3 text-[clamp(0.95rem,2.5vw,1rem)]"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Tipo - Obligatorio */}
            <div className="grid gap-2">
              <label htmlFor="type" className="text-[clamp(0.9rem,2.5vw,0.875rem)] font-medium">
                Tipo <span className="text-red-500">*</span>
              </label>
              <Select value={newPet.type || ''} onValueChange={(value: 'perro' | 'gato' | 'pajaro' | 'pez' | 'hamster' | 'conejo' | 'otro') => setNewPet({ ...newPet, type: value })}>
                <SelectTrigger className="min-h-[44px]">
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

            {/* Fecha de Nacimiento - Obligatorio */}
            <div className="grid gap-2">
              <label htmlFor="birthDate" className="text-[clamp(0.9rem,2.5vw,0.875rem)] font-medium">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </label>
              <Input
                id="birthDate"
                type="date"
                value={newPet.birthDate || ''}
                onChange={(e) => setNewPet({ ...newPet, birthDate: e.target.value })}
                className="min-h-[44px]"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Foto - Obligatorio */}
            <div className="grid gap-2">
              <label className="text-[clamp(0.9rem,2.5vw,0.875rem)] font-medium">
                Foto de la Mascota <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {newPet.image ? (
                  <div className="relative">
                    <img
                      src={newPet.image}
                      alt="Vista previa"
                      className="w-full h-48 sm:h-56 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 min-h-[44px] min-w-[44px] p-0 active:scale-95 transition-transform"
                      onClick={() => setNewPet({ ...newPet, image: undefined })}
                      aria-label="Eliminar foto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 sm:p-8 text-center hover:border-primary transition-colors cursor-pointer">
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
                    <label htmlFor="pet-image" className="cursor-pointer flex flex-col items-center gap-3">
                      <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                          Haz clic para agregar una foto
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          JPG, PNG (máx. 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddPetDialog(false)
                setSelectedPet(null)
                setNewPet({})
                setValidationErrors([])
              }} 
              className="w-full sm:w-auto min-h-[44px] py-3 px-6 text-[clamp(0.95rem,2.5vw,1rem)] active:scale-95 transition-transform"
            >
              Cancelar
            </Button>
            <Button 
              onClick={addPet} 
              className="w-full sm:w-auto min-h-[44px] py-3 px-6 text-[clamp(0.95rem,2.5vw,1rem)] bg-primary hover:bg-primary/90 active:scale-95 transition-transform"
            >
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






      {/* Dialog: Visualizar Foto */}
      <Dialog open={!!selectedPhotoView} onOpenChange={(open) => !open && setSelectedPhotoView(null)}>
        <DialogContent 
          className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] max-h-[95vh] p-0 overflow-hidden bg-black/95"
          style={{
            paddingTop: 'max(env(safe-area-inset-top), 0)',
            paddingBottom: 'max(env(safe-area-inset-bottom), 0)'
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedPhotoView ? `Foto de ${getPetById(selectedPhotoView.petId)?.name || 'mascota'}` : 'Vista de Foto'}
            </DialogTitle>
          </DialogHeader>
          {selectedPhotoView && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={selectedPhotoView.image}
                alt={getPetById(selectedPhotoView.petId)?.name || 'Foto de mascota'}
                className="max-w-full max-h-[95vh] object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPhotoView(null)}
                className="absolute top-4 right-4 min-h-[44px] min-w-[44px] p-0 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white active:scale-95 transition-transform"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </Button>
              {getPetById(selectedPhotoView.petId)?.name && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-white/90 backdrop-blur-sm text-[clamp(0.875rem,2vw,1rem)] px-4 py-2 shadow-lg">
                    {getPetById(selectedPhotoView.petId)?.name}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Agregar Foto */}
      <Dialog open={showAddPhotoDialog} onOpenChange={setShowAddPhotoDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditingPhoto ? 'Editar Foto' : 'Agregar Nueva Foto'}</DialogTitle>
            <DialogDescription>
              {isEditingPhoto ? 'Modifica la foto de tu mascota.' : 'Sube una foto de tu mascota.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                setPhotoFile(file)
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
            <Button variant="outline" onClick={() => {
              setShowAddPhotoDialog(false)
              setIsEditingPhoto(false)
              setNewPhoto({})
              setPhotoFile(null)
            }}>
              Cancelar
            </Button>
            <Button onClick={addPhoto}>{isEditingPhoto ? 'Guardar Cambios' : 'Agregar Foto'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
