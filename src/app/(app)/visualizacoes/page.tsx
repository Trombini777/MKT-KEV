"use client";

import { useState } from "react";
import { ListFilter, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/page-header";
import { KanbanBoard } from "@/components/kanban-board";
import { ListaTarefas } from "@/components/lista-tarefas";
import { CalendarioEditorial } from "@/components/calendario-editorial";
import { WorkloadView } from "@/components/workload-view";
import { NovaAtividadeDialog } from "@/components/nova-atividade-dialog";
import { cn } from "@/lib/utils";
import { isoHoje, diasEntre } from "@/lib/hoje";
import { ehTimeDeTecnologia } from "@/lib/kev-cargo";
import { useTasks, moveTask, recarregarTarefas } from "@/lib/task-store";
import { useEtapas } from "@/lib/etapa-store";
import { useColaboradores } from "@/lib/colaborador-store";
import { useTiposTarefa } from "@/lib/tipo-tarefa-store";
import { executorAtualDaTarefa, type StatusAtividade } from "@/lib/mock";

const TODOS_STATUS: StatusAtividade[] = ["Ativa", "Pausada", "Concluída", "Arquivada"];

export default function VisualizacoesPage() {
  const todasTarefas = useTasks();
  const colaboradores = useColaboradores();
  // KanbanBoard/ListaTarefas leem etapaById/nomeTipo direto (sem hook) — assinar aqui garante que
  // a página re-renderize assim que esses catálogos hidratarem do Supabase.
  useEtapas();
  useTiposTarefa();

  // Só "Ativa" marcada por padrão — os outros status (Pausada, Concluída, Arquivada) ficam fora
  // até a pessoa marcar explicitamente que quer vê-los também. Vale pras 4 visões (Kanban, Lista,
  // Calendário, Workload), que recebem essa mesma lista já filtrada.
  const [statusSelecionados, setStatusSelecionados] = useState<StatusAtividade[]>(["Ativa"]);

  function alternarFiltro(status: StatusAtividade, marcado: boolean) {
    setStatusSelecionados((atuais) =>
      marcado ? [...atuais, status] : atuais.filter((s) => s !== status)
    );
  }

  // Filtro de executor: todo mundo marcado por padrão, exceto o time de tecnologia (não são do
  // marketing, não têm tarefas de verdade — ver ehTimeDeTecnologia). `null` = a pessoa ainda não
  // mexeu no filtro — nesse caso o padrão é derivado direto do catálogo de colaboradores a cada
  // render (em vez de sincronizado via useEffect), então já nasce certo assim que hidratar.
  const [executoresSelecionados, setExecutoresSelecionados] = useState<string[] | null>(null);
  const colaboradoresTime = colaboradores.filter((c) => !ehTimeDeTecnologia(c.cargo));
  const colaboradoresTecnologia = colaboradores.filter((c) => ehTimeDeTecnologia(c.cargo));
  const executoresPadrao = colaboradoresTime.map((c) => c.id);
  const executoresAtivos = executoresSelecionados ?? executoresPadrao;

  function alternarExecutor(id: string, marcado: boolean) {
    setExecutoresSelecionados((atuais) => {
      const base = atuais ?? executoresPadrao;
      return marcado ? [...base, id] : base.filter((x) => x !== id);
    });
  }

  const tasksPorStatus = todasTarefas.filter((t) => statusSelecionados.includes(t.statusAtividade));
  const tasks = tasksPorStatus.filter((t) => {
    // Colaboradores ainda hidratando do Supabase: não filtra por executor ainda, senão toda
    // tarefa com executor some da tela até o catálogo carregar (executoresAtivos ficaria vazio).
    if (colaboradores.length === 0) return true;
    const executorId = executorAtualDaTarefa(t);
    return !executorId || executoresAtivos.includes(executorId);
  });

  // Filtro adicional (Total / Em dia / Atrasadas), independente do de status acima — clicar num
  // deles mostra só aquele recorte nas 4 visões, igual ao seletor de Kanban/Lista/Calendário/
  // Workload ao lado.
  const [filtroPrazo, setFiltroPrazo] = useState<"total" | "em-dia" | "atrasadas">("total");
  const hoje = isoHoje();
  const ativas = tasks.filter((t) => t.faseAtualId !== "concluido");
  const estaAtrasada = (t: (typeof ativas)[number]) => Boolean(t.prazo && diasEntre(hoje, t.prazo) < 0);
  const atrasadasTarefas = ativas.filter(estaAtrasada);
  const emDiaTarefas = ativas.filter((t) => !estaAtrasada(t));
  const tasksExibidas =
    filtroPrazo === "em-dia" ? emDiaTarefas : filtroPrazo === "atrasadas" ? atrasadasTarefas : tasks;

  return (
    <div>
      <PageHeader
        title="Gestão de Tarefas"
        description="Kanban, Lista, Calendário e Workload sobre o mesmo conjunto de tarefas."
      />

      <Tabs defaultValue="kanban">
        <div className="flex items-center gap-3">
          {/* Botões simples (não o componente Tabs) de propósito — dois <Tabs> aninhados
              acabavam com o destaque do de fora preso no valor inicial do de dentro. Mesmas
              classes visuais do TabsList/TabsTrigger, pra ficar idêntico ao seletor ao lado. */}
          <div className="inline-flex h-8 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-xs">
            {(
              [
                { valor: "total", label: "Total", contagem: tasks.length, corNumero: undefined },
                { valor: "em-dia", label: "Em dia", contagem: emDiaTarefas.length, corNumero: "text-success" },
                {
                  valor: "atrasadas",
                  label: "Atrasadas",
                  contagem: atrasadasTarefas.length,
                  corNumero: atrasadasTarefas.length > 0 ? "text-destructive" : undefined,
                },
              ] as const
            ).map((op) => (
              <button
                key={op.valor}
                type="button"
                onClick={() => setFiltroPrazo(op.valor)}
                className={cn(
                  "inline-flex h-[calc(100%-1px)] items-center gap-1.5 rounded-md px-2.5 font-medium transition-all",
                  filtroPrazo === op.valor
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/60 hover:text-foreground"
                )}
              >
                {op.label} <span className={cn("font-semibold", op.corNumero)}>{op.contagem}</span>
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted">
              <ListFilter className="size-3.5" />
              Status
              {statusSelecionados.length > 0 && statusSelecionados.length < TODOS_STATUS.length && (
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

          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted">
              <UserRound className="size-3.5" />
              Executor
              {executoresSelecionados !== null && (
                <span className="grid size-4 place-items-center rounded-full bg-primary text-[0.65rem] font-semibold text-primary-foreground">
                  {executoresAtivos.length}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {colaboradoresTime.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={executoresAtivos.includes(c.id)}
                  onCheckedChange={(marcado) => alternarExecutor(c.id, marcado)}
                >
                  {c.nome}
                </DropdownMenuCheckboxItem>
              ))}
              {colaboradoresTecnologia.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Time de tecnologia</DropdownMenuLabel>
                    {colaboradoresTecnologia.map((c) => (
                      <DropdownMenuCheckboxItem
                        key={c.id}
                        checked={executoresAtivos.includes(c.id)}
                        onCheckedChange={(marcado) => alternarExecutor(c.id, marcado)}
                      >
                        {c.nome}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
          </TabsList>

          <NovaAtividadeDialog onCriada={recarregarTarefas} />
        </div>

        <TabsContent value="kanban" className="mt-4">
          <KanbanBoard tasks={tasksExibidas} onMoverTarefa={moveTask} />
        </TabsContent>
        <TabsContent value="lista" className="mt-4">
          <ListaTarefas tarefas={tasksExibidas} />
        </TabsContent>
        <TabsContent value="calendario" className="mt-4">
          <CalendarioEditorial tarefas={tasksExibidas} />
        </TabsContent>
        <TabsContent value="workload" className="mt-4">
          <WorkloadView mostrarAtividades tarefas={tasksExibidas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
