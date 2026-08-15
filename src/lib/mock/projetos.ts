import type { Projeto } from "./types";

export const PROJETOS: Projeto[] = [
  {
    id: "dia-das-maes",
    nome: "Dia das Mães 2026",
    sigla: "DMÃES26",
    descricao: "Campanha sazonal de seguro de vida e assistência financeira para o Dia das Mães.",
    tipo: "Campanha",
    departamento: "Comercial",
    responsavelId: "beatriz",
    dataInicio: "2026-07-15",
    dataFim: "2026-08-20",
  },
  {
    id: "ipva",
    nome: "IPVA SP 2026",
    sigla: "IPVA26",
    descricao: "Campanha de prevenção e cross-sell de seguro auto durante a janela de IPVA em SP.",
    tipo: "Campanha",
    departamento: "Autoday",
    responsavelId: "beatriz",
    dataInicio: "2026-07-01",
    dataFim: "2026-09-10",
  },
  {
    id: "renovacao-apolice",
    nome: "Renovação de Apólice",
    sigla: "RENOV26",
    descricao: "Comunicação recorrente para clientes com apólice próxima do vencimento.",
    tipo: "Projeto",
    departamento: "Comercial",
    responsavelId: "marcos",
    dataInicio: "2026-08-01",
    dataFim: "2026-10-31",
  },
];

export function projetoById(id: string): Projeto | undefined {
  return PROJETOS.find((p) => p.id === id);
}
