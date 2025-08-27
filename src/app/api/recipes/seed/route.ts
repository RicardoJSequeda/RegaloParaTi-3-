import { NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'

export async function POST() {
  try {
    const supabase = getAdminClient()
    
    const sampleRecipes = [
      {
        title: 'Pasta Carbonara Romántica',
        description: 'Una deliciosa pasta carbonara perfecta para una cena romántica en casa',
        category: 'cena',
        cuisine: 'italiana',
        difficulty: 'medio',
        prepTime: 15,
        cookTime: 20,
        servings: 2,
        ingredients: [
          '200g spaghetti',
          '100g panceta o tocino',
          '2 huevos',
          '50g queso parmesano rallado',
          'Pimienta negra molida',
          'Sal al gusto'
        ],
        instructions: [
          'Cocina la pasta en agua con sal hasta que esté al dente',
          'Mientras tanto, corta la panceta en trozos pequeños y fríela hasta que esté crujiente',
          'En un bowl, bate los huevos con el queso parmesano y pimienta',
          'Escurre la pasta y mézclala inmediatamente con la mezcla de huevos',
          'Agrega la panceta y revuelve suavemente',
          'Sirve caliente con queso parmesano adicional'
        ],
        tips: 'El secreto está en mezclar la pasta caliente con los huevos para crear una salsa cremosa sin que se cuajen.',
        author: 'ambos',
        isFavorite: true,
        rating: 5,
        tags: ['Romántico', 'Favorito', 'Italiana'],
        images: [
          'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop'
        ]
      },
      {
        title: 'Smoothie de Frutos Rojos',
        description: 'Un refrescante smoothie perfecto para el desayuno o merienda',
        category: 'bebida',
        cuisine: 'otra',
        difficulty: 'facil',
        prepTime: 5,
        cookTime: 0,
        servings: 2,
        ingredients: [
          '1 taza de frutos rojos (fresas, frambuesas, moras)',
          '1 plátano',
          '1 taza de leche o leche de almendras',
          '1 cucharada de miel',
          'Hielo al gusto'
        ],
        instructions: [
          'Lava y prepara las frutas',
          'Coloca todos los ingredientes en la licuadora',
          'Licúa hasta obtener una mezcla suave',
          'Sirve inmediatamente'
        ],
        author: 'yo',
        isFavorite: false,
        rating: 4,
        tags: ['Saludable', 'Rápido', 'Fácil'],
        images: [
          'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop'
        ]
      },
      {
        title: 'Brownies de Chocolate',
        description: 'Brownies caseros con chocolate negro, perfectos para compartir',
        category: 'postre',
        cuisine: 'americana',
        difficulty: 'medio',
        prepTime: 20,
        cookTime: 25,
        servings: 8,
        ingredients: [
          '200g chocolate negro',
          '150g mantequilla',
          '3 huevos',
          '200g azúcar',
          '100g harina',
          '1 cucharadita de vainilla',
          'Pizca de sal'
        ],
        instructions: [
          'Precalienta el horno a 180°C',
          'Derrite el chocolate con la mantequilla al baño maría',
          'Bate los huevos con el azúcar hasta que estén espumosos',
          'Mezcla el chocolate derretido con los huevos',
          'Agrega la harina, vainilla y sal',
          'Vierte en un molde engrasado y hornea 25 minutos'
        ],
        tips: 'No los cocines demasiado, deben quedar un poco húmedos en el centro.',
        author: 'pareja',
        isFavorite: true,
        rating: 5,
        tags: ['Dulce', 'Favorito', 'Chocolate'],
        images: [
          'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop'
        ]
      }
    ]

    const { data: recipes, error } = await supabase
      .from('recipes')
      .insert(sampleRecipes)
      .select()

    if (error) {
      console.error('Error seeding recipes:', error)
      return NextResponse.json({ error: 'Error al poblar recetas' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Recetas de ejemplo agregadas exitosamente',
      count: recipes.length 
    })
  } catch (error) {
    console.error('Error in POST /api/recipes/seed:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
