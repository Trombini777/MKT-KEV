"use client";

import { createClient } from "@/lib/supabase/client";
import { obterColaboradorAtual } from "@/lib/current-colaborador-client";

export type CorNota = "verde" | "branco";

export type NotaPessoal = {
  conteudo: string;
  cor: CorNota;
};

const NOTA_VAZIA: NotaPessoal = { conteudo: "", cor: "verde" };

/** Lê a anotação pessoal do colaborador logado — privada, ver RLS em notas_pessoais (0016). */
export async function carregarNotaPessoal(): Promise<NotaPessoal> {
  const usuario = await obterColaboradorAtual();
  if (!usuario) return NOTA_VAZIA;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("notas_pessoais")
    .select("conteudo, cor")
    .eq("colaborador_id", usuario.id)
    .maybeSingle();
  if (error || !data) return NOTA_VAZIA;
  return { conteudo: data.conteudo, cor: data.cor === "branco" ? "branco" : "verde" };
}

/** Upsert: primeira gravação cria a linha, as seguintes atualizam a mesma (colaborador_id é PK). */
export async function salvarNotaPessoal(nota: NotaPessoal): Promise<void> {
  const usuario = await obterColaboradorAtual();
  if (!usuario) return;

  const supabase = createClient();
  const { error } = await supabase
    .from("notas_pessoais")
    .upsert({
      colaborador_id: usuario.id,
      conteudo: nota.conteudo,
      cor: nota.cor,
      atualizado_em: new Date().toISOString(),
    });
  if (error) console.error("Falha ao salvar anotação pessoal:", error.message);
}
