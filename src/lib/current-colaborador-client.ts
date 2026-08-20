"use client";

import { createClient } from "@/lib/supabase/client";
import { registrarResetDeSessao } from "@/lib/session-cache";

// Substitui o antigo USUARIO_ATUAL_ID hardcoded (mock/current-user.ts): resolve qual colaborador
// está vinculado (via `auth_user_id`) ao usuário logado agora — usado pelos stores client-side
// pra assinar histórico/comentários como autor real.
type ColaboradorAtual = { id: string; nome: string; email: string };

let cache: ColaboradorAtual | null = null;
let carregando: Promise<ColaboradorAtual | null> | null = null;
// Incrementada a cada reset de sessão — uma busca iniciada ANTES do reset (ex.: disparada no
// instante do logout, com a sessão antiga ainda válida) só pode gravar em `cache` se essa geração
// ainda for a atual; senão uma resposta tardia da sessão anterior sobrescreveria a identidade da
// pessoa que acabou de logar.
let geracao = 0;

export async function obterColaboradorAtual(): Promise<ColaboradorAtual | null> {
  if (cache) return cache;
  if (!carregando) {
    const geracaoDaBusca = geracao;
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
      if (geracaoDaBusca === geracao) cache = data;
      return data;
    })().finally(() => {
      // Não deixa `carregando` preso numa Promise já resolvida: se essa chamada rodou sem sessão
      // (ex.: no instante do login, antes do cookie propagar) ou falhou, a próxima chamada refaz
      // a consulta em vez de herdar `null` pra sempre.
      if (geracaoDaBusca === geracao && !cache) carregando = null;
    });
  }
  return carregando;
}

registrarResetDeSessao(() => {
  geracao++;
  cache = null;
  carregando = null;
});
