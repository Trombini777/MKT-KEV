"use client";

import { useState } from "react";
import { CalendarClock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskLink } from "@/components/task-link";
import { PriorityBadge } from "@/components/priority-badge";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { cn, TABS_ATIVO_PRIMARY_CLASS } from "@/lib/utils";
import {
  isoHoje,
  diasEntre,
  dataParaIso,
  formatDataCurta,
  gerarGradeMes,
  DIAS_SEMANA_CURTO,
  NOMES_MESES,
} from "@/lib/hoje";
import { etapaById, infoEtapaAtual, type EtapaFutura } from "@/lib/mock";

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
// tamanho do texto de cada tarefa.
const COLUNAS =
  "grid-cols-[1.25rem_minmax(0,1fr)_5.5rem_9.5rem_1rem_9rem_2.5rem_6.5rem]";

function AtividadesFuturasLista({ itens }: { itens: EtapaFutura[] }) {
  if (itens.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 py-5 text-center text-sm text-muted-foreground">
        Nada chegando na sua fila nos próximos dias.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={`hidden ${COLUNAS} items-center gap-3 px-4 md:grid`}>
        <span className="col-span-2" />
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

function AtividadesFuturasCalendario({
  itens,
  diaSelecionado,
}: {
  itens: EtapaFutura[];
  diaSelecionado?: string | null;
}) {
  const hoje = new Date();
  const [mesExibido, setMesExibido] = useState(() => {
    if (diaSelecionado) {
      const [ano, mes] = diaSelecionado.split("-").map(Number);
      return new Date(ano, mes - 1, 1);
    }
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  // Pula o calendário pro mês do dia selecionado no Workload — ajuste de estado durante o render
  // (comparando com o valor anterior), não em useEffect, pra não disparar um re-render em cascata.
  const [diaSelecionadoAnterior, setDiaSelecionadoAnterior] = useState(diaSelecionado);
  if (diaSelecionado !== diaSelecionadoAnterior) {
    setDiaSelecionadoAnterior(diaSelecionado);
    if (diaSelecionado) {
      const [ano, mes] = diaSelecionado.split("-").map(Number);
      setMesExibido(new Date(ano, mes - 1, 1));
    }
  }

  function mudarMes(delta: number) {
    setMesExibido((atual) => new Date(atual.getFullYear(), atual.getMonth() + delta, 1));
  }

  const itensPorDia = new Map<string, EtapaFutura[]>();
  for (const item of itens) {
    const lista = itensPorDia.get(item.dataFim) ?? [];
    lista.push(item);
    itensPorDia.set(item.dataFim, lista);
  }

  const celulas = gerarGradeMes(mesExibido.getFullYear(), mesExibido.getMonth());
  const hojeIso = dataParaIso(hoje);

  return (
    <div>
      <div className="mb-3 flex items-center justify-end gap-2 text-sm">
        <button
          type="button"
          onClick={() => mudarMes(-1)}
          aria-label="Mês anterior"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-28 text-center font-medium capitalize">
          {NOMES_MESES[mesExibido.getMonth()]} de {mesExibido.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => mudarMes(1)}
          aria-label="Próximo mês"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60">
        {DIAS_SEMANA_CURTO.map((d) => (
          <div key={d} className="bg-muted/50 px-2 py-1.5 text-center text-xs text-muted-foreground">
            {d}
          </div>
        ))}
        {celulas.map((data, i) => {
          if (!data) return <div key={i} className="min-h-24 bg-card" />;
          const iso = dataParaIso(data);
          const itensDoDia = itensPorDia.get(iso) ?? [];
          const ehHoje = iso === hojeIso;
          const ehSelecionado = iso === diaSelecionado;
          return (
            <div
              key={i}
              className={cn(
                "flex min-h-24 flex-col gap-1 bg-card p-1.5",
                ehSelecionado && "ring-2 ring-inset ring-primary"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs",
                    ehHoje ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  {data.getDate()}
                </span>
                {itensDoDia.length > 0 && (
                  <span className="pr-0.5 text-[0.65rem] font-semibold text-muted-foreground">
                    {itensDoDia.length}
                  </span>
                )}
              </div>
              {itensDoDia.slice(0, 3).map(({ tarefa, ordem, esforco }) => {
                const minhaEtapa = etapaById(
                  tarefa.planejamento?.etapas.find((e) => e.ordem === ordem)?.etapaId ?? ""
                );
                const nomeEtapa = minhaEtapa?.nome ?? "—";
                const tooltip = `${nomeEtapa}: ${tarefa.titulo}${esforco != null ? ` (${horasCurta(esforco)})` : ""}`;
                return (
                  <TaskLink
                    key={`${tarefa.id}-${ordem}`}
                    taskId={tarefa.id}
                    title={tooltip}
                    className="truncate rounded bg-primary px-1.5 py-0.5 text-[0.68rem] font-medium text-primary-foreground hover:bg-primary/85"
                  >
                    {nomeEtapa}: {tarefa.titulo}
                  </TaskLink>
                );
              })}
              {itensDoDia.length > 3 && (
                <span className="px-1.5 text-[0.65rem] text-muted-foreground">
                  +{itensDoDia.length - 3}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * "Entrando em breve" (PRD E3): próxima execução de fase minha que ainda não liberou. Alterna
 * entre lista (ordem cronológica, uma linha por item) e calendário de mês (visão por dia) —
 * cada item aparece individual e clicável nas duas visões.
 */
export function AtividadesEntrandoEmBreve({
  itens,
  diaSelecionado,
}: {
  itens: EtapaFutura[];
  /** Dia (iso) selecionado no Workload do Painel de Trabalho — só tem efeito na visão de
   * calendário (navega até o mês dele e destaca a célula, sem esconder os outros dias). */
  diaSelecionado?: string | null;
}) {
  const [visualizacao, setVisualizacao] = useState<"lista" | "calendario">("lista");

  // Clicar num dia do Workload só faz sentido na visão de calendário — troca pra ela
  // automaticamente quando um novo dia é selecionado (mesmo ajuste de estado durante o render
  // usado no calendário pra pular de mês, evitando useEffect + setState em cascata).
  const [diaSelecionadoAnterior, setDiaSelecionadoAnterior] = useState(diaSelecionado);
  if (diaSelecionado !== diaSelecionadoAnterior) {
    setDiaSelecionadoAnterior(diaSelecionado);
    if (diaSelecionado) setVisualizacao("calendario");
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Atividades futuras</h2>
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {itens.length}
          </span>
        </div>
        <Tabs value={visualizacao} onValueChange={(v) => v && setVisualizacao(v as "lista" | "calendario")}>
          <TabsList>
            <TabsTrigger value="lista" className={TABS_ATIVO_PRIMARY_CLASS}>
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendario" className={TABS_ATIVO_PRIMARY_CLASS}>
              Calendário
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {visualizacao === "lista" ? (
        <AtividadesFuturasLista itens={itens} />
      ) : (
        <AtividadesFuturasCalendario itens={itens} diaSelecionado={diaSelecionado} />
      )}
    </div>
  );
}
