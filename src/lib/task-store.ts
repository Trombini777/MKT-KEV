"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  TAREFAS,
  USUARIO_ATUAL_ID,
  faseById,
  nomeColaborador,
  type Tarefa,
  type PlanejamentoTarefa,
} from "@/lib/mock";
import { proximoDia, proximoDiaUtil } from "@/lib/scheduling";
import { isoHoje } from "@/lib/hoje";

// Sem backend ainda (ver docs/PLAN.md): guarda as tarefas em memória + localStorage
// pra simular persistência entre o formulário público de Solicitações e o painel
// interno, que são páginas/abas diferentes e não compartilham estado de React.
const STORAGE_KEY = "kev-marketing:tarefas";

let tasks: Tarefa[] = TAREFAS.map((t) => ({ ...t }));
let hidratado = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persistir() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // localStorage indisponível (modo privado, cota cheia etc.) — ignora.
  }
}

/**
 * Passa a data de início pente-fino: tarefa no Backlog cujo dia de início já chegou vira
 * "Em Execução" sozinha. Simula, no front, o que seria um job agendado num backend real —
 * roda uma vez por carregamento da página (ver `hidratar`).
 */
function sincronizarInicioDeTarefas() {
  const hoje = isoHoje();
  let mudou = false;
  tasks = tasks.map((t) => {
    if (t.faseAtualId !== "backlog" || !t.dataInicio || t.dataInicio > hoje) return t;
    mudou = true;
    return {
      ...t,
      faseAtualId: "em-execucao",
      historico: [
        ...t.historico,
        {
          id: `h-${t.historico.length}-em-execucao`,
          data: new Date().toISOString(),
          autorId: USUARIO_ATUAL_ID,
          descricao: `Chegou a data de início — movida automaticamente para ${faseById("em-execucao")?.nome ?? "Em Execução"}`,
          faseId: "em-execucao",
        },
      ],
    };
  });
  if (mudou) persistir();
}

function hidratar() {
  if (hidratado || typeof window === "undefined") return;
  hidratado = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      tasks = JSON.parse(raw) as Tarefa[];
    }
  } catch {
    // dado corrompido ou localStorage indisponível — mantém o seed inicial.
  }
  sincronizarInicioDeTarefas();
  emit();
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

export function addTask(tarefa: Tarefa) {
  tasks = [tarefa, ...tasks];
  persistir();
  emit();
}

/** Registra a decisão de aprovação interna da solicitação; aprovar já move a tarefa para Triagem. */
export function registrarAprovacaoInterna(taskId: string, aprovada: boolean) {
  tasks = tasks.map((t) => {
    if (t.id !== taskId) return t;
    const verbo = aprovada ? "aprovou" : "recusou";
    const acao: "aprovada" | "recusada" = aprovada ? "aprovada" : "recusada";
    const historicoComDecisao = [
      ...t.historico,
      {
        id: `h-${t.historico.length}-aprovacao`,
        data: new Date().toISOString(),
        autorId: USUARIO_ATUAL_ID,
        descricao: `${nomeColaborador(USUARIO_ATUAL_ID)} ${verbo} a solicitação da atividade "${t.titulo}"`,
        faseId: t.faseAtualId,
        acao,
      },
    ];
    if (!aprovada) {
      return { ...t, historico: historicoComDecisao };
    }
    const novaFaseId = "triagem";
    return {
      ...t,
      faseAtualId: novaFaseId,
      historico: [
        ...historicoComDecisao,
        {
          id: `h-${historicoComDecisao.length}-${novaFaseId}`,
          data: new Date().toISOString(),
          autorId: USUARIO_ATUAL_ID,
          descricao: `Movida para ${faseById(novaFaseId)?.nome ?? novaFaseId}`,
          faseId: novaFaseId,
        },
      ],
    };
  });
  persistir();
  emit();
}

/** Define o Tipo de Tarefa (registro de Tipos de Tarefa) durante a triagem da solicitação. */
export function atualizarTipoTarefa(taskId: string, tipoId: string) {
  tasks = tasks.map((t) => (t.id === taskId ? { ...t, tipoId } : t));
  persistir();
  emit();
}

/** Grava as respostas da triagem ("temos os dados?" e "tipo de solicitação"). */
export function definirRespostaTriagem(
  taskId: string,
  campo: "dadosCompletos" | "tipoSolicitacaoGeral",
  valor: string
) {
  tasks = tasks.map((t) => (t.id === taskId ? { ...t, [campo]: valor } : t));
  persistir();
  emit();
}

