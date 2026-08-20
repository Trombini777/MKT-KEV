"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  faseById,
  etapaById,
  type Tarefa,
  type PlanejamentoTarefa,
  type EtapaAgendada,
  type EtapaAgendadaAplicada,
  type CategoriaEtapa,
  type ChecklistItem,
  type Comentario,
  type HistoricoEvento,
  type StatusAtividade,
  type StatusPlanejamento,
  type ExecutorPorFase,
} from "@/lib/mock";
import {
  proximoDia,
  proximoDiaUtil,
  distribuirHorasPorDia,
  foraDeOrdemCronologica,
  passosUteisEntre,
} from "@/lib/scheduling";
import { decimalParaHorario } from "@/lib/time-format";
import { isoHoje, formatDataCompleta } from "@/lib/hoje";
import { SELECT_TAREFA as SELECT, linhaParaTarefa } from "@/lib/tarefa-mapper";
import { createClient } from "@/lib/supabase/client";
import { obterColaboradorAtual } from "@/lib/current-colaborador-client";
import { obterConfiguracoesFluxo } from "@/lib/configuracoes-fluxo";
import { registrarResetDeSessao } from "@/lib/session-cache";

type SupabaseClient = ReturnType<typeof createClient>;

// Lê/escreve as tarefas direto no Supabase (protegido por RLS) — mesma API de hooks/mutators de
// antes (ver docs/PLAN.md M2), só trocando a persistência local por queries reais.
let tasks: Tarefa[] = [];
let hidratado = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

async function inserirHistorico(
  supabase: SupabaseClient,
  taskId: string,
  descricao: string,
  opts: { faseId?: string; acao?: "aprovada" | "recusada" } = {}
): Promise<HistoricoEvento> {
  const autor = await obterColaboradorAtual();
  const { data, error } = await supabase
    .from("historico_eventos")
    .insert({
      tarefa_id: taskId,
      autor_id: autor?.id ?? null,
      descricao,
      fase_id: opts.faseId ?? null,
      acao: opts.acao ?? null,
    })
    .select("id, data, autor_id, descricao, fase_id, acao")
    .single();
  if (error || !data) {
    console.error("Falha ao registrar histórico:", error?.message);
    return {
      id: `local-${Date.now()}`,
      data: new Date().toISOString(),
      autorId: autor?.id ?? "",
      descricao,
      faseId: opts.faseId,
      acao: opts.acao,
    };
  }
  return {
    id: data.id,
    data: data.data,
    autorId: data.autor_id,
    descricao: data.descricao,
    faseId: data.fase_id ?? undefined,
    acao: data.acao ?? undefined,
  };
}

/**
 * Apaga e recria as alocações de uma linha de `planejamento_etapas` — usado sempre que uma etapa
 * já aplicada tem sua data/horas ajustadas (ajustarEtapaEmExecucao, replanejarEtapasDaAtividade).
 * Não dá pra só fazer UPDATE: o cálculo de carga por dia (horasAlocadasPorDia, usado pelo
 * Workload e pela tool buscarCargaPorDia do keV) soma por data, então a alocação antiga precisa
 * sumir e a nova entrar com a data/horas certas.
 */
async function substituirAlocacoesDaEtapa(
  supabase: SupabaseClient,
  planejamentoEtapaId: string,
  alocacoes: { data: string; horas: number }[]
) {
  await supabase.from("planejamento_alocacoes").delete().eq("planejamento_etapa_id", planejamentoEtapaId);
  if (alocacoes.length > 0) {
    await supabase
      .from("planejamento_alocacoes")
      .insert(alocacoes.map((a) => ({ planejamento_etapa_id: planejamentoEtapaId, data: a.data, horas: a.horas })));
  }
}

/**
 * Se `ordem` for a etapa ATUAL da tarefa, calcula `executoresPorFase[faseAtualId]` já sincronizado
 * com o novo executor — campo legado usado pela tool buscarWorkloadEquipe do keV pra contar carga do
 * time; sem essa sincronização, a pessoa antiga continua "contando" na fase mesmo depois de
 * substituída na etapa de verdade. Reatribuir uma etapa FUTURA não muda quem está de fato
 * trabalhando na fase agora, então devolve o mesmo `executoresPorFase` de antes, sem tocar em
 * nada. Função pura (não persiste sozinha) — quem chama decide como/quando gravar o resultado,
 * usada por reatribuirExecutorEtapa e replanejarEtapasDaAtividade.
 */
function calcularExecutoresPorFaseAtualizado(t: Tarefa, ordem: number, novoColaboradorId: string): ExecutorPorFase {
  if (ordem !== t.planejamento?.etapaAtualOrdem) return t.executoresPorFase;
  return { ...t.executoresPorFase, [t.faseAtualId]: [novoColaboradorId] };
}

/**
 * Passa a data de início pente-fino: tarefa no Backlog cujo dia de início já chegou vira
 * "Em Execução" sozinha. Roda uma vez por carregamento da página (ver `hidratar`).
 */
async function sincronizarInicioDeTarefas() {
  const hoje = isoHoje();
  const candidatas = tasks.filter(
    (t) => t.faseAtualId === "backlog" && t.dataInicio && t.dataInicio <= hoje
  );
  if (candidatas.length === 0) return;

  const supabase = createClient();
  for (const t of candidatas) {
    const { error } = await supabase
      .from("tarefas")
      .update({ fase_atual_id: "em-execucao" })
      .eq("id", t.id);
    if (error) continue;
    const hist = await inserirHistorico(
      supabase,
      t.id,
      `Chegou a data de início — movida automaticamente para ${faseById("em-execucao")?.nome ?? "Em Execução"}`,
      { faseId: "em-execucao" }
    );
    tasks = tasks.map((x) =>
      x.id === t.id ? { ...x, faseAtualId: "em-execucao", historico: [...x.historico, hist] } : x
    );
  }
  emit();
}

/**
 * Refaz a busca completa e substitui `tasks` — usado depois de uma escrita que não passa pelos
 * mutators daqui (ex.: a RPC `criar_solicitacao_publica`, chamada direto pelo dialog de nova
 * atividade), pra essa mudança aparecer na tela sem precisar recarregar a página.
 */
