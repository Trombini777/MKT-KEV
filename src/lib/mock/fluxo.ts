import type { Fase, Transicao } from "./types";

export const FASES: Fase[] = [
  { id: "solicitacoes", nome: "Solicitações", ordem: 1, slaDias: 2, isFinal: false, modoExecucao: "Individual" },
  { id: "triagem", nome: "Triagem", ordem: 2, slaDias: 1, isFinal: false, modoExecucao: "Individual" },
  { id: "aguardando-info", nome: "Aguardando Informações", ordem: 3, slaDias: 5, isFinal: false, modoExecucao: "Individual" },
  { id: "backlog", nome: "Backlog", ordem: 4, slaDias: 3, isFinal: false, modoExecucao: "Individual" },
  { id: "em-execucao", nome: "Em Execução", ordem: 5, slaDias: 4, isFinal: false, modoExecucao: "Individual" },
  { id: "aprovacao", nome: "Aprovação", ordem: 6, slaDias: 2, isFinal: false, modoExecucao: "Individual" },
  { id: "concluido", nome: "Concluído", ordem: 7, slaDias: 0, isFinal: true, modoExecucao: "Individual" },
];

export const TRANSICOES: Transicao[] = [
  { de: "solicitacoes", para: "triagem", label: "revisão" },
  { de: "triagem", para: "backlog", label: "aprova" },
  { de: "triagem", para: "aguardando-info", label: "falta info" },
  { de: "aguardando-info", para: "triagem", label: "recebida" },
  { de: "backlog", para: "em-execucao", label: "início" },
  { de: "em-execucao", para: "aprovacao", label: "pronto" },
  { de: "aprovacao", para: "concluido", label: "aprovado" },
  { de: "aprovacao", para: "em-execucao", label: "pede ajuste" },
];

export function destinosPermitidos(faseId: string): string[] {
  return TRANSICOES.filter((t) => t.de === faseId).map((t) => t.para);
}

/** Da Triagem em diante, o card só avança depois de "Planejar atividade" — é o planejamento
 * (aplicarPlanejamento) que tira o card da Triagem; mover na mão sem ele deixava a atividade
 * em Backlog/Execução sem etapas e sem como planejar mais. */
export const FASES_QUE_EXIGEM_PLANEJAMENTO = ["backlog", "em-execucao", "aprovacao", "concluido"];

export function exigePlanejamento(faseId: string): boolean {
  return FASES_QUE_EXIGEM_PLANEJAMENTO.includes(faseId);
}

export function faseById(id: string): Fase | undefined {
  return FASES.find((f) => f.id === id);
}
