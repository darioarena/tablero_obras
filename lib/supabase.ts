import { createClient, SupabaseClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("[Security] lib/supabase solo puede ejecutarse en el servidor.");
}

let cachedClient: SupabaseClient | null = null;

/**
 * Verifica si las variables de entorno de Supabase / PostgreSQL están configuradas.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

/**
 * Obtiene el cliente administrativo de Supabase para operaciones en backend.
 * Utiliza SUPABASE_SERVICE_ROLE_KEY para interactuar con la base de datos de forma segura
 * desde Server Components, Server Actions y NextAuth, respetando el aislamiento fuera del navegador.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error("[Supabase] Error inicializando cliente administrativo:", err);
    return null;
  }
}
