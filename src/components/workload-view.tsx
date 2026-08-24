"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonDayGrid } from "@/components/person-day-grid";
import { gerarDias, tarefaContaNoWorkload, type Tarefa } from "@/lib/mock";
import { useTasks } from "@/lib/task-store";
import { TABS_ATIVO_PRIMARY_CLASS } from "@/lib/utils";

export function WorkloadView({
  title,
  pessoaId,
  colaboradoresIds,
  diaSelecionado,
  onSelecionarDia,
  mostrarAtividades = false,
  tarefas: tarefasProp,
}: {
  title?: string;
  pessoaId?: string;
  /** Restringe as linhas da grade a esses ids (ex.: filtro de Executor em Gestão de Tarefas) —
   * sem isso, mostra todo o time operacional. Ignorado quando `pessoaId` também é passado. */
  colaboradoresIds?: string[];
  diaSelecionado?: string | null;
  onSelecionarDia?: (iso: string) => void;
  /** Detalha embaixo da hora as atividades que a compõem — só na grade completa de Gestão de
   * Tarefas, não no resumo do Painel de Trabalho. */
  mostrarAtividades?: boolean;
  /** Sobrescreve a lista ao vivo (útil quando a página já filtrou por status, ex.: Gestão de
   * Tarefas) — sem isso, cai no useTasks() padrão. */
  tarefas?: Tarefa[];
} = {}) {
  const [intervalo, setIntervalo] = useState("7");
  const dias = useMemo(() => gerarDias(new Date(), Number(intervalo)), [intervalo]);
  const tasksHook = useTasks();
  const todasTarefas = tarefasProp ?? tasksHook;
  const tarefas = useMemo(() => todasTarefas.filter(tarefaContaNoWorkload), [todasTarefas]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        {title ? (
          <p className="text-sm font-semibold">{title}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Grade pessoa x dia. Nunca bloqueia over-allocation, só sinaliza.
          </p>
        )}
        <Tabs value={intervalo} onValueChange={(v) => v && setIntervalo(v)}>
          <TabsList>
            <TabsTrigger value="7" className={TABS_ATIVO_PRIMARY_CLASS}>
              7D
            </TabsTrigger>
            <TabsTrigger value="15" className={TABS_ATIVO_PRIMARY_CLASS}>
              15D
            </TabsTrigger>
            <TabsTrigger value="30" className={TABS_ATIVO_PRIMARY_CLASS}>
              30D
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <PersonDayGrid
        dias={dias}
        colaboradorId={pessoaId}
        colaboradoresIds={colaboradoresIds}
        tarefas={tarefas}
        diaSelecionado={diaSelecionado}
        onSelecionarDia={onSelecionarDia}
        mostrarAtividades={mostrarAtividades}
      />
    </div>
  );
}
