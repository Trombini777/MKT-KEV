"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColaboradorSheet } from "@/components/colaborador-sheet";
import {
  useColaboradores,
  adicionarColaborador,
  editarColaborador,
  excluirColaborador,
} from "@/lib/colaborador-store";
import { type Colaborador, type StatusColaborador } from "@/lib/mock";

const STATUS_VARIANT: Record<StatusColaborador, "default" | "outline" | "destructive" | "secondary"> = {
  Ativo: "default",
  "Em Licença": "outline",
  Férias: "secondary",
  "Não operacional": "outline",
  Inativo: "destructive",
};

// Todo status entra por padrão, exceto "Não operacional" — só aparece na lista se a pessoa marcar
// esse filtro explicitamente (ver pedido: não deve "aparecer de cara").
const TODOS_STATUS: StatusColaborador[] = ["Ativo", "Em Licença", "Férias", "Não operacional", "Inativo"];
const STATUS_PADRAO = TODOS_STATUS.filter((s) => s !== "Não operacional");

/** Termos de cargo, do mais sênior ao mais júnior — usado para ordenar a equipe da esquerda
 * (maior cargo) para a direita (menor cargo). Cargos que não batem com nenhum termo ficam no
 * nível intermediário (individual contributor). */
const NIVEIS_CARGO: { termo: string; nivel: number }[] = [
  { termo: "superintendente", nivel: 0 },
  { termo: "diretor", nivel: 0 },
  { termo: "diretora", nivel: 0 },
  { termo: "gerente", nivel: 1 },
  { termo: "coordenador", nivel: 2 },
  { termo: "coordenadora", nivel: 2 },
  { termo: "supervisor", nivel: 3 },
  { termo: "supervisora", nivel: 3 },
  { termo: "especialista", nivel: 4 },
  { termo: "sênior", nivel: 4 },
  { termo: "senior", nivel: 4 },
  { termo: "pleno", nivel: 5 },
  { termo: "júnior", nivel: 6 },
  { termo: "junior", nivel: 6 },
  { termo: "estagiário", nivel: 7 },
  { termo: "estagiaria", nivel: 7 },
];

function nivelDoCargo(cargo: string): number {
  const cargoLower = cargo.toLowerCase();
  for (const { termo, nivel } of NIVEIS_CARGO) {
    if (cargoLower.includes(termo)) return nivel;
  }
  return 5;
}

export function EquipeBoard() {
  const colaboradoresBrutos = useColaboradores();
  const [statusSelecionados, setStatusSelecionados] = useState<StatusColaborador[]>(STATUS_PADRAO);
  const colaboradores = colaboradoresBrutos
    .filter((c) => statusSelecionados.includes(c.status))
    .sort((a, b) => nivelDoCargo(a.cargo) - nivelDoCargo(b.cargo));
  const [colaboradorEditando, setColaboradorEditando] = useState<Colaborador | null>(null);

  function alternarFiltro(status: StatusColaborador, marcado: boolean) {
    setStatusSelecionados((atuais) =>
      marcado ? [...atuais, status] : atuais.filter((s) => s !== status)
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted">
            <ListFilter className="size-3.5" />
            Status
            {statusSelecionados.length < TODOS_STATUS.length && (
              <span className="grid size-4 place-items-center rounded-full bg-primary text-[0.65rem] font-semibold text-primary-foreground">
                {statusSelecionados.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {TODOS_STATUS.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusSelecionados.includes(status)}
                onCheckedChange={(marcado) => alternarFiltro(status, marcado)}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ColaboradorSheet onCriar={adicionarColaborador} />
      </div>

      <ColaboradorSheet
        key={colaboradorEditando?.id}
        colaboradorParaEditar={colaboradorEditando ?? undefined}
        onEditar={editarColaborador}
        onExcluir={excluirColaborador}
        open={colaboradorEditando !== null}
        onOpenChange={(v) => {
          if (!v) setColaboradorEditando(null);
        }}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colaboradores.map((c) => (
          <Card
            key={c.id}
            role="button"
            tabIndex={0}
            onClick={() => setColaboradorEditando(c)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setColaboradorEditando(c);
              }
            }}
            className="cursor-pointer transition-all hover:shadow-sm hover:ring-primary dark:hover:ring-primary/50"
          >
            <CardContent className="flex items-center gap-4 py-4">
              <Avatar className="size-16">
                {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt="" />}
                <AvatarFallback className="text-lg">{c.avatarIniciais}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{c.cargo}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge
                    variant={STATUS_VARIANT[c.status]}
                    className={c.status === "Não operacional" ? "text-muted-foreground/70" : undefined}
                  >
                    {c.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {c.capacidadeHorasSemana}h/semana
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
