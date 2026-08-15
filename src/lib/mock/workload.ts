import { TAREFAS } from "./tarefas";
import { COLABORADORES } from "./colaboradores";
import type { Tarefa } from "./types";

export type DiaGrade = { iso: string; label: string; fimDeSemana: boolean };

const DIAS_SEMANA_CURTO = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function gerarDias(base: Date, quantidade: number): DiaGrade[] {
  const dias: DiaGrade[] = [];
  for (let i = 0; i < quantidade; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const diaSemana = d.getDay();
    dias.push({
      iso: toIso(d),
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

export function horasAlocadasPorDia(
  colaboradorId: string,
  diaIso: string,
  overrides: Record<string, string> = {},
  tarefas: Tarefa[] = TAREFAS
): number {
  let total = 0;
  for (const tarefa of tarefas) {
    if (tarefa.faseAtualId === "concluido") continue;

    if (tarefa.planejamento) {
      for (const etapa of tarefa.planejamento.etapas) {
        if (etapa.colaboradorId !== colaboradorId) continue;
        for (const alocacao of etapa.alocacoes) {
          if (alocacao.data === diaIso) total += alocacao.horas;
        }
      }
      continue;
    }

    const executores = tarefa.executoresPorFase[tarefa.faseAtualId] ?? [];
    if (!executores.includes(colaboradorId)) continue;
    const dataAlocada = overrides[tarefa.id] ?? tarefa.dataInicio;
    if (dataAlocada === diaIso) {
      total += tarefa.estimativaPorFase[tarefa.faseAtualId] ?? 0;
    }
  }
  return total;
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
