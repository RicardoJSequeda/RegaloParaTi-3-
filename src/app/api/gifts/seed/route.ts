import { NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'

export async function POST() {
  try {
    const supabase = getAdminClient()
    
    const sampleGifts = [
      {
        name: 'Anillo de Compromiso',
        description: 'Un anillo especial para el momento perfecto',
        category: 'romantico',
        type: 'deseo',
        price: 2500,
        priority: 'alta',
        date: '2024-12-25',
        occasion: 'Navidad',
        rating: 5,
        notes: 'Diamante de 1 quilate, oro blanco',
        isFavorite: true,
        purchased: false,
        recipient: 'pareja'
      },
      {
        name: 'Reloj Inteligente',
        description: 'Para monitorear su salud y estar conectados',
        category: 'tecnologico',
        type: 'recibido',
        price: 350,
        priority: 'media',
        date: '2024-02-14',
        occasion: 'San Valentín',
        rating: 4,
        notes: 'Apple Watch Series 9',
        isFavorite: false,
        purchased: true,
        recipient: 'yo'
      },
      {
        name: 'Cena Romántica',
        description: 'Una cena especial en su restaurante favorito',
        category: 'experiencia',
        type: 'regalado',
        price: 120,
        priority: 'alta',
        date: '2024-01-15',
        occasion: 'Aniversario',
        rating: 5,
        notes: 'Restaurante La Casa del Amor',
        isFavorite: true,
        purchased: true,
        recipient: 'ambos'
      },
      {
        name: 'Perfume Exclusivo',
        description: 'Su fragancia favorita para ocasiones especiales',
        category: 'moda',
        type: 'deseo',
        price: 180,
        priority: 'media',
        date: '2024-03-14',
        occasion: 'Cumpleaños',
        rating: 4,
        notes: 'Chanel N°5 o similar',
        isFavorite: false,
        purchased: false,
        recipient: 'pareja'
      },
      {
        name: 'Kit de Cocina Profesional',
        description: 'Para preparar juntos deliciosas comidas',
        category: 'hogar',
        type: 'regalado',
        price: 450,
        priority: 'baja',
        date: '2024-01-20',
        occasion: 'Sin ocasión especial',
        rating: 5,
        notes: 'Incluye cuchillos, tabla y utensilios',
        isFavorite: true,
        purchased: true,
        recipient: 'ambos'
      }
    ]

    const { data: gifts, error } = await supabase
      .from('gifts')
      .insert(sampleGifts)
      .select()

    if (error) {
      console.error('Error seeding gifts:', error)
      return NextResponse.json({ error: 'Error al poblar regalos' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Regalos de ejemplo agregados exitosamente',
      count: gifts.length 
    })
  } catch (error) {
    console.error('Error in POST /api/gifts/seed:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
