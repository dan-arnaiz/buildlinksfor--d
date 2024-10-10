"use server";

import { supabase } from "../lib/supabase";
import { revalidatePath } from "next/cache";
import { Domain } from "../types/Domains";
import { cache } from "react";

let cachedDomains: Domain[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchDomains = cache(
  async (forceRefresh: boolean = false): Promise<Domain[]> => {
    const now = Date.now();
    if (
      !forceRefresh &&
      cachedDomains &&
      now - lastFetchTime < CACHE_DURATION
    ) {
      return cachedDomains;
    }

    const query = supabase
      .from("Domains")
      .select("*")
      .order("name", { ascending: true });
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching domains:", error);
      throw error;
    }

    cachedDomains = data;
    lastFetchTime = now;
    return data;
  }
);

export async function addDomain(domain: Omit<Domain, "id">): Promise<Domain> {
  const { data, error } = await supabase
    .from("Domains")
    .insert(domain)
    .select()
    .single();

  if (error) {
    console.error("Error adding domain:", error);
    throw error;
  }

  revalidatePath("/");
  cachedDomains = null; // Invalidate cache
  return data;
}

export async function updateDomain(domain: Domain): Promise<Domain> {
  const { data, error } = await supabase
    .from("Domains")
    .update(domain)
    .eq("id", domain.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating domain:", error);
    throw error;
  }

  revalidatePath("/");
  cachedDomains = null; // Invalidate cache
  return data;
}

export async function deleteDomain(id: string): Promise<void> {
  const { error } = await supabase.from("Domains").delete().eq("id", id);

  if (error) {
    console.error("Error deleting domain:", error);
    throw error;
  }

  revalidatePath("/");
  cachedDomains = null; // Invalidate cache
}
