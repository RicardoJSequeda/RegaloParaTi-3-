import { NextResponse } from 'next/server'
import { getAdminClient } from '@/server/supabase-admin'

export async function POST() {
  try {
    const supabase = getAdminClient()

    const sampleMovies = [
      // Películas
      {
        title: 'La La Land',
        description: 'Una historia de amor entre una aspirante a actriz y un músico de jazz en Los Ángeles.',
        type: 'pelicula',
        genre: 'romantico',
        image: 'https://images.unsplash.com/photo-1489599835382-957593cb2371?w=400&h=600&fit=crop',
        watchLink: 'https://www.netflix.com/title/80095314'
      },
      {
        title: 'Inception',
        description: 'Un ladrón que roba información corporativa a través del uso de la tecnología de compartir sueños.',
        type: 'pelicula',
        genre: 'ciencia_ficcion',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
        watchLink: 'https://play.hbomax.com/feature/urn:hbo:feature:GVU2cgg0zRJuAuwEAAABj'
      },
      {
        title: 'El Rey León',
        description: 'La historia de Simba, un joven león que debe enfrentar su destino.',
        type: 'pelicula',
        genre: 'animacion',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
        watchLink: 'https://www.disneyplus.com/movies/the-lion-king/1HqwiFnkVctS'
      },
      {
        title: 'El Padrino',
        description: 'La historia de la familia Corleone, una de las cinco familias criminales más poderosas de Nueva York.',
        type: 'pelicula',
        genre: 'drama',
        image: 'https://images.unsplash.com/photo-1560109947-543149eceb16?w=400&h=600&fit=crop',
        watchLink: 'https://www.paramountplus.com/movies/the-godfather/'
      },
      {
        title: 'Titanic',
        description: 'Una historia de amor entre dos jóvenes de diferentes clases sociales a bordo del famoso barco.',
        type: 'pelicula',
        genre: 'romantico',
        image: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=400&h=600&fit=crop',
        watchLink: 'https://www.disneyplus.com/movies/titanic/1HqwiFnkVctS'
      },
      // Series
      {
        title: 'Stranger Things',
        description: 'Un grupo de niños descubre fenómenos sobrenaturales en su pequeño pueblo.',
        type: 'serie',
        genre: 'ciencia_ficcion',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
        watchLink: 'https://www.netflix.com/title/80057281',
        season: 4,
        episode: 8
      },
      {
        title: 'The Crown',
        description: 'La historia de la reina Isabel II y los eventos que ayudaron a dar forma a la segunda mitad del siglo XX.',
        type: 'serie',
        genre: 'drama',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
        watchLink: 'https://www.netflix.com/title/80025678',
        season: 1,
        episode: 1
      },
      {
        title: 'Friends',
        description: 'Las aventuras de seis amigos que viven en Manhattan y comparten sus vidas, amores y risas.',
        type: 'serie',
        genre: 'comedia',
        image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop',
        watchLink: 'https://www.hbomax.com/series/urn:hbo:series:GXdbR_gOXWJuAuwEAABJ9',
        season: 10,
        episode: 236
      },
      {
        title: 'Breaking Bad',
        description: 'Un profesor de química de secundaria recurre a una vida de crimen, produciendo y vendiendo metanfetaminas.',
        type: 'serie',
        genre: 'drama',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
        watchLink: 'https://www.netflix.com/title/70143836',
        season: 3,
        episode: 13
      },
      {
        title: 'The Office',
        description: 'Un documental falso sobre la vida cotidiana de los empleados de una empresa de papel.',
        type: 'serie',
        genre: 'comedia',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=600&fit=crop',
        watchLink: 'https://www.peacocktv.com/stream-tv/the-office',
        season: 1,
        episode: 1
      }
    ]

    const { data: movies, error } = await supabase
      .from('movies')
      .insert(sampleMovies)
      .select()

    if (error) {
      console.error('Error seeding movies:', error)
      return NextResponse.json(
        { error: 'Error al poblar la base de datos', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: `${movies.length} películas y series agregadas exitosamente`,
      movies 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
