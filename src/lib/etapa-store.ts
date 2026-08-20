"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ETAPAS, type EtapaTarefa } from "@/lib/mock";
import { createClient } from "@/lib/supabase/client";
import { registrarResetDeSessao } from "@/lib/session-cache";

// Diferente dos outros stores (que reatribuem a variável), aqui mutamos o array ETAPAS *no
// próprio lugar* (push/splice) — assim quem importa `ETAPAS`/`etapaById` direto (ex.:
// tipo-tarefa-sheet.tsx, os cartões de tarefa) continua vendo os dados atualizados sem precisar
// trocar pra um hook, já que é a mesma referência de array sendo alterada em memória. Os campos
// da tabela `etapas` batem 1:1 com EtapaTarefa (id/nome/categoria), sem precisar de alias.
let hidratado = false;
let snapshot: EtapaTarefa[] = [...ETAPAS];
const listeners = new Set<() => void>();

function emit() {
  snapshot = [...ETAPAS];
  for (const listener of listeners) listener();
}

async function hidratar() {
  if (hidratado) return;
  hidratado = true;
  const supabase = createClient();
  const { data, error } = await supabase.from("etapas").select("id, nome, categoria").order("nome");
  if (error) {
    console.error("Falha ao carregar etapas:", error.message);
    hidratado = false;
    return;
  }
  ETAPAS.length = 0;
  ETAPAS.push(...((data ?? []) as EtapaTarefa[]));
  emit();
}

// Só destrava a flag — ver comentário equivalente em colaborador-store.ts sobre por que não
// refazer a busca eagerly aqui.
registrarResetDeSessao(() => {
  hidratado = false;
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function useEtapas(): EtapaTarefa[] {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** `etapa.id` recebido é ignorado na criação — o Postgres gera o uuid real. */
export async function adicionarEtapa(etapa: EtapaTarefa) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("etapas")
    .insert({ nome: etapa.nome, categoria: etapa.categoria })
    .select("id, nome, categoria")
    .single();
  if (error || !data) {
    console.error("Falha ao criar etapa:", error?.message);
    return;
  }
  ETAPAS.push(data as EtapaTarefa);
  emit();
}

export async function editarEtapa(id: string, patch: Partial<EtapaTarefa>) {
  const supabase = createClient();
  const linha: Record<string, unknown> = {};
  if (patch.nome !== undefined) linha.nome = patch.nome;
  if (patch.categoria !== undefined) linha.categoria = patch.categoria;
  const { error } = await supabase.from("etapas").update(linha).eq("id", id);
  if (error) {
    console.error("Falha ao editar etapa:", error.message);
    return;
  }
  const idx = ETAPAS.findIndex((e) => e.id === id);
  if (idx === -1) return;
  ETAPAS[idx] = { ...ETAPAS[idx], ...patch };
  emit();
}

export async function excluirEtapa(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("etapas").delete().eq("id", id);
  if (error) {
    console.error("Falha ao excluir etapa:", error.message);
    return;
  }
  const idx = ETAPAS.findIndex((e) => e.id === id);
  if (idx === -1) return;
  ETAPAS.splice(idx, 1);
  emit();
}
