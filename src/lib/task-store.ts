"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  faseById,
  etapaById,
  type Tarefa,
  type PlanejamentoTarefa,
  type CategoriaEtapa,
  type ChecklistItem,
  type Comentario,
  type HistoricoEvento,
} from "@/lib/mock";
import { proximoDia, proximoDiaUtil } from "@/lib/scheduling";
import { isoHoje, diasEntre } from "@/lib/hoje";
import { createClient } from "@/lib/supabase/client";
import { obterColaboradorAtual } from "@/lib/current-colaborador-client";

type SupabaseClient = ReturnType<typeof createClient>;

// Lê/escreve as tarefas direto no Supabase (protegido por RLS) — mesma API de hooks/mutators de
// antes (ver docs/PLAN.md M2), só trocando a persistência local por queries reais.
let tasks: Tarefa[] = [];
let hidratado = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

const SELECT = `
  id, titulo, descricao, tipo_id, origem, solicitante_nome, solicitante_email, anexos, links,
  justificativa_prioridade, justificativa_prazo, observacoes, quantidade_unidade, dados_completos,
  tipo_solicitacao_geral, departamento, projeto_id, prioridade_sugerida, prioridade_final,
  fase_atual_id, data_inicio, prazo, previsao_conclusao, executores_por_fase, estimativa_por_fase,
  participantes_ids, tag_ids,
  checklist_itens(id, texto, feito, criado_em),
  comentarios(id, autor_id, texto, criado_em),
  historico_eventos(id, data, autor_id, descricao, fase_id, acao),
  planejamentos(gerado_em, previsao_conclusao, status, folga_dias, etapa_atual_ordem,
    planejamento_etapas(etapa_id, ordem, colaborador_id, data_fim,
      planejamento_alocacoes(data, horas)))
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function linhaParaTarefa(row: any): Tarefa {
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
              etapaId: e.etapa_id,
              ordem: e.ordem,
              colaboradorId: e.colaborador_id,
              dataFim: e.data_fim,
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

function paraColunas(t: Partial<Tarefa>): Record<string, unknown> {
  const linha: Record<string, unknown> = {};
  if (t.titulo !== undefined) linha.titulo = t.titulo;
  if (t.descricao !== undefined) linha.descricao = t.descricao;
  if (t.tipoId !== undefined) linha.tipo_id = t.tipoId || null;
  if (t.origem !== undefined) linha.origem = t.origem;
  if (t.solicitanteNome !== undefined) linha.solicitante_nome = t.solicitanteNome || null;
  if (t.solicitanteEmail !== undefined) linha.solicitante_email = t.solicitanteEmail || null;
  if (t.anexos !== undefined) linha.anexos = t.anexos;
  if (t.links !== undefined) linha.links = t.links;
  if (t.justificativaPrioridade !== undefined)
    linha.justificativa_prioridade = t.justificativaPrioridade || null;
  if (t.justificativaPrazo !== undefined) linha.justificativa_prazo = t.justificativaPrazo || null;
  if (t.observacoes !== undefined) linha.observacoes = t.observacoes || null;
  if (t.quantidadeUnidade !== undefined) linha.quantidade_unidade = t.quantidadeUnidade ?? null;
  if (t.dadosCompletos !== undefined) linha.dados_completos = t.dadosCompletos || null;
  if (t.tipoSolicitacaoGeral !== undefined) linha.tipo_solicitacao_geral = t.tipoSolicitacaoGeral || null;
  if (t.departamento !== undefined) linha.departamento = t.departamento || null;
  if (t.projetoId !== undefined) linha.projeto_id = t.projetoId || null;
  if (t.prioridadeSugerida !== undefined) linha.prioridade_sugerida = t.prioridadeSugerida || null;
  if (t.prioridadeFinal !== undefined) linha.prioridade_final = t.prioridadeFinal;
  if (t.faseAtualId !== undefined) linha.fase_atual_id = t.faseAtualId;
  if (t.dataInicio !== undefined) linha.data_inicio = t.dataInicio;
  if (t.prazo !== undefined) linha.prazo = t.prazo || null;
  if (t.previsaoConclusao !== undefined) linha.previsao_conclusao = t.previsaoConclusao || null;
  if (t.executoresPorFase !== undefined) linha.executores_por_fase = t.executoresPorFase;
  if (t.estimativaPorFase !== undefined) linha.estimativa_por_fase = t.estimativaPorFase;
  if (t.participantesIds !== undefined) linha.participantes_ids = t.participantesIds;
  if (t.tagIds !== undefined) linha.tag_ids = t.tagIds;
  return linha;
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

async function hidratar() {
  if (hidratado) return;
  hidratado = true;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tarefas")
    .select(SELECT)
    .order("criado_em", { ascending: false });
  if (error) {
    console.error("Falha ao carregar tarefas:", error.message);
    return;
  }
  tasks = (data ?? []).map(linhaParaTarefa);
  emit();
  await sincronizarInicioDeTarefas();
}

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

/**
 * Cria uma tarefa nova (fluxo interno, autenticado — não confundir com o formulário público de
 * Solicitação, que usa a RPC `criar_solicitacao_publica` direto). `dados.id` é ignorado — o
 * Postgres gera o uuid real.
 */
export async function addTask(
  dados: Partial<Tarefa> &
    Pick<Tarefa, "titulo" | "descricao" | "origem" | "prioridadeFinal" | "faseAtualId" | "dataInicio">
) {
  const supabase = createClient();
  const { data, error } = await supabase.from("tarefas").insert(paraColunas(dados)).select(SELECT).single();
  if (error || !data) {
    console.error("Falha ao criar tarefa:", error?.message);
    return;
  }
  const nova = linhaParaTarefa(data);
  const hist = await inserirHistorico(supabase, nova.id, "Tarefa criada", { faseId: nova.faseAtualId });
  nova.historico = [hist];
  tasks = [nova, ...tasks];
  emit();
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
  const { error } = await supabase.from("tarefas").update({ fase_atual_id: novaFaseId }).eq("id", taskId);
  if (error) {
    console.error("Falha ao mover para triagem:", error.message);
    return;
  }
  const histMove = await inserirHistorico(supabase, taskId, `Movida para ${faseById(novaFaseId)?.nome ?? novaFaseId}`, {
    faseId: novaFaseId,
  });
  tasks = tasks.map((x) =>
    x.id === taskId
      ? { ...x, faseAtualId: novaFaseId, historico: [...x.historico, histDecisao, histMove] }
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

/** Aplica o planejamento recomendado pelo motor de regras, gerado a partir do Tipo de Tarefa da triagem. */
export async function aplicarPlanejamento(
  taskId: string,
  resultado: Omit<PlanejamentoTarefa, "geradoEm" | "etapaAtualOrdem">,
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
    etapas: resultado.etapas,
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
    await supabase.from("tarefas").update({ fase_atual_id: novaFaseId }).eq("id", taskId);
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
          planejamento: { ...x.planejamento!, etapaAtualOrdem: novaOrdem },
          historico: [...x.historico, hist],
        }
      : x
  );
  emit();
}

/** Renegocia o prazo final da tarefa com o solicitante e registra no histórico. */
export async function atualizarPrazoTarefa(taskId: string, novoPrazo: string) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return;
  const prazoAntigoFormatado = t.prazo || "sem prazo definido";
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
    `${autor?.nome ?? "Alguém"} renegociou o prazo com o solicitante: de ${prazoAntigoFormatado} para ${novoPrazo}`,
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
        await supabase.from("planejamento_alocacoes").delete().eq("planejamento_etapa_id", etapaRow.id);
        if (etapa.alocacoes.length > 0) {
          await supabase
            .from("planejamento_alocacoes")
            .insert(etapa.alocacoes.map((a) => ({ planejamento_etapa_id: etapaRow.id, data: a.data, horas: a.horas })));
        }
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
  const supabase = createClient();
  const { error } = await supabase.from("tarefas").update({ fase_atual_id: novaFaseId }).eq("id", taskId);
  if (error) {
    console.error("Falha ao mover tarefa:", error.message);
    return;
  }
  const hist = await inserirHistorico(supabase, taskId, `Movida para ${faseById(novaFaseId)?.nome ?? novaFaseId}`, {
    faseId: novaFaseId,
  });
  tasks = tasks.map((t) =>
    t.id === taskId ? { ...t, faseAtualId: novaFaseId, historico: [...t.historico, hist] } : t
  );
  emit();
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

  const novasEtapas = etapasOriginais.map((e) => ({ ...e, alocacoes: e.alocacoes.map((a) => ({ ...a })) }));
  novasEtapas[idx] = {
    ...novasEtapas[idx],
    dataFim: novaDataFim,
    alocacoes: [{ data: novaDataFim, horas: novasHoras }],
  };

  // Etapas seguintes mantêm o mesmo espaçamento (em dias úteis) que já tinham entre si,
  // só que a partir da nova data — é o que "empurra todo o resto" automaticamente.
  let cursorOriginal = etapasOriginais[idx].dataFim;
  let cursorNovo = novaDataFim;
  for (let j = idx + 1; j < novasEtapas.length; j++) {
    const gap = diasEntre(cursorOriginal, etapasOriginais[j].dataFim);
    let novoFim = cursorNovo;
    for (let k = 0; k < gap; k++) novoFim = proximoDiaUtil(proximoDia(novoFim));
    novasEtapas[j] = {
      ...novasEtapas[j],
      dataFim: novoFim,
      alocacoes: novasEtapas[j].alocacoes.map((a) => ({ ...a, data: novoFim })),
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
      await supabase.from("planejamento_alocacoes").delete().eq("planejamento_etapa_id", etapaRow.id);
      if (etapa.alocacoes.length > 0) {
        await supabase
          .from("planejamento_alocacoes")
          .insert(etapa.alocacoes.map((a) => ({ planejamento_etapa_id: etapaRow.id, data: a.data, horas: a.horas })));
      }
    }
  }
  await supabase.from("tarefas").update({ previsao_conclusao: previsaoConclusao }).eq("id", taskId);

  const autor = await obterColaboradorAtual();
  const hist = await inserirHistorico(
    supabase,
    taskId,
    `${autor?.nome ?? "Alguém"} ajustou a etapa "${nomeEtapa}" para ${novaDataFim} (${novasHoras}h) — as etapas seguintes foram reagendadas junto`,
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
