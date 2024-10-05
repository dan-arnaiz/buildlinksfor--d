import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data, error } = await supabase.from('Publishers').select('*').limit(10)
    
    if (error) {
      console.error("Supabase query error:", error)
      throw error
    }
    
    console.log("Fetched data:", data)
    
    return NextResponse.json({ message: "Supabase connected successfully", data })
  } catch (error) {
    console.error("Supabase connection error:", error)
    return NextResponse.json({ error: "Failed to connect to Supabase" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const data = await request.json()
  
  // No need to join the niche array here, it's already a string

  const { data: publisher, error } = await supabase
    .from('publishers')
    .insert(data)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(publisher)
}


