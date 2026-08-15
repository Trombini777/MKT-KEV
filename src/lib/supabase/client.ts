import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase do navegador — usado pelos stores client-side (task-store.ts etc.) pra
 * ler/escrever direto, protegido por RLS (ver supabase/migrations/0001_init_schema.sql).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
