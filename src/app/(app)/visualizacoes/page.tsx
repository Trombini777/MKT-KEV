"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { KanbanBoard } from "@/components/kanban-board";
import { ListaTarefas } from "@/components/lista-tarefas";
import { CalendarioEditorial } from "@/components/calendario-editorial";
import { WorkloadView } from "@/components/workload-view";
import { NovaAtividadeDialog } from "@/components/nova-atividade-dialog";
import { cn } from "@/lib/utils";
import { isoHoje, diasEntre } from "@/lib/hoje";
import { useTasks, moveTask, recarregarTarefas } from "@/lib/task-store";
import { useEtapas } from "@/lib/etapa-store";
import { useColaboradores } from "@/lib/colaborador-store";
import { useTiposTarefa } from "@/lib/tipo-tarefa-store";

export default function VisualizacoesPage() {
  const tasks = useTasks();
  // KanbanBoard/ListaTarefas leem etapaById/nomeColaborador/nomeTipo direto (sem hook) —
  // assinar aqui garante que a página re-renderize assim que esses catálogos hidratarem do
  // Supabase.
  useEtapas();
  useColaboradores();
  useTiposTarefa();

  const hoje = isoHoje();
  const ativas = tasks.filter((t) => t.faseAtualId !== "concluido");
  const atrasadas = ativas.filter((t) => t.prazo && diasEntre(hoje, t.prazo) < 0).length;
  const emDia = ativas.length - atrasadas;

  return (
    <div>
      <PageHeader
        title="Gestão de Tarefas"
        description="Kanban, Lista, Calendário e Workload sobre o mesmo conjunto de tarefas."
      />

      <Tabs defaultValue="kanban">
        <div className="flex items-center gap-3">
          <div className="flex h-8 items-center gap-0.5 rounded-lg bg-muted p-[3px] text-xs">
            <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{tasks.length}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1">
              <span className="text-muted-foreground">Em dia</span>
              <span className="font-semibold text-success">{emDia}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1">
              <span className="text-muted-foreground">Atrasadas</span>
              <span
                className={cn("font-semibold", atrasadas > 0 && "text-destructive")}
              >
                {atrasadas}
              </span>
            </div>
          </div>

          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
          </TabsList>

          <NovaAtividadeDialog onCriada={recarregarTarefas} />
        </div>

        <TabsContent value="kanban" className="mt-4">
          <KanbanBoard tasks={tasks} onMoverTarefa={moveTask} />
        </TabsContent>
        <TabsContent value="lista" className="mt-4">
          <ListaTarefas />
        </TabsContent>
        <TabsContent value="calendario" className="mt-4">
          <CalendarioEditorial />
        </TabsContent>
        <TabsContent value="workload" className="mt-4">
          <WorkloadView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
