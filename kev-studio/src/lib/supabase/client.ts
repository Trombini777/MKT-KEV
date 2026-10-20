import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase do navegador, protegido por RLS. Mesmo projeto do Sistema de Marketing
 * (schema em ../supabase/migrations/).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
