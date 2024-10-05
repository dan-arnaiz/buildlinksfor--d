'use server'

import { revalidatePath } from 'next/cache'
import { Publisher } from '../types/Publisher'

// This is a mock database. Replace with your actual database logic.
let publishers: Publisher[] = []

export async function getPublishers(filterParams: string = ''): Promise<Publisher[]> {
  // Implement filtering logic here based on filterParams
  return publishers
}

export async function addPublisher(publisher: Omit<Publisher, 'id'>): Promise<Publisher> {
  const newPublisher = { ...publisher, id: Date.now().toString() }
  publishers.push(newPublisher)
  revalidatePath('/')
  return newPublisher
}

export async function updatePublisher(updatedPublisher: Publisher): Promise<Publisher> {
  publishers = publishers.map(p => p.id === updatedPublisher.id ? updatedPublisher : p)
  revalidatePath('/')
  return updatedPublisher
}

export async function deletePublisher(id: string): Promise<boolean> {
  publishers = publishers.filter(p => p.id !== id)
  revalidatePath('/')
  return true
}