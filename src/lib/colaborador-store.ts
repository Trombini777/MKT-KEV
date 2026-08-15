"use client";

import { useEffect, useSyncExternalStore } from "react";
import { COLABORADORES, type Colaborador } from "@/lib/mock";
import { createClient } from "@/lib/supabase/client";

// Mesmo padrão de hooks/mutators de antes (ver docs/PLAN.md M2), só que agora lendo/escrevendo
// direto no Supabase (protegido por RLS) em vez de localStorage. Igual ao etapa-store.ts, muta
// o array COLABORADORES *no próprio lugar* (push/splice) — assim quem lê direto via
// `colaboradorById`/`nomeColaborador`/`iniciaisColaborador` (dezenas de componentes) continua
// vendo dados atualizados sem precisar trocar pro hook.
const SELECT =
  "id, nome, email, whatsapp, dataNascimento:data_nascimento, cargo, skills, capacidadeHorasSemana:capacidade_horas_semana, status, squadId:squad_id, avatarIniciais:avatar_iniciais, avatarUrl:avatar_url";

let hidratado = false;
let snapshot: Colaborador[] = [...COLABORADORES];
const listeners = new Set<() => void>();

function emit() {
  snapshot = [...COLABORADORES];
  for (const listener of listeners) listener();
}

function paraLinha(c: Partial<Colaborador>) {
  return {
    nome: c.nome,
    email: c.email,
    whatsapp: c.whatsapp ?? null,
    data_nascimento: c.dataNascimento ?? null,
    cargo: c.cargo,
    skills: c.skills,
    capacidade_horas_semana: c.capacidadeHorasSemana,
    status: c.status,
    squad_id: c.squadId,
    avatar_iniciais: c.avatarIniciais,
    avatar_url: c.avatarUrl ?? null,
  };
}

async function hidratar() {
  if (hidratado) return;
  hidratado = true;
  const supabase = createClient();
  const { data, error } = await supabase.from("colaboradores").select(SELECT).order("nome");
  if (error) {
    console.error("Falha ao carregar colaboradores:", error.message);
    return;
  }
  COLABORADORES.length = 0;
  COLABORADORES.push(...((data ?? []) as unknown as Colaborador[]));
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function useColaboradores(): Colaborador[] {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** `colaborador.id` recebido é ignorado na criação — o Postgres gera o uuid real. */
export async function adicionarColaborador(colaborador: Colaborador) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("colaboradores")
    .insert(paraLinha(colaborador))
    .select(SELECT)
    .single();
  if (error || !data) {
    console.error("Falha ao criar colaborador:", error?.message);
    return;
  }
  COLABORADORES.push(data as unknown as Colaborador);
  COLABORADORES.sort((a, b) => a.nome.localeCompare(b.nome));
  emit();
}

export async function editarColaborador(colaboradorAtualizado: Colaborador) {
  const supabase = createClient();
  const { error } = await supabase
    .from("colaboradores")
    .update(paraLinha(colaboradorAtualizado))
    .eq("id", colaboradorAtualizado.id);
  if (error) {
    console.error("Falha ao editar colaborador:", error.message);
    return;
  }
  const idx = COLABORADORES.findIndex((c) => c.id === colaboradorAtualizado.id);
  if (idx !== -1) COLABORADORES[idx] = colaboradorAtualizado;
  emit();
}

export async function excluirColaborador(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("colaboradores").delete().eq("id", id);
  if (error) {
    console.error("Falha ao excluir colaborador:", error.message);
    return;
  }
  const idx = COLABORADORES.findIndex((c) => c.id === id);
  if (idx !== -1) COLABORADORES.splice(idx, 1);
  emit();
}