export async function recarregarTarefas(): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tarefas")
    .select(SELECT)
    .order("criado_em", { ascending: false });
  if (error) {
    console.error("Falha ao carregar tarefas:", error.message);
    return false;
  }
  tasks = (data ?? []).map(linhaParaTarefa);
  emit();
  return true;
}

async function hidratar() {
  if (hidratado) return;
  hidratado = true;
  const ok = await recarregarTarefas();
  if (!ok) {
    // Falha pontual (ex.: RLS ainda sem sessão válida no instante do login) não pode travar essa
    // store vazia pra sempre nessa aba — a próxima tentativa precisa poder refazer a busca.
    hidratado = false;
    return;
  }
  await sincronizarInicioDeTarefas();
}

// Só destrava a flag — ver comentário equivalente em colaborador-store.ts sobre por que não
// refazer a busca eagerly aqui.
registrarResetDeSessao(() => {
  hidratado = false;
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return tasks;
}

export function useTasks(): Tarefa[] {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Leitura síncrona do estado atual — útil logo depois de outra mutação, no mesmo tick, antes do React re-renderizar. */
export function obterTarefas(): Tarefa[] {
  return tasks;
}

/** Registra a decisão de aprovação interna da solicitação; aprovar já move a tarefa para Triagem. */
export async function registrarAprovacaoInterna(taskId: string, aprovada: boolean) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return;
  const supabase = createClient();
  const autor = await obterColaboradorAtual();
  const verbo = aprovada ? "aprovou" : "recusou";
  const acao: "aprovada" | "recusada" = aprovada ? "aprovada" : "recusada";
  const histDecisao = await inserirHistorico(
    supabase,
    taskId,
    `${autor?.nome ?? "Alguém"} ${verbo} a solicitação da atividade "${t.titulo}"`,
    { faseId: t.faseAtualId, acao }
  );

  if (!aprovada) {
    tasks = tasks.map((x) => (x.id === taskId ? { ...x, historico: [...x.historico, histDecisao] } : x));
    emit();
    return;
  }

  const novaFaseId = "triagem";
  // Sem responsável padrão configurado (ver /etapas), a tarefa entra na Triagem sem dono — do
  // jeito que já era antes dessa checagem existir.
  let novoExecutoresPorFase = t.executoresPorFase;
  if (!(t.executoresPorFase.triagem ?? []).length) {
    const { config } = await obterConfiguracoesFluxo();
    if (config.responsavelPadraoTriagemId) {
      novoExecutoresPorFase = { ...t.executoresPorFase, triagem: [config.responsavelPadraoTriagemId] };
    }
  }

  const { error } = await supabase
    .from("tarefas")
    .update({ fase_atual_id: novaFaseId, executores_por_fase: novoExecutoresPorFase })
    .eq("id", taskId);
  if (error) {
    console.error("Falha ao mover para triagem:", error.message);
    return;
  }
  const histMove = await inserirHistorico(supabase, taskId, `Movida para ${faseById(novaFaseId)?.nome ?? novaFaseId}`, {
    faseId: novaFaseId,
  });
  tasks = tasks.map((x) =>
    x.id === taskId
      ? {
          ...x,
          faseAtualId: novaFaseId,
          executoresPorFase: novoExecutoresPorFase,
          historico: [...x.historico, histDecisao, histMove],
        }
      : x
  );
  emit();
}

/** Define o Tipo de Tarefa (registro de Tipos de Tarefa) durante a triagem da solicitação. */
export async function atualizarTipoTarefa(taskId: string, tipoId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tarefas").update({ tipo_id: tipoId }).eq("id", taskId);
  if (error) {
    console.error("Falha ao atualizar tipo:", error.message);
    return;
  }
  tasks = tasks.map((t) => (t.id === taskId ? { ...t, tipoId } : t));
  emit();
}

/** Grava as respostas da triagem ("temos os dados?" e "tipo de solicitação"). */
export async function definirRespostaTriagem(
  taskId: string,
  campo: "dadosCompletos" | "tipoSolicitacaoGeral",
  valor: string
) {
  const coluna = campo === "dadosCompletos" ? "dados_completos" : "tipo_solicitacao_geral";
  const supabase = createClient();
  const { error } = await supabase.from("tarefas").update({ [coluna]: valor }).eq("id", taskId);
  if (error) {
    console.error("Falha ao gravar resposta da triagem:", error.message);
    return;
  }
  tasks = tasks.map((t) => (t.id === taskId ? { ...t, [campo]: valor } : t));
  emit();
}

/** Atribui o responsável pela etapa atual da tarefa. */
export async function atribuirResponsavelEtapa(taskId: string, faseId: string, colaboradorId: string) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return;
  const novoExecutoresPorFase = { ...t.executoresPorFase, [faseId]: [colaboradorId] };
  const supabase = createClient();
  const { error } = await supabase
    .from("tarefas")
    .update({ executores_por_fase: novoExecutoresPorFase })
    .eq("id", taskId);
  if (error) {
    console.error("Falha ao atribuir responsável:", error.message);
    return;
  }
  tasks = tasks.map((x) => (x.id === taskId ? { ...x, executoresPorFase: novoExecutoresPorFase } : x));
  emit();
}

