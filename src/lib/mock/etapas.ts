import type { EtapaTarefa } from "./types";

export const ETAPAS: EtapaTarefa[] = [
  { id: "briefing", nome: "Briefing", categoria: "A fazer" },
  { id: "roteiro", nome: "Roteiro", categoria: "A fazer" },
  { id: "redacao", nome: "Redação", categoria: "Em andamento" },
  { id: "design", nome: "Design", categoria: "Em andamento" },
  { id: "gravacao", nome: "Gravação", categoria: "Em andamento" },
  { id: "edicao", nome: "Edição", categoria: "Em andamento" },
  { id: "revisao-interna", nome: "Revisão Interna", categoria: "Em andamento" },
  { id: "aprovacao-solicitante", nome: "Aprovação Solicitante", categoria: "Em andamento" },
  { id: "publicacao", nome: "Publicação", categoria: "Concluído" },
  { id: "disparo", nome: "Disparo", categoria: "Concluído" },
  { id: "envio", nome: "Envio", categoria: "Concluído" },
  { id: "entrega", nome: "Entrega", categoria: "Concluído" },
];

export function etapaById(id: string): EtapaTarefa | undefined {
  return ETAPAS.find((e) => e.id === id);
}
