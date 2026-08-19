import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a service role key — ignora RLS. Só pra leituras internas do sistema
 * disparadas por quem NÃO está autenticado como colaborador da Kev (ex.: o formulário público de
 * solicitação em /solicitacoes), onde o client normal (RLS por `is_kev_colaborador()`) retornaria
 * zero linhas sem erro. Nunca importar isso de um arquivo que roda no browser.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
