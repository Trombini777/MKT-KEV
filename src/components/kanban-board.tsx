"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { PriorityBadge } from "@/components/priority-badge";
import { cn } from "@/lib/utils";
import { isoHoje, diasEntre } from "@/lib/hoje";
import { decimalParaHorario } from "@/lib/time-format";
import { useProjetos } from "@/lib/projeto-store";
import { useConfiguracoesFluxo } from "@/lib/configuracoes-fluxo-store";
import {
  FASES,
  destinosPermitidos,
  infoEtapaAtual,
  projetoById,
  tipoById,
  etapaById,
  unidadeMedidaById,
  nomeColaborador,
  nomeTipo,
  estaEmRisco,
  type Tarefa,
} from "@/lib/mock";

function formatarDataCurta(iso?: string): string {
  if (!iso) return "—";
  const [, mes, dia] = iso.split("-");
  return `${dia}/${mes}`;
}

function situacaoEtapa(iso?: string): { label: string; className: string } {
  if (!iso) return { label: "—", className: "bg-muted text-muted-foreground" };
  const dias = diasEntre(isoHoje(), iso);
  if (dias < 0) return { label: `Atrasado ${Math.abs(dias)}d`, className: "bg-destructive text-white" };
  if (dias === 0) return { label: "Hoje", className: "bg-primary text-primary-foreground" };
  if (dias === 1) return { label: "Amanhã", className: "bg-success text-success-foreground" };
  return { label: formatarDataCurta(iso), className: "bg-secondary text-secondary-foreground" };
}

/**
 * Prévia da primeira etapa do fluxo do tipo — usada quando a tarefa ainda não tem planejamento
 * aplicado (Solicitações/Triagem/Backlog), pra a etapa/SLA médio não ficarem em branco no card.
 */
function primeiraEtapaTipo(
  tarefa: Tarefa
): { nome: string | undefined; slaDias: number | undefined; slaHoras?: undefined } | undefined {
  const primeira = tipoById(tarefa.tipoId)?.etapas.reduce<
    { etapaId: string; ordem: number; slaDias?: number } | undefined
  >((menor, e) => (!menor || e.ordem < menor.ordem ? e : menor), undefined);
  if (!primeira) return undefined;
  return { nome: etapaById(primeira.etapaId)?.nome, slaDias: primeira.slaDias };
}

function buDaTarefa(tarefa: Tarefa): string {
  if (tarefa.origem === "Solicitação") return tarefa.departamento ?? "—";
  if (tarefa.projetoId) return projetoById(tarefa.projetoId)?.departamento ?? "—";
  return "—";
}

const LARGURA_COLUNA_BASE = 320;
const GAP_COLUNAS = 16;

/**
 * Calcula quantas colunas cabem inteiras no espaço disponível e estica a largura de
 * cada uma pra preencher exatamente esse espaço — sem sobra vazia e sem coluna cortada.
 */
