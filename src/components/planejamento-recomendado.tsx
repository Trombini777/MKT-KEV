"use client";

import { useState, useMemo } from "react";
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
import {
  useTasks,
  aplicarPlanejamento,
  atualizarPrazoTarefa,
  moveTask,
  replanejarEtapasDaAtividade,
} from "@/lib/task-store";
import { anoDoPrazoValido, MENSAGEM_ANO_INVALIDO } from "@/lib/validacao-data";
import {
  calcularPlanejamentoSimples,
  classificarStatus,
  distribuirHorasPorDia,
  foraDeOrdemCronologica,
  passosUteisEntre,
  proximoDiaUtil,
  type ExecutorPorEtapa,
} from "@/lib/scheduling";
import {
  COLABORADORES,
  colaboradorEhOperacional,
  etapaById,
  tipoById,
  horasAlocadasPorDia,
  capacidadeDiaria,
  type Tarefa,
  type StatusPlanejamento,
} from "@/lib/mock";
import { isoHoje } from "@/lib/hoje";
import { horarioParaDecimal, decimalParaHorarioInput, decimalParaHorario } from "@/lib/time-format";

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

/**
 * `modoReplanejamento`: em vez de sugerir um planejamento do zero (fluxo de Triagem), edita as
 * etapas ATUAL/futuras de um planejamento já aplicado — etapas concluídas ficam só leitura, e
 * salvar chama `replanejarEtapasDaAtividade` (update in-place) em vez de `aplicarPlanejamento`
 * (que sempre cria do zero). `onSalvar` avisa quem renderizou (o Dialog de replanejamento em
 * task-detail-sheet.tsx) que terminou, pra fechar a tela.
 */
