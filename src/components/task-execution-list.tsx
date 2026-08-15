"use client";

import type { ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AlertCircle, CirclePlay } from "lucide-react";
import { PriorityBadge } from "@/components/priority-badge";
import { TaskLink } from "@/components/task-link";
import { cn } from "@/lib/utils";
import { isoHoje, diasEntre } from "@/lib/hoje";
import {
  estaEmRisco,
  etapaTarefaAtual,
  nomeColaborador,
  projetoById,
  type Tarefa,
} from "@/lib/mock";

function formatDataCurta(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

function situacaoEtapa(iso?: string): { label: string; className: string } {
  if (!iso) return { label: "—", className: "bg-secondary text-muted-foreground" };
  const dias = diasEntre(isoHoje(), iso);
  if (dias < 0) return { label: `Atrasado ${Math.abs(dias)}d`, className: "bg-destructive text-white" };
  if (dias === 0) return { label: "Hoje", className: "bg-primary text-primary-foreground" };
  if (dias === 1) return { label: "Amanhã", className: "bg-success text-success-foreground" };
  return { label: formatDataCurta(iso), className: "bg-secondary text-secondary-foreground" };
}

function situacaoPrazo(iso: string): { label: string; className: string } {
  if (!iso) return { label: "sem prazo", className: "bg-secondary text-muted-foreground" };
  const dias = diasEntre(isoHoje(), iso);
  if (dias < 0) return { label: `Atrasado ${Math.abs(dias)}d`, className: "bg-destructive text-white" };
  if (dias === 0) return { label: "Hoje", className: "bg-primary text-primary-foreground" };
  return { label: `em ${dias} dias`, className: "bg-secondary text-secondary-foreground" };
}

function buDaTarefa(tarefa: Tarefa): string {
  if (tarefa.origem === "Solicitação") return tarefa.departamento ?? "—";
  if (tarefa.projetoId) return projetoById(tarefa.projetoId)?.departamento ?? "—";
  return "—";
}

function projetoDaTarefa(tarefa: Tarefa): string {
  if (tarefa.origem !== "Projeto" || !tarefa.projetoId) return "—";
  const projeto = projetoById(tarefa.projetoId);
  return projeto?.tipo === "Projeto" ? projeto.nome : "—";
}

function campanhaDaTarefa(tarefa: Tarefa): string {
  if (tarefa.origem !== "Projeto" || !tarefa.projetoId) return "—";
  const projeto = projetoById(tarefa.projetoId);
  return projeto?.tipo === "Campanha" ? projeto.nome : "—";
}

function bucketDoPrazo(iso?: string): { chave: string; nome: string; ordem: number } {
  if (!iso) return { chave: "sem-prazo", nome: "Sem prazo definido", ordem: 2 };
  const dias = diasEntre(isoHoje(), iso);
  if (dias <= 0) return { chave: "hoje", nome: "Hoje", ordem: 0 };
  return { chave: "proximos", nome: "Próximos dias", ordem: 1 };
}

function CampoTarefa({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col justify-center gap-3">
      <span className="text-center text-[0.6rem] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex h-6 min-w-0 items-center justify-center text-xs">{children}</div>
    </div>
  );
}

const COLUNAS_CARD =
  "grid grid-cols-[1fr_1.1fr_1fr_0.6fr_0.8fr_1.2fr_1.2fr_0.7fr] gap-x-4 gap-y-3";

function TagCampo({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold",
        className
      )}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

function TaskCard({ tarefa }: { tarefa: Tarefa }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const emRisco = estaEmRisco(tarefa);
  const situacaoExecucao = situacaoEtapa(tarefa.execucaoEtapaAte);
  const situacaoConclusao = situacaoPrazo(tarefa.prazo);
  const etapa = etapaTarefaAtual(tarefa);
  const executorId = (tarefa.executoresPorFase[tarefa.faseAtualId] ?? [])[0];
  const esforco = tarefa.estimativaPorFase[tarefa.faseAtualId];

  function abrirTarefa() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tarefa", tarefa.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={abrirTarefa}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrirTarefa();
        }
      }}
      className="cursor-pointer rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/50"
    >
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="flex min-w-0 items-center gap-2">
          {emRisco ? (
            <AlertCircle className="size-4 shrink-0 text-destructive" />
          ) : (
            <CirclePlay className="size-4 shrink-0 text-success" />
          )}
          <TaskLink taskId={tarefa.id} className="truncate text-lg font-semibold hover:underline">
            {tarefa.titulo}
          </TaskLink>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Concluir tarefa até
          </span>
          <TagCampo label={situacaoConclusao.label} className={situacaoConclusao.className} />
        </div>
      </div>

      <div className={cn("border-t border-border/60 pt-4", COLUNAS_CARD)}>
        <CampoTarefa label="Etapa">
          <TagCampo label={etapa?.nome ?? "—"} className="bg-secondary text-secondary-foreground" />
        </CampoTarefa>
        <CampoTarefa label="Executor">
          <TagCampo label={nomeColaborador(executorId)} className="bg-secondary text-secondary-foreground" />
        </CampoTarefa>
        <CampoTarefa label="Executar etapa até">
          <TagCampo label={situacaoExecucao.label} className={situacaoExecucao.className} />
        </CampoTarefa>
        <CampoTarefa label="Esforço">{esforco ? `${esforco}h` : "—"}</CampoTarefa>
        <CampoTarefa label="BU">
          <TagCampo label={buDaTarefa(tarefa)} className="bg-secondary text-secondary-foreground" />
        </CampoTarefa>
        <CampoTarefa label="Projeto">
          <span className="block truncate" title={projetoDaTarefa(tarefa)}>
            {projetoDaTarefa(tarefa)}
          </span>
        </CampoTarefa>
        <CampoTarefa label="Campanha">
          <span className="block truncate" title={campanhaDaTarefa(tarefa)}>
            {campanhaDaTarefa(tarefa)}
          </span>
        </CampoTarefa>
        <CampoTarefa label="Prioridade">
          <PriorityBadge prioridade={tarefa.prioridadeFinal} />
        </CampoTarefa>
      </div>
    </div>
  );
}

export function TaskExecutionList({ tarefas }: { tarefas: Tarefa[] }) {
  if (tarefas.length === 0) {
    return (
      <p className="rounded-xl border border-border/60 bg-card py-6 text-center text-sm text-muted-foreground">
        Nada na sua fila agora.
      </p>
    );
  }

  const grupos = new Map<string, { nome: string; ordem: number; tarefas: Tarefa[] }>();

  for (const tarefa of tarefas) {
    const bucket = bucketDoPrazo(tarefa.execucaoEtapaAte);
    const grupo = grupos.get(bucket.chave);
    if (grupo) {
      grupo.tarefas.push(tarefa);
    } else {
      grupos.set(bucket.chave, { nome: bucket.nome, ordem: bucket.ordem, tarefas: [tarefa] });
    }
  }

  const gruposOrdenados = [...grupos.values()].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="flex flex-col gap-6">
      {gruposOrdenados.map((grupo) => (
        <div key={grupo.nome}>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-base font-semibold">{grupo.nome}</h3>
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {grupo.tarefas.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {grupo.tarefas.map((tarefa) => (
              <TaskCard key={tarefa.id} tarefa={tarefa} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
