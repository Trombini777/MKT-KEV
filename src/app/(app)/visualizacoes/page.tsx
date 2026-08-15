"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { KanbanBoard } from "@/components/kanban-board";
import { ListaTarefas } from "@/components/lista-tarefas";
import { CalendarioEditorial } from "@/components/calendario-editorial";
import { WorkloadView } from "@/components/workload-view";
import { cn } from "@/lib/utils";
import { isoHoje, diasEntre } from "@/lib/hoje";
import { useTasks, addTask, moveTask } from "@/lib/task-store";
import { FASES, TIPOS_TAREFA } from "@/lib/mock";

const PRIMEIRA_FASE = [...FASES].sort((a, b) => a.ordem - b.ordem)[0];

export default function VisualizacoesPage() {
  const tasks = useTasks();
  const [criando, setCriando] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");

  function confirmarNovaTarefa() {
    const titulo = novoTitulo.trim();
    if (!titulo) {
      setCriando(false);
      return;
    }
    addTask({
      titulo,
      descricao: "",
      tipoId: TIPOS_TAREFA[0]?.id ?? "",
      origem: "Projeto",
      prioridadeFinal: "Normal",
      faseAtualId: PRIMEIRA_FASE?.id ?? "",
      dataInicio: isoHoje(),
    });
    setNovoTitulo("");
    setCriando(false);
  }

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

          {criando ? (
            <div className="flex items-center gap-1.5">
              <Input
                autoFocus
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                placeholder="Nome da tarefa"
                className="h-8 w-64"
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmarNovaTarefa();
                  if (e.key === "Escape") setCriando(false);
                }}
              />
              <Button onClick={confirmarNovaTarefa}>Adicionar</Button>
              <Button variant="ghost" onClick={() => setCriando(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              className="h-8 gap-1.5 rounded-full px-5 shadow-sm"
              onClick={() => {
                setCriando(true);
                setNovoTitulo("");
              }}
            >
              <Plus className="size-4" />
              Nova tarefa
            </Button>
          )}
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