export function PlanejamentoRecomendado({
  tarefa,
  modoReplanejamento = false,
  onSalvar,
}: {
  tarefa: Tarefa;
  modoReplanejamento?: boolean;
  onSalvar?: () => void;
}) {
  const tarefasLive = useTasks();
  // No replanejamento, a própria tarefa já está em tarefasLive com o plano ANTIGO — sem excluí-la,
  // a checagem de disponibilidade abaixo contaria a alocação atual dela contra si mesma (sempre
  // "ocupado" pelo que ela mesma já tinha reservado naquele dia).
  const tarefasParaCapacidade = modoReplanejamento
    ? tarefasLive.filter((t) => t.id !== tarefa.id)
    : tarefasLive;
  // "Não operacional" não aparece como opção de executor aqui — continua vendo o sistema, só não
  // entra como escolha pra assumir uma etapa.
  const colaboradoresOperacionais = COLABORADORES.filter(colaboradorEhOperacional);
  const tipo = tipoById(tarefa.tipoId);
  const planejamentoExistente = modoReplanejamento ? tarefa.planejamento : undefined;
  const etapaAtualOrdem = planejamentoExistente?.etapaAtualOrdem ?? 1;

  // Um único passe sobre planejamentoExistente.etapas pra derivar o estado inicial da tabela de
  // replanejamento (antes eram 4 loops independentes, um por useState). Só as etapas CONCLUÍDAS
  // (ordem < etapaAtualOrdem) entram em concluirBloqueadas — são a âncora fixa da cadeia. As
  // editáveis não começam com data forçada: recalculam pela duração, igual ao fluxo de criação
  // (sem isso, precisaria "desforçar" cada etapa posterior a cada edição em cadeia).
  const seedReplanejamento = useMemo(() => {
    if (!planejamentoExistente) return null;
    const etapasReais = [...planejamentoExistente.etapas].sort((a, b) => a.ordem - b.ordem);
    const executores: ExecutorPorEtapa = {};
    const duracoes: Record<number, number> = {};
    const horas: Record<number, number> = {};
    const concluirBloqueadas: Record<number, string> = {};
    // Mesma convenção de cursor que calcularPlanejamentoSimples usa pra frente (etapa seguinte
    // começa no mesmo dia em que a anterior termina, duração 0 é válido), contando em dias úteis
    // (passosUteisEntre) — não corridos, senão um intervalo que cruza fim de semana erra a conta.
    let cursor = proximoDiaUtil(tarefa.dataInicio || isoHoje());
    for (const e of etapasReais) {
      executores[e.ordem] = e.colaboradorId;
      duracoes[e.ordem] = passosUteisEntre(cursor, e.dataFim);
      horas[e.ordem] = e.alocacoes.reduce((soma, a) => soma + a.horas, 0);
      if (e.ordem < planejamentoExistente.etapaAtualOrdem) concluirBloqueadas[e.ordem] = e.dataFim;
      cursor = e.dataFim;
    }
    return { executores, duracoes, horas, concluirBloqueadas };
  }, [planejamentoExistente, tarefa.dataInicio]);

  const [executoresPorEtapa, setExecutoresPorEtapa] = useState<ExecutorPorEtapa>(
    () =>
      seedReplanejamento?.executores ??
      Object.fromEntries(
        (tipo?.etapas ?? [])
          .filter((e) => e.executorPadraoId)
          .map((e) => [e.ordem, e.executorPadraoId as string])
      )
  );
  const [duracoesPorEtapa, setDuracoesPorEtapa] = useState<Record<number, number>>(
    () => seedReplanejamento?.duracoes ?? {}
  );
  const [horasPorEtapa, setHorasPorEtapa] = useState<Record<number, number>>(
    () => seedReplanejamento?.horas ?? {}
  );
  const [iniciosForcados, setIniciosForcados] = useState<Record<number, string>>({});
  const [concluirForcados, setConcluirForcados] = useState<Record<number, string>>(
    () => seedReplanejamento?.concluirBloqueadas ?? {}
  );
  const [editandoDataDesejada, setEditandoDataDesejada] = useState(false);
  const [dataDesejadaInput, setDataDesejadaInput] = useState("");
  const [expandido, setExpandido] = useState(false);
  const [planejando, setPlanejando] = useState(false);
  const [salvandoReplanejamento, setSalvandoReplanejamento] = useState(false);
  const [erroReplanejamento, setErroReplanejamento] = useState(false);

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
  // Só relevante no replanejamento: as etapas concluídas entram na cadeia com data real fixa
  // (concluirForcados), então uma data "fora de ordem" só pode vir de edição manual numa etapa
  // editável — trava o Salvar em vez de deixar a sequência inconsistente.
  const foraDeOrdem = modoReplanejamento && foraDeOrdemCronologica(linhas);

  function confirmarDataDesejada() {
    if (!dataDesejadaInput || !anoDoPrazoValido(dataDesejadaInput)) return;
    atualizarPrazoTarefa(tarefa.id, dataDesejadaInput);
    setEditandoDataDesejada(false);
  }

  async function salvarReplanejamento() {
    if (!todasComExecutor || foraDeOrdem || salvandoReplanejamento) return;
    setSalvandoReplanejamento(true);
    setErroReplanejamento(false);
    const etapasEditadas = linhas
      .filter((l) => l.ordem >= etapaAtualOrdem)
      .map((l) => ({
        etapaId: l.etapaId,
        ordem: l.ordem,
        colaboradorId: l.colaboradorId,
        alocacoes: distribuirHorasPorDia(l.inicioEm, l.concluirEm, l.horas),
        dataFim: l.concluirEm,
      }));
    const sucesso = await replanejarEtapasDaAtividade(
      tarefa.id,
      etapasEditadas,
      classificarStatus(previsaoConclusao, tarefa.prazo || undefined)
    );
    setSalvandoReplanejamento(false);
    // Só fecha a tela quando o servidor confirma — senão uma falha parcial/total ficaria
    // escondida atrás de um "salvo com sucesso" falso (a tela some como se tivesse dado certo).
    if (sucesso) {
      onSalvar?.();
    } else {
      setErroReplanejamento(true);
    }
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
          alocacoes: distribuirHorasPorDia(l.inicioEm, l.concluirEm, l.horas),
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

  if (tarefa.planejamento && !modoReplanejamento) {
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
          <span className="text-sm font-medium">{decimalParaHorario(esforcoPrevisto)}</span>
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
                ? horasAlocadasPorDia(linha.colaboradorId, linha.concluirEm, {}, tarefasParaCapacidade)
                : 0;
              const capacidade = linha.colaboradorId ? capacidadeDiaria(linha.colaboradorId) : 0;
              const disponivel = linha.colaboradorId ? ocupado + linha.horas <= capacidade : false;
              // No replanejamento, etapa já concluída é só leitura — mostra o que de fato
              // aconteceu, sem input, e não entra na validação de disponibilidade (já passou).
              const bloqueada = modoReplanejamento && etapaDoTipo.ordem < etapaAtualOrdem;
              return (
                <TableRow key={etapaDoTipo.ordem} className={cn(bloqueada && "text-muted-foreground")}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {etapaInfo?.nome ?? "—"}
                  </TableCell>
                  <TableCell>
                    {bloqueada ? (
                      "—"
                    ) : (
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
                    )}
                  </TableCell>
                  <TableCell>
                    {bloqueada ? (
                      decimalParaHorario(linha.horas)
                    ) : (
                      <div className="relative inline-block">
                        <Input
                          type="time"
                          value={decimalParaHorarioInput(linha.horas)}
                          onChange={(e) =>
                            setHorasPorEtapa((prev) => ({
                              ...prev,
                              [etapaDoTipo.ordem]: horarioParaDecimal(e.target.value) ?? 0,
                            }))
                          }
                          className="h-8 w-32 pr-9"
                        />
                        <span className="pointer-events-none absolute top-1/2 right-8 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                          h
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className={cn(bloqueada && "text-xs")}>
                    {bloqueada ? (
                      dataAbreviada(linha.inicioEm)
                    ) : (
                      <>
                        <Input
                          type="date"
                          value={linha.inicioEm}
                          onChange={(e) => {
                            if (!e.target.value) return;
                            setIniciosForcados((prev) => ({ ...prev, [etapaDoTipo.ordem]: e.target.value }));
                          }}
                          className="h-8 w-[8.75rem] text-xs"
                        />
                        <span className="mt-0.5 block text-[0.65rem] text-muted-foreground">
                          {diaDaSemana(linha.inicioEm)}
                        </span>
                      </>
                    )}
                  </TableCell>
                  <TableCell className={cn(bloqueada && "text-xs")}>
                    {bloqueada ? (
                      dataAbreviada(linha.concluirEm)
                    ) : (
                      <>
                        <Input
                          type="date"
                          value={linha.concluirEm}
                          onChange={(e) => {
                            if (!e.target.value) return;
                            setConcluirForcados((prev) => ({ ...prev, [etapaDoTipo.ordem]: e.target.value }));
                          }}
                          className="h-8 w-[8.75rem] text-xs"
                        />
                        <span className="mt-0.5 block text-[0.65rem] text-muted-foreground">
                          {diaDaSemana(linha.concluirEm)}
                        </span>
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    {bloqueada ? (
                      <div className="flex items-center gap-1.5">
                        <ColaboradorAvatar
                          colaboradorId={linha.colaboradorId}
                          className="size-5 shrink-0"
                          fallbackClassName="text-[0.55rem]"
                        />
                        <span className="truncate text-xs">
                          {COLABORADORES.find((c) => c.id === linha.colaboradorId)?.nome ?? "—"}
                        </span>
                      </div>
                    ) : (
                      <Select
                        // `items` alimenta o label do valor selecionado — usa a lista completa (não só
                        // operacionais) pra continuar mostrando o nome de quem já estava atribuído
                        // antes de virar "Não operacional"; as opções abertas no dropdown (abaixo)
                        // continuam restritas aos operacionais.
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
                          {colaboradoresOperacionais.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-center"
                    title={
                      bloqueada
                        ? undefined
                        : `${decimalParaHorario(ocupado)} de ${decimalParaHorario(capacidade)} ocupadas nesse dia`
                    }
                  >
                    {!bloqueada &&
                      linha.colaboradorId &&
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

      {foraDeOrdem && (
        <p className="text-xs text-destructive">
          Uma das datas ficou antes da etapa anterior — ajusta antes de salvar.
        </p>
      )}
      {erroReplanejamento && (
        <p className="text-xs text-destructive">
          Não deu pra salvar o replanejamento agora — tenta de novo em instantes.
        </p>
      )}
      <button
        type="button"
        disabled={!todasComExecutor || foraDeOrdem || salvandoReplanejamento}
        onClick={modoReplanejamento ? salvarReplanejamento : criar}
        className="rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {modoReplanejamento
          ? salvandoReplanejamento
            ? "Salvando..."
            : "Salvar replanejamento"
          : "Criar atividade"}
      </button>
    </>
  );

  // Em modo replanejamento, quem renderiza (o Dialog em task-detail-sheet.tsx) já dá o
  // enquadramento de "tela cheia" — aqui basta o conteúdo, sem a caixa/label/botão de expandir
  // da versão usada na Triagem.
  if (modoReplanejamento) return conteudo;

  if (!planejando) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
        <div>
          <Rotulo>Planejamento da atividade</Rotulo>
          <p className="mt-1 text-sm text-muted-foreground">
            {esforcoPrevisto > 0
              ? `~${decimalParaHorario(esforcoPrevisto)} de esforço previsto`
              : "Configure as etapas pra ver o esforço e o prazo previstos."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPlanejando(true)}
          className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Planejar atividade
        </button>
      </div>
    );
  }

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
