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
import { etapaAtualDoPlanejamento } from "./tarefas";
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

/**
 * Etapa/executor/data "atual" pra exibição — prioriza o planejamento aplicado (fonte de verdade
 * hoje) e cai pros campos antigos (`etapaAtualId`/`execucaoEtapaAte`) só pra tarefas sem
 * planejamento, que nunca chegam a ganhar esses campos preenchidos. Compartilhado entre qualquer
 * lugar que mostre "etapa atual" de uma tarefa (Kanban, Lista de atividades etc.) — sem essa
 * checagem, cards de tarefas com planejamento aplicado ficam sem executor/etapa (campos legados
 * simplesmente nunca são escritos nesse fluxo).
 */
export function infoEtapaAtual(tarefa: Tarefa): {
  nome: string | undefined;
  executorId: string | undefined;
  dataFim: string | undefined;
  esforco: number | undefined;
} {
  const atual = etapaAtualDoPlanejamento(tarefa);
  if (atual) {
    return {
      nome: ETAPAS.find((e) => e.id === atual.etapaId)?.nome,
      executorId: atual.colaboradorId,
      dataFim: atual.dataFim,
      esforco:
        atual.alocacoes.length > 0
          ? atual.alocacoes.reduce((soma, a) => soma + a.horas, 0)
          : undefined,
    };
  }
  return {
    nome: etapaTarefaAtual(tarefa)?.nome,
    executorId: (tarefa.executoresPorFase[tarefa.faseAtualId] ?? [])[0],
    dataFim: tarefa.execucaoEtapaAte,
    esforco: tarefa.estimativaPorFase[tarefa.faseAtualId],
  };
}

export function nomeTag(id: string): string {
  return TAGS.find((t) => t.id === id)?.nome ?? id;
}