/** Troca quem executa uma etapa específica do planejamento aplicado (não precisa ser a etapa atual). */
export async function reatribuirExecutorEtapa(taskId: string, ordem: number, novoColaboradorId: string) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t || !t.planejamento) return;
  const etapaAlvo = t.planejamento.etapas.find((e) => e.ordem === ordem);
  if (!etapaAlvo || etapaAlvo.colaboradorId === novoColaboradorId) return;

  const supabase = createClient();
  const { data: planRow, error: planErro } = await supabase
    .from("planejamentos")
    .select("id")
    .eq("tarefa_id", taskId)
    .single();
  if (planErro || !planRow) {
    console.error("Falha ao localizar planejamento pra reatribuir executor:", planErro?.message);
    return;
  }

  const { error } = await supabase
    .from("planejamento_etapas")
    .update({ colaborador_id: novoColaboradorId })
    .eq("planejamento_id", planRow.id)
    .eq("ordem", ordem);
  if (error) {
    console.error("Falha ao reatribuir executor da etapa:", error.message);
    return;
  }

  let novoExecutoresPorFase = calcularExecutoresPorFaseAtualizado(t, ordem, novoColaboradorId);
  if (novoExecutoresPorFase !== t.executoresPorFase) {
    const { error: erroExecutores } = await supabase
      .from("tarefas")
      .update({ executores_por_fase: novoExecutoresPorFase })
      .eq("id", taskId);
    if (erroExecutores) {
      console.error("Falha ao sincronizar executoresPorFase:", erroExecutores.message);
      novoExecutoresPorFase = t.executoresPorFase;
    }
  }

  const autor = await obterColaboradorAtual();
  const nomeEtapa = etapaById(etapaAlvo.etapaId)?.nome ?? etapaAlvo.etapaId;
  const hist = await inserirHistorico(
    supabase,
    taskId,
    `${autor?.nome ?? "Alguém"} reatribuiu a etapa "${nomeEtapa}" para outro executor`,
    { faseId: t.faseAtualId }
  );

  tasks = tasks.map((x) =>
    x.id === taskId
      ? {
          ...x,
          executoresPorFase: novoExecutoresPorFase,
          planejamento: {
            ...x.planejamento!,
            etapas: x.planejamento!.etapas.map((e) =>
              e.ordem === ordem ? { ...e, colaboradorId: novoColaboradorId } : e
            ),
          },
          historico: [...x.historico, hist],
        }
      : x
  );
  emit();
}

/** Aplica o planejamento recomendado pelo motor de regras, gerado a partir do Tipo de Tarefa da triagem. */
export async function aplicarPlanejamento(
  taskId: string,
  resultado: Omit<PlanejamentoTarefa, "geradoEm" | "etapaAtualOrdem" | "etapas"> & {
    etapas: EtapaAgendada[];
  },
  dataInicio?: string
) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return;
  const supabase = createClient();

  const { data: planRow, error: planErro } = await supabase
    .from("planejamentos")
    .insert({
      tarefa_id: taskId,
      previsao_conclusao: resultado.previsaoConclusao,
      status: resultado.status,
      folga_dias: resultado.folgaDias ?? null,
      etapa_atual_ordem: 1,
    })
    .select("id, gerado_em")
    .single();
  if (planErro || !planRow) {
    console.error("Falha ao aplicar planejamento:", planErro?.message);
    return;
  }

  const etapasAplicadas: EtapaAgendadaAplicada[] = [];
  for (const etapa of resultado.etapas) {
    const { data: etapaRow, error: etapaErro } = await supabase
      .from("planejamento_etapas")
      .insert({
        planejamento_id: planRow.id,
        etapa_id: etapa.etapaId,
        ordem: etapa.ordem,
        colaborador_id: etapa.colaboradorId,
        data_fim: etapa.dataFim,
      })
      .select("id")
      .single();
    if (etapaErro || !etapaRow) {
      console.error("Falha ao aplicar etapa do planejamento:", etapaErro?.message);
      continue;
    }
    if (etapa.alocacoes.length > 0) {
      await supabase
        .from("planejamento_alocacoes")
        .insert(etapa.alocacoes.map((a) => ({ planejamento_etapa_id: etapaRow.id, data: a.data, horas: a.horas })));
    }
    etapasAplicadas.push({
      ...etapa,
      id: etapaRow.id,
      tempoGastoHoras: 0,
    });
  }

  const colunas: Record<string, unknown> = { previsao_conclusao: resultado.previsaoConclusao };
  if (dataInicio) colunas.data_inicio = dataInicio;
  await supabase.from("tarefas").update(colunas).eq("id", taskId);

  const autor = await obterColaboradorAtual();
  const hist = await inserirHistorico(
    supabase,
    taskId,
    `${autor?.nome ?? "Alguém"} aplicou o planejamento recomendado para "${t.titulo}"`,
    { faseId: t.faseAtualId }
  );

  const planejamento: PlanejamentoTarefa = {
    geradoEm: planRow.gerado_em,
    etapaAtualOrdem: 1,
    etapas: etapasAplicadas,
    previsaoConclusao: resultado.previsaoConclusao,
    status: resultado.status,
    folgaDias: resultado.folgaDias,
  };

  tasks = tasks.map((x) =>
    x.id === taskId
      ? {
          ...x,
          planejamento,
          previsaoConclusao: resultado.previsaoConclusao,
          dataInicio: dataInicio ?? x.dataInicio,
          historico: [...x.historico, hist],
        }
      : x
  );
  emit();
}

/**
 * Cada categoria da etapa (cadastro em /etapas) aponta pra fase correspondente do Kanban —
 * é isso que faz o card seguir o catálogo de etapas: sempre que a etapa atual muda, a fase
 * é resincronizada a partir da categoria da nova etapa atual. Categoria "Concluído" pula
 * direto pra fase "concluido", sem passar por um gate manual de Aprovação.
 */
export const CATEGORIA_PARA_FASE: Record<CategoriaEtapa, string> = {
  Backlog: "backlog",
  "Em Execução": "em-execucao",
  "Em Aprovação": "aprovacao",
  Concluído: "concluido",
};

/** Ao chegar na fase final do fluxo, o status da atividade vira "Concluída" automaticamente. */
function colunasConclusao(novaFaseId: string, statusAtual: StatusAtividade) {
  if (novaFaseId === "concluido") return { status: "Concluída" as const };
  // Reabrir uma tarefa concluída (mover pra fora de "concluido") volta o status pra Ativa —
  // sem isso ela ficaria com o badge "Concluída" numa fase que não é mais a final. Pausada e
  // Arquivada são decisões manuais do usuário, então ficam como estão.
  if (statusAtual === "Concluída") return { status: "Ativa" as const };
  return {};
}

/**
 * Conclui a etapa atual do fluxo de trabalho (planejamento aplicado) e avança pra próxima —
 * `etapaAtualOrdem` passa de `maxOrdem` pra `maxOrdem + 1` ao concluir a última, sinalizando
 * "todas as etapas concluídas" sem ambiguidade com "última etapa ainda em andamento".
 * A fase da tarefa é resincronizada com a categoria da etapa que passa a ficar atual (ou, ao
 * concluir a última, com a categoria dela mesma) — assim o card no Kanban sempre reflete o
 * catálogo de Etapas, sem depender de um mapeamento fixo "última etapa -> Aprovação".
 */
