"use client";

import { CalendarClock, ArrowRight } from "lucide-react";
import { TaskLink } from "@/components/task-link";
import { PriorityBadge } from "@/components/priority-badge";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { isoHoje, diasEntre } from "@/lib/hoje";
import { etapaById, infoEtapaAtual, type EtapaFutura } from "@/lib/mock";

function formatDataCurta(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

function quandoChega(iso: string): string {
  const dias = diasEntre(isoHoje(), iso);
  if (dias <= 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  return `${formatDataCurta(iso)} · em ${dias} dias`;
}

function horasCurta(horas: number): string {
  return Number.isInteger(horas) ? `${horas}h` : `${horas.toFixed(1)}h`;
}

// Grid de largura fixa por coluna — assim cada campo (etapa atual, seta, minha etapa, esforço,
// prioridade, data) fica alinhado na mesma posição em toda linha, em vez de deslizar conforme o
// tamanho do texto de cada tarefa (ver pedido do usuário: "quero tudo alinhado").
const COLUNAS =
  "grid-cols-[1.25rem_minmax(0,1fr)_5.5rem_9.5rem_1rem_9rem_2.5rem_6.5rem]";

/**
 * "Entrando em breve" (PRD E3): próxima execução de fase minha que ainda não liberou — a pessoa
 * já vê o que está por vir (com quem está agora e quanto tempo deve levar) e pode se preparar,
 * mesmo sem poder agir ainda.
 */
export function AtividadesEntrandoEmBreve({ itens }: { itens: EtapaFutura[] }) {
  if (itens.length === 0) {
    return (
      <div>
        <h2 className="mb-2 text-sm font-semibold">Atividades futuras</h2>
        <p className="rounded-xl border border-dashed border-border/60 py-5 text-center text-sm text-muted-foreground">
          Nada chegando na sua fila nos próximos dias.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="mb-1 text-sm font-semibold md:hidden">Atividades futuras</h2>
      <div className={`hidden ${COLUNAS} items-center gap-3 px-4 md:grid`}>
        <h2 className="col-span-2 -ml-4 text-sm font-semibold">Atividades futuras</h2>
        <span className="text-[0.6rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Prioridade
        </span>
        <span className="text-[0.6rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Etapa atual
        </span>
        <span />
        <span className="hidden text-[0.6rem] font-semibold tracking-wide text-muted-foreground uppercase sm:inline">
          Suas atividades
        </span>
        <span />
        <span />
      </div>
      {itens.map(({ tarefa, ordem, dataFim, esforco }) => {
        const minhaEtapa = etapaById(tarefa.planejamento?.etapas.find((e) => e.ordem === ordem)?.etapaId ?? "");
        const etapaAtual = infoEtapaAtual(tarefa);
        return (
          <TaskLink
            key={`${tarefa.id}-${ordem}`}
            taskId={tarefa.id}
            className={`grid ${COLUNAS} items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-card`}
          >
            <CalendarClock className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate font-medium">{tarefa.titulo}</span>

            <PriorityBadge prioridade={tarefa.prioridadeFinal} />

            <div className="hidden min-w-0 items-center gap-1.5 md:flex" title="Etapa atual">
              <ColaboradorAvatar
                colaboradorId={etapaAtual.executorId}
                className="size-5 shrink-0"
                fallbackClassName="text-[0.55rem]"
              />
              <span className="min-w-0 truncate rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                {etapaAtual.nome ?? "—"}
              </span>
            </div>

            <ArrowRight className="hidden size-3.5 shrink-0 text-muted-foreground md:block" />

            <span
              className="hidden min-w-0 truncate rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground sm:inline"
              title="Sua próxima etapa"
            >
              {minhaEtapa?.nome ?? "—"}
            </span>

            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline" title="Esforço estimado">
              {esforco != null ? horasCurta(esforco) : ""}
            </span>

            <span className="shrink-0 text-right text-xs text-muted-foreground">{quandoChega(dataFim)}</span>
          </TaskLink>
        );
      })}
    </div>
  );
}
