import "server-only";
import { supabaseConfigurado } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type StatusSupabase =
  | { ok: true; areas: number }
  | { ok: false; motivo: "sem-configuracao" | "erro" };

/**
 * Checagem de conexão do M0: lê a contagem de `departamentos` (tabela do Sistema de Marketing
 * com leitura pública por RLS) usando o cliente anônimo. Confirma que o Studio aponta para o
 * mesmo projeto Supabase sem precisar de login nem de service role.
 */
export async function verificarSupabase(): Promise<StatusSupabase> {
  if (!supabaseConfigurado()) return { ok: false, motivo: "sem-configuracao" };
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("departamentos")
      .select("id", { count: "exact", head: true });
    if (error) {
      console.error("[supabase/status]", error.code, error.message);
      return { ok: false, motivo: "erro" };
    }
    return { ok: true, areas: count ?? 0 };
  } catch (e) {
    console.error("[supabase/status]", e instanceof Error ? e.message : e);
    return { ok: false, motivo: "erro" };
  }
}
