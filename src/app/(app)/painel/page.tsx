"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { TaskExecutionList } from "@/components/task-execution-list";
import { WorkloadView } from "@/components/workload-view";
import { useTasks } from "@/lib/task-store";
import {
  COLABORADORES,
  USUARIO_ATUAL_ID,
  colaboradorById,
  ordenarPorPrioridadeEPrazo,
  tarefasExecutadasPor,
} from "@/lib/mock";

export default function PainelDeTrabalhoPage() {
  const usuario = colaboradorById(USUARIO_ATUAL_ID)!;
  const tarefas = useTasks();

  const minhasExecucoes = ordenarPorPrioridadeEPrazo(tarefasExecutadasPor(usuario.id, tarefas));

  return (
    <div>
      <PageHeader
        title={`Olá, ${usuario.nome.split(" ")[0]}`}
        description="Seu painel de trabalho: o que fazer agora e o que está chegando."
      />

      <Card className="mt-4">
        <CardContent className="py-4">
          <WorkloadView title="Workload" pessoaId={usuario.id} />
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold">Lista de atividades</h2>
        <TaskExecutionList tarefas={minhasExecucoes} />
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        {COLABORADORES.length} pessoas no time · dados de exemplo, ainda sem backend real.
      </p>
    </div>
  );
}
