import type { EtapaTarefa } from "./types";

export const ETAPAS: EtapaTarefa[] = [
  { id: "briefing", nome: "Briefing", categoria: "Backlog" },
  { id: "roteiro", nome: "Roteiro", categoria: "Backlog" },
  { id: "redacao", nome: "Redação", categoria: "Em Execução" },
  { id: "design", nome: "Design", categoria: "Em Execução" },
  { id: "gravacao", nome: "Gravação", categoria: "Em Execução" },
  { id: "edicao", nome: "Edição", categoria: "Em Execução" },
  { id: "revisao-interna", nome: "Revisão Interna", categoria: "Em Aprovação" },
  { id: "aprovacao-solicitante", nome: "Aprovação Solicitante", categoria: "Em Aprovação" },
  { id: "publicacao", nome: "Publicação", categoria: "Concluído" },
  { id: "disparo", nome: "Disparo", categoria: "Concluído" },
  { id: "envio", nome: "Envio", categoria: "Concluído" },
  { id: "entrega", nome: "Entrega", categoria: "Concluído" },
];

export function etapaById(id: string): EtapaTarefa | undefined {
  return ETAPAS.find((e) => e.id === id);
}
