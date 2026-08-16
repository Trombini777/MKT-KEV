"use client";

import { TaskLink } from "@/components/task-link";
import { useTasks } from "@/lib/task-store";
import { dataParaIso, gerarGradeMes, DIAS_SEMANA_CURTO, NOMES_MESES } from "@/lib/hoje";
import { nomeTipo, type Tarefa } from "@/lib/mock";

export function CalendarioEditorial() {
  const tasks = useTasks();
  const hoje = new Date();
  const celulas = gerarGradeMes(hoje.getFullYear(), hoje.getMonth());

  const tarefasPorDia = new Map<string, Tarefa[]>();
  for (const t of tasks) {
    if (!t.prazo) continue;
    const lista = tarefasPorDia.get(t.prazo) ?? [];
    lista.push(t);
    tarefasPorDia.set(t.prazo, lista);
  }

  const hojeIso = dataParaIso(hoje);

  return (
    <div>
      <p className="mb-3 text-sm font-medium capitalize">
        {NOMES_MESES[hoje.getMonth()]} de {hoje.getFullYear()}
      </p>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60">
        {DIAS_SEMANA_CURTO.map((d) => (
          <div key={d} className="bg-muted/50 px-2 py-1.5 text-center text-xs text-muted-foreground">
            {d}
          </div>
        ))}
        {celulas.map((data, i) => {
          if (!data) return <div key={i} className="min-h-24 bg-background" />;
          const iso = dataParaIso(data);
          const tarefas = tarefasPorDia.get(iso) ?? [];
          const ehHoje = iso === hojeIso;
          return (
            <div key={i} className="flex min-h-24 flex-col gap-1 bg-background p-1.5">
              <span
                className={`self-start rounded-full px-1.5 text-xs ${
                  ehHoje ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {data.getDate()}
              </span>
              {tarefas.slice(0, 3).map((t) => (
                <TaskLink
                  key={t.id}
                  taskId={t.id}
                  className="truncate rounded bg-muted px-1.5 py-0.5 text-[0.68rem] hover:bg-muted/70"
                >
                  {nomeTipo(t.tipoId)}: {t.titulo}
                </TaskLink>
              ))}
              {tarefas.length > 3 && (
                <span className="px-1.5 text-[0.65rem] text-muted-foreground">
                  +{tarefas.length - 3}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
