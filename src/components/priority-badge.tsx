import { cn } from "@/lib/utils";
import type { PrioridadeFinal } from "@/lib/mock";

const STYLES: Record<PrioridadeFinal, string> = {
  Crítica: "bg-destructive/10 text-destructive",
  Alta: "bg-warning/15 text-warning",
  Normal: "bg-muted text-muted-foreground",
  Baixa: "border border-border text-muted-foreground",
};

const LABEL: Record<PrioridadeFinal, string> = {
  Crítica: "Crítica",
  Alta: "Alta",
  Normal: "Média",
  Baixa: "Baixa",
};

export function PriorityBadge({ prioridade }: { prioridade: PrioridadeFinal }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        STYLES[prioridade]
      )}
    >
      {LABEL[prioridade]}
    </span>
  );
}
