"use client";

import { useState } from "react";
import { Calendar, Check, Maximize2, X } from "lucide-react";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTasks, aplicarPlanejamento, atualizarPrazoTarefa, moveTask } from "@/lib/task-store";
import { anoDoPrazoValido, MENSAGEM_ANO_INVALIDO } from "@/lib/validacao-data";
import {
  calcularPlanejamentoSimples,
  classificarStatus,
  type ExecutorPorEtapa,
} from "@/lib/scheduling";
import {
  COLABORADORES,
  etapaById,
  tipoById,
  horasAlocadasPorDia,
  capacidadeDiaria,
  type Tarefa,
  type StatusPlanejamento,
} from "@/lib/mock";
import { isoHoje } from "@/lib/hoje";

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];
const DIAS_SEMANA_ABREV = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function dataAbreviada(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return `${MESES_ABREV[mes - 1]} ${dia}${ano !== new Date().getFullYear() ? `/${ano}` : ""}`;
}

function diaDaSemana(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return DIAS_SEMANA_ABREV[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()];
}

/** "01:30" -> 1.5 */
function horarioParaDecimal(horario: string): number {
  if (!horario) return 0;
  const [h, m] = horario.split(":").map(Number);
  return Math.round((h + m / 60) * 100) / 100;
}

/** 1.5 -> "01:30" */
function decimalParaHorarioInput(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** 1.5 -> "1h 30m" */
function decimalParaHorasLabel(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

const STATUS_INFO: Record<StatusPlanejamento, { label: (folga?: number) => string; className: string }> = {
  "sem-prazo": {
    label: () => "Sem prazo definido",
    className: "bg-muted text-muted-foreground",
  },
  "dentro-do-prazo": {
    label: (folga) => `Dentro do prazo — ${folga ?? 0} dia${folga === 1 ? "" : "s"} de folga`,
    className: "bg-success/10 text-success",
  },
  apertado: {
    label: () => "Apertado — praticamente sem folga",
    className: "bg-warning/15 text-warning",
  },
  impossivel: {
    label: (folga) =>
      `Impossível cumprir o prazo — atrasaria ${Math.abs(folga ?? 0)} dia${Math.abs(folga ?? 0) === 1 ? "" : "s"}`,
    className: "bg-destructive/10 text-destructive",
  },
};

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </p>
  );
}