export async function avancarEtapaPlanejamento(taskId: string) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t || !t.planejamento) return;
  const maxOrdem = Math.max(...t.planejamento.etapas.map((e) => e.ordem));
  if (t.planejamento.etapaAtualOrdem > maxOrdem) return;

  const etapaConcluida = t.planejamento.etapas.find((e) => e.ordem === t.planejamento!.etapaAtualOrdem);
  const nomeEtapaConcluida = etapaConcluida ? etapaById(etapaConcluida.etapaId)?.nome : undefined;
  const eraUltima = t.planejamento.etapaAtualOrdem >= maxOrdem;
  const novaOrdem = t.planejamento.etapaAtualOrdem + 1;

  const etapaQueDefineFase = t.planejamento.etapas.find((e) => e.ordem === Math.min(novaOrdem, maxOrdem));
  const categoriaEtapaQueDefineFase = etapaQueDefineFase
    ? etapaById(etapaQueDefineFase.etapaId)?.categoria
    : undefined;
  const novaFaseId = categoriaEtapaQueDefineFase
    ? CATEGORIA_PARA_FASE[categoriaEtapaQueDefineFase]
    : t.faseAtualId;
  const mudouFase = novaFaseId !== t.faseAtualId;
  const proximaEtapa = eraUltima ? undefined : t.planejamento.etapas.find((e) => e.ordem === novaOrdem);
  const nomeNovaEtapa = proximaEtapa ? etapaById(proximaEtapa.etapaId)?.nome : undefined;

  const supabase = createClient();
  const { error: planErro } = await supabase
    .from("planejamentos")
    .update({ etapa_atual_ordem: novaOrdem })
    .eq("tarefa_id", taskId);
  if (planErro) {
    console.error("Falha ao avançar etapa:", planErro.message);
    return;
  }
  if (mudouFase) {
    await supabase
      .from("tarefas")
      .update({ fase_atual_id: novaFaseId, ...colunasConclusao(novaFaseId, t.statusAtividade) })
      .eq("id", taskId);
  }

  const autor = await obterColaboradorAtual();
  const descricao = eraUltima
    ? `${autor?.nome ?? "Alguém"} concluiu a última etapa (${nomeEtapaConcluida ?? "—"})${mudouFase ? ` — card movido para ${faseById(novaFaseId)?.nome ?? novaFaseId}, de acordo com a categoria dessa etapa` : ""}`
    : `${autor?.nome ?? "Alguém"} concluiu a etapa "${nomeEtapaConcluida ?? "—"}" — avançou para "${nomeNovaEtapa ?? "—"}"${mudouFase ? ` (card movido para ${faseById(novaFaseId)?.nome ?? novaFaseId})` : ""}`;
  const hist = await inserirHistorico(supabase, taskId, descricao, { faseId: novaFaseId });

  tasks = tasks.map((x) =>
    x.id === taskId
      ? {
          ...x,
          faseAtualId: novaFaseId,
          ...colunasConclusao(novaFaseId, t.statusAtividade),
          planejamento: { ...x.planejamento!, etapaAtualOrdem: novaOrdem },
          historico: [...x.historico, hist],
        }
      : x
  );
  emit();
}

/**
 * Registra no histórico que alguém deu o "check" de pronto na etapa atual do planejamento —
 * é só um sinal/registro; quem efetivamente avança a etapa pro próximo executor continua sendo
 * `avancarEtapaPlanejamento` (botão "Mover etapa").
 */
export async function marcarEtapaChecada(taskId: string, ordem: number) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t || !t.planejamento) return;
  const etapa = t.planejamento.etapas.find((e) => e.ordem === ordem);
  if (!etapa) return;
  const nomeEtapa = etapaById(etapa.etapaId)?.nome ?? etapa.etapaId;

  const supabase = createClient();
  const autor = await obterColaboradorAtual();
  const hist = await inserirHistorico(
    supabase,
    taskId,
    `${autor?.nome ?? "Alguém"} deu o check na etapa "${nomeEtapa}" como pronta`,
    { faseId: t.faseAtualId }
  );
  tasks = tasks.map((x) => (x.id === taskId ? { ...x, historico: [...x.historico, hist] } : x));
  emit();
}

function atualizarEtapaAplicada(
  taskId: string,
  planejamentoEtapaId: string,
  patch: Partial<EtapaAgendadaAplicada>
) {
  tasks = tasks.map((x) =>
    x.id === taskId && x.planejamento
      ? {
          ...x,
          planejamento: {
            ...x.planejamento,
            etapas: x.planejamento.etapas.map((e) =>
              e.id === planejamentoEtapaId ? { ...e, ...patch } : e
            ),
          },
        }
      : x
  );
  emit();
}

/** Registra manualmente horas gastas numa etapa — soma ao total já registrado (não substitui).
 * `planejamentoEtapaId` é o uuid da linha `planejamento_etapas` (`etapa.id`), não o id do
 * catálogo de etapas. */
export async function adicionarTempoEtapa(
  taskId: string,
  planejamentoEtapaId: string,
  horasAdicionais: number
) {
  if (!(horasAdicionais > 0)) return;
  const t = tasks.find((x) => x.id === taskId);
  const etapa = t?.planejamento?.etapas.find((e) => e.id === planejamentoEtapaId);
  if (!etapa) return;

  const novoTotal = etapa.tempoGastoHoras + horasAdicionais;
  const supabase = createClient();
  const { error } = await supabase
    .from("planejamento_etapas")
    .update({ tempo_gasto_horas: novoTotal })
    .eq("id", planejamentoEtapaId);
  if (error) {
    console.error("Falha ao registrar tempo gasto:", error.message);
    return;
  }
  atualizarEtapaAplicada(taskId, planejamentoEtapaId, { tempoGastoHoras: novoTotal });
}

/**
 * Início manual da execução direto do card, sem esperar a data de início automática (ver
 * `sincronizarInicioDeTarefas`) — usado pelo botão "Iniciar atividade" enquanto a tarefa está
 * no Backlog.
 */
