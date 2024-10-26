'use server'

import { Publisher } from '../types/Publisher'
import { supabase } from '../lib/supabase'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { Domain } from "../types/Domains";

let cachedPublishers: Publisher[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchPublishers = cache(
  async (forceRefresh: boolean = false): Promise<Publisher[]> => {
    const now = Date.now();
    if (
      !forceRefresh &&
      cachedPublishers &&
      now - lastFetchTime < CACHE_DURATION
    ) {
      return cachedPublishers;
    }

    const query = supabase
      .from("Publishers")
      .select("*")
      .order("domainName", { ascending: true });
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching publishers:", error);
      throw error;
    }

    cachedPublishers = data;
    lastFetchTime = now;
    return data;
  }
);

export async function addPublisher(
  publisher: Omit<Publisher, "id">
): Promise<Publisher> {
  const { data, error } = await supabase
    .from("Publishers")
    .insert(publisher)
    .select()
    .single();

  if (error) {
    console.error("Error adding publisher:", error);
    throw error;
  }

  revalidatePath("/");
  return data;
}

export async function updatePublisher(
  publisher: Publisher
): Promise<Publisher> {
  const { data, error } = await supabase
    .from("Publishers")
    .update(publisher)
    .eq("id", publisher.id)
    .select()
    .single();
  if (error) throw error;

  revalidatePath("/");
  return data;
}

export async function deletePublisher(id: string): Promise<boolean> {
  const { error } = await supabase.from("Publishers").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/");
  return true;
}

export async function handleGetLinks(publisher: Publisher) {
  console.log(publisher);
}

export async function handleBlacklist(publisher: Publisher) {
  console.log(publisher);
}

export async function handleViewRejectedSites(domain: Domain) {
  console.log(domain);
}
