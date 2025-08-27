import { NextRequest, NextResponse } from 'next/server'
import { getBrowserClient } from '@/lib/supabase/browser-client'

export async function GET() {
  try {
    const supabase = getBrowserClient()
    
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recipes:', error)
      return NextResponse.json({ error: 'Error al obtener recetas' }, { status: 500 })
    }

    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error in GET /api/recipes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getBrowserClient()
    const body = await request.json()
    
    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating recipe:', error)
      return NextResponse.json({ error: 'Error al crear receta' }, { status: 500 })
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error in POST /api/recipes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
