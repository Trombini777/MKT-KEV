import type { ChecklistItem, Comentario, HistoricoEvento, Tarefa } from "@/lib/mock";

/**
 * SELECT + mapeamento de uma linha do Supabase para a forma `Tarefa` usada em toda a UI
 * (store do cliente) e também pelo assistente keV no servidor. Fonte ÚNICA dessa conversão:
 * qualquer cálculo (workload por dia, atividades futuras, etc.) que rode em cima de `Tarefa`
 * enxerga exatamente os mesmos dados que as telas, sem risco de divergir.
 */
export const SELECT_TAREFA = `
  id, titulo, descricao, tipo_id, origem, solicitante_nome, solicitante_email, anexos, links,
  justificativa_prioridade, justificativa_prazo, observacoes, quantidade_unidade, dados_completos,
  tipo_solicitacao_geral, departamento, projeto_id, prioridade_sugerida, prioridade_final,
  fase_atual_id, status, data_inicio, prazo, previsao_conclusao, executores_por_fase,
  estimativa_por_fase, participantes_ids, tag_ids,
  checklist_itens(id, texto, feito, criado_em),
  comentarios(id, autor_id, texto, criado_em),
  historico_eventos(id, data, autor_id, descricao, fase_id, acao),
  planejamentos(gerado_em, previsao_conclusao, status, folga_dias, etapa_atual_ordem,
    planejamento_etapas(id, etapa_id, ordem, colaborador_id, data_fim,
      tempo_gasto_horas,
      planejamento_alocacoes(data, horas)))
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function linhaParaTarefa(row: any): Tarefa {
  const planejamentoRaw = Array.isArray(row.planejamentos) ? row.planejamentos[0] : row.planejamentos;
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    tipoId: row.tipo_id ?? undefined,
    origem: row.origem,
    solicitanteNome: row.solicitante_nome ?? undefined,
    solicitanteEmail: row.solicitante_email ?? undefined,
    anexos: row.anexos ?? [],
    links: row.links ?? [],
    justificativaPrioridade: row.justificativa_prioridade ?? undefined,
    justificativaPrazo: row.justificativa_prazo ?? undefined,
    observacoes: row.observacoes ?? undefined,
    quantidadeUnidade: row.quantidade_unidade ?? undefined,
    dadosCompletos: row.dados_completos ?? undefined,
    tipoSolicitacaoGeral: row.tipo_solicitacao_geral ?? undefined,
    departamento: row.departamento ?? undefined,
    projetoId: row.projeto_id ?? undefined,
    prioridadeSugerida: row.prioridade_sugerida ?? undefined,
    prioridadeFinal: row.prioridade_final,
    faseAtualId: row.fase_atual_id,
    statusAtividade: row.status,
    dataInicio: row.data_inicio,
    prazo: row.prazo ?? "",
    previsaoConclusao: row.previsao_conclusao ?? "",
    executoresPorFase: row.executores_por_fase ?? {},
    estimativaPorFase: row.estimativa_por_fase ?? {},
    participantesIds: row.participantes_ids ?? [],
    tagIds: row.tag_ids ?? [],
    checklist: (row.checklist_itens ?? [])
      .slice()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.criado_em.localeCompare(b.criado_em))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any): ChecklistItem => ({ id: c.id, texto: c.texto, feito: c.feito })),
    comentarios: (row.comentarios ?? [])
      .slice()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.criado_em.localeCompare(b.criado_em))
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any): Comentario => ({ id: c.id, autorId: c.autor_id, texto: c.texto, data: c.criado_em })
      ),
    historico: (row.historico_eventos ?? [])
      .slice()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.data.localeCompare(b.data))
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (h: any): HistoricoEvento => ({
          id: h.id,
          data: h.data,
          autorId: h.autor_id,
          descricao: h.descricao,
          faseId: h.fase_id ?? undefined,
          acao: h.acao ?? undefined,
        })
      ),
    planejamento: planejamentoRaw
      ? {
          geradoEm: planejamentoRaw.gerado_em,
          etapas: (planejamentoRaw.planejamento_etapas ?? [])
            .slice()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => a.ordem - b.ordem)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((e: any) => ({
              id: e.id,
              etapaId: e.etapa_id,
              ordem: e.ordem,
              colaboradorId: e.colaborador_id,
              dataFim: e.data_fim,
              tempoGastoHoras: e.tempo_gasto_horas ?? 0,
              alocacoes: (e.planejamento_alocacoes ?? [])
                .slice()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .sort((a: any, b: any) => a.data.localeCompare(b.data))
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((a: any) => ({ data: a.data, horas: a.horas })),
            })),
          previsaoConclusao: planejamentoRaw.previsao_conclusao,
          status: planejamentoRaw.status,
          folgaDias: planejamentoRaw.folga_dias ?? undefined,
          etapaAtualOrdem: planejamentoRaw.etapa_atual_ordem,
        }
      : undefined,
  };
}