/** Atribui o responsável pela etapa atual da tarefa. */
export function atribuirResponsavelEtapa(taskId: string, faseId: string, colaboradorId: string) {
  tasks = tasks.map((t) => {
    if (t.id !== taskId) return t;
    return {
      ...t,
      executoresPorFase: { ...t.executoresPorFase, [faseId]: [colaboradorId] },
    };
  });
  persistir();
  emit();
}

/** Aplica o planejamento recomendado pelo motor de regras, gerado a partir do Tipo de Tarefa da triagem. */
export function aplicarPlanejamento(
  taskId: string,
  resultado: Omit<PlanejamentoTarefa, "geradoEm">,
  dataInicio?: string
) {
  tasks = tasks.map((t) => {
    if (t.id !== taskId) return t;
    const planejamento: PlanejamentoTarefa = {
      geradoEm: new Date().toISOString(),
      ...resultado,
    };
    return {
      ...t,
      planejamento,
      previsaoConclusao: resultado.previsaoConclusao,
      dataInicio: dataInicio ?? t.dataInicio,
      historico: [
        ...t.historico,
        {
          id: `h-${t.historico.length}-planejamento`,
          data: new Date().toISOString(),
          autorId: USUARIO_ATUAL_ID,
          descricao: `${nomeColaborador(USUARIO_ATUAL_ID)} aplicou o planejamento recomendado para "${t.titulo}"`,
          faseId: t.faseAtualId,
        },
      ],
    };
  });
  persistir();
  emit();
}

/** Renegocia o prazo final da tarefa com o solicitante e registra no histórico. */
export function atualizarPrazoTarefa(taskId: string, novoPrazo: string) {
  tasks = tasks.map((t) => {
    if (t.id !== taskId) return t;
    const prazoAntigoFormatado = t.prazo || "sem prazo definido";
    return {
      ...t,
      prazo: novoPrazo,
      historico: [
        ...t.historico,
        {
          id: `h-${t.historico.length}-prazo`,
          data: new Date().toISOString(),
          autorId: USUARIO_ATUAL_ID,
          descricao: `${nomeColaborador(USUARIO_ATUAL_ID)} renegociou o prazo com o solicitante: de ${prazoAntigoFormatado} para ${novoPrazo}`,
          faseId: t.faseAtualId,
        },
      ],
    };
  });
  persistir();
  emit();
}

/**
 * Desloca a ocupação de outra tarefa num dia de conflito pro próximo dia útil, pra abrir espaço
 * pro planejamento da tarefa atual. Registra histórico nas duas tarefas.
 */
export function deslocarOcupacaoParaAjuste(
  tarefaOutraId: string,
  colaboradorId: string,
  diaConflito: string,
  tarefaAtualId: string
) {
  const tarefaAtual = tasks.find((t) => t.id === tarefaAtualId);
  const novoDia = proximoDiaUtil(proximoDia(diaConflito));

  tasks = tasks.map((t) => {
    if (t.id !== tarefaOutraId) return t;
    const atualizada: Tarefa = t.planejamento
      ? {
          ...t,
          planejamento: {
            ...t.planejamento,
            etapas: t.planejamento.etapas.map((e) =>
              e.colaboradorId !== colaboradorId
                ? e
                : {
                    ...e,
                    alocacoes: e.alocacoes.map((a) =>
                      a.data === diaConflito ? { ...a, data: novoDia } : a
                    ),
                    dataFim: e.alocacoes.some((a) => a.data === diaConflito) ? novoDia : e.dataFim,
                  }
            ),
          },
        }
      : { ...t, dataInicio: novoDia };
    return {
      ...atualizada,
      historico: [
        ...atualizada.historico,
        {
          id: `h-${atualizada.historico.length}-reajuste`,
          data: new Date().toISOString(),
          autorId: USUARIO_ATUAL_ID,
          descricao: `${nomeColaborador(USUARIO_ATUAL_ID)} moveu essa tarefa de ${diaConflito} para ${novoDia} pra abrir espaço pra atividade "${tarefaAtual?.titulo ?? ""}"`,
          faseId: atualizada.faseAtualId,
        },
      ],
    };
  });

  persistir();
  emit();
}

export function moveTask(taskId: string, novaFaseId: string) {
  tasks = tasks.map((t) => {
    if (t.id !== taskId) return t;
    return {
      ...t,
      faseAtualId: novaFaseId,
      historico: [
        ...t.historico,
        {
          id: `h-${t.historico.length}-${novaFaseId}`,
          data: new Date().toISOString(),
          autorId: USUARIO_ATUAL_ID,
          descricao: `Movida para ${faseById(novaFaseId)?.nome ?? novaFaseId}`,
          faseId: novaFaseId,
        },
      ],
    };
  });
  persistir();
  emit();
}