function useLarguraColuna() {
  const medidorRef = useRef<HTMLDivElement>(null);
  const [larguraColuna, setLarguraColuna] = useState<number>(LARGURA_COLUNA_BASE);

  useEffect(() => {
    const elemento = medidorRef.current;
    if (!elemento) return;

    function recalcular(disponivel: number) {
      const passo = LARGURA_COLUNA_BASE + GAP_COLUNAS;
      const colunasVisiveis = Math.max(1, Math.floor((disponivel + GAP_COLUNAS) / passo));
      setLarguraColuna((disponivel - (colunasVisiveis - 1) * GAP_COLUNAS) / colunasVisiveis);
    }

    recalcular(elemento.clientWidth);
    const observer = new ResizeObserver((entries) => {
      const entrada = entries[0];
      if (entrada) recalcular(entrada.contentRect.width);
    });
    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  return { medidorRef, larguraColuna };
}

export function KanbanBoard({
  tasks,
  onMoverTarefa,
}: {
  tasks: Tarefa[];
  onMoverTarefa: (taskId: string, novaFaseId: string) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  // Assina o hook (mesmo sem usar o valor) só pra re-renderizar quando PROJETOS hidratar do
  // Supabase — `buDaTarefa`/`projetoById` são lidos direto do array mutado em memória.
  useProjetos();
  // SLA padrão de Aprovação/Triagem configurado em Tipos de Tarefa — usado como fallback do
  // card enquanto a tarefa não tem etapa própria (ver `slaFallbackHoras` abaixo).
  const configFluxo = useConfiguracoesFluxo();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { medidorRef, larguraColuna } = useLarguraColuna();

  function abrirTarefa(taskId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tarefa", taskId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleDrop(faseId: string) {
    if (!draggingId) return;
    const tarefa = tasks.find((t) => t.id === draggingId);
    if (tarefa && destinosPermitidos(tarefa.faseAtualId).includes(faseId)) {
      onMoverTarefa(draggingId, faseId);
    }
    setDraggingId(null);
  }

  const fasesOrdenadas = [...FASES].sort((a, b) => a.ordem - b.ordem);

  return (
    <div
      ref={medidorRef}
      className="w-full"
      style={{ width: "calc(100vw - 256px - 3rem)" }}
    >
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
      {fasesOrdenadas.map((fase) => {
        const tarefasDaFase = tasks.filter((t) => t.faseAtualId === fase.id);
        const podeReceber = draggingId
          ? destinosPermitidos(
              tasks.find((t) => t.id === draggingId)?.faseAtualId ?? ""
            ).includes(fase.id)
          : false;

        return (
          <div
            key={fase.id}
            onDragOver={(e) => {
              if (podeReceber) e.preventDefault();
            }}
            onDrop={() => handleDrop(fase.id)}
            style={{ width: larguraColuna }}
            className={cn(
              "flex shrink-0 snap-start flex-col gap-2 overflow-hidden rounded-xl p-2.5 pt-0 transition-colors",
              podeReceber ? "bg-primary/10 ring-1 ring-primary/40" : "bg-muted/40"
            )}
          >
            <div className="-mx-2.5 h-1 shrink-0 bg-neutral-400/70 dark:bg-neutral-600" />

            <div className="flex items-center gap-2 px-1 pt-1.5 pb-1">
              <span className="text-sm font-semibold">{fase.nome}</span>
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-background px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {tarefasDaFase.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {tarefasDaFase.map((tarefa) => {
                const etapaAtual = infoEtapaAtual(tarefa);
                const executorId = etapaAtual.executorId;
                const emRisco = estaEmRisco(tarefa);
                const prazoEtapa = situacaoEtapa(etapaAtual.dataFim);
                // Sem etapa de execução ainda (tarefa sem planejamento aplicado): tenta a primeira
                // etapa do tipo (se já triada) e, na falta disso, cai pro SLA médio da própria fase
                // atual — assim o card nunca fica com "—"/"—" antes da tarefa ganhar um fluxo.
                // SLA de Solicitações/Triagem vem da config real (em horas, "Responsáveis e SLA
                // padrão" em Tipos de Tarefa) — só cai pro `fase.slaDias` genérico (em dias) nas
                // outras fases, onde não existe config equivalente.
                const slaHorasDaFase =
                  fase.id === "solicitacoes"
                    ? configFluxo.slaHorasAprovacao
                    : fase.id === "triagem"
                      ? configFluxo.slaHorasTriagem
                      : undefined;
                const proximaEtapa =
                  etapaAtual.nome
                    ? undefined
                    : primeiraEtapaTipo(tarefa) ??
                      (slaHorasDaFase != null
                        ? { nome: fase.nome, slaDias: undefined, slaHoras: slaHorasDaFase }
                        : { nome: fase.nome, slaDias: fase.slaDias });
                const unidadeMedidaId = tipoById(tarefa.tipoId)?.unidadeMedidaId;
                const unidadeMedida = unidadeMedidaId
                  ? unidadeMedidaById(unidadeMedidaId)
                  : undefined;

                return (
                  <div
                    key={tarefa.id}
                    draggable
                    onDragStart={() => setDraggingId(tarefa.id)}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => abrirTarefa(tarefa.id)}
                    className={cn(
                      "cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:ring-1 hover:ring-primary/50 active:cursor-grabbing dark:hover:ring-primary/50",
                      fase.id === "concluido" && "opacity-60 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 bg-muted px-4 py-2 dark:bg-white/5">
                      <span className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
                        {nomeTipo(tarefa.tipoId)}
                      </span>
                      {unidadeMedida && tarefa.quantidadeUnidade != null && (
                        <span
                          title={`${tarefa.quantidadeUnidade} ${unidadeMedida.nome}${tarefa.quantidadeUnidade === 1 ? "" : "s"}`}
                          className="flex size-4 shrink-0 items-center justify-center rounded-full bg-neutral-600 text-[0.6rem] font-semibold text-white"
                        >
                          {tarefa.quantidadeUnidade}
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="mb-3 truncate text-sm font-semibold">
                        {tarefa.titulo}
                      </p>

                      <div className="mb-3 flex items-center gap-1.5 text-xs">
                        <PriorityBadge prioridade={tarefa.prioridadeFinal} />
                        <span className="h-3 w-px shrink-0 bg-border" />
                        <span className="shrink-0 truncate text-muted-foreground">
                          {buDaTarefa(tarefa)}
                        </span>
                        <span className="h-3 w-px shrink-0 bg-border" />
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">
                          {tarefa.solicitanteNome ?? "—"}
                        </span>
                      </div>

                      <div className="mb-3 flex items-center gap-1.5 border-t border-border/60 pt-3">
                        <div className="flex min-w-0 flex-1 items-center gap-1.5">
                          <ColaboradorAvatar
                            colaboradorId={executorId}
                            className="size-5 shrink-0"
                            fallbackClassName="text-[0.6rem]"
                          />
                          <span className="truncate text-xs text-muted-foreground">
                            {executorId ? nomeColaborador(executorId) : "—"}
                          </span>
                        </div>
                        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[0.7rem] font-semibold text-secondary-foreground">
                          {etapaAtual.nome ?? proximaEtapa?.nome ?? "—"}
                        </span>
                        <span
                          title={proximaEtapa ? "SLA médio da primeira etapa" : undefined}
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold",
                            etapaAtual.dataFim
                              ? prazoEtapa.className
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {etapaAtual.dataFim
                            ? prazoEtapa.label
                            : proximaEtapa?.slaHoras != null
                              ? `SLA ${decimalParaHorario(proximaEtapa.slaHoras)}`
                              : proximaEtapa?.slaDias != null
                                ? `SLA ${proximaEtapa.slaDias}d`
                                : "—"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                        <div>
                          <p className="text-[0.6rem] font-semibold tracking-wide text-muted-foreground uppercase">
                            Prazo final
                          </p>
                          <p className="text-xs font-medium">
                            {formatarDataCurta(tarefa.prazo)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[0.6rem] font-semibold tracking-wide text-muted-foreground uppercase">
                            Previsão de entrega
                          </p>
                          <p
                            className={cn(
                              "text-xs font-medium",
                              emRisco && "text-destructive"
                            )}
                          >
                            {formatarDataCurta(tarefa.previsaoConclusao)}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
              {tarefasDaFase.length === 0 && (
                <p className="px-1 py-2 text-xs text-muted-foreground">Vazio</p>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
