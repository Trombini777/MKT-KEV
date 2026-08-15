import { createClient } from "@/lib/supabase/server";
import type { Colaborador } from "@/lib/mock";

/**
 * Colaborador vinculado ao usuário autenticado agora (via `colaboradores.auth_user_id`) — usado
 * pelo layout do app pra mostrar nome/avatar e como `autor_id` nas mutações. `null` quando não
 * há sessão ou quando a conta de Auth ainda não foi vinculada a um colaborador.
 *
 * Fica separado de `auth.ts` de propósito: aquele arquivo é `"use server"` no topo (só Server
 * Actions), e uma função de leitura simples misturada ali quebra o build quando um Client
 * Component (login-form.tsx) importa de lá — Next.js não permite Server Actions inline num
 * arquivo que também é alcançável do client.
 */
export async function getUsuarioAtual(): Promise<Colaborador | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("colaboradores")
    .select(
      "id, nome, email, whatsapp, dataNascimento:data_nascimento, cargo, skills, capacidadeHorasSemana:capacidade_horas_semana, status, squadId:squad_id, avatarIniciais:avatar_iniciais, avatarUrl:avatar_url"
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return (data as Colaborador | null) ?? null;
}
