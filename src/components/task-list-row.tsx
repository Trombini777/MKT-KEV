import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { PriorityBadge } from "@/components/priority-badge";
import { TaskLink } from "@/components/task-link";
import { nomeTipo, estaEmRisco } from "@/lib/mock";
import type { Tarefa } from "@/lib/mock";

function formatData(iso: string) {
  if (!iso) return null;
  const [, mes, dia] = iso.split("T")[0].split("-");
  return `${dia}/${mes}`;
}

export function TaskListRow({ tarefa, executorId }: { tarefa: Tarefa; executorId?: string }) {
  const emRisco = estaEmRisco(tarefa);
  const prazo = formatData(tarefa.prazo);

  return (
    <TaskLink
      taskId={tarefa.id}
      className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
    >
      <ColaboradorAvatar
        colaboradorId={executorId}
        className="size-7 shrink-0"
        fallbackClassName="text-xs"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{tarefa.titulo}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <PriorityBadge prioridade={tarefa.prioridadeFinal} />
          <span className="text-xs text-muted-foreground">{nomeTipo(tarefa.tipoId)}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        {emRisco && <p className="text-xs font-semibold text-destructive">em risco</p>}
        {prazo && <p className="text-xs text-muted-foreground">prazo {prazo}</p>}
      </div>
    </TaskLink>
  );
}
