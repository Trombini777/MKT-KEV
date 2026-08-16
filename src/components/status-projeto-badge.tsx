import { cn } from "@/lib/utils";
import type { StatusProjeto } from "@/lib/mock";

const STYLES: Record<StatusProjeto, string> = {
  Planejado: "bg-muted text-muted-foreground",
  Ativo: "bg-primary text-primary-foreground",
  Concluído: "bg-muted text-muted-foreground",
  Cancelado: "bg-muted text-muted-foreground",
};

export function StatusProjetoBadge({ status }: { status: StatusProjeto }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