export function PlanejamentoRecomendado({ tarefa }: { tarefa: Tarefa }) {
  const tarefasLive = useTasks();
  const tipo = tipoById(tarefa.tipoId);

  const [executoresPorEtapa, setExecutoresPorEtapa] = useState<ExecutorPorEtapa>(() =>
    Object.fromEntries(
      (tipo?.etapas ?? [])
        .filter((e) => e.executorPadraoId)
        .map((e) => [e.ordem, e.executorPadraoId as string])
    )
  );
  const [duracoesPorEtapa, setDuracoesPorEtapa] = useState<Record<number, number>>({});
  const [horasPorEtapa, setHorasPorEtapa] = useState<Record<number, number>>({});
  const [iniciosForcados, setIniciosForcados] = useState<Record<number, string>>({});
  const [concluirForcados, setConcluirForcados] = useState<Record<number, string>>({});
  const [editandoDataDesejada, setEditandoDataDesejada] = useState(false);
  const [dataDesejadaInput, setDataDesejadaInput] = useState("");
  const [expandido, setExpandido] = useState(false);

  if (!tipo || tipo.etapas.length === 0) return null;

  const etapasOrdenadas = [...tipo.etapas].sort((a, b) => a.ordem - b.ordem);
  const dataInicio = tarefa.dataInicio || isoHoje();

  const linhas = calcularPlanejamentoSimples(
    tipo,
    executoresPorEtapa,
    duracoesPorEtapa,
    horasPorEtapa,
    dataInicio,
    iniciosForcados,
    concluirForcados
  );
  const todasComExecutor = linhas.every((l) => l.colaboradorId);
  const esforcoPrevisto = linhas.reduce((soma, l) => soma + l.horas, 0);
  const previsaoConclusao = linhas.length
    ? linhas.reduce((max, l) => (l.concluirEm > max ? l.concluirEm : max), dataInicio)
    : dataInicio;

  function confirmarDataDesejada() {
    if (!dataDesejadaInput || !anoDoPrazoValido(dataDesejadaInput)) return;
    atualizarPrazoTarefa(tarefa.id, dataDesejadaInput);
    setEditandoDataDesejada(false);
  }

  function criar() {
    if (!todasComExecutor) return;
    const dataInicioAtividade = linhas[0]?.inicioEm ?? dataInicio;
    aplicarPlanejamento(
      tarefa.id,
      {
        etapas: linhas.map((l) => ({
          etapaId: l.etapaId,
          ordem: l.ordem,
          colaboradorId: l.colaboradorId,
          alocacoes: [{ data: l.concluirEm, horas: l.horas }],
          dataFim: l.concluirEm,
        })),
        previsaoConclusao,
        ...classificarStatus(previsaoConclusao, tarefa.prazo || undefined),
      },
      dataInicioAtividade
    );
    // Se a atividade só começa depois de hoje, fica no Backlog aguardando a data — assim que o
    // dia de início chegar, `sincronizarInicioDeTarefas` (task-store) move sozinha pra Execução.
    moveTask(tarefa.id, dataInicioAtividade <= isoHoje() ? "em-execucao" : "backlog");
  }

  if (tarefa.planejamento) {
    return (
      <div>
        <Rotulo>Planejamento aplicado</Rotulo>
        <p className="mt-1 text-xs text-muted-foreground">
          Gerado em {dataAbreviada(tarefa.planejamento.geradoEm.slice(0, 10))}
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {tarefa.planejamento.etapas.map((etapa) => {
            const etapaInfo = etapaById(etapa.etapaId);
            return (
              <div
                key={etapa.ordem}
                className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {etapa.ordem}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {etapaInfo?.nome ?? etapa.etapaId}
                </span>
                <ColaboradorAvatar
                  colaboradorId={etapa.colaboradorId}
                  className="size-6 shrink-0"
                  fallbackClassName="text-[0.65rem]"
                />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {dataAbreviada(etapa.dataFim)}
                </span>
              </div>
            );
          })}
        </div>
        <span
          className={cn(
            "mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            STATUS_INFO[tarefa.planejamento.status].className
          )}
        >
          {STATUS_INFO[tarefa.planejamento.status].label(tarefa.planejamento.folgaDias)}
        </span>
      </div>
    );
  }

  const conteudo = (
    <>
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Concluir até
          </span>
          {editandoDataDesejada ? (
            <div className="flex items-center gap-1">
              <Input
                type="date"
                autoFocus
                value={dataDesejadaInput}
                onChange={(e) => setDataDesejadaInput(e.target.value)}
                className="h-8 text-xs"
              />
              <button
                type="button"
                disabled={!dataDesejadaInput || !anoDoPrazoValido(dataDesejadaInput)}
                title={
                  dataDesejadaInput && !anoDoPrazoValido(dataDesejadaInput)
                    ? MENSAGEM_ANO_INVALIDO
                    : "Salvar prazo"
                }
                onClick={confirmarDataDesejada}
                className="shrink-0 text-success disabled:cursor-not-allowed disabled:text-muted-foreground/40"
                aria-label="Salvar prazo"
              >
                <Check className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEditandoDataDesejada(false)}
                className="shrink-0 text-muted-foreground"
                aria-label="Cancelar"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDataDesejadaInput(tarefa.prazo || "");
                setEditandoDataDesejada(true);
              }}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium hover:underline",
                !tarefa.prazo && "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
              {tarefa.prazo ? dataAbreviada(tarefa.prazo) : "--/--/----"}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Esforço previsto
          </span>
          <span className="text-sm font-medium">{decimalParaHorasLabel(esforcoPrevisto)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Previsão de entrega
          </span>
          <span className="text-sm font-medium">
            {dataAbreviada(previsaoConclusao)} · {diaDaSemana(previsaoConclusao)}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Etapa</TableHead>
              <TableHead className="w-24">Duração dias</TableHead>
              <TableHead className="w-32">Previsto</TableHead>
              <TableHead className="w-36">Iniciar em</TableHead>
              <TableHead className="w-36">Concluir até</TableHead>
              <TableHead>Executor</TableHead>
              <TableHead className="w-10 text-center">Disponível</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {etapasOrdenadas.map((etapaDoTipo) => {
              const linha = linhas.find((l) => l.ordem === etapaDoTipo.ordem);
              if (!linha) return null;
              const etapaInfo = etapaById(etapaDoTipo.etapaId);
              const ocupado = linha.colaboradorId
                ? horasAlocadasPorDia(linha.colaboradorId, linha.concluirEm, {}, tarefasLive)
                : 0;
              const capacidade = linha.colaboradorId ? capacidadeDiaria(linha.colaboradorId) : 0;
              const disponivel = linha.colaboradorId ? ocupado + linha.horas <= capacidade : false;
              return (
                <TableRow key={etapaDoTipo.ordem}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {etapaInfo?.nome ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={linha.duracaoDias}
                      onChange={(e) => {
                        const valor = Number(e.target.value) || 0;
                        setDuracoesPorEtapa((prev) => ({ ...prev, [etapaDoTipo.ordem]: valor }));
                        // volta a calcular "Concluir até" pela duração — se a pessoa tinha
                        // editado essa data na mão antes, essa edição de duração assume de novo.
                        setConcluirForcados((prev) =>
                          Object.fromEntries(
                            Object.entries(prev).filter(([ordem]) => ordem !== String(etapaDoTipo.ordem))
                          )
                        );
                      }}
                      className="h-8 w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative inline-block">
                      <Input
                        type="time"
                        value={decimalParaHorarioInput(linha.horas)}
                        onChange={(e) =>
                          setHorasPorEtapa((prev) => ({
                            ...prev,
                            [etapaDoTipo.ordem]: horarioParaDecimal(e.target.value),
                          }))
                        }
                        className="h-8 w-32 pr-9"
                      />
                      <span className="pointer-events-none absolute top-1/2 right-8 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        h
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={linha.inicioEm}
                      onChange={(e) =>
                        e.target.value &&
                        setIniciosForcados((prev) => ({ ...prev, [etapaDoTipo.ordem]: e.target.value }))
                      }
                      className="h-8 w-[8.75rem] text-xs"
                    />
                    <span className="mt-0.5 block text-[0.65rem] text-muted-foreground">
                      {diaDaSemana(linha.inicioEm)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={linha.concluirEm}
                      onChange={(e) =>
                        e.target.value &&
                        setConcluirForcados((prev) => ({ ...prev, [etapaDoTipo.ordem]: e.target.value }))
                      }
                      className="h-8 w-[8.75rem] text-xs"
                    />
                    <span className="mt-0.5 block text-[0.65rem] text-muted-foreground">
                      {diaDaSemana(linha.concluirEm)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      items={Object.fromEntries(COLABORADORES.map((c) => [c.id, c.nome]))}
                      value={linha.colaboradorId}
                      onValueChange={(v) =>
                        typeof v === "string" &&
                        v &&
                        setExecutoresPorEtapa((prev) => ({ ...prev, [etapaDoTipo.ordem]: v }))
                      }
                    >
                      <SelectTrigger className="h-8 w-48 gap-1.5">
                        <ColaboradorAvatar
                          colaboradorId={linha.colaboradorId}
                          className="size-5 shrink-0"
                          fallbackClassName="text-[0.55rem]"
                        />
                        <SelectValue placeholder="Escolher" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLABORADORES.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center" title={`${ocupado}h de ${capacidade}h ocupadas nesse dia`}>
                    {linha.colaboradorId &&
                      (disponivel ? (
                        <Check className="mx-auto size-4 text-success" />
                      ) : (
                        <X className="mx-auto size-4 text-warning" />
                      ))}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <button
        type="button"
        disabled={!todasComExecutor}
        onClick={criar}
        className="rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Criar atividade
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <Rotulo>Planejamento da atividade</Rotulo>
        <button
          type="button"
          onClick={() => setExpandido(true)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Abrir em tela cheia"
          title="Abrir em tela cheia"
        >
          <Maximize2 className="size-3.5" />
        </button>
      </div>

      {expandido ? (
        <Dialog open onOpenChange={(v) => !v && setExpandido(false)}>
          <DialogContent className="flex h-[92vh] w-[96vw] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
            <DialogHeader className="border-b border-border/60 p-4 pb-3">
              <DialogTitle>Planejamento da atividade — {tarefa.titulo}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="min-w-0 flex-1 px-4 py-3">
              <div className="flex flex-col gap-3 pb-4">{conteudo}</div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      ) : (
        conteudo
      )}
    </div>
  );
}
