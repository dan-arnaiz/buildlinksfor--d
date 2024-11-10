import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// This is for Client-Side
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

// This is for SSR (Server-Side Rendering)
export function createSSRClient(req, res) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createServerClient({ supabaseUrl, supabaseKey, req, res });
}

// This is for Browser Client
export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
