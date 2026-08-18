import { TAREFAS } from "./tarefas";
import { COLABORADORES } from "./colaboradores";
import { etapaById } from "./etapas";
import { faseById } from "./fluxo";
import type { Tarefa } from "./types";
import { dataParaIso, DIAS_SEMANA_CURTO, isoHoje } from "@/lib/hoje";

export type DiaGrade = { iso: string; label: string; fimDeSemana: boolean };

export function gerarDias(base: Date, quantidade: number): DiaGrade[] {
  const dias: DiaGrade[] = [];
  for (let i = 0; i < quantidade; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const diaSemana = d.getDay();
    dias.push({
      iso: dataParaIso(d),
      label: DIAS_SEMANA_CURTO[diaSemana],
      fimDeSemana: diaSemana === 0 || diaSemana === 6,
    });
  }
  return dias;
}

export function inicioDaSemana(base: Date): Date {
  const d = new Date(base);
  const diaSemana = d.getDay();
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana; // volta pra segunda-feira
  d.setDate(d.getDate() + diff);
  return d;
}

export type ItemAlocadoDia = { tarefa: Tarefa; etapaNome: string; horas: number };

/** Itens (tarefa + etapa + horas naquele dia) que compõem o total de `horasAlocadasPorDia` —
 * usado pra detalhar a grade de Workload, mostrando embaixo de cada célula quais atividades
 * formam a soma de horas daquele dia. */
export function itensAlocadosPorDia(
  colaboradorId: string,
  diaIso: string,
  overrides: Record<string, string> = {},
  tarefas: Tarefa[] = TAREFAS
): ItemAlocadoDia[] {
  const itens: ItemAlocadoDia[] = [];
  for (const tarefa of tarefas) {
    if (tarefa.faseAtualId === "concluido") continue;

    if (tarefa.planejamento) {
      // Etapa já concluída (ordem < etapaAtualOrdem) com alocação NO FUTURO (depois de hoje) não
      // conta mais — esse compromisso não vai acontecer, já que o trabalho foi resolvido antes da
      // data planejada. Alocação de hoje ou de um dia que já passou continua contando: é tempo
      // que já foi (ou está sendo) gasto de verdade nessa atividade, não uma previsão fantasma.
      // As alocações continuam salvas no banco (nada é apagado) — servem de histórico pra quando
      // existir uma visão de Workload passado.
      const diaEhFuturo = diaIso > isoHoje();
      for (const etapa of tarefa.planejamento.etapas) {
        if (etapa.colaboradorId !== colaboradorId) continue;
        if (diaEhFuturo && etapa.ordem < tarefa.planejamento.etapaAtualOrdem) continue;
        const horasNoDia = etapa.alocacoes
          .filter((a) => a.data === diaIso)
          .reduce((soma, a) => soma + a.horas, 0);
        if (horasNoDia > 0) {
          itens.push({ tarefa, etapaNome: etapaById(etapa.etapaId)?.nome ?? "—", horas: horasNoDia });
        }
      }
      continue;
    }

    const executores = tarefa.executoresPorFase[tarefa.faseAtualId] ?? [];
    if (!executores.includes(colaboradorId)) continue;
    const dataAlocada = overrides[tarefa.id] ?? tarefa.dataInicio;
    if (dataAlocada === diaIso) {
      const horas = tarefa.estimativaPorFase[tarefa.faseAtualId] ?? 0;
      if (horas > 0) {
        itens.push({ tarefa, etapaNome: faseById(tarefa.faseAtualId)?.nome ?? "—", horas });
      }
    }
  }
  return itens;
}

export function horasAlocadasPorDia(
  colaboradorId: string,
  diaIso: string,
  overrides: Record<string, string> = {},
  tarefas: Tarefa[] = TAREFAS
): number {
  return itensAlocadosPorDia(colaboradorId, diaIso, overrides, tarefas).reduce(
    (soma, item) => soma + item.horas,
    0
  );
}

export function nivelCarga(horas: number, capacidadeDia: number): "good" | "warn" | "crit" | "off" {
  if (horas === 0) return "off";
  const pct = horas / capacidadeDia;
  if (pct > 1) return "crit";
  if (pct >= 0.8) return "warn";
  return "good";
}

export function capacidadeDiaria(colaboradorId: string): number {
  const colaborador = COLABORADORES.find((c) => c.id === colaboradorId);
  if (!colaborador) return 8;
  return Math.round((colaborador.capacidadeHorasSemana / 5) * 10) / 10;
}
