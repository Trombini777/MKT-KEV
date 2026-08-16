"use client";

import { useColaboradores } from "@/lib/colaborador-store";
import { useEtapas } from "@/lib/etapa-store";
import { useTiposTarefa } from "@/lib/tipo-tarefa-store";
import { useProjetos } from "@/lib/projeto-store";
import { useConfiguracoesFluxo } from "@/lib/configuracoes-fluxo-store";

/**
 * Sem saída visual — só garante que os catálogos com mutação em memória (COLABORADORES, ETAPAS,
 * TIPOS_TAREFA, PROJETOS) hidratem do Supabase logo no primeiro carregamento de qualquer página
 * autenticada, e não só quando a pessoa visita /pessoas, /etapas, /tipos-de-tarefa ou /projetos.
 * Sem isso, `colaboradorById`/`etapaById`/`projetoById`/etc. (lidos direto por dezenas de
 * componentes, sem hook) ficariam presos nos dados de seed até alguém abrir a página
 * correspondente — e no caso de `projetoById`, os ids de seed nem batem com os uuids reais do
 * banco, então qualquer vínculo (ex.: vincular uma tarefa a um projeto) falharia.
 */
export function CatalogoHydrator() {
  useColaboradores();
  useEtapas();
  useTiposTarefa();
  useProjetos();
  useConfiguracoesFluxo();
  return null;
}
