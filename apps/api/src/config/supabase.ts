import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "./env";

/** Create a server-side Supabase client (service key). */
export function createServerSupabase(env: Env): SupabaseClient {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase server credentials are not configured.");
  }
  return createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

