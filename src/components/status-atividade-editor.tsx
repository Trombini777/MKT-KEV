"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { StatusAtividade } from "@/lib/mock";

const STYLES: Record<StatusAtividade, string> = {
  Ativa: "bg-primary text-primary-foreground",
  Pausada: "bg-warning/15 text-warning",
  Concluída: "bg-success/10 text-success",
  Arquivada: "bg-muted text-muted-foreground",
};

const OPCOES: StatusAtividade[] = ["Ativa", "Pausada", "Concluída", "Arquivada"];

/** Badge de status clicável — abre um select pra trocar o status na hora, sem precisar de um form separado. */
export function StatusAtividadeEditor({
  status,
  onChange,
}: {
  status: StatusAtividade;
  onChange: (novoStatus: StatusAtividade) => void;
}) {
  return (
    <Select value={status} onValueChange={(v) => v && onChange(v as StatusAtividade)}>
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