export async function iniciarAtividade(taskId: string) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t || t.faseAtualId !== "backlog") return;
  const novaFaseId = "em-execucao";

  const supabase = createClient();
  const { error } = await supabase.from("tarefas").update({ fase_atual_id: novaFaseId }).eq("id", taskId);
  if (error) {
    console.error("Falha ao iniciar atividade:", error.message);
    return;
  }

  const autor = await obterColaboradorAtual();
  const hist = await inserirHistorico(
    supabase,
    taskId,
    `${autor?.nome ?? "Alguém"} iniciou a atividade — movida para ${faseById(novaFaseId)?.nome ?? novaFaseId}`,
    { faseId: novaFaseId }
  );

  tasks = tasks.map((x) =>
    x.id === taskId ? { ...x, faseAtualId: novaFaseId, historico: [...x.historico, hist] } : x
  );
  emit();
}

/** Renomeia a tarefa e registra no histórico. */
export async function atualizarTitulo(taskId: string, novoTitulo: string) {
  const limpo = novoTitulo.trim();
  if (!limpo) return;
  const t = tasks.find((x) => x.id === taskId);
  if (!t || limpo === t.titulo) return;
  const tituloAntigo = t.titulo;

  const supabase = createClient();
  const { error } = await supabase.from("tarefas").update({ titulo: limpo }).eq("id", taskId);
  if (error) {
    console.error("Falha ao renomear atividade:", error.message);
    return;
  }

  const autor = await obterColaboradorAtual();
  const hist = await inserirHistorico(
    supabase,
    taskId,
    `${autor?.nome ?? "Alguém"} renomeou a atividade de "${tituloAntigo}" para "${limpo}"`,
    { faseId: t.faseAtualId }
  );

  tasks = tasks.map((x) => (x.id === taskId ? { ...x, titulo: limpo, historico: [...x.historico, hist] } : x));
  emit();
}

/** Vincula a tarefa a um projeto/campanha existente (ex.: solicitação avulsa que passa a fazer parte de uma campanha) e registra no histórico. */
export async function vincularProjeto(taskId: string, projetoId: string, nomeProjeto: string) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t || t.projetoId === projetoId) return;

  const supabase = createClient();
  const { error } = await supabase.from("tarefas").update({ projeto_id: projetoId }).eq("id", taskId);
  if (error) {
    console.error("Falha ao vincular projeto:", error.message);
    return;
  }

  const autor = await obterColaboradorAtual();
  const hist = await inserirHistorico(
    supabase,
    taskId,
    `${autor?.nome ?? "Alguém"} vinculou a atividade ao projeto "${nomeProjeto}"`,
    { faseId: t.faseAtualId }
  );

  tasks = tasks.map((x) => (x.id === taskId ? { ...x, projetoId, historico: [...x.historico, hist] } : x));
  emit();
}

/**
 * Marcador de texto (sem coluna própria no banco) pra sinalizar eventos de histórico que merecem
 * destaque visual — o card amarelo de atenção no histórico (task-detail-sheet.tsx) é decidido por
 * `descricao.startsWith(ATENCAO_PREFIXO)`, não por um campo estruturado.
 */
export const ATENCAO_PREFIXO = "[atenção] ";

/** Altera o prazo final de conclusão da tarefa e registra no histórico, com destaque de atenção. */
export async function atualizarPrazoTarefa(taskId: string, novoPrazo: string) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return;
  const prazoAntigoFormatado = formatDataCompleta(t.prazo);
  const prazoNovoFormatado = formatDataCompleta(novoPrazo);
  const supabase = createClient();
  const { error } = await supabase.from("tarefas").update({ prazo: novoPrazo || null }).eq("id", taskId);
  if (error) {
    console.error("Falha ao atualizar prazo:", error.message);
    return;
  }
  const autor = await obterColaboradorAtual();
  const hist = await inserirHistorico(
    supabase,
    taskId,
    `${ATENCAO_PREFIXO}${autor?.nome ?? "Alguém"} alterou o prazo de conclusão: de ${prazoAntigoFormatado} para ${prazoNovoFormatado}`,
    { faseId: t.faseAtualId }
  );
  tasks = tasks.map((x) => (x.id === taskId ? { ...x, prazo: novoPrazo, historico: [...x.historico, hist] } : x));
  emit();
}

/**
 * Desloca a ocupação de outra tarefa num dia de conflito pro próximo dia útil, pra abrir espaço
 * pro planejamento da tarefa atual. Registra histórico nas duas tarefas.
 */
export async function deslocarOcupacaoParaAjuste(
  tarefaOutraId: string,
  colaboradorId: string,
  diaConflito: string,
  tarefaAtualId: string
) {
  const tarefaAtual = tasks.find((t) => t.id === tarefaAtualId);
  const tarefaOutra = tasks.find((t) => t.id === tarefaOutraId);
  if (!tarefaOutra) return;
  const novoDia = proximoDiaUtil(proximoDia(diaConflito));
  const supabase = createClient();

  let novaTarefaOutra: Tarefa;

  if (tarefaOutra.planejamento) {
    const { data: planRow } = await supabase
      .from("planejamentos")
      .select("id")
      .eq("tarefa_id", tarefaOutraId)
      .single();

    const novasEtapas = tarefaOutra.planejamento.etapas.map((e) => {
      if (e.colaboradorId !== colaboradorId || !e.alocacoes.some((a) => a.data === diaConflito)) return e;
      return {
        ...e,
        alocacoes: e.alocacoes.map((a) => (a.data === diaConflito ? { ...a, data: novoDia } : a)),
        dataFim: novoDia,
      };
    });

    if (planRow) {
      for (let j = 0; j < novasEtapas.length; j++) {
        const etapa = novasEtapas[j];
        if (etapa === tarefaOutra.planejamento.etapas[j]) continue; // não mudou
        const { data: etapaRow } = await supabase
          .from("planejamento_etapas")
          .select("id")
          .eq("planejamento_id", planRow.id)
          .eq("ordem", etapa.ordem)
          .single();
        if (!etapaRow) continue;
        await supabase.from("planejamento_etapas").update({ data_fim: etapa.dataFim }).eq("id", etapaRow.id);
        await substituirAlocacoesDaEtapa(supabase, etapaRow.id, etapa.alocacoes);
      }
    }

    novaTarefaOutra = { ...tarefaOutra, planejamento: { ...tarefaOutra.planejamento, etapas: novasEtapas } };
  } else {
    await supabase.from("tarefas").update({ data_inicio: novoDia }).eq("id", tarefaOutraId);
    novaTarefaOutra = { ...tarefaOutra, dataInicio: novoDia };
  }

  const autor = await obterColaboradorAtual();
  const hist = await inserirHistorico(
    supabase,
    tarefaOutraId,
    `${autor?.nome ?? "Alguém"} moveu essa tarefa de ${diaConflito} para ${novoDia} pra abrir espaço pra atividade "${tarefaAtual?.titulo ?? ""}"`,
    { faseId: novaTarefaOutra.faseAtualId }
  );
  novaTarefaOutra = { ...novaTarefaOutra, historico: [...novaTarefaOutra.historico, hist] };

  tasks = tasks.map((t) => (t.id === tarefaOutraId ? novaTarefaOutra : t));
  emit();
}

