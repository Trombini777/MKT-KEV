"use client";

import { useEffect, useSyncExternalStore } from "react";
import { PROJETOS, type Projeto } from "@/lib/mock";
import { createClient } from "@/lib/supabase/client";

// Mesmo padrão do etapa-store.ts/colaborador-store.ts: muta o array PROJETOS *no próprio lugar*
// assim que hidrata do Supabase, assim quem lê direto via `projetoById` (kanban, detalhe da
// tarefa, lista de execução) passa a ver os uuids reais do banco em vez dos ids-slug do mock
// estático — sem essa troca, vincular uma tarefa a um projeto falha (`tarefas.projeto_id` é uuid
// de verdade).
const SELECT =
  "id, nome, sigla, descricao, tipo, departamento, responsavelId:responsavel_id, dataInicio:data_inicio, dataFim:data_fim, notasEncerramento:notas_encerramento, status";

function paraLinha(p: Partial<Projeto>) {
  return {
    nome: p.nome,
    sigla: p.sigla,
    descricao: p.descricao ?? "",
    tipo: p.tipo,
    departamento: p.departamento,
    responsavel_id: p.responsavelId,
    data_inicio: p.dataInicio || null,
    data_fim: p.dataFim || null,
    notas_encerramento: p.notasEncerramento ?? null,
    status: p.status,
  };
}

let hidratando = false;
// Distinto de `hidratando`: só vira true depois que a primeira leitura do Supabase termina (com
// sucesso ou erro) — usado por páginas tipo /projetos/[id] pra não confundir "ainda carregando"
// com "id realmente não existe" (ver `useProjetosCarregados`).
let carregado = false;
let snapshot: Projeto[] = [...PROJETOS];
const listeners = new Set<() => void>();

function emit() {
  snapshot = [...PROJETOS];
  for (const listener of listeners) listener();
}

async function hidratar() {
  if (hidratando) return;
  hidratando = true;
  const supabase = createClient();
  const { data, error } = await supabase.from("projetos").select(SELECT).order("nome");
  if (error) {
    console.error("Falha ao carregar projetos:", error.message);
    carregado = true;
    emit();
    return;
  }
  PROJETOS.length = 0;
  PROJETOS.push(...((data ?? []) as unknown as Projeto[]));
  carregado = true;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getCarregadoSnapshot() {
  return carregado;
}

export function useProjetos(): Projeto[] {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** true assim que a primeira leitura real do Supabase termina — antes disso, `useProjetos()`
 * ainda está devolvendo só o seed estático, então "não encontrei esse id" pode só significar
 * "ainda não carreguei", não que o projeto não existe. */
export function useProjetosCarregados(): boolean {
  return useSyncExternalStore(subscribe, getCarregadoSnapshot, getCarregadoSnapshot);
}

/** `projeto.id` recebido é ignorado na criação — o Postgres gera o uuid real. */
export async function adicionarProjeto(projeto: Projeto) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projetos")
    .insert(paraLinha(projeto))
    .select(SELECT)
    .single();
  if (error || !data) {
    console.error("Falha ao criar projeto:", error?.message);
    return;
  }
  PROJETOS.push(data as unknown as Projeto);
  PROJETOS.sort((a, b) => a.nome.localeCompare(b.nome));
  emit();
}

export async function editarProjeto(projetoAtualizado: Projeto) {
  const supabase = createClient();
  const { error } = await supabase
    .from("projetos")
    .update(paraLinha(projetoAtualizado))
    .eq("id", projetoAtualizado.id);
  if (error) {
    console.error("Falha ao editar projeto:", error.message);
    return;
  }
  const idx = PROJETOS.findIndex((p) => p.id === projetoAtualizado.id);
  if (idx !== -1) PROJETOS[idx] = projetoAtualizado;
  emit();
}
