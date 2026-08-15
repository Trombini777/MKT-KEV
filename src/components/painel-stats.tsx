"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { isoHoje, diasEntre } from "@/lib/hoje";
import { estaEmRisco, type Tarefa } from "@/lib/mock";

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-4">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p className={cn("text-2xl font-semibold", valueClassName)}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function PainelStats({
  minhasExecucoes,
  entrandoEmBreve,
  capacidadeDiaria,
}: {
  minhasExecucoes: Tarefa[];
  entrandoEmBreve: Tarefa[];
  capacidadeDiaria: number;
}) {
  const hoje = isoHoje();

  const tarefasHoje = minhasExecucoes.filter(
    (t) => t.execucaoEtapaAte && diasEntre(hoje, t.execucaoEtapaAte) <= 0
  );
  const horasHoje = tarefasHoje.reduce(
    (acc, t) => acc + (t.estimativaPorFase[t.faseAtualId] ?? 0),
    0
  );
  const atrasadas = minhasExecucoes.filter(estaEmRisco).length;
  const totalAtividades = minhasExecucoes.length + entrandoEmBreve.length;
  const capacidadePct =
    capacidadeDiaria > 0 ? Math.round((horasHoje / capacidadeDiaria) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatCard label="Etapas hoje" value={tarefasHoje.length} />
      <StatCard label="Atividades" value={totalAtividades} />
      <StatCard label="Horas hoje" value={`${horasHoje}h`} />
      <StatCard
        label="Atrasadas"
        value={atrasadas}
        valueClassName={atrasadas > 0 ? "text-destructive" : undefined}
      />
      <StatCard
        label="Capacidade hoje"
        value={`${capacidadePct}%`}
        valueClassName={
          capacidadePct > 100
            ? "text-destructive"
            : capacidadePct >= 80
              ? "text-warning"
              : undefined
        }
      />
    </div>
  );
}
