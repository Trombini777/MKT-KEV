"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { StatusProjeto } from "@/lib/mock";

const STYLES: Record<StatusProjeto, string> = {
  Planejado: "bg-muted text-muted-foreground",
  Ativo: "bg-primary text-primary-foreground",
  Concluído: "bg-muted text-muted-foreground",
  Cancelado: "bg-muted text-muted-foreground",
};

const OPCOES: StatusProjeto[] = ["Planejado", "Ativo", "Concluído", "Cancelado"];

/** Badge de status clicável — abre um select pra trocar o status na hora, sem precisar de um form separado. */
export function StatusProjetoEditor({
  status,
  onChange,
}: {
  status: StatusProjeto;
  onChange: (novoStatus: StatusProjeto) => void;
}) {
  return (
    <Select value={status} onValueChange={(v) => v && onChange(v as StatusProjeto)}>
      <SelectTrigger
        className={cn(
          "h-auto w-fit gap-1 rounded-full border-0 px-2 py-0.5 text-xs font-semibold shadow-none [&_svg]:size-3",
          STYLES[status]
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        {OPCOES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
