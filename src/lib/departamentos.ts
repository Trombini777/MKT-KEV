/**
 * Lista fechada de Departamento/Área solicitante (PRD.md E1): subconjunto
 * documentado (~18 de ~29 itens reais do Pipefy). Completar com a lista
 * original antes de conectar o backend real (docs/PLAN.md, M2).
 */
export const DEPARTAMENTOS = [
  "Agronegócio",
  "Assistência Financeira",
  "Autoday",
  "Bancassurance",
  "Comercial",
  "Conecta",
  "Diretoria Executiva",
  "Estrutural",
  "Financeiro",
  "Jurídico",
  "KEV",
  "Marketing",
  "Operações",
  "Projetos",
  "RH",
  "Side",
  "Sinistros",
  "Tecnologia",
] as const;

export type Departamento = (typeof DEPARTAMENTOS)[number];
