"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { cn } from "@/lib/utils";
import { useEtapas } from "@/lib/etapa-store";
import { horarioParaDecimal, decimalParaHorario, decimalParaHorarioInput } from "@/lib/time-format";
import {
  COLABORADORES,
  colaboradorEhOperacional,
  etapaById,
  type EtapaDoTipo,
  type TipoTarefa,
  type UnidadeMedida,
} from "@/lib/mock";

const PASSOS = [
  { numero: 1, titulo: "Sobre a atividade" },
  { numero: 2, titulo: "Fluxo de trabalho" },
  { numero: 3, titulo: "Revisão" },
] as const;

function SeletorUnidadeMedida({
  unidades,
  tipos,
  valor,
  onSelecionar,
  onCriar,
  onEditar,
  onExcluir,
}: {
  unidades: UnidadeMedida[];
  tipos: TipoTarefa[];
  valor: string;
  onSelecionar: (id: string) => void;
  onCriar: (unidade: UnidadeMedida) => void;
  onEditar: (id: string, novoNome: string) => void;
  onExcluir: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [criando, setCriando] = useState(false);
  const [nomeNovo, setNomeNovo] = useState("");

  const selecionada = unidades.find((u) => u.id === valor);

  function unidadeEmUso(id: string) {
    return tipos.some((t) => t.ativo && t.unidadeMedidaId === id);
  }

  function iniciarEdicao(u: UnidadeMedida) {
    setEditandoId(u.id);
    setNomeEdicao(u.nome);
  }

  function confirmarEdicao() {
    const nome = nomeEdicao.trim();
    if (nome && editandoId) onEditar(editandoId, nome);
    setEditandoId(null);
  }

  function confirmarCriacao() {
    const nome = nomeNovo.trim();
    if (!nome) {
      setCriando(false);
      return;
    }
    const id = `unidade-${Date.now()}`;
    onCriar({ id, nome });
    onSelecionar(id);
    setCriando(false);
    setNomeNovo("");
  }

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setEditandoId(null);
          setCriando(false);
          setNomeNovo("");
        }
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <span className={cn(!selecionada && "text-muted-foreground")}>
          {selecionada?.nome ?? "Nenhuma"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-70 p-1.5">
        <button
          onClick={() => {
            onSelecionar("");
            setOpen(false);
          }}
          className="rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
        >
          Nenhuma
        </button>

        <div className="flex flex-col gap-0.5">
          {unidades.map((u) =>
            editandoId === u.id ? (
              <div key={u.id} className="flex items-center gap-1.5 px-0.5 py-0.5">
                <Input
                  autoFocus
                  value={nomeEdicao}
                  onChange={(e) => setNomeEdicao(e.target.value)}
                  className="h-7 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmarEdicao();
                    if (e.key === "Escape") setEditandoId(null);
                  }}
                />
                <button
                  onClick={confirmarEdicao}
                  className="shrink-0 text-success"
                  aria-label="Salvar"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="shrink-0 text-muted-foreground"
                  aria-label="Cancelar"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <div
                key={u.id}
                className="group flex items-center gap-1 rounded-md px-0.5 py-0.5 hover:bg-muted"
              >
                <button
                  onClick={() => {
                    onSelecionar(u.id);
                    setOpen(false);
                  }}
                  className="min-w-0 flex-1 truncate rounded px-1.5 py-1 text-left text-sm"
                >
                  {u.nome}
                </button>
                <button
                  onClick={() => iniciarEdicao(u)}
                  className="hidden shrink-0 p-1 text-muted-foreground hover:text-foreground group-hover:block"
                  aria-label="Editar unidade"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (!unidadeEmUso(u.id)) onExcluir(u.id);
                  }}
                  disabled={unidadeEmUso(u.id)}
                  title={
                    unidadeEmUso(u.id)
                      ? "Em uso por um tipo de tarefa ativo — não pode ser excluída"
                      : "Excluir"
                  }
                  className={cn(
                    "hidden shrink-0 p-1 group-hover:block",
                    unidadeEmUso(u.id)
                      ? "cursor-not-allowed text-muted-foreground/40"
                      : "text-muted-foreground hover:text-destructive"
                  )}
                  aria-label="Excluir unidade"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )
          )}
        </div>

        {criando ? (
          <div className="flex items-center gap-1.5 border-t border-border/60 pt-1.5">
            <Input
              autoFocus
              value={nomeNovo}
              onChange={(e) => setNomeNovo(e.target.value)}
              placeholder="Ex.: Slides"
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmarCriacao();
                if (e.key === "Escape") setCriando(false);
              }}
            />
            <button
              onClick={confirmarCriacao}
              className="shrink-0 text-success"
              aria-label="Adicionar"
            >
              <Check className="size-4" />
            </button>
            <button
              onClick={() => setCriando(false)}
              className="shrink-0 text-muted-foreground"
              aria-label="Cancelar"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCriando(true)}
            className="flex items-center gap-1.5 border-t border-border/60 px-1.5 pt-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" />
            Nova unidade
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

