import { NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'

export async function POST() {
  try {
    const supabase = getAdminClient()
    
    const sampleEntries = [
      {
        title: 'Nuestro Primer Aniversario',
        content: 'Hoy celebramos un año juntos y no puedo creer lo rápido que ha pasado el tiempo. Cada día a tu lado es un regalo que atesoro profundamente. Recordamos nuestro primer encuentro, esa mirada que cambió todo, y cómo desde entonces nuestras vidas se entrelazaron de la manera más hermosa. Te amo más cada día.',
        date: '2024-01-15',
        mood: 'muy_feliz',
        weather: 'soleado',
        location: 'Nuestro hogar',
        author: 'ambos',
        isPrivate: false,
        isFavorite: true,
        tags: ['Amor', 'Celebración', 'Aniversario'],
        wordCount: 89
      },
      {
        title: 'Reflexión sobre Nuestro Futuro',
        content: 'Hoy me puse a pensar en todo lo que hemos construido juntos y en los sueños que compartimos. Es increíble cómo dos personas pueden tener visiones tan similares de la vida. Me emociona pensar en todo lo que nos espera: viajes, proyectos, tal vez una familia... Contigo todo es posible.',
        date: '2024-01-10',
        mood: 'romantico',
        weather: 'nublado',
        location: 'Café del centro',
        author: 'yo',
        isPrivate: true,
        isFavorite: false,
        tags: ['Reflexión', 'Futuro', 'Amor'],
        wordCount: 67
      },
      {
        title: 'Sorpresa Inesperada',
        content: '¡No puedo creer lo que hiciste hoy! Llegaste a casa con flores y mi comida favorita, solo porque sabías que había tenido un día difícil. Esos pequeños gestos son los que hacen que nuestro amor sea tan especial. Gracias por ser tan atento y por recordarme siempre que no estoy sola.',
        date: '2024-01-08',
        mood: 'emocionado',
        weather: 'lluvioso',
        location: 'Nuestra casa',
        author: 'pareja',
        isPrivate: false,
        isFavorite: true,
        tags: ['Sorpresa', 'Amor', 'Casa'],
        wordCount: 78
      },
      {
        title: 'Paseo por el Parque',
        content: 'Hoy fuimos a caminar al parque y fue perfecto. El sol brillaba, los pájaros cantaban, y tu mano en la mía me hacía sentir que todo estaba bien en el mundo. Esos momentos simples son los que más valoro. Contigo hasta una caminata se convierte en una aventura.',
        date: '2024-01-05',
        mood: 'tranquilo',
        weather: 'soleado',
        location: 'Parque Central',
        author: 'ambos',
        isPrivate: false,
        isFavorite: false,
        tags: ['Naturaleza', 'Cita', 'Paz'],
        wordCount: 65
      },
      {
        title: 'Noche de Películas',
        content: 'Pasamos toda la noche viendo películas románticas y riéndonos de las escenas más cursis. Es increíble cómo podemos pasar horas juntos sin aburrirnos. Tu risa es mi sonido favorito en el mundo. Me encanta cómo nos complementamos.',
        date: '2024-01-03',
        mood: 'feliz',
        weather: 'frio',
        location: 'Nuestro sofá',
        author: 'yo',
        isPrivate: false,
        isFavorite: true,
        tags: ['Películas', 'Risa', 'Casa'],
        wordCount: 72
      }
    ]

    const { data: entries, error } = await supabase
      .from('diary_entries')
      .insert(sampleEntries)
      .select()

    if (error) {
      console.error('Error seeding diary entries:', error)
      return NextResponse.json({ error: 'Error al poblar entradas del diario' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Entradas de ejemplo agregadas exitosamente',
      count: entries.length 
    })
  } catch (error) {
    console.error('Error in POST /api/diary/seed:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
