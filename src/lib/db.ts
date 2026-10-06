import { supabaseConfigured } from "./supabase";

/**
 * Persistence lives in Supabase (Postgres) so Netlify serverless functions never
 * write a local SQLite file or `.data` directory. When Supabase env vars are
 * missing (local preview), an in-memory store is used instead — still no disk.
 */
export { getSupabase, supabaseConfigured } from "./supabase";

export function usingSupabase(): boolean {
  return supabaseConfigured();
}
