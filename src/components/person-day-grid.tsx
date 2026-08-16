import { Fragment, useState } from "react";
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
  diaSelecionado,
  onSelecionarDia,
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
}) {
  const [diaEmFoco, setDiaEmFoco] = useState<string | null>(null);
  const colaboradoresAtivos = COLABORADORES.filter(
    (c) => c.status !== "Inativo" && (!colaboradorId || c.id === colaboradorId)
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
              const horas = horasAlocadasPorDia(colaborador.id, dia.iso, overrides, tarefas);
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
                    "flex h-9 items-center justify-center rounded-md text-xs font-medium transition-colors",
                    NIVEL_CLASSES[nivel],
                    interativo && "cursor-pointer",
                    selecionado && "ring-2 ring-primary ring-offset-1 ring-offset-background"
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
