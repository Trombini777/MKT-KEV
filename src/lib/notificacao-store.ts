"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Notificacao } from "@/lib/mock";
import { createClient } from "@/lib/supabase/client";
import { obterColaboradorAtual } from "@/lib/current-colaborador-client";
import { registrarResetDeSessao } from "@/lib/session-cache";

// Mesmo padrão de task-store.ts/colaborador-store.ts: array em memória + useSyncExternalStore,
// hidratado do Supabase (RLS restringe cada colaborador às próprias notificações — ver migration
// 0019). Sem realtime: time pequeno, atualiza ao montar e após marcar como lida.
let notificacoes: Notificacao[] = [];
let hidratado = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

async function hidratar() {
  if (hidratado) return;
  hidratado = true;
  const autor = await obterColaboradorAtual();
  if (!autor) {
    hidratado = false;
    return;
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notificacoes")
    .select("id, tipo, tarefa_id, mensagem, lida, criado_em")
    .eq("colaborador_id", autor.id)
    .order("criado_em", { ascending: false });
  if (error) {
    console.error("Falha ao carregar notificações:", error.message);
    hidratado = false;
    return;
  }
  notificacoes = (data ?? []).map(
    (n): Notificacao => ({
      id: n.id,
      tipo: n.tipo,
      tarefaId: n.tarefa_id ?? undefined,
      mensagem: n.mensagem,
      lida: n.lida,
      criadoEm: n.criado_em,
    })
  );
  emit();
}

registrarResetDeSessao(() => {
  hidratado = false;
  notificacoes = [];
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return notificacoes;
}

export function useNotificacoes(): Notificacao[] {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export async function marcarNotificacaoLida(id: string) {
  const notificacao = notificacoes.find((n) => n.id === id);
  if (!notificacao || notificacao.lida) return;
  notificacoes = notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n));
  emit();
  const supabase = createClient();
  const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
  if (error) console.error("Falha ao marcar notificação como lida:", error.message);
}