export async function moveTask(taskId: string, novaFaseId: string) {
  const atual = tasks.find((x) => x.id === taskId);
  if (!atual) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("tarefas")
    .update({ fase_atual_id: novaFaseId, ...colunasConclusao(novaFaseId, atual.statusAtividade) })
    .eq("id", taskId);
  if (error) {
    console.error("Falha ao mover tarefa:", error.message);
    return;
  }
  const hist = await inserirHistorico(supabase, taskId, `Movida para ${faseById(novaFaseId)?.nome ?? novaFaseId}`, {
    faseId: novaFaseId,
  });
  tasks = tasks.map((t) =>
    t.id === taskId
      ? { ...t, faseAtualId: novaFaseId, ...colunasConclusao(novaFaseId, t.statusAtividade), historico: [...t.historico, hist] }
      : t
  );
  emit();
}

/** Muda o status manual da atividade (Ativa/Pausada/Concluída/Arquivada) — Pausada e Arquivada
 * tiram a tarefa da contagem de Workload e Painel de Trabalho, sem apagar o registro. */
export async function atualizarStatusAtividade(taskId: string, novoStatus: StatusAtividade) {
  const supabase = createClient();
  const { error } = await supabase.from("tarefas").update({ status: novoStatus }).eq("id", taskId);
  if (error) {
    console.error("Falha ao atualizar status da atividade:", error.message);
    return;
  }
  const autor = await obterColaboradorAtual();
  const hist = await inserirHistorico(supabase, taskId, `${autor?.nome ?? "Alguém"} mudou o status para ${novoStatus}`);
  tasks = tasks.map((t) =>
    t.id === taskId ? { ...t, statusAtividade: novoStatus, historico: [...t.historico, hist] } : t
  );
  emit();
}

/** Exclui a tarefa definitivamente (não é o mesmo que arquivar/status "Arquivada", que só some
 * do Workload mas mantém o registro). Comentários, checklist, histórico, planejamento, etapas e
 * alocações são removidos junto via `on delete cascade` no banco. Retorna `false` sem mexer no
 * estado local se a exclusão falhar. */
export async function excluirTarefa(taskId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("tarefas").delete().eq("id", taskId);
  if (error) {
    console.error("Falha ao excluir tarefa:", error.message);
    return false;
  }
  tasks = tasks.filter((t) => t.id !== taskId);
  emit();
  return true;
}

/** Adiciona um comentário à tarefa — parte do "local de trabalho" da etapa em execução. */
export async function adicionarComentario(taskId: string, texto: string) {
  const limpo = texto.trim();
  if (!limpo) return;
  const supabase = createClient();
  const autor = await obterColaboradorAtual();
  const { data, error } = await supabase
    .from("comentarios")
    .insert({ tarefa_id: taskId, autor_id: autor?.id ?? null, texto: limpo })
    .select("id, autor_id, texto, criado_em")
    .single();
  if (error || !data) {
    console.error("Falha ao comentar:", error?.message);
    return;
  }
  const comentario: Comentario = { id: data.id, autorId: data.autor_id, texto: data.texto, data: data.criado_em };
  tasks = tasks.map((t) => (t.id === taskId ? { ...t, comentarios: [...t.comentarios, comentario] } : t));
  emit();
}

/** Marca/desmarca um item do checklist. */
export async function alternarChecklistItem(taskId: string, itemId: string) {
  const t = tasks.find((x) => x.id === taskId);
  const item = t?.checklist.find((i) => i.id === itemId);
  if (!item) return;
  const novoFeito = !item.feito;
  const supabase = createClient();
  const { error } = await supabase.from("checklist_itens").update({ feito: novoFeito }).eq("id", itemId);
  if (error) {
    console.error("Falha ao atualizar checklist:", error.message);
    return;
  }
  tasks = tasks.map((x) =>
    x.id === taskId
      ? { ...x, checklist: x.checklist.map((i) => (i.id === itemId ? { ...i, feito: novoFeito } : i)) }
      : x
  );
  emit();
}

/** Adiciona um novo item ao checklist da tarefa. */
export async function adicionarChecklistItem(taskId: string, texto: string) {
  const limpo = texto.trim();
  if (!limpo) return;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("checklist_itens")
    .insert({ tarefa_id: taskId, texto: limpo })
    .select("id, texto, feito")
    .single();
  if (error || !data) {
    console.error("Falha ao adicionar item do checklist:", error?.message);
    return;
  }
  tasks = tasks.map((t) => (t.id === taskId ? { ...t, checklist: [...t.checklist, data as ChecklistItem] } : t));
  emit();
}

/** Anexa um arquivo (só o nome, sem backend de upload ainda) à tarefa. */
export async function adicionarAnexo(taskId: string, nomeArquivo: string) {
  const limpo = nomeArquivo.trim();
  if (!limpo) return;
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return;
  const novosAnexos = [...(t.anexos ?? []), limpo];
  const supabase = createClient();
  const { error } = await supabase.from("tarefas").update({ anexos: novosAnexos }).eq("id", taskId);
  if (error) {
    console.error("Falha ao anexar arquivo:", error.message);
    return;
  }
  tasks = tasks.map((x) => (x.id === taskId ? { ...x, anexos: novosAnexos } : x));
  emit();
}

