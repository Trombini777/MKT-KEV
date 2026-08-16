"use client";

import { createClient } from "@/lib/supabase/client";

export type ConfiguracoesFluxo = {
  responsavelPadraoAprovacaoId: string | null;
  /** Esforço real — o que ocupa o workload da pessoa. */
  estimativaHorasAprovacao: number | null;
  /** Tempo até conseguir encaixar e concluir — a meta de atendimento. */
  slaHorasAprovacao: number | null;
  responsavelPadraoTriagemId: string | null;
  estimativaHorasTriagem: number | null;
  slaHorasTriagem: number | null;
};

type PatchConfiguracoesFluxo = Partial<{
  responsavel_padrao_aprovacao_id: string | null;
  estimativa_horas_aprovacao: number | null;
  sla_horas_aprovacao: number | null;
  responsavel_padrao_triagem_id: string | null;
  estimativa_horas_triagem: number | null;
  sla_horas_triagem: number | null;
}>;

export const CONFIG_VAZIA: ConfiguracoesFluxo = {
  responsavelPadraoAprovacaoId: null,
  estimativaHorasAprovacao: null,
  slaHorasAprovacao: null,
  responsavelPadraoTriagemId: null,
  estimativaHorasTriagem: null,
  slaHorasTriagem: null,
};

const SELECT_COMPLETO =
  "responsavel_padrao_aprovacao_id, estimativa_horas_aprovacao, sla_horas_aprovacao, responsavel_padrao_triagem_id, estimativa_horas_triagem, sla_horas_triagem";
// Sem as colunas de SLA em horas — usado como fallback enquanto a migração 0006 (sla_dias_* ->
// sla_horas_*) não roda no banco. Sem esse fallback, um único `select` pedindo uma coluna
// inexistente derruba a query inteira e Responsável/Horas estimadas (que têm coluna de verdade)
// ficam parecendo "nunca salvos" também, quando na verdade só a leitura está quebrada.
const SELECT_SEM_SLA =
  "responsavel_padrao_aprovacao_id, estimativa_horas_aprovacao, responsavel_padrao_triagem_id, estimativa_horas_triagem";

const ERRO_MIGRACAO_PENDENTE =
  'A coluna de SLA (em horas) ainda não existe no banco — falta rodar a migração "supabase/migrations/0006_sla_em_horas.sql" no SQL Editor do Supabase. Responsável e Horas estimadas continuam salvando normalmente.';

/** Lê a config global de responsáveis/SLA padrão (Aprovação/Triagem) — sempre busca fresco, sem
 * cache, já que é usada raramente (só ao aprovar uma solicitação) e pode mudar a qualquer hora
 * pela tela de Tipos de Tarefa. */
export async function obterConfiguracoesFluxo(): Promise<{
  config: ConfiguracoesFluxo;
  erro: string | null;
}> {
  const supabase = createClient();
  const completo = await supabase
    .from("configuracoes_fluxo")
    .select(SELECT_COMPLETO)
    .eq("id", true)
    .maybeSingle();

  if (!completo.error) {
    if (!completo.data) return { config: CONFIG_VAZIA, erro: null };
    return {
      config: {
        responsavelPadraoAprovacaoId: completo.data.responsavel_padrao_aprovacao_id,
        estimativaHorasAprovacao: completo.data.estimativa_horas_aprovacao,
        slaHorasAprovacao: completo.data.sla_horas_aprovacao,
        responsavelPadraoTriagemId: completo.data.responsavel_padrao_triagem_id,
        estimativaHorasTriagem: completo.data.estimativa_horas_triagem,
        slaHorasTriagem: completo.data.sla_horas_triagem,
      },
      erro: null,
    };
  }

  console.error("Falha ao carregar responsáveis/SLA padrão:", completo.error.message);
  const semSla = await supabase
    .from("configuracoes_fluxo")
    .select(SELECT_SEM_SLA)
    .eq("id", true)
    .maybeSingle();
  if (semSla.error || !semSla.data) {
    return { config: CONFIG_VAZIA, erro: semSla.error?.message ?? completo.error.message };
  }
  return {
    config: {
      responsavelPadraoAprovacaoId: semSla.data.responsavel_padrao_aprovacao_id,
      estimativaHorasAprovacao: semSla.data.estimativa_horas_aprovacao,
      slaHorasAprovacao: null,
      responsavelPadraoTriagemId: semSla.data.responsavel_padrao_triagem_id,
      estimativaHorasTriagem: semSla.data.estimativa_horas_triagem,
      slaHorasTriagem: null,
    },
    erro: ERRO_MIGRACAO_PENDENTE,
  };
}

export async function atualizarConfiguracaoFluxo(
  patch: PatchConfiguracoesFluxo
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("configuracoes_fluxo").update(patch).eq("id", true);
  if (error) {
    console.error("Falha ao salvar responsável/SLA padrão:", error.message);
    return { ok: false, erro: error.message };
  }
  return { ok: true };
}
