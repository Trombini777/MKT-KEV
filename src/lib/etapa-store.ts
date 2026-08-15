"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ETAPAS, type EtapaTarefa } from "@/lib/mock";

// Diferente do task-store.ts (que reatribui a variável), aqui mutamos o array ETAPAS *no
// próprio lugar* (push/splice) — assim quem importa `ETAPAS`/`etapaById` direto (ex.:
// tipo-tarefa-sheet.tsx, os cartões de tarefa) continua vendo os dados atualizados sem precisar
// trocar pra um hook, já que é a mesma referência de array sendo alterada em memória.
const STORAGE_KEY = "kev-marketing:etapas";

let hidratado = false;
let snapshot: EtapaTarefa[] = [...ETAPAS];
const listeners = new Set<() => void>();

function emit() {
  snapshot = [...ETAPAS];
  for (const listener of listeners) listener();
}

function persistir() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ETAPAS));
  } catch {
    // localStorage indisponível — ignora.
  }
}

function hidratar() {
  if (hidratado || typeof window === "undefined") return;
  hidratado = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const salvas = JSON.parse(raw) as EtapaTarefa[];
      ETAPAS.length = 0;
      ETAPAS.push(...salvas);
      emit();
    }
  } catch {
    // dado corrompido ou localStorage indisponível — mantém o seed inicial.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

export function useEtapas(): EtapaTarefa[] {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function adicionarEtapa(etapa: EtapaTarefa) {
  ETAPAS.push(etapa);
  persistir();
  emit();
}

export function editarEtapa(id: string, patch: Partial<EtapaTarefa>) {
  const idx = ETAPAS.findIndex((e) => e.id === id);
  if (idx === -1) return;
  ETAPAS[idx] = { ...ETAPAS[idx], ...patch };
  persistir();
  emit();
}

export function excluirEtapa(id: string) {
  const idx = ETAPAS.findIndex((e) => e.id === id);
  if (idx === -1) return;
  ETAPAS.splice(idx, 1);
  persistir();
  emit();
}
