import { Fragment } from "react";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { cn } from "@/lib/utils";
import {
  COLABORADORES,
  capacidadeDiaria,
  horasAlocadasPorDia,
  nivelCarga,
  type DiaGrade,
  type Tarefa,
} from "@/lib/mock";

const NIVEL_CLASSES: Record<string, string> = {
  good: "bg-success/10 text-success",
  warn: "bg-warning/15 text-warning",
  crit: "bg-destructive/10 text-destructive",
  off: "bg-muted/50 text-muted-foreground/50",
};

export function PersonDayGrid({
  dias,
  overrides = {},
  colaboradorId,
  tarefas,
}: {
  dias: DiaGrade[];
  overrides?: Record<string, string>;
  colaboradorId?: string;
  /** Tarefas ao vivo (via useTasks()) — sem isso, cai no array estático do seed. */
  tarefas?: Tarefa[];
}) {
  const colaboradoresAtivos = COLABORADORES.filter(
    (c) => c.status !== "Inativo" && (!colaboradorId || c.id === colaboradorId)
  );

  return (
    <div
      className="grid w-full gap-1.5"
      style={{ gridTemplateColumns: `10rem repeat(${dias.length}, minmax(0, 1fr))` }}
    >
      <div />
      {dias.map((dia) => (
        <div
          key={dia.iso}
          className={cn(
            "text-center text-xs",
            dia.fimDeSemana ? "text-muted-foreground/50" : "text-muted-foreground"
          )}
        >
          {dia.label}
        </div>
      ))}

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
              const horas = horasAlocadasPorDia(colaborador.id, dia.iso, overrides, tarefas);
              const nivel = dia.fimDeSemana ? "off" : nivelCarga(horas, capacidade);
              return (
                <div
                  key={`${colaborador.id}-${dia.iso}`}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-md text-xs font-medium",
                    NIVEL_CLASSES[nivel]
                  )}
                  title={`${horas}h alocadas de ${capacidade}h`}
                >
                  {horas > 0 ? `${horas}h` : dia.fimDeSemana ? "" : "-"}
                </div>
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
}
