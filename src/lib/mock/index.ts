export * from "./types";
export * from "./colaboradores";
export * from "./fluxo";
export * from "./tipos";
export * from "./etapas";
export * from "./unidades-medida";
export * from "./tags";
export * from "./projetos";
export * from "./executores-padrao";
export * from "./usuarios";
export * from "./tarefas";
export * from "./workload";
export * from "./dashboards";

import { COLABORADORES } from "./colaboradores";
import { TIPOS_TAREFA } from "./tipos";
import { ETAPAS } from "./etapas";
import { TAGS } from "./tags";
import type { EtapaTarefa, Tarefa } from "./types";

export function colaboradorById(id: string) {
  return COLABORADORES.find((c) => c.id === id);
}

export function nomeColaborador(id: string | undefined): string {
  if (!id) return "";
  return COLABORADORES.find((c) => c.id === id)?.nome ?? id;
}

export function iniciaisColaborador(id: string | undefined): string {
  if (!id) return "?";
  return COLABORADORES.find((c) => c.id === id)?.avatarIniciais ?? "?";
}

export function nomeTipo(id: string | undefined): string {
  if (!id) return "";
  return TIPOS_TAREFA.find((t) => t.id === id)?.nome ?? id;
}

export function etapaTarefaAtual(tarefa: Tarefa): (EtapaTarefa & { ordem: number }) | undefined {
  if (!tarefa.etapaAtualId) return undefined;
  const etapa = ETAPAS.find((e) => e.id === tarefa.etapaAtualId);
  if (!etapa) return undefined;
  const tipo = TIPOS_TAREFA.find((t) => t.id === tarefa.tipoId);
  const ordem = tipo?.etapas.find((e) => e.etapaId === tarefa.etapaAtualId)?.ordem ?? 0;
  return { ...etapa, ordem };
}

export function nomeTag(id: string): string {
  return TAGS.find((t) => t.id === id)?.nome ?? id;
}
