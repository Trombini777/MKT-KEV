import type { EtapaDoTipo, TipoTarefa } from "./types";

type EtapaDoFluxo = Omit<EtapaDoTipo, "ordem">;

/** Monta o fluxo de um tipo a partir de etapas cadastradas em ETAPAS (aba Etapas). */
function fluxo(etapas: EtapaDoFluxo[]): EtapaDoTipo[] {
  return etapas.map((etapa, i) => ({ ...etapa, ordem: i + 1 }));
}

export const TIPOS_TAREFA: TipoTarefa[] = [
  {
    id: "post-social",
    nome: "Post Social",
    descricao: "Peça única para redes sociais — feed, stories ou carrossel.",
    ativo: true,
    atualizadoEm: "2026-07-22",
    unidadeMedidaId: "arte",
    etapas: fluxo([
      { etapaId: "briefing", estimativaHoras: 1, executorPadraoId: "beatriz" },
      { etapaId: "redacao", estimativaHoras: 2, executorPadraoId: "diego" },
      { etapaId: "design", estimativaHoras: 3, executorPadraoId: "marcos" },
      { etapaId: "aprovacao-solicitante", estimativaHoras: 0.5, executorPadraoId: "marcos" },
      { etapaId: "publicacao", estimativaHoras: 0.5, executorPadraoId: "carla" },
    ]),
  },
  {
    id: "email-marketing",
    nome: "E-mail Marketing",
    descricao: "Campanha de e-mail para a base de clientes ou leads.",
    ativo: true,
    atualizadoEm: "2026-06-30",
    etapas: fluxo([
      { etapaId: "briefing", estimativaHoras: 1, executorPadraoId: "beatriz" },
      { etapaId: "redacao", estimativaHoras: 2, executorPadraoId: "diego" },
      { etapaId: "design", estimativaHoras: 3, executorPadraoId: "marcos" },
      { etapaId: "revisao-interna", estimativaHoras: 1, executorPadraoId: "marcos" },
      { etapaId: "aprovacao-solicitante", estimativaHoras: 0.5, executorPadraoId: "marcos" },
      { etapaId: "disparo", estimativaHoras: 0.5, executorPadraoId: "diego" },
    ]),
  },
  {
    id: "peca-corretor",
    nome: "Peça para Corretor",
    descricao: "Material de apoio para corretores parceiros usarem na venda.",
    ativo: true,
    atualizadoEm: "2026-05-14",
    unidadeMedidaId: "pagina",
    etapas: fluxo([
      { etapaId: "briefing", estimativaHoras: 1, executorPadraoId: "beatriz", podeDividir: true },
      {
        etapaId: "design",
        estimativaHoras: 3,
        executorPadraoId: "marcos",
        podeDividir: true,
        dependeDe: [1],
        executoresPermitidosIds: ["rafael"],
      },
      {
        etapaId: "revisao-interna",
        estimativaHoras: 1,
        executorPadraoId: "marcos",
        podeDividir: true,
        dependeDe: [2],
      },
      {
        etapaId: "aprovacao-solicitante",
        estimativaHoras: 0.5,
        executorPadraoId: "marcos",
        podeDividir: true,
        dependeDe: [3],
      },
      {
        etapaId: "publicacao",
        estimativaHoras: 0.5,
        executorPadraoId: "marcos",
        podeDividir: true,
        dependeDe: [4],
      },
    ]),
  },
  {
    id: "banner",
    nome: "Banner",
    descricao: "Banner para site, redes sociais ou landing pages.",
    ativo: true,
    atualizadoEm: "2026-08-01",
    unidadeMedidaId: "arte",
    etapas: fluxo([
      { etapaId: "briefing", estimativaHoras: 1, executorPadraoId: "beatriz" },
      { etapaId: "redacao", estimativaHoras: 2, executorPadraoId: "diego" },
      { etapaId: "design", estimativaHoras: 3, executorPadraoId: "marcos" },
      { etapaId: "revisao-interna", estimativaHoras: 1, executorPadraoId: "marcos" },
      { etapaId: "aprovacao-solicitante", estimativaHoras: 0.5, executorPadraoId: "marcos" },
      { etapaId: "publicacao", estimativaHoras: 0.5, executorPadraoId: "carla" },
    ]),
  },
  {
    id: "video",
    nome: "Vídeo",
    descricao: "Vídeo institucional, publicitário ou educativo.",
    ativo: true,
    atualizadoEm: "2026-04-09",
    etapas: fluxo([
      { etapaId: "briefing", estimativaHoras: 1, executorPadraoId: "beatriz", podeDividir: true },
      {
        etapaId: "roteiro",
        estimativaHoras: 2,
        executorPadraoId: "diego",
        podeDividir: true,
        dependeDe: [1],
      },
      {
        etapaId: "gravacao",
        estimativaHoras: 4,
        executorPadraoId: "rafael",
        podeDividir: false,
        dependeDe: [2],
        executoresPermitidosIds: ["marcos"],
      },
      {
        etapaId: "edicao",
        estimativaHoras: 4,
        executorPadraoId: "rafael",
        podeDividir: true,
        dependeDe: [3],
      },
      {
        etapaId: "revisao-interna",
        estimativaHoras: 1,
        executorPadraoId: "marcos",
        podeDividir: true,
        dependeDe: [4],
        executoresPermitidosIds: ["beatriz"],
      },
      {
        etapaId: "aprovacao-solicitante",
        estimativaHoras: 0.5,
        executorPadraoId: "marcos",
        podeDividir: true,
        dependeDe: [5],
      },
      {
        etapaId: "publicacao",
        estimativaHoras: 0.5,
        executorPadraoId: "carla",
        podeDividir: true,
        dependeDe: [6],
      },
    ]),
  },
  {
    id: "comunicado-interno",
    nome: "Comunicado Interno",
    descricao: "Comunicado para o time interno da Kev.",
    ativo: true,
    atualizadoEm: "2026-08-05",
    etapas: fluxo([
      { etapaId: "briefing", estimativaHoras: 1, executorPadraoId: "beatriz" },
      { etapaId: "redacao", estimativaHoras: 2, executorPadraoId: "diego" },
      { etapaId: "revisao-interna", estimativaHoras: 1, executorPadraoId: "marcos" },
      { etapaId: "aprovacao-solicitante", estimativaHoras: 0.5, executorPadraoId: "marcos" },
      { etapaId: "envio", estimativaHoras: 0.5, executorPadraoId: "beatriz" },
    ]),
  },
  {
    id: "material-campanha",
    nome: "Material de Campanha",
    descricao: "Material de apoio para campanhas e ações comerciais.",
    ativo: true,
    atualizadoEm: "2026-03-18",
    unidadeMedidaId: "pagina",
    etapas: fluxo([
      { etapaId: "briefing", estimativaHoras: 1, executorPadraoId: "beatriz" },
      { etapaId: "design", estimativaHoras: 3, executorPadraoId: "marcos" },
      { etapaId: "revisao-interna", estimativaHoras: 1, executorPadraoId: "marcos" },
      { etapaId: "aprovacao-solicitante", estimativaHoras: 0.5, executorPadraoId: "marcos" },
      { etapaId: "entrega", estimativaHoras: 0.5, executorPadraoId: "marcos" },
    ]),
  },
];

export function tipoById(id: string | undefined): TipoTarefa | undefined {
  if (!id) return undefined;
  return TIPOS_TAREFA.find((t) => t.id === id);
}
