"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonDayGrid } from "@/components/person-day-grid";
import { gerarDias } from "@/lib/mock";
import { useTasks } from "@/lib/task-store";

const FILTRO_ATIVO_CLASS =
  "data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground";

export function WorkloadView({
  title,
  pessoaId,
}: { title?: string; pessoaId?: string } = {}) {
  const [intervalo, setIntervalo] = useState("7");
  const dias = useMemo(() => gerarDias(new Date(), Number(intervalo)), [intervalo]);
  const tarefas = useTasks();

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
            <TabsTrigger value="7" className={FILTRO_ATIVO_CLASS}>
              7D
            </TabsTrigger>
            <TabsTrigger value="15" className={FILTRO_ATIVO_CLASS}>
              15D
            </TabsTrigger>
            <TabsTrigger value="30" className={FILTRO_ATIVO_CLASS}>
              30D
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <PersonDayGrid dias={dias} colaboradorId={pessoaId} tarefas={tarefas} />
    </div>
  );
}
