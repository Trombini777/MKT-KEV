import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { PriorityBadge } from "@/components/priority-badge";
import { TaskLink } from "@/components/task-link";
import { cn } from "@/lib/utils";
import { nomeTipo, nomeColaborador, estaEmRisco, horasEstimadasTarefa } from "@/lib/mock";
import type { StatusAtividade, Tarefa } from "@/lib/mock";
import { decimalParaHorario } from "@/lib/time-format";
import { isoHoje } from "@/lib/hoje";

function formatData(iso: string) {
  if (!iso) return null;
  const [, mes, dia] = iso.split("T")[0].split("-");
  return `${dia}/${mes}`;
}

const STATUS_ATIVIDADE_CLASSES: Record<StatusAtividade, string> = {
  Ativa: "bg-primary/15 text-primary",
  Pausada: "bg-warning/15 text-warning",
  Concluída: "bg-success/10 text-success",
  Arquivada: "bg-muted text-muted-foreground",
};

/** Quem executou por último: a etapa atual (planejamento em andamento), a última etapa (já
 * concluída) ou, sem planejamento aplicado ainda, o executor legado da fase atual. */
function executorDaTarefa(tarefa: Tarefa): string | undefined {
  if (tarefa.planejamento) {
    const { etapas, etapaAtualOrdem } = tarefa.planejamento;
    if (tarefa.faseAtualId === "concluido") {
      const ultima = etapas.reduce((max, e) => (e.ordem > max.ordem ? e : max), etapas[0]);
      return ultima?.colaboradorId;
    }
    return etapas.find((e) => e.ordem === etapaAtualOrdem)?.colaboradorId;
  }
  return tarefa.executoresPorFase[tarefa.faseAtualId]?.[0];
}

export function TaskListRow({ tarefa }: { tarefa: Tarefa }) {
  const emRisco = estaEmRisco(tarefa);
  const concluida = tarefa.faseAtualId === "concluido";
  const executorId = executorDaTarefa(tarefa);
  const horasPrevistas = horasEstimadasTarefa(tarefa);

  // Data em que o card entrou na fase "concluido" — último evento de histórico que registra essa
  // mudança de fase (ver inserirHistorico em task-store.ts, sempre chamado com faseId no momento
  // da transição).
  const eventoConclusao = concluida
    ? [...tarefa.historico].reverse().find((h) => h.faseId === "concluido")
    : undefined;
  const dataConclusao = eventoConclusao ? formatData(eventoConclusao.data) : null;
  const prazo = formatData(tarefa.prazo);

  // Atrasada = passou do prazo sem concluir (referência = hoje) OU concluiu depois do prazo
  // (referência = data da conclusão). Sem prazo definido, não dá pra dizer se está atrasada.
  const referenciaPrazo = eventoConclusao ? eventoConclusao.data.slice(0, 10) : isoHoje();
  const atrasada = tarefa.prazo ? referenciaPrazo > tarefa.prazo : false;

  return (
    <TaskLink
      taskId={tarefa.id}
      className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
    >
      <span title={executorId ? nomeColaborador(executorId) : "Sem responsável"}>
        <ColaboradorAvatar
          colaboradorId={executorId}
          className="size-7 shrink-0"
          fallbackClassName="text-xs"
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{tarefa.titulo}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <PriorityBadge prioridade={tarefa.prioridadeFinal} />
          <span className="text-xs text-muted-foreground">{nomeTipo(tarefa.tipoId)}</span>
          <span className="text-xs text-muted-foreground">{decimalParaHorario(horasPrevistas)}</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold",
              STATUS_ATIVIDADE_CLASSES[tarefa.statusAtividade]
            )}
          >
            {tarefa.statusAtividade}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        {/* "Atrasada" já é mais concreto que "em risco" (previsão ainda dentro do prazo, mas
            projetada pra passar dele) — não mostra os dois juntos pra não empilhar dois avisos
            vermelhos dizendo basicamente a mesma coisa. */}
        {emRisco && !concluida && !atrasada && (
          <p className="text-xs font-semibold text-destructive">em risco</p>
        )}
        {concluida ? (
          <>
            {dataConclusao && (
              <p className="text-xs text-muted-foreground">concluída em {dataConclusao}</p>
            )}
            {/* Sem o evento de histórico que marca a transição pra "concluido", não sabemos QUANDO
                foi concluída — comparar o prazo contra hoje nesse caso diria "atrasada" pra
                qualquer tarefa velha já concluída, mesmo tendo terminado dentro do prazo. */}
            {tarefa.prazo && eventoConclusao && (
              <p className={cn("text-xs font-medium", atrasada ? "text-destructive" : "text-success")}>
                {atrasada ? "atrasada" : "no prazo"}
              </p>
            )}
          </>
        ) : (
          <>
            {prazo && <p className="text-xs text-muted-foreground">prazo {prazo}</p>}
            {tarefa.prazo && atrasada && <p className="text-xs font-medium text-destructive">atrasada</p>}
          </>
        )}
      </div>
    </TaskLink>
  );
}
