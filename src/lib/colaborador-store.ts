"use client";

import { useEffect, useSyncExternalStore } from "react";
import { COLABORADORES, type Colaborador } from "@/lib/mock";

// Mesmo padrão do task-store.ts: guarda os colaboradores em memória + localStorage pra
// persistir entre sessões enquanto não existe backend real (ver docs/PLAN.md).
const STORAGE_KEY = "kev-marketing:colaboradores";

let colaboradores: Colaborador[] = COLABORADORES.map((c) => ({ ...c }));
let hidratado = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persistir() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(colaboradores));
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
      colaboradores = JSON.parse(raw) as Colaborador[];
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
  return colaboradores;
}

export function useColaboradores(): Colaborador[] {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function adicionarColaborador(colaborador: Colaborador) {
  colaboradores = [...colaboradores, colaborador];
  persistir();
  emit();
}

export function editarColaborador(colaboradorAtualizado: Colaborador) {
  colaboradores = colaboradores.map((c) =>
    c.id === colaboradorAtualizado.id ? colaboradorAtualizado : c
  );
  persistir();
  emit();
}

export function excluirColaborador(id: string) {
  colaboradores = colaboradores.filter((c) => c.id !== id);
  persistir();
  emit();
}