/** Adiciona um link de referência à tarefa. */
export async function adicionarLink(taskId: string, url: string) {
  const limpo = url.trim();
  if (!limpo) return;
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return;
  const novosLinks = [...(t.links ?? []), limpo];
  const supabase = createClient();
  const { error } = await supabase.from("tarefas").update({ links: novosLinks }).eq("id", taskId);
  if (error) {
    console.error("Falha ao adicionar link:", error.message);
    return;
  }
  tasks = tasks.map((x) => (x.id === taskId ? { ...x, links: novosLinks } : x));
  emit();
}

/**
 * Ajusta a data de entrega e/ou as horas de uma etapa já aplicada (em execução) — quando a
 * pessoa percebe que vai precisar de mais tempo. Empurra automaticamente as etapas seguintes
 * mantendo o mesmo espaçamento que já tinham entre si, e recalcula a previsão de conclusão.
 */
export async function ajustarEtapaEmExecucao(
  taskId: string,
  ordem: number,
  novaDataFim: string,
  novasHoras: number
) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t || !t.planejamento) return;
  const etapasOriginais = [...t.planejamento.etapas].sort((a, b) => a.ordem - b.ordem);
  const idx = etapasOriginais.findIndex((e) => e.ordem === ordem);
  if (idx === -1) return;

  // Início "de verdade" da etapa editada é onde a anterior termina (ou o início da tarefa, se for
  // a primeira) — não fica persistido à parte, mas é o mesmo critério usado ao montar a tabela de
  // planejamento (ver seed de duracoesPorEtapa em planejamento-recomendado.tsx). Sem essa trava,
  // uma data anterior à etapa anterior faria distribuirHorasPorDia não achar nenhum dia útil no
  // intervalo e empilhar tudo de volta num dia só, silenciosamente.
  const inicioEtapaEditada = idx > 0 ? etapasOriginais[idx - 1].dataFim : t.dataInicio || novaDataFim;
  if (novaDataFim < inicioEtapaEditada) return;

  const novasEtapas = etapasOriginais.map((e) => ({ ...e, alocacoes: e.alocacoes.map((a) => ({ ...a })) }));
  novasEtapas[idx] = {
    ...novasEtapas[idx],
    dataFim: novaDataFim,
    alocacoes: distribuirHorasPorDia(inicioEtapaEditada, novaDataFim, novasHoras),
  };

  // Etapas seguintes mantêm o mesmo espaçamento (em dias úteis) que já tinham entre si, só que a
  // partir da nova data — é o que "empurra todo o resto" automaticamente. As horas de cada uma
  // continuam as mesmas de antes, só redistribuídas pelos novos dias do intervalo deslocado.
  let cursorOriginal = etapasOriginais[idx].dataFim;
  let cursorNovo = novaDataFim;
  for (let j = idx + 1; j < novasEtapas.length; j++) {
    const gap = passosUteisEntre(cursorOriginal, etapasOriginais[j].dataFim);
    let novoFim = cursorNovo;
    for (let k = 0; k < gap; k++) novoFim = proximoDiaUtil(proximoDia(novoFim));
    const horasEtapa = etapasOriginais[j].alocacoes.reduce((soma, a) => soma + a.horas, 0);
    novasEtapas[j] = {
      ...novasEtapas[j],
      dataFim: novoFim,
      alocacoes: distribuirHorasPorDia(cursorNovo, novoFim, horasEtapa),
    };
    cursorOriginal = etapasOriginais[j].dataFim;
    cursorNovo = novoFim;
  }

  const previsaoConclusao = novasEtapas.reduce((max, e) => (e.dataFim > max ? e.dataFim : max), novaDataFim);
  const nomeEtapa = etapaById(novasEtapas[idx].etapaId)?.nome ?? novasEtapas[idx].etapaId;

  const supabase = createClient();
  const { data: planRow } = await supabase.from("planejamentos").select("id").eq("tarefa_id", taskId).single();
  if (planRow) {
    for (let j = idx; j < novasEtapas.length; j++) {
      const etapa = novasEtapas[j];
      const { data: etapaRow } = await supabase
        .from("planejamento_etapas")
        .select("id")
        .eq("planejamento_id", planRow.id)
        .eq("ordem", etapa.ordem)
        .single();
      if (!etapaRow) continue;
      await supabase.from("planejamento_etapas").update({ data_fim: etapa.dataFim }).eq("id", etapaRow.id);
      await substituirAlocacoesDaEtapa(supabase, etapaRow.id, etapa.alocacoes);
    }
  }
  await supabase.from("tarefas").update({ previsao_conclusao: previsaoConclusao }).eq("id", taskId);

  const autor = await obterColaboradorAtual();
  const hist = await inserirHistorico(
    supabase,
    taskId,
    `${autor?.nome ?? "Alguém"} ajustou a etapa "${nomeEtapa}" para ${novaDataFim} (${decimalParaHorario(novasHoras)}) — as etapas seguintes foram reagendadas junto`,
    { faseId: t.faseAtualId }
  );

  tasks = tasks.map((x) =>
    x.id === taskId
      ? {
          ...x,
          planejamento: { ...x.planejamento!, etapas: novasEtapas, previsaoConclusao },
          previsaoConclusao,
          historico: [...x.historico, hist],
        }
      : x
  );
  emit();
}

/**
 * Replanejamento: substitui os dados (data, horas, executor) das etapas ATUAL/FUTURAS recebidas
 * em `etapasEditadas`, sem tocar nas concluídas (não fazem parte da lista). Diferente de
 * `aplicarPlanejamento` (que sempre insere um planejamento novo do zero), essa função só faz
 * UPDATE — preserva o `id` de cada linha `planejamento_etapas` (chave de dedup do convite
 * proativo do keV em `kev_convites_atividade`) e o `tempoGastoHoras` já registrado nelas.
 *
 * Retorna `true` só quando TODAS as etapas enviadas e a atualização de previsão/status foram
 * confirmadas no banco — quem chama (salvarReplanejamento) precisa aguardar essa confirmação
 * antes de fechar a tela de replanejamento, senão uma falha vira um "salvou" falso pro usuário.
 */
