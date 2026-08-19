import { Fragment, useState } from "react";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { TaskLink } from "@/components/task-link";
import { cn } from "@/lib/utils";
import {
  COLABORADORES,
  capacidadeDiaria,
  colaboradorEhOperacional,
  itensAlocadosPorDia,
  nivelCarga,
  type DiaGrade,
  type Tarefa,
} from "@/lib/mock";
import { decimalParaHorario } from "@/lib/time-format";

const NIVEL_CLASSES: Record<string, string> = {
  good: "bg-success/10 text-success",
  warn: "bg-warning/15 text-warning",
  crit: "bg-destructive/10 text-destructive",
  off: "bg-muted/50 text-muted-foreground/50 dark:text-muted-foreground/85",
};

export function PersonDayGrid({
  dias,
  overrides = {},
  colaboradorId,
  tarefas,
  diaSelecionado,
  onSelecionarDia,
  mostrarAtividades = false,
}: {
  dias: DiaGrade[];
  overrides?: Record<string, string>;
  colaboradorId?: string;
  /** Tarefas ao vivo (via useTasks()) — sem isso, cai no array estático do seed. */
  tarefas?: Tarefa[];
  /** Dia (iso) atualmente filtrado — realça a coluna inteira. */
  diaSelecionado?: string | null;
  /** Presente só quando o clique no dia deve filtrar algo (Painel de Trabalho) — sem isso, a
   * grade fica só informativa, sem hover/clique nos dias. */
  onSelecionarDia?: (iso: string) => void;
  /** Lista, embaixo da hora de cada célula, as atividades que compõem aquele total — só faz
   * sentido na grade completa (Workload dentro de Gestão de Tarefas). No Workload resumido do
   * Painel de Trabalho a célula mostra só a hora, sem detalhar. */
  mostrarAtividades?: boolean;
}) {
  const [diaEmFoco, setDiaEmFoco] = useState<string | null>(null);
  // O filtro de "não operacional" só vale pra grade geral (todo o time) — quando um colaborador
  // específico é pedido (ex.: o próprio Painel de Trabalho da pessoa), ela deve aparecer mesmo
  // sendo "Não operacional", já que continua acessando a plataforma normalmente.
  const colaboradoresAtivos = COLABORADORES.filter(
    (c) =>
      c.status !== "Inativo" &&
      (colaboradorId ? c.id === colaboradorId : colaboradorEhOperacional(c))
  );
  const interativo = onSelecionarDia != null;

  return (
    <div
      className="grid w-full gap-1.5"
      style={{ gridTemplateColumns: `10rem repeat(${dias.length}, minmax(0, 1fr))` }}
    >
      <div />
      {dias.map((dia) => {
        const emDestaque = dia.iso === diaEmFoco || dia.iso === diaSelecionado;
        return (
          <div
            key={dia.iso}
            className={cn(
              "text-center text-xs transition-colors",
              dia.fimDeSemana ? "text-muted-foreground/50" : "text-muted-foreground",
              emDestaque && "font-semibold text-primary"
            )}
          >
            {dia.label}
          </div>
        );
      })}

      {colaboradoresAtivos.map((colaborador) => {
        const capacidade = capacidadeDiaria(colaborador.id);
        return (
          <Fragment key={colaborador.id}>
            <div className="flex items-center gap-2 py-1 text-sm">
              <ColaboradorAvatar
                colaboradorId={colaborador.id}
                className="size-6"
                fallbackClassName="text-[0.65rem]"
              />
              <span className="truncate">{colaborador.nome.split(" ")[0]}</span>
            </div>
            {dias.map((dia) => {
              const itens = itensAlocadosPorDia(colaborador.id, dia.iso, overrides, tarefas);
              const horas = itens.reduce((soma, item) => soma + item.horas, 0);
              const nivel = dia.fimDeSemana ? "off" : nivelCarga(horas, capacidade);
              const selecionado = dia.iso === diaSelecionado;
              return (
                <div
                  key={`${colaborador.id}-${dia.iso}`}
                  role={interativo ? "button" : undefined}
                  tabIndex={interativo ? 0 : undefined}
                  onMouseEnter={() => interativo && setDiaEmFoco(dia.iso)}
                  onMouseLeave={() => interativo && setDiaEmFoco((atual) => (atual === dia.iso ? null : atual))}
                  onClick={() => onSelecionarDia?.(dia.iso)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md p-1 text-xs font-medium transition-colors",
                    mostrarAtividades ? "min-h-9" : "h-9 justify-center",
                    NIVEL_CLASSES[nivel],
                    interativo && "cursor-pointer",
                    selecionado && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                  )}
                  title={`${decimalParaHorario(horas)} alocadas de ${decimalParaHorario(capacidade)}`}
                >
                  <span className="flex h-5 items-center">
                    {horas > 0 ? decimalParaHorario(horas) : dia.fimDeSemana ? "" : "-"}
                  </span>
                  {mostrarAtividades && itens.length > 0 && (
                    <div className="flex w-full flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                      {itens.map((item, i) => (
                        <TaskLink
                          key={`${item.tarefa.id}-${i}`}
                          taskId={item.tarefa.id}
                          title={`${item.etapaNome}: ${item.tarefa.titulo} (${decimalParaHorario(item.horas)} nesse dia)`}
                          className="block truncate rounded bg-background/60 px-1 py-0.5 text-left text-[0.65rem] font-medium text-foreground hover:bg-background/90"
                        >
                          {item.etapaNome}: {item.tarefa.titulo}
                        </TaskLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}
