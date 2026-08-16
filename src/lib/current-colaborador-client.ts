"use client";

import { createClient } from "@/lib/supabase/client";

// Substitui o antigo USUARIO_ATUAL_ID hardcoded (mock/current-user.ts): resolve, uma vez por
// sessão do navegador, qual colaborador está vinculado (via `auth_user_id`) ao usuário logado
// agora — usado pelos stores client-side pra assinar histórico/comentários como autor real.
type ColaboradorAtual = { id: string; nome: string; email: string };

let cache: ColaboradorAtual | null = null;
let carregando: Promise<ColaboradorAtual | null> | null = null;

export async function obterColaboradorAtual(): Promise<ColaboradorAtual | null> {
  if (cache) return cache;
  if (!carregando) {
    carregando = (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("colaboradores")
        .select("id, nome, email")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (!data) return null;
      cache = data;
      return cache;
    })();
  }
  return carregando;
}
