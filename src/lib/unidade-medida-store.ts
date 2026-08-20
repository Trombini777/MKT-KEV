"use client";

import { useEffect, useSyncExternalStore } from "react";
import { type UnidadeMedida } from "@/lib/mock";
import { createClient } from "@/lib/supabase/client";
import { registrarResetDeSessao } from "@/lib/session-cache";

let unidades: UnidadeMedida[] = [];
let hidratado = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

async function hidratar() {
  if (hidratado) return;
  hidratado = true;
  const supabase = createClient();
  const { data, error } = await supabase.from("unidades_medida").select("id, nome").order("nome");
  if (error) {
    console.error("Falha ao carregar unidades de medida:", error.message);
    hidratado = false;
    return;
  }
  unidades = data ?? [];
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
  return unidades;
}

export function useUnidadesMedida(): UnidadeMedida[] {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** `unidade.id` recebido é ignorado na criação — o Postgres gera o uuid real. */
export async function adicionarUnidadeMedida(unidade: UnidadeMedida) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("unidades_medida")
    .insert({ nome: unidade.nome })
    .select("id, nome")
    .single();
  if (error || !data) {
    console.error("Falha ao criar unidade de medida:", error?.message);
    return;
  }
  unidades = [...unidades, data].sort((a, b) => a.nome.localeCompare(b.nome));
  emit();
}

export async function editarUnidadeMedida(id: string, novoNome: string) {
  const supabase = createClient();
  const { error } = await supabase.from("unidades_medida").update({ nome: novoNome }).eq("id", id);
  if (error) {
    console.error("Falha ao editar unidade de medida:", error.message);
    return;
  }
  unidades = unidades.map((u) => (u.id === id ? { ...u, nome: novoNome } : u));
  emit();
}

export async function excluirUnidadeMedida(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("unidades_medida").delete().eq("id", id);
  if (error) {
    console.error("Falha ao excluir unidade de medida:", error.message);
    return;
  }
  unidades = unidades.filter((u) => u.id !== id);
  emit();
}
