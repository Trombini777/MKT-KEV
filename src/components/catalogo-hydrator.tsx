"use client";

import { useColaboradores } from "@/lib/colaborador-store";
import { useEtapas } from "@/lib/etapa-store";
import { useTiposTarefa } from "@/lib/tipo-tarefa-store";

/**
 * Sem saída visual — só garante que os catálogos com mutação em memória (COLABORADORES, ETAPAS,
 * TIPOS_TAREFA) hidratem do Supabase logo no primeiro carregamento de qualquer página
 * autenticada, e não só quando a pessoa visita /pessoas, /etapas ou /tipos-de-tarefa. Sem isso,
 * `colaboradorById`/`etapaById`/etc. (lidos direto por dezenas de componentes, sem hook) ficariam
 * presos nos dados de seed até alguém abrir a página de gestão correspondente.
 */
export function CatalogoHydrator() {
  useColaboradores();
  useEtapas();
  useTiposTarefa();
  return null;
}