export async function replanejarEtapasDaAtividade(
  taskId: string,
  etapasEditadas: EtapaAgendada[],
  status: { status: StatusPlanejamento; folgaDias?: number }
): Promise<boolean> {
  const t = tasks.find((x) => x.id === taskId);
  if (!t || !t.planejamento || etapasEditadas.length === 0) return false;

  const etapasOrdenadas = [...etapasEditadas].sort((a, b) => a.ordem - b.ordem);
  const etapasAtuais = [...t.planejamento.etapas].sort((a, b) => a.ordem - b.ordem);

  // Trava de segurança: já validado na tela (foraDeOrdemCronologica), mas confere de novo aqui —
  // etapa anterior real (concluída, se existir) + as editadas, na mesma ordem que serão salvas.
  const etapaAnteriorReal = etapasAtuais.find((e) => e.ordem === etapasOrdenadas[0].ordem - 1);
  const sequenciaParaValidar = etapaAnteriorReal ? [etapaAnteriorReal, ...etapasOrdenadas] : etapasOrdenadas;
  if (foraDeOrdemCronologica(sequenciaParaValidar.map((e) => ({ concluirEm: e.dataFim })))) return false;

  const supabase = createClient();
  const { data: planRow, error: planErro } = await supabase
    .from("planejamentos")
    .select("id")
    .eq("tarefa_id", taskId)
    .single();
  if (planErro || !planRow) {
    console.error("Falha ao localizar planejamento pra replanejar:", planErro?.message);
    return false;
  }

  // Só entram no estado local (e no histórico) as etapas cujo UPDATE realmente confirmou no
  // banco — senão uma falha pontual deixaria a tela mostrando um valor que um recarregamento
  // (recarregarTarefas) desfaria, sem avisar que aquela etapa específica não salvou. Etapas são
  // linhas independentes (ordens diferentes), então os UPDATEs rodam em paralelo em vez de
  // esperar um de cada vez.
  const resultados = await Promise.all(
    etapasOrdenadas.map(async (etapa) => {
      const { data: etapaRow, error: etapaErro } = await supabase
        .from("planejamento_etapas")
        .update({ colaborador_id: etapa.colaboradorId, data_fim: etapa.dataFim })
        .eq("planejamento_id", planRow.id)
        .eq("ordem", etapa.ordem)
        .select("id")
        .single();
      if (etapaErro || !etapaRow) {
        console.error("Falha ao replanejar etapa:", etapaErro?.message);
        return null;
      }
      await substituirAlocacoesDaEtapa(supabase, etapaRow.id, etapa.alocacoes);
      return etapa;
    })
  );
  const etapasSalvas = resultados.filter((e): e is EtapaAgendada => e !== null);
  if (etapasSalvas.length === 0) return false;
  // Sucesso parcial também é reportado como falha — sem isso o usuário via a tela fechar como se
  // tivesse dado certo mesmo com uma etapa não persistida.
  const sucessoTotal = etapasSalvas.length === etapasOrdenadas.length;

  const novasEtapas = etapasAtuais.map((e) => {
    const editada = etapasSalvas.find((n) => n.ordem === e.ordem);
    return editada
      ? { ...e, dataFim: editada.dataFim, colaboradorId: editada.colaboradorId, alocacoes: editada.alocacoes.map((a) => ({ ...a })) }
      : e;
  });
  // Seed é a primeira etapa (sempre existe, já que etapasAtuais não é vazio) — não o
  // previsaoConclusao antigo: o replanejamento pode ADIANTAR a entrega, não só atrasar, e um seed
  // desatualizado nunca deixaria o resultado diminuir.
  const previsaoConclusao = novasEtapas.reduce(
    (max, e) => (e.dataFim > max ? e.dataFim : max),
    novasEtapas[0].dataFim
  );

  // executoresPorFase (campo legado, usado por buscarWorkloadEquipe do keV) só reflete a etapa
  // ATUAL — reatribuir uma etapa futura não muda quem está de fato trabalhando na fase agora.
  const etapaAtualEditada = etapasSalvas.find((e) => e.ordem === t.planejamento!.etapaAtualOrdem);
  const novoExecutoresPorFase = etapaAtualEditada
    ? calcularExecutoresPorFaseAtualizado(t, etapaAtualEditada.ordem, etapaAtualEditada.colaboradorId)
    : t.executoresPorFase;

  const { error: erroTarefa } = await supabase
    .from("tarefas")
    .update({ previsao_conclusao: previsaoConclusao, executores_por_fase: novoExecutoresPorFase })
    .eq("id", taskId);
  if (erroTarefa) console.error("Falha ao atualizar previsão/executores após replanejar:", erroTarefa.message);
  // status/folgaDias (badge "dentro do prazo"/"apertado"/"impossível") também ficariam presos ao
  // valor de quando o plano foi aplicado pela primeira vez se não forem recalculados aqui.
  const { error: erroStatus } = await supabase
    .from("planejamentos")
    .update({ status: status.status, folga_dias: status.folgaDias ?? null })
    .eq("id", planRow.id);
  if (erroStatus) console.error("Falha ao atualizar status do planejamento:", erroStatus.message);
  const sucesso = sucessoTotal && !erroTarefa && !erroStatus;

  const autor = await obterColaboradorAtual();
  const plural = etapasSalvas.length === 1 ? "" : "s";
  const hist = await inserirHistorico(
    supabase,
    taskId,
    `${autor?.nome ?? "Alguém"} replanejou ${etapasSalvas.length} etapa${plural} restante${plural} da atividade`,
    { faseId: t.faseAtualId }
  );

  tasks = tasks.map((x) =>
    x.id === taskId
      ? {
          ...x,
          executoresPorFase: novoExecutoresPorFase,
          planejamento: {
            ...x.planejamento!,
            etapas: novasEtapas,
            previsaoConclusao,
            status: status.status,
            folgaDias: status.folgaDias,
          },
          previsaoConclusao,
          historico: [...x.historico, hist],
        }
      : x
  );
  emit();
  return sucesso;
}