function PopoverChecklist({
  emptyLabel,
  options,
  selected,
  onToggle,
}: {
  emptyLabel: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-8 w-full items-center justify-between gap-1 rounded-md border border-input bg-transparent px-2 text-xs outline-none hover:bg-muted"
          />
        }
      >
        <span className={cn("truncate", selected.length === 0 && "text-muted-foreground")}>
          {selected.length > 0
            ? `${selected.length} selecionada${selected.length > 1 ? "s" : ""}`
            : emptyLabel}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1.5">
        {options.length === 0 ? (
          <p className="px-1.5 py-1 text-xs text-muted-foreground">Nenhuma opção disponível.</p>
        ) : (
          <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
            {options.map((opt) => {
              const marcado = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onToggle(opt.id)}
                  className="flex items-center gap-2 rounded px-1.5 py-1 text-left text-xs hover:bg-muted"
                >
                  <span
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded border",
                      marcado ? "border-primary bg-primary text-primary-foreground" : "border-input"
                    )}
                  >
                    {marcado && <Check className="size-2.5" />}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function TipoTarefaSheet({
  tipos,
  unidadesMedida,
  onCriarUnidadeMedida,
  onEditarUnidadeMedida,
  onExcluirUnidadeMedida,
  onCriar,
  onEditar,
  tipoParaEditar,
  open: openControlado,
  onOpenChange: onOpenChangeControlado,
}: {
  tipos: TipoTarefa[];
  unidadesMedida: UnidadeMedida[];
  onCriarUnidadeMedida: (unidade: UnidadeMedida) => void;
  onEditarUnidadeMedida: (id: string, novoNome: string) => void;
  onExcluirUnidadeMedida: (id: string) => void;
  onCriar?: (tipo: TipoTarefa) => void;
  onEditar?: (tipo: TipoTarefa) => void;
  /** Quando informado, o sheet abre em modo de edição, pré-preenchido com os dados desse tipo. */
  tipoParaEditar?: TipoTarefa;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  // "Não operacional" não aparece como opção de executor padrão nem de outros executores.
  const colaboradoresOperacionais = COLABORADORES.filter(colaboradorEhOperacional);
  const editando = !!tipoParaEditar;
  const controlado = openControlado !== undefined;
  const [openInterno, setOpenInterno] = useState(false);
  const open = openControlado ?? openInterno;
  const setOpen = onOpenChangeControlado ?? setOpenInterno;

  const catalogoEtapas = useEtapas();
  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [nome, setNome] = useState(tipoParaEditar?.nome ?? "");
  const [descricao, setDescricao] = useState(tipoParaEditar?.descricao ?? "");
  const [etapas, setEtapas] = useState<EtapaDoTipo[]>(tipoParaEditar?.etapas ?? []);

  const [unidadeMedidaId, setUnidadeMedidaId] = useState(tipoParaEditar?.unidadeMedidaId ?? "");

  const totalHoras = etapas.reduce((acc, e) => acc + (e.estimativaHoras ?? 0), 0);
  const unidadeSelecionada = unidadesMedida.find((u) => u.id === unidadeMedidaId);
  const etapasDisponiveis = catalogoEtapas.filter((e) => !etapas.some((ed) => ed.etapaId === e.id));

  function resetar() {
    setPasso(1);
    setNome(tipoParaEditar?.nome ?? "");
    setDescricao(tipoParaEditar?.descricao ?? "");
    setEtapas(tipoParaEditar?.etapas ?? []);
    setUnidadeMedidaId(tipoParaEditar?.unidadeMedidaId ?? "");
  }

  /** Adiciona a etapa ao final da sequência, na ordem em que for clicada — já pronta pra
   *  editar direto na tabela, sem abrir um formulário separado. */
  function adicionarEtapa(etapaId: string) {
    setEtapas((prev) => [
      ...prev,
      {
        etapaId,
        ordem: prev.length + 1,
        estimativaHoras: undefined,
        executorPadraoId: undefined,
        dependeDe: prev.length > 0 ? [prev.length] : undefined,
        podeDividir: true,
        executoresPermitidosIds: undefined,
      },
    ]);
  }

  function atualizarEtapa(ordem: number, patch: Partial<EtapaDoTipo>) {
    setEtapas((prev) => prev.map((e) => (e.ordem === ordem ? { ...e, ...patch } : e)));
  }

  function alternarDependeDe(ordem: number, ordemDependida: number) {
    setEtapas((prev) =>
      prev.map((e) => {
        if (e.ordem !== ordem) return e;
        const atual = e.dependeDe ?? [];
        const novo = atual.includes(ordemDependida)
          ? atual.filter((o) => o !== ordemDependida)
          : [...atual, ordemDependida];
        return { ...e, dependeDe: novo.length ? novo : undefined };
      })
    );
  }

  function alternarExecutorPermitido(ordem: number, colaboradorId: string) {
    setEtapas((prev) =>
      prev.map((e) => {
        if (e.ordem !== ordem) return e;
        const atual = e.executoresPermitidosIds ?? [];
        const novo = atual.includes(colaboradorId)
          ? atual.filter((id) => id !== colaboradorId)
          : [...atual, colaboradorId];
        return { ...e, executoresPermitidosIds: novo.length ? novo : undefined };
      })
    );
  }

  /** Remove a etapa e reindexa a ordem de todo mundo, tirando também qualquer referência
   *  de "depende de" que apontava pra ela e ajustando as que apontavam pra quem passou pra
   *  frente na fila. */
  function removerEtapa(ordemRemovida: number) {
    setEtapas((prev) => {
      const restantes = prev.filter((e) => e.ordem !== ordemRemovida);
      return restantes.map((e, i) => {
        const novoDependeDe = e.dependeDe
          ?.filter((d) => d !== ordemRemovida)
          .map((d) => (d > ordemRemovida ? d - 1 : d));
        return { ...e, ordem: i + 1, dependeDe: novoDependeDe?.length ? novoDependeDe : undefined };
      });
    });
  }

  /** Move a etapa uma posição pra cima/baixo na sequência, remapeando "depende de" de todo
   *  mundo pra continuar apontando pras mesmas etapas depois da troca de posição — e descarta
   *  qualquer dependência que a troca deixaria apontando "pra frente" (etapa que passou a vir
   *  depois dela), já que isso não é uma dependência válida. */
  function moverEtapa(ordem: number, direcao: -1 | 1) {
    setEtapas((prev) => {
      const idx = prev.findIndex((e) => e.ordem === ordem);
      const alvoIdx = idx + direcao;
      if (idx < 0 || alvoIdx < 0 || alvoIdx >= prev.length) return prev;
      const copia = [...prev];
      [copia[idx], copia[alvoIdx]] = [copia[alvoIdx], copia[idx]];
      const mapaOrdem = new Map(copia.map((e, i) => [e.ordem, i + 1]));
      return copia.map((e, i) => {
        const novaOrdem = i + 1;
        const novoDependeDe = e.dependeDe
          ?.map((d) => mapaOrdem.get(d))
          .filter((d): d is number => d != null && d < novaOrdem);
        return { ...e, ordem: novaOrdem, dependeDe: novoDependeDe?.length ? novoDependeDe : undefined };
      });
    });
  }

  function salvar() {
    if (!nome.trim()) return;
    const hoje = new Date().toISOString().slice(0, 10);
    if (editando && tipoParaEditar) {
      onEditar?.({
        ...tipoParaEditar,
        nome: nome.trim(),
        descricao: descricao.trim(),
        unidadeMedidaId: unidadeMedidaId || undefined,
        etapas,
        atualizadoEm: hoje,
      });
    } else {
      onCriar?.({
        id: `tipo-${Date.now()}`,
        nome: nome.trim(),
        descricao: descricao.trim(),
        ativo: true,
        unidadeMedidaId: unidadeMedidaId || undefined,
        etapas,
        atualizadoEm: hoje,
      });
    }
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) resetar();
      }}
    >
      {!controlado && (
        <DialogTrigger render={<Button className="gap-1.5 shadow-sm" />}>
          <Plus className="size-4" />
          Criar Novo Tipo de Tarefa
        </DialogTrigger>
      )}
      <DialogContent
        className={cn(
          "w-full gap-0 overflow-hidden p-0 transition-[max-width]",
          passo === 2 ? "sm:max-w-4xl" : "sm:max-w-xl"
        )}
      >
        <DialogHeader className="gap-4 p-5 pb-4">
          <div>
            <DialogTitle>{editando ? "Editar tipo de tarefa" : "Novo tipo de tarefa"}</DialogTitle>
            <DialogDescription>
              {editando
                ? "Altere os dados dessa atividade. As mudanças valem para as próximas tarefas criadas com esse tipo."
                : "Cadastre um novo tipo de atividade. Assim que salvar, ele fica disponível para qualquer pessoa do time escolher na hora de criar uma tarefa."}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {PASSOS.map((p, i) => (
              <div key={p.numero} className="flex flex-1 items-center gap-2 last:flex-none">
                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    passo === p.numero
                      ? "bg-primary text-primary-foreground"
                      : passo > p.numero
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {p.numero}
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium",
                    passo === p.numero ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {p.titulo}
                </span>
                {i < PASSOS.length - 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="min-w-0 max-h-[55vh] px-5">
          {passo === 1 ? (
            <div className="flex flex-col gap-5 pb-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="tipo-nome">Nome da atividade</Label>
                <Input
                  id="tipo-nome"
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Banner"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="tipo-descricao">Descrição da atividade</Label>
                <p className="text-xs text-muted-foreground">
                  Explique em poucas palavras o que essa atividade é e o que a pessoa vai
                  produzir ao executá-la — isso ajuda quem for abrir uma tarefa desse tipo a
                  saber se é exatamente o que precisa.
                </p>
                <Textarea
                  id="tipo-descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex.: Peça gráfica única para redes sociais, como feed, stories ou carrossel."
                  className="min-h-24"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Unidade de medida (opcional)</Label>
                <p className="text-xs text-muted-foreground">
                  Como essa atividade é contada — por exemplo, Slides, Páginas ou Artes. Quem for
                  criar uma tarefa desse tipo vai poder informar a quantidade nessa unidade.
                </p>
                <SeletorUnidadeMedida
                  unidades={unidadesMedida}
                  tipos={tipos}
                  valor={unidadeMedidaId}
                  onSelecionar={setUnidadeMedidaId}
                  onCriar={onCriarUnidadeMedida}
                  onEditar={onEditarUnidadeMedida}
                  onExcluir={onExcluirUnidadeMedida}
                />
              </div>
            </div>
          ) : passo === 2 ? (
            <div className="flex flex-col gap-3 pb-5">
              <p className="text-xs text-muted-foreground">
                Clique nas etapas abaixo, na ordem em que elas acontecem, pra montar o fluxo.
                Depois é só editar cada uma direto na tabela — executor, tempo, dependências e o
                SLA (quantos dias corridos ela costuma levar até ser entregue, mesmo que exija
                pouco tempo de trabalho — ex.: aprovação do cliente).
              </p>

              {etapasDisponiveis.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {etapasDisponiveis.map((etapa) => (
                    <button
                      key={etapa.id}
                      type="button"
                      onClick={() => adicionarEtapa(etapa.id)}
                      className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Plus className="size-3" />
                      {etapa.nome}
                    </button>
                  ))}
                </div>
              )}

              {etapas.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
                  Nenhuma etapa ainda — clique numa etapa acima pra começar a montar o fluxo.
                </p>
              ) : (
                <div className="rounded-lg border border-border/60">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-9"></TableHead>
                        <TableHead>Etapa</TableHead>
                        <TableHead>Executor padrão</TableHead>
                        <TableHead className="w-36">Estimativa (h)</TableHead>
                        <TableHead className="w-24">Estimativa (d)</TableHead>
                        <TableHead className="w-16 text-center">Divide?</TableHead>
                        <TableHead className="w-32">Depende de</TableHead>
                        <TableHead className="w-32">Outros executores</TableHead>
                        <TableHead className="w-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {etapas.map((etapaDoTipo, i) => {
                        const etapa = etapaById(etapaDoTipo.etapaId);
                        const opcoesDependeDe = etapas
                          .filter((e) => e.ordem < etapaDoTipo.ordem)
                          .map((e) => ({
                            id: String(e.ordem),
                            label: `${e.ordem}. ${etapaById(e.etapaId)?.nome ?? "—"}`,
                          }));
                        const opcoesExecutores = colaboradoresOperacionais
                          .filter((c) => c.id !== etapaDoTipo.executorPadraoId)
                          .map((c) => ({ id: c.id, label: c.nome }));
                        return (
                          <TableRow key={etapaDoTipo.ordem}>
                            <TableCell>
                              <div className="flex flex-col items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => moverEtapa(etapaDoTipo.ordem, -1)}
                                  disabled={i === 0}
                                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                  aria-label="Mover etapa pra cima"
                                >
                                  <ChevronUp className="size-3.5" />
                                </button>
                                <span className="text-xs font-semibold text-muted-foreground">
                                  {etapaDoTipo.ordem}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => moverEtapa(etapaDoTipo.ordem, 1)}
                                  disabled={i === etapas.length - 1}
                                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                  aria-label="Mover etapa pra baixo"
                                >
                                  <ChevronDown className="size-3.5" />
                                </button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              {etapa?.nome ?? "—"}
                            </TableCell>
                            <TableCell>
                              <Select
                                // `items` alimenta o label do valor selecionado — lista completa pra
                                // manter o nome de quem já era executor padrão mesmo se virar "Não
                                // operacional"; as opções do dropdown continuam restritas abaixo.
                                items={Object.fromEntries(COLABORADORES.map((c) => [c.id, c.nome]))}
                                value={etapaDoTipo.executorPadraoId ?? ""}
                                onValueChange={(v) =>
                                  typeof v === "string" &&
                                  atualizarEtapa(etapaDoTipo.ordem, {
                                    executorPadraoId: v || undefined,
                                  })
                                }
                              >
                                <SelectTrigger className="h-8 w-40 gap-1.5">
                                  <ColaboradorAvatar
                                    colaboradorId={etapaDoTipo.executorPadraoId}
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
                            </TableCell>
                            <TableCell>
                              <div className="relative inline-block">
                                <Input
                                  type="time"
                                  value={
                                    etapaDoTipo.estimativaHoras != null
                                      ? decimalParaHorarioInput(etapaDoTipo.estimativaHoras)
                                      : ""
                                  }
                                  onChange={(e) =>
                                    atualizarEtapa(etapaDoTipo.ordem, {
                                      estimativaHoras: horarioParaDecimal(e.target.value),
                                    })
                                  }
                                  className="h-8 w-32 pr-9"
                                />
                                <span className="pointer-events-none absolute top-1/2 right-8 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                  h
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="relative inline-block">
                                <Input
                                  type="number"
                                  min={1}
                                  step={1}
                                  placeholder="—"
                                  value={etapaDoTipo.slaDias ?? ""}
                                  onChange={(e) => {
                                    const valor = e.target.value ? Number(e.target.value) : undefined;
                                    atualizarEtapa(etapaDoTipo.ordem, {
                                      slaDias: valor && valor >= 1 ? valor : undefined,
                                    });
                                  }}
                                  className="h-8 w-16 pr-5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                  d
                                </span>
                              </div>
                            </TableCell>
                            <TableCell
                              className="text-center"
                              title={
                                etapaDoTipo.slaDias
                                  ? "Definido pelo SLA — a etapa já é dividida pelos dias do SLA"
                                  : undefined
                              }
                            >
                              <Switch
                                checked={!!etapaDoTipo.slaDias || (etapaDoTipo.podeDividir ?? true)}
                                disabled={!!etapaDoTipo.slaDias}
                                onCheckedChange={(v) =>
                                  atualizarEtapa(etapaDoTipo.ordem, { podeDividir: v })
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <PopoverChecklist
                                emptyLabel={opcoesDependeDe.length ? "Nenhuma" : "—"}
                                options={opcoesDependeDe}
                                selected={(etapaDoTipo.dependeDe ?? []).map(String)}
                                onToggle={(id) =>
                                  alternarDependeDe(etapaDoTipo.ordem, Number(id))
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <PopoverChecklist
                                emptyLabel="Só o padrão"
                                options={opcoesExecutores}
                                selected={etapaDoTipo.executoresPermitidosIds ?? []}
                                onToggle={(id) =>
                                  alternarExecutorPermitido(etapaDoTipo.ordem, id)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                onClick={() => removerEtapa(etapaDoTipo.ordem)}
                                className="text-muted-foreground hover:text-destructive"
                                aria-label="Remover etapa"
                              >
                                <X className="size-3.5" />
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {etapas.length > 0 && (
                <p className="text-right text-xs font-medium text-muted-foreground">
                  Tempo total: {decimalParaHorario(totalHoras)}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-5">
              <p className="text-xs text-muted-foreground">
                Confira como essa atividade vai ficar antes de salvar.
              </p>

              <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Nome
                </p>
                <p className="mt-0.5 text-sm font-medium">{nome || "—"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Descrição
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {descricao || "Sem descrição."}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Unidade de medida
                </p>
                {unidadeSelecionada ? (
                  <span className="mt-1 inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    {unidadeSelecionada.nome}
                  </span>
                ) : (
                  <p className="mt-0.5 text-sm text-muted-foreground">Nenhuma</p>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Fluxo de trabalho
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Tempo total: {decimalParaHorario(totalHoras)}
                  </span>
                </div>
                {etapas.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma etapa adicionada.</p>
                ) : (
                  <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                    {etapas.map((etapaDoTipo, i) => {
                      const etapa = etapaById(etapaDoTipo.etapaId);
                      return (
                        <li key={etapaDoTipo.ordem} className="flex items-center gap-1.5">
                          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                            {etapa?.nome ?? "—"}
                          </span>
                          {i < etapas.length - 1 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Etapas
                  </p>
                  <p className="text-lg font-semibold">{etapas.length}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Tempo previsto
                  </p>
                  <p className="text-lg font-semibold">{decimalParaHorario(totalHoras)}</p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mx-0 mb-0 flex-row items-center justify-between border-t border-border/60 bg-transparent p-4">
          {passo > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setPasso((p) => (p - 1) as 1 | 2)}
              className="gap-1.5"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
          ) : (
            <span />
          )}
          {passo < 3 ? (
            <Button
              onClick={() => setPasso((p) => (p + 1) as 2 | 3)}
              disabled={!nome.trim()}
              className="gap-1.5"
            >
              Continuar
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={salvar}>
              {editando ? "Salvar alterações" : "Salvar tipo de tarefa"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
