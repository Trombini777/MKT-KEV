/**
 * "Quem é responsável pela etapa atual de uma tarefa" — compartilhado entre a tool `buscarAtividades`
 * do keV (`src/app/api/chat/route.ts`) e o convite proativo de tarefa (`src/lib/kev-tarefa.ts`), pra
 * não ter duas implementações do mesmo cálculo podendo divergir.
 *
 * O responsável de verdade pela etapa atual é `planejamento_etapas.colaborador_id` (quando há
 * planejamento aplicado), não o campo legado `executores_por_fase` — uma tarefa pode não ter o
 * usuário em `executoresPorFase` e ainda assim estar na mão dele agora via planejamento.
 */

type EtapaPlanejadaMinima = {
  /** uuid da linha `planejamento_etapas` — não disponível nos selects mais enxutos do route.ts. */
  id?: string;
  ordem: number;
  etapaId: string;
  colaboradorId: string | null;
  dataFim: string | null;
  alocacoes?: { horas: number }[] | null;
};

type PlanejamentoMinimo = {
  etapaAtualOrdem: number;
  etapas: EtapaPlanejadaMinima[];
};

export type TarefaComEtapaAtual = {
  faseAtualId: string;
  executoresPorFase?: Record<string, string[]> | null;
  participantesIds?: string[] | null;
  planejamento?: PlanejamentoMinimo | PlanejamentoMinimo[] | null;
};

export function etapaAtualDe(t: TarefaComEtapaAtual) {
  const planejamento = Array.isArray(t.planejamento) ? t.planejamento[0] : t.planejamento;
  const atual = planejamento?.etapas?.find((e) => e.ordem === planejamento.etapaAtualOrdem);
  const esforcoHoras = atual?.alocacoes?.length
    ? atual.alocacoes.reduce((soma, a) => soma + a.horas, 0)
    : undefined;
  return {
    id: atual?.id ?? null,
    etapaId: atual?.etapaId ?? null,
    dataFim: atual?.dataFim ?? null,
    colaboradorId: atual?.colaboradorId ?? null,
    esforcoHoras,
  };
}

/** É "minha" se eu sou o responsável da etapa atual (planejamento) OU estou no campo legado. */
export function ehMinhaAtividade(t: TarefaComEtapaAtual, usuarioId: string): boolean {
  if (etapaAtualDe(t).colaboradorId === usuarioId) return true;
  const executores = t.executoresPorFase?.[t.faseAtualId] ?? [];
  const participantes = t.participantesIds ?? [];
  return executores.includes(usuarioId) || participantes.includes(usuarioId);
}
