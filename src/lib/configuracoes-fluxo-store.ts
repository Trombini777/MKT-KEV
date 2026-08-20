"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  obterConfiguracoesFluxo,
  CONFIG_VAZIA,
  type ConfiguracoesFluxo,
} from "@/lib/configuracoes-fluxo";
import { registrarResetDeSessao } from "@/lib/session-cache";

// Mesmo padrão de etapa-store.ts/projeto-store.ts, só que sem mutar um array — aqui é um objeto
// singleton (config global). Existe pra o card do Kanban conseguir mostrar o SLA padrão de
// Aprovação/Triagem (configurado em Tipos de Tarefa) de forma reativa, em vez do valor fixo de
// `fase.slaDias` — que era só um placeholder até essa configuração existir de verdade.
let snapshot: ConfiguracoesFluxo = CONFIG_VAZIA;
let hidratado = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

async function hidratar() {
  if (hidratado) return;
  hidratado = true;
  const { config } = await obterConfiguracoesFluxo();
  snapshot = config;
  emit();
}

/** Força reler do Supabase — chamado pela tela de Tipos de Tarefa depois de salvar, pra qualquer
 * Kanban aberto em outra aba/rota já refletir o novo SLA sem precisar recarregar a página. */
export async function recarregarConfiguracoesFluxo() {
  const { config } = await obterConfiguracoesFluxo();
  snapshot = config;
  emit();
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
  return snapshot;
}

export function useConfiguracoesFluxo(): ConfiguracoesFluxo {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
