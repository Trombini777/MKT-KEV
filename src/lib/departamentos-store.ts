"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DEPARTAMENTOS as SEED } from "@/lib/departamentos";
import { createClient } from "@/lib/supabase/client";

// Só leitura (sem tela de gestão — ver docs/PRD.md E1) — mas ainda assim busca do Supabase, não
// do array estático, porque a lista está incompleta hoje (18 de ~29) e pode ser completada
// direto no banco sem precisar de deploy. A tabela tem policy de leitura pública, então funciona
// até no formulário de Solicitação (sem login).
let departamentos: readonly string[] = SEED;
let hidratado = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

async function hidratar() {
  if (hidratado) return;
  hidratado = true;
  const supabase = createClient();
  const { data, error } = await supabase.from("departamentos").select("nome").order("nome");
  if (error || !data || data.length === 0) {
    console.error("Falha ao carregar departamentos, usando lista embutida:", error?.message);
    return;
  }
  departamentos = data.map((d) => d.nome);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return departamentos;
}

export function useDepartamentos(): readonly string[] {
  useEffect(() => {
    hidratar();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
