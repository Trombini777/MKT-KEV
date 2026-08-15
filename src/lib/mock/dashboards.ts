import { TAREFAS } from "./tarefas";
import { COLABORADORES } from "./colaboradores";
import { FASES } from "./fluxo";
import { DEPARTAMENTOS } from "../departamentos";
import { estaEmRisco } from "./tarefas";

export function resumoProdutividade() {
  const hoje = new Date();
  const em7dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);

  const ativas = TAREFAS.filter((t) => t.faseAtualId !== "concluido");
  const aVencer = ativas.filter(
    (t) => t.prazo && new Date(t.prazo) >= hoje && new Date(t.prazo) <= em7dias
  );
  const atrasadas = ativas.filter((t) => t.prazo && new Date(t.prazo) < hoje);
  const emRisco = ativas.filter(estaEmRisco);

  return {
    ativas: ativas.length,
    aVencer: aVencer.length,
    atrasadas: atrasadas.length,
    emRisco: emRisco.length,
  };
}

export function atividadesPorPessoa() {
  return COLABORADORES.map((c) => {
    const ativas = TAREFAS.filter(
      (t) =>
        t.faseAtualId !== "concluido" &&
        (t.executoresPorFase[t.faseAtualId] ?? []).includes(c.id)
    ).length;
    const concluidas = TAREFAS.filter(
      (t) => t.faseAtualId === "concluido" && (t.executoresPorFase["em-execucao"] ?? []).includes(c.id)
    ).length;
    return { colaborador: c, ativas, concluidas };
  }).sort((a, b) => b.ativas - a.ativas);
}

export function atividadesPorEtapa() {
  return FASES.map((f) => ({
    fase: f,
    total: TAREFAS.filter((t) => t.faseAtualId === f.id).length,
  }));
}

export function atividadesPorSquad() {
  const squads = new Map<string, number>();
  for (const t of TAREFAS) {
    const executorId = t.executoresPorFase[t.faseAtualId]?.[0];
    if (!executorId) continue;
    const colaborador = COLABORADORES.find((c) => c.id === executorId);
    if (!colaborador) continue;
    squads.set(colaborador.squadId, (squads.get(colaborador.squadId) ?? 0) + 1);
  }
  return squads;
}

export function atividadesPorDepartamento() {
  const contagem = new Map<string, number>();
  for (const t of TAREFAS) {
    if (t.origem !== "Solicitação" || !t.departamento) continue;
    contagem.set(t.departamento, (contagem.get(t.departamento) ?? 0) + 1);
  }
  return DEPARTAMENTOS.map((d) => ({ departamento: d, total: contagem.get(d) ?? 0 })).filter(
    (d) => d.total > 0
  );
}

export const COMPARATIVO_SEMANAL = [
  { semana: "22/07", planejado: 14, entregue: 12 },
  { semana: "29/07", planejado: 16, entregue: 15 },
  { semana: "05/08", planejado: 15, entregue: 11 },
  { semana: "12/08", planejado: 18, entregue: 9 },
];
