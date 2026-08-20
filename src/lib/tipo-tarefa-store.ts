"use client";

import { useEffect, useSyncExternalStore } from "react";
import { TIPOS_TAREFA, type TipoTarefa, type EtapaDoTipo } from "@/lib/mock";
import { createClient } from "@/lib/supabase/client";
import { registrarResetDeSessao } from "@/lib/session-cache";

// Igual ao etapa-store.ts/colaborador-store.ts: muta TIPOS_TAREFA *no próprio lugar* — assim
// quem lê direto (visualizacoes/page.tsx, task-detail-sheet.tsx, lista-tarefas.tsx) continua
// vendo dados atualizados sem precisar trocar pro hook.
const SELECT = `
  id, nome, descricao, ativo, unidadeMedidaId:unidade_medida_id, atualizadoEm:atualizado_em,
  tipos_tarefa_etapas(etapa_id, ordem, estimativa_horas, executor_padrao_id, depende_de, pode_dividir, sla_dias, executores_permitidos_ids)
`;

let hidratado = false;
let snapshot: TipoTarefa[] = [...TIPOS_TAREFA];
const listeners = new Set<() => void>();

function emit() {
  snapshot = [...TIPOS_TAREFA];
  for (const listener of listeners) listener();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function linhaParaTipo(row: any): TipoTarefa {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    ativo: row.ativo,
    unidadeMedidaId: row.unidadeMedidaId ?? undefined,
    atualizadoEm: row.atualizadoEm,
    etapas: (row.tipos_tarefa_etapas ?? [])
      .slice()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.ordem - b.ordem)
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any): EtapaDoTipo => ({
          etapaId: e.etapa_id,
          ordem: e.ordem,
          estimativaHoras: e.estimativa_horas ?? undefined,
          executorPadraoId: e.executor_padrao_id ?? undefined,
          dependeDe: e.depende_de?.length ? e.depende_de : undefined,
          podeDividir: e.pode_dividir ?? undefined,
          slaDias: e.sla_dias ?? undefined,
          executoresPermitidosIds: e.executores_permitidos_ids?.length
            ? e.executores_permitidos_ids
            : undefined,
        })
      ),
  };
}

async function hidratar() {
  if (hidratado) return;
  hidratado = true;
  const supabase = createClient();
  const { data, error } = await supabase.from("tipos_tarefa").select(SELECT).order("nome");
  if (error) {
    console.error("Falha ao carregar tipos de tarefa:", error.message);
    hidratado = false;
    return;
  }
  TIPOS_TAREFA.length = 0;
  TIPOS_TAREFA.push(...(data ?? []).map(linhaParaTipo));
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

export function useTiposTarefa(): TipoTarefa[] {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

async function salvarEtapas(supabase: ReturnType<typeof createClient>, tipoTarefaId: string, etapas: EtapaDoTipo[]) {
  await supabase.from("tipos_tarefa_etapas").delete().eq("tipo_tarefa_id", tipoTarefaId);
  if (etapas.length === 0) return;
  await supabase.from("tipos_tarefa_etapas").insert(
    etapas.map((e) => ({
      tipo_tarefa_id: tipoTarefaId,
      etapa_id: e.etapaId,
      ordem: e.ordem,
      estimativa_horas: e.estimativaHoras ?? null,
      executor_padrao_id: e.executorPadraoId ?? null,
      depende_de: e.dependeDe ?? [],
      pode_dividir: e.podeDividir ?? false,
      sla_dias: e.slaDias ?? null,
      executores_permitidos_ids: e.executoresPermitidosIds ?? [],
    }))
  );
}

/** `tipo.id` recebido é ignorado na criação — o Postgres gera o uuid real. */
export async function adicionarTipoTarefa(tipo: TipoTarefa) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tipos_tarefa")
    .insert({
      nome: tipo.nome,
      descricao: tipo.descricao,
      ativo: tipo.ativo,
      unidade_medida_id: tipo.unidadeMedidaId || null,
      atualizado_em: tipo.atualizadoEm,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("Falha ao criar tipo de tarefa:", error?.message);
    return;
  }
  await salvarEtapas(supabase, data.id, tipo.etapas);
  TIPOS_TAREFA.push({ ...tipo, id: data.id });
  TIPOS_TAREFA.sort((a, b) => a.nome.localeCompare(b.nome));
  emit();
}

export async function editarTipoTarefa(tipoAtualizado: TipoTarefa) {
  const supabase = createClient();
  const { error } = await supabase
    .from("tipos_tarefa")
    .update({
      nome: tipoAtualizado.nome,
      descricao: tipoAtualizado.descricao,
      ativo: tipoAtualizado.ativo,
      unidade_medida_id: tipoAtualizado.unidadeMedidaId || null,
      atualizado_em: tipoAtualizado.atualizadoEm,
    })
    .eq("id", tipoAtualizado.id);
  if (error) {
    console.error("Falha ao editar tipo de tarefa:", error.message);
    return;
  }
  await salvarEtapas(supabase, tipoAtualizado.id, tipoAtualizado.etapas);
  const idx = TIPOS_TAREFA.findIndex((t) => t.id === tipoAtualizado.id);
  if (idx !== -1) TIPOS_TAREFA[idx] = tipoAtualizado;
  emit();
}
