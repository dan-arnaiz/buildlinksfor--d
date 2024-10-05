'use server'


import { Publisher } from '../types/Publisher'
import { supabase } from '../lib/supabase'
import { revalidatePath } from 'next/cache'
export async function fetchPublishers(): Promise<Publisher[]> {
 
  const query = supabase.from('Publishers').select('*')
  console.log("Executing query for Publishers")
  const { data, error } = await query
  if (error) {
    console.error("Error fetching publishers:", error)
    throw error
  }
  console.log("Fetched publishers:", data)
  return data
}
 

export async function addPublisher(publisher: Omit<Publisher, 'id'>): Promise<Publisher> {
  const { data, error } = await supabase
    .from('Publishers')
    .insert(publisher)
    .select()
    .single()

  if (error) {
    console.error("Error adding publisher:", error)
    throw error
  }

  revalidatePath('/') 
  return data
}

export async function updatePublisher(publisher: Publisher): Promise<Publisher> {
  const { data, error } = await supabase
    .from('Publishers')
    .update(publisher)
    .eq('id', publisher.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePublisher(id: string): Promise<boolean> {
  const { error } = await supabase.from('Publishers').delete().eq('id', id)
  if (error) throw error
  return true
}