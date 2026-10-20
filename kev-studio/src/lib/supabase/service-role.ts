import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { envServiceRole } from "@/lib/env";

/**
 * Cliente Supabase com a service role key: ignora RLS. No Studio, só para gravações que o
 * usuário de BU não pode fazer direto (consumo, cotas). O `server-only` faz o build falhar se
 * este arquivo for importado por código que roda no navegador.
 */
export function createServiceRoleClient() {
  const env = envServiceRole();
  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
