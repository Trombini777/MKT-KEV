"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { PlanejamentoRecomendado } from "@/components/planejamento-recomendado";
import { RegistroTempoEtapa } from "@/components/registro-tempo-etapa";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusProjetoBadge } from "@/components/status-projeto-badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useTasks,
  moveTask,
  registrarAprovacaoInterna,
  atualizarTipoTarefa,
  definirRespostaTriagem,
  atribuirResponsavelEtapa,
  reatribuirExecutorEtapa,
  avancarEtapaPlanejamento,
  marcarEtapaChecada,
  iniciarAtividade,
  atualizarTitulo,
  vincularProjeto,
  adicionarComentario,
  adicionarAnexo,
  adicionarLink,
  alternarChecklistItem,
  adicionarChecklistItem,
  ajustarEtapaEmExecucao,
} from "@/lib/task-store";
import { useEtapas } from "@/lib/etapa-store";
import { useColaboradores } from "@/lib/colaborador-store";
import { useTiposTarefa } from "@/lib/tipo-tarefa-store";
import { useProjetos } from "@/lib/projeto-store";
import { anoDoPrazoValido, MENSAGEM_ANO_INVALIDO } from "@/lib/validacao-data";
import { isoHoje, diasEntre } from "@/lib/hoje";
import {
  faseById,
  etapaById,
  nomeTipo,
  nomeTag,
  nomeColaborador,
  projetoById,
  PROJETOS,
  estaEmRisco,
  destinosPermitidos,
  TIPOS_TAREFA,
  COLABORADORES,
  type Tarefa,
  type HistoricoEvento,
} from "@/lib/mock";
import {
  CheckSquare,
  Square,
  User,
  Mail,
  Building2,
  Heading,
  AlignLeft,
  Paperclip,
  Link2,
  Plus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  AlertTriangle,
  MessageSquareText,
  Hash,
  Calendar,
  Play,
  FileText,
  Pencil,
} from "lucide-react";
import { useState, useRef } from "react";

function formatData(iso: string) {
  if (!iso) return "-";
  const [ano, mes, dia] = iso.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
}

function tempoRelativo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return "agora mesmo";
  if (minutos < 60) return `há ${minutos} minuto${minutos === 1 ? "" : "s"}`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} hora${horas === 1 ? "" : "s"}`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} dia${dias === 1 ? "" : "s"}`;
}

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function dataAbreviada(iso: string): string {
  const d = new Date(iso);
  return `${MESES_ABREV[d.getMonth()]} ${d.getDate()}`;
}

function horaCompleta(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Título e pessoa exibidos em destaque no bloco de histórico, conforme o tipo de evento. */
function tituloEPessoaHistorico(
  h: HistoricoEvento,
  index: number,
  tarefa: Tarefa
): { titulo: string; pessoa: string } {
  if (index === 0 && tarefa.origem === "Solicitação") {
    return { titulo: "Nova solicitação", pessoa: tarefa.solicitanteNome || nomeColaborador(h.autorId) };
  }
  if (h.acao === "aprovada") {
    return { titulo: "Aprovação de solicitação", pessoa: nomeColaborador(h.autorId) };
  }
  if (h.acao === "recusada") {
    return { titulo: "Recusa de solicitação", pessoa: nomeColaborador(h.autorId) };
  }
  return { titulo: h.descricao, pessoa: nomeColaborador(h.autorId) };
}

function duracaoEntre(inicioIso: string, fimIso: string): string {
  const diffMs = new Date(fimIso).getTime() - new Date(inicioIso).getTime();
  const minutos = Math.floor(diffMs / 60000);
  if (minutos < 1) return "poucos segundos";
  if (minutos < 60) return `${minutos} minuto${minutos === 1 ? "" : "s"}`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas} hora${horas === 1 ? "" : "s"}`;
  const dias = Math.floor(horas / 24);
  return `${dias} dia${dias === 1 ? "" : "s"}`;
}

const COR_FASE_HISTORICO: Record<string, string> = {
  solicitacoes: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  triagem: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400",
  "aguardando-info": "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400",
  backlog: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-400",
  "em-execucao": "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  aprovacao: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400",
  concluido: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
};

const PRIORIDADE_EMOJI: Record<string, string> = {
  Alta: "🔴",
  Regular: "🟡",
  Baixa: "🟢",
};

/** Cor do nome da fase no cabeçalho do card — verde em execução, amarelo em aprovação. */
const CORES_FASE: Record<string, { text: string }> = {
  "em-execucao": { text: "text-success" },
  aprovacao: { text: "text-warning" },
};

/** Projetos/campanhas de um tipo pra oferecer no seletor: os ativos, mais o que a tarefa já tem
 * vinculado (mesmo que tenha saído de "Ativo" depois) — sem isso, mudar o status de um projeto
 * pra Concluído/Cancelado fazia o vínculo já feito "sumir" da tela (mostrava vazio, mesmo com
 * `tarefa.projetoId` ainda setado no banco). */
function projetosParaVincular(tipo: "Projeto" | "Campanha", projetoIdAtual: string | undefined) {
  return PROJETOS.filter(
    (p) => p.tipo === tipo && (p.status === "Ativo" || p.id === projetoIdAtual)
  );
}

function ColunaLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </p>
  );
}

export function TaskDetailSheet() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tarefaId = searchParams.get("tarefa");
  const tasks = useTasks();
  // `etapaById`/`colaboradorById`/`nomeTipo` (usados abaixo via @/lib/mock) leem
  // ETAPAS/COLABORADORES/TIPOS_TAREFA, que hidratam do Supabase de forma assíncrona
  // (etapa-store.ts/colaborador-store.ts/tipo-tarefa-store.ts mutam esses arrays no próprio
  // lugar). Se essa sheet renderizar antes da hidratação terminar (ex.: link direto pra uma
  // tarefa), fica presa nos dados iniciais (id cru em vez do nome) até algo mais causar um novo
  // render — assinar os hooks aqui (mesmo sem usar o valor) garante que essa sheet re-renderize
  // assim que os dados reais chegarem.
  useEtapas();
  useColaboradores();
  useTiposTarefa();
  useProjetos();
  const tarefa = tarefaId ? tasks.find((t) => t.id === tarefaId) : undefined;
  const [historicoColapsado, setHistoricoColapsado] = useState<Record<string, boolean>>({});
  const [atribuindoResponsavel, setAtribuindoResponsavel] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");
  const [novoLink, setNovoLink] = useState("");
  const [novoChecklistItem, setNovoChecklistItem] = useState("");
  const [editandoEtapaAtual, setEditandoEtapaAtual] = useState(false);
  const [dataEtapaInput, setDataEtapaInput] = useState("");
  const [horasEtapaInput, setHorasEtapaInput] = useState("");
  const [etapaVisualizadaOrdem, setEtapaVisualizadaOrdem] = useState<number | null>(null);
  const [sequenciaAberta, setSequenciaAberta] = useState(false);
  const [etapaAtualChecada, setEtapaAtualChecada] = useState<Record<string, boolean>>({});
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [tituloInput, setTituloInput] = useState("");
  const comentarioInputRef = useRef<HTMLInputElement>(null);

  function close() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tarefa");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  if (!tarefa) {
    return (
      <Dialog open={false} onOpenChange={(open) => !open && close()}>
        <DialogContent />
      </Dialog>
    );
  }

  const fase = faseById(tarefa.faseAtualId);
  // No Backlog o card só está esperando a data de início (ver sincronizarInicioDeTarefas) — o
  // conteúdo de trabalho fica visualmente desabilitado e "Iniciar atividade" pula essa espera.
  const emBacklog = tarefa.faseAtualId === "backlog";
  // Trava de avanço da Triagem: sem responder as perguntas obrigatórias (*), nenhum destino de
  // "Mover card para fase" fica disponível — força passar pela etapa antes de seguir. Quando o
  // tipo de solicitação é Projeto/Campanha, também exige o vínculo com um projeto/campanha ativo.
  const faltamRequisitosTriagem =
    tarefa.faseAtualId === "triagem" &&
    (!tarefa.dadosCompletos ||
      !tarefa.tipoSolicitacaoGeral ||
      ((tarefa.tipoSolicitacaoGeral === "Projeto" || tarefa.tipoSolicitacaoGeral === "Campanha") &&
        !tarefa.projetoId));
  const projeto = tarefa.projetoId ? projetoById(tarefa.projetoId) : undefined;
  const emRisco = estaEmRisco(tarefa);
  const executoresFaseAtual = tarefa.executoresPorFase[tarefa.faseAtualId] ?? [];
  const estimativaFaseAtual = tarefa.estimativaPorFase[tarefa.faseAtualId];
  const historicoComFase = tarefa.historico.filter((h) => h.faseId);
  const historicoLegado = tarefa.historico.filter((h) => !h.faseId);
  const decisaoAprovacao = [...tarefa.historico].reverse().find((h) => h.acao)?.acao;

  // Navegação da barra inferior: percorre as etapas do fluxo de trabalho sem depender de qual
  // delas está "em execução" agora — dá pra olhar qualquer uma, só edita/avança a atual.
  const etapasPlano = tarefa.planejamento
    ? [...tarefa.planejamento.etapas].sort((a, b) => a.ordem - b.ordem)
    : [];
  const maxOrdemPlano = etapasPlano.length > 0 ? etapasPlano[etapasPlano.length - 1].ordem : 0;
  // `etapaAtualOrdem` passa de maxOrdemPlano pra maxOrdemPlano + 1 ao concluir a última etapa
  // (ver avancarEtapaPlanejamento) — esse é o sinal inequívoco de "fluxo de etapas terminou".
  const planoFinalizado =
    tarefa.planejamento != null && tarefa.planejamento.etapaAtualOrdem > maxOrdemPlano;
  const fluxoEmAndamento = tarefa.planejamento != null && !planoFinalizado;
  // Enquanto o fluxo de etapas ainda não terminou, a fase é resincronizada automaticamente pela
  // categoria da etapa atual (ver avancarEtapaPlanejamento) — por isso os botões manuais de
  // "pular" pra Aprovação/Concluído ficam escondidos aqui: só "pede ajuste" (voltar) continua
  // disponível a qualquer momento como válvula de escape.
  const bloqueiaDestinoManual = (destinoId: string) =>
    fluxoEmAndamento &&
    ((tarefa.faseAtualId === "em-execucao" && destinoId === "aprovacao") ||
      (tarefa.faseAtualId === "aprovacao" && destinoId === "concluido"));
  const destinosBrutos = destinosPermitidos(tarefa.faseAtualId);
  const etapasBloqueiamAvanco = destinosBrutos.some((d) => bloqueiaDestinoManual(d));
  const destinos = destinosBrutos.filter((d) => !bloqueiaDestinoManual(d));
  // Uma vez finalizado o fluxo, ordemPadrao fica presa na última etapa real (em vez do ponteiro
  // já avançado, que não existe na lista) — assim a barra de baixo continua navegável em modo
  // somente-leitura em vez de sumir.
  const ordemPadrao = tarefa.planejamento
    ? Math.min(tarefa.planejamento.etapaAtualOrdem, maxOrdemPlano || 1)
    : (etapasPlano[0]?.ordem ?? 1);
  const ordemVisualizadaValida =
    etapaVisualizadaOrdem != null && etapasPlano.some((e) => e.ordem === etapaVisualizadaOrdem);
  const ordemVisualizada = ordemVisualizadaValida ? etapaVisualizadaOrdem! : ordemPadrao;
  const indexVisualizado = etapasPlano.findIndex((e) => e.ordem === ordemVisualizada);
  const etapaVisualizada = indexVisualizado >= 0 ? etapasPlano[indexVisualizado] : undefined;
  const infoEtapaVisualizada = etapaVisualizada ? etapaById(etapaVisualizada.etapaId) : undefined;
  const horasEtapaVisualizada = etapaVisualizada
    ? etapaVisualizada.alocacoes.reduce((soma, a) => soma + a.horas, 0)
    : 0;
  const visualizandoAtual =
    tarefa.planejamento != null && ordemVisualizada === tarefa.planejamento.etapaAtualOrdem;
  const podeEditarEtapaVisualizada = visualizandoAtual && fluxoEmAndamento;

  // Etapa atual "de verdade" (não a que está sendo navegada/visualizada) — usada na Coluna 2.
  const etapaAtualPlano = tarefa.planejamento
    ? etapasPlano.find((e) => e.ordem === ordemPadrao)
    : undefined;
  const infoEtapaAtualPlano = etapaAtualPlano ? etapaById(etapaAtualPlano.etapaId) : undefined;
  // Check manual de "pronto pra avançar" — só um sinal visual pra dar destaque ao botão "Mover
  // etapa"; quem efetivamente avança é o clique nesse botão (avancarEtapaPlanejamento). Chaveado
  // por tarefa+ordem pra "desmarcar" sozinho assim que a etapa avança de verdade.
  const chaveEtapaAtualCheck = etapaAtualPlano ? `${tarefa.id}:${etapaAtualPlano.ordem}` : "";
  const etapaAtualMarcada = etapaAtualChecada[chaveEtapaAtualCheck] ?? false;
  // Luzinha de status da fase no cabeçalho: verde em execução, amarelo em aprovação, cinza pro
  // resto (Backlog, Concluído e as fases anteriores ao planejamento).
  const corFaseAtual = CORES_FASE[tarefa.faseAtualId] ?? { text: "text-muted-foreground" };
  // "Mover etapa" (Coluna 3) só aponta pra próxima etapa da fila — não uma lista de todas.
  const proximaEtapaPlano = tarefa.planejamento
    ? etapasPlano.find((e) => e.ordem === tarefa.planejamento!.etapaAtualOrdem + 1)
    : undefined;
  const rotuloProximaEtapa = proximaEtapaPlano
    ? (etapaById(proximaEtapaPlano.etapaId)?.nome ?? "Próxima etapa")
    : "Concluir tarefa";

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <div className="border-b border-border/60 px-5 py-4 pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge prioridade={tarefa.prioridadeFinal} />
            <span className="text-xs text-muted-foreground">{nomeTipo(tarefa.tipoId)}</span>
            <span className={cn("text-xs font-medium", corFaseAtual.text)}>· {fase?.nome}</span>
            {emRisco && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                Em risco
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            {editandoTitulo ? (
              <>
                <Input
                  autoFocus
                  value={tituloInput}
                  onChange={(e) => setTituloInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      atualizarTitulo(tarefa.id, tituloInput);
                      setEditandoTitulo(false);
                    }
                    if (e.key === "Escape") setEditandoTitulo(false);
                  }}
                  className="h-8 min-w-0 flex-1 text-base font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    atualizarTitulo(tarefa.id, tituloInput);
                    setEditandoTitulo(false);
                  }}
                  className="shrink-0 text-success"
                  aria-label="Salvar título"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoTitulo(false)}
                  className="shrink-0 text-muted-foreground"
                  aria-label="Cancelar"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTituloInput(tarefa.titulo);
                  setEditandoTitulo(true);
                }}
                className="group flex min-w-0 flex-1 items-center gap-1.5 text-left"
              >
                <DialogTitle className="min-w-0 truncate text-base font-semibold">
                  {tarefa.titulo}
                </DialogTitle>
                <Pencil className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            )}
          </div>
        </div>

        <div className="relative grid min-h-0 flex-1 grid-cols-1 divide-y divide-border/60 md:grid-cols-[1.3fr_1.65fr_0.75fr] md:divide-x md:divide-y-0">
          {/* Coluna 1 — informações da solicitação/projeto */}
          <ScrollArea
            className={cn(
              "min-h-0 min-w-0 md:h-full",
              emBacklog && "pointer-events-none opacity-40 select-none"
            )}
          >
            <div className="flex flex-col gap-5 p-5">
              {tarefa.origem === "Solicitação" ? (
                <div>
                  <ColunaLabel>Formulário inicial</ColunaLabel>
                  {tarefa.historico[0] && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Criado por {nomeColaborador(tarefa.historico[0].autorId)} ·{" "}
                      {tempoRelativo(tarefa.historico[0].data)}
                    </p>
                  )}
                  <div className="mt-2 flex flex-col gap-3 rounded-lg border border-border/60 p-3">
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Nome do solicitante</p>
                        <p className="text-sm">{tarefa.solicitanteNome || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">E-mail</p>
                        <p className="text-sm">{tarefa.solicitanteEmail || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Departamento</p>
                        <p className="text-sm">{tarefa.departamento || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heading className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Título da demanda</p>
                        <p className="text-sm">{tarefa.titulo}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlignLeft className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Descrição da solicitação</p>
                        <p className="text-sm whitespace-pre-line">{tarefa.descricao}</p>
                      </div>
                    </div>
                    {tarefa.prioridadeSugerida && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Prioridade da demanda</p>
                          <p className="text-sm">
                            {PRIORIDADE_EMOJI[tarefa.prioridadeSugerida]} {tarefa.prioridadeSugerida}{" "}
                            prioridade
                          </p>
                        </div>
                      </div>
                    )}
                    {tarefa.justificativaPrioridade && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Justificativa da Alta Prioridade
                          </p>
                          <p className="text-sm whitespace-pre-line">
                            {tarefa.justificativaPrioridade}
                          </p>
                        </div>
                      </div>
                    )}
                    {tarefa.prazo && (
                      <div className="flex items-start gap-2">
                        <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Prazo desejado</p>
                          <p className="text-sm">{formatData(tarefa.prazo)}</p>
                          {tarefa.justificativaPrazo && (
                            <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">
                              {tarefa.justificativaPrazo}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {tarefa.anexos != null && tarefa.anexos.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Paperclip className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Anexos ({tarefa.anexos.length})
                          </p>
                          <div className="flex flex-col gap-0.5">
                            {tarefa.anexos.map((nomeArquivo) => (
                              <p key={nomeArquivo} className="text-sm">
                                {nomeArquivo}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Observações adicionais</p>
                        <p
                          className={cn(
                            "text-sm whitespace-pre-line",
                            !tarefa.observacoes && "text-muted-foreground italic"
                          )}
                        >
                          {tarefa.observacoes || "Nenhuma observação adicional."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Hash className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">ID de solicitação</p>
                        <p className="text-sm">#{tarefa.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <ColunaLabel>Informações do projeto</ColunaLabel>
                  <div className="mt-2 flex flex-col gap-3 rounded-lg border border-border/60 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Projeto</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <p className="text-sm">{projeto?.nome ?? "-"}</p>
                        {projeto && <StatusProjetoBadge status={projeto.status} />}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlignLeft className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Descrição</p>
                        <p className="text-sm whitespace-pre-line">{tarefa.descricao}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {tarefa.tagIds.length > 0 && (
                <div>
                  <ColunaLabel>Tags</ColunaLabel>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tarefa.tagIds.map((tid) => (
                      <span
                        key={tid}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {nomeTag(tid)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(historicoComFase.length > 0 || historicoLegado.length > 0) && (
                <div>
                  <ColunaLabel>Histórico</ColunaLabel>
                  <div className="mt-2 flex flex-col gap-2">
                    {historicoComFase.map((h, i) => {
                      const faseHist = faseById(h.faseId!);
                      const fim = historicoComFase[i + 1]?.data ?? new Date().toISOString();
                      const responsavelId = tarefa.executoresPorFase[h.faseId!]?.[0];
                      const colapsado = historicoColapsado[h.id] ?? false;
                      const indiceOriginal = tarefa.historico.indexOf(h);
                      const { titulo, pessoa } = tituloEPessoaHistorico(h, indiceOriginal, tarefa);
                      return (
                        <div
                          key={h.id}
                          className="overflow-hidden rounded-lg border border-border/60"
                        >
                          <div
                            className={cn(
                              "flex items-center justify-between px-3 py-2",
                              COR_FASE_HISTORICO[h.faseId!] ?? "bg-muted text-muted-foreground"
                            )}
                          >
                            <span className="text-xs font-semibold">{faseHist?.nome ?? h.faseId}</span>
                            <span className="text-xs font-medium opacity-80">
                              {dataAbreviada(h.data)}
                            </span>
                          </div>
                          <div className="px-3 pt-2.5">
                            <p className="text-sm font-semibold text-foreground">{titulo}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {pessoa} · {formatData(h.data)} às {horaCompleta(h.data)}
                            </p>
                          </div>
                          {!colapsado && (
                            <div className="flex flex-col gap-2 px-3 pt-1.5 pb-2.5">
                              <p className="text-xs text-muted-foreground">
                                {duracaoEntre(h.data, fim)}
                              </p>
                              {responsavelId && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Responsável</span>
                                  <ColaboradorAvatar
                                    colaboradorId={responsavelId}
                                    className="size-5"
                                    fallbackClassName="text-[0.6rem]"
                                  />
                                  <span className="text-xs">{nomeColaborador(responsavelId)}</span>
                                </div>
                              )}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setHistoricoColapsado((prev) => ({ ...prev, [h.id]: !colapsado }))
                            }
                            className="w-full border-t border-border/60 px-3 py-1.5 text-center text-[0.7rem] font-medium text-muted-foreground hover:bg-muted/50"
                          >
                            {colapsado ? "Mostrar mais" : "Mostrar menos"}
                          </button>
                        </div>
                      );
                    })}
                    {historicoLegado.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-border" />
                        <span>
                          {nomeColaborador(h.autorId)}: {h.descricao}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Coluna 2 — o que fazer nessa etapa */}
          <ScrollArea className="min-h-0 min-w-0 md:h-full">
            <div className="flex flex-col gap-5 p-5">
              <div
                className={cn(
                  "flex flex-col gap-5",
                  emBacklog && "pointer-events-none opacity-40 select-none"
                )}
              >
              {tarefa.planejamento ? (
                <div>
                  <ColunaLabel>Etapa atual</ColunaLabel>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const novoValor = !etapaAtualMarcada;
                        setEtapaAtualChecada((prev) => ({ ...prev, [chaveEtapaAtualCheck]: novoValor }));
                        if (novoValor && etapaAtualPlano) {
                          marcarEtapaChecada(tarefa.id, etapaAtualPlano.ordem);
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                        etapaAtualMarcada
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full",
                          etapaAtualMarcada ? "bg-success" : "bg-neutral-600"
                        )}
                      >
                        {etapaAtualMarcada && <Check className="size-3 text-white" />}
                      </span>
                      {infoEtapaAtualPlano?.nome ?? "—"}
                    </button>
                    {etapaAtualPlano && (
                      <RegistroTempoEtapa
                        taskId={tarefa.id}
                        etapa={etapaAtualPlano}
                        previstoHoras={etapaAtualPlano.alocacoes.reduce((soma, a) => soma + a.horas, 0)}
                      />
                    )}
                  </div>
                </div>
              ) : null}

              {tarefa.faseAtualId === "solicitacoes" ? (
                <div>
                  <ColunaLabel>Responsável pela aprovação</ColunaLabel>
                  {executoresFaseAtual.length > 0 ? (
                    <div className="mt-2 mb-4 flex flex-col gap-2">
                      {executoresFaseAtual.map((cid) => (
                        <div key={cid} className="flex items-center gap-2">
                          <ColaboradorAvatar
                            colaboradorId={cid}
                            className="size-7"
                            fallbackClassName="text-xs"
                          />
                          <span className="text-sm">{nomeColaborador(cid)}</span>
                        </div>
                      ))}
                    </div>
                  ) : atribuindoResponsavel ? (
                    <Select
                      items={Object.fromEntries(COLABORADORES.map((c) => [c.id, c.nome]))}
                      onValueChange={(cid) => {
                        if (typeof cid === "string" && cid) {
                          atribuirResponsavelEtapa(tarefa.id, tarefa.faseAtualId, cid);
                          setAtribuindoResponsavel(false);
                        }
                      }}
                    >
                      <SelectTrigger className="mt-2 mb-4 h-9 w-full">
                        <SelectValue placeholder="Selecionar colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLABORADORES.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAtribuindoResponsavel(true)}
                      className="mt-2 mb-4 flex w-fit items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Plus className="size-3.5" />
                      Adicionar responsável
                    </button>
                  )}

                  <ColunaLabel>Aprovação interna</ColunaLabel>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => registrarAprovacaoInterna(tarefa.id, true)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
                        decisaoAprovacao === "aprovada"
                          ? "bg-success text-white shadow-success/25"
                          : "bg-secondary text-secondary-foreground hover:bg-success hover:text-white"
                      )}
                    >
                      <Check className="size-4" />
                      Aprovada
                    </button>
                    <button
                      type="button"
                      onClick={() => registrarAprovacaoInterna(tarefa.id, false)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
                        decisaoAprovacao === "recusada"
                          ? "bg-destructive text-white shadow-destructive/25"
                          : "bg-secondary text-secondary-foreground hover:bg-destructive hover:text-white"
                      )}
                    >
                      <X className="size-4" />
                      Recusada
                    </button>
                  </div>
                  {decisaoAprovacao === "recusada" && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Solicitação recusada. Mova manualmente se decidir revisar.
                    </p>
                  )}
                </div>
              ) : tarefa.faseAtualId === "triagem" ? (
                <>
                  <div>
                    <ColunaLabel>Responsável pela atividade</ColunaLabel>
                    {executoresFaseAtual.length > 0 ? (
                      <div className="mt-2 flex flex-col gap-2">
                        {executoresFaseAtual.map((cid) => (
                          <div key={cid} className="flex items-center gap-2">
                            <ColaboradorAvatar
                              colaboradorId={cid}
                              className="size-7"
                              fallbackClassName="text-xs"
                            />
                            <span className="text-sm">{nomeColaborador(cid)}</span>
                          </div>
                        ))}
                      </div>
                    ) : atribuindoResponsavel ? (
                      <Select
                        items={Object.fromEntries(COLABORADORES.map((c) => [c.id, c.nome]))}
                        onValueChange={(cid) => {
                          if (typeof cid === "string" && cid) {
                            atribuirResponsavelEtapa(tarefa.id, tarefa.faseAtualId, cid);
                            setAtribuindoResponsavel(false);
                          }
                        }}
                      >
                        <SelectTrigger className="mt-2 h-9 w-full">
                          <SelectValue placeholder="Selecionar colaborador" />
                        </SelectTrigger>
                        <SelectContent>
                          {COLABORADORES.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAtribuindoResponsavel(true)}
                        className="mt-2 flex w-fit items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <Plus className="size-3.5" />
                        Adicionar responsável
                      </button>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      <span className="mr-1 text-destructive">*</span>
                      Temos todos os dados necessários para a execução da atividade?
                    </p>
                    <RadioGroup
                      value={tarefa.dadosCompletos ?? ""}
                      onValueChange={(v) =>
                        typeof v === "string" &&
                        definirRespostaTriagem(tarefa.id, "dadosCompletos", v)
                      }
                      className="mt-2 flex flex-col gap-2"
                    >
                      <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="sim" /> Sim
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="nao" /> Não
                      </label>
                    </RadioGroup>
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      <span className="mr-1 text-destructive">*</span>
                      Tipo de solicitação:
                    </p>
                    <RadioGroup
                      value={tarefa.tipoSolicitacaoGeral ?? ""}
                      onValueChange={(v) =>
                        typeof v === "string" &&
                        definirRespostaTriagem(tarefa.id, "tipoSolicitacaoGeral", v)
                      }
                      className="mt-2 flex flex-col gap-2"
                    >
                      {(["Tarefa", "Projeto", "Campanha"] as const).map((opcao) => (
                        <label key={opcao} className="flex items-center gap-2 text-sm">
                          <RadioGroupItem value={opcao} /> {opcao}
                        </label>
                      ))}
                    </RadioGroup>
                  </div>

                  {(tarefa.tipoSolicitacaoGeral === "Projeto" ||
                    tarefa.tipoSolicitacaoGeral === "Campanha") && (
                    <div>
                      <p className="text-sm font-medium">
                        <span className="mr-1 text-destructive">*</span>
                        {tarefa.tipoSolicitacaoGeral === "Projeto" ? "Qual projeto?" : "Qual campanha?"}
                      </p>
                      <Select
                        items={Object.fromEntries(
                          projetosParaVincular(tarefa.tipoSolicitacaoGeral, tarefa.projetoId).map(
                            (p) => [p.id, p.nome]
                          )
                        )}
                        value={tarefa.projetoId ?? ""}
                        onValueChange={(v) => {
                          if (typeof v !== "string" || !v) return;
                          const projeto = PROJETOS.find((p) => p.id === v);
                          vincularProjeto(tarefa.id, v, projeto?.nome ?? "");
                        }}
                      >
                        <SelectTrigger className="mt-2 h-9 w-full">
                          <SelectValue
                            placeholder={
                              tarefa.tipoSolicitacaoGeral === "Projeto"
                                ? "Selecionar projeto ativo"
                                : "Selecionar campanha ativa"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {projetosParaVincular(tarefa.tipoSolicitacaoGeral, tarefa.projetoId).map(
                            (p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nome}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <ColunaLabel>Tipo de tarefa</ColunaLabel>
                    <Select
                      items={Object.fromEntries(TIPOS_TAREFA.map((tipo) => [tipo.id, tipo.nome]))}
                      value={tarefa.tipoId ?? ""}
                      onValueChange={(v) =>
                        typeof v === "string" && v && atualizarTipoTarefa(tarefa.id, v)
                      }
                    >
                      <SelectTrigger className="mt-2 h-9 w-full">
                        <SelectValue placeholder="Selecionar tipo de tarefa" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_TAREFA.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {tarefa.tipoId && (
                    <PlanejamentoRecomendado
                      key={`${tarefa.id}:${tarefa.tipoId}`}
                      tarefa={tarefa}
                    />
                  )}
                </>
              ) : tarefa.planejamento ? null : (
                <div>
                  <ColunaLabel>Responsável pela etapa</ColunaLabel>
                  {executoresFaseAtual.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">Ainda não definido.</p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2">
                      {executoresFaseAtual.map((cid) => (
                        <div key={cid} className="flex items-center gap-2">
                          <ColaboradorAvatar
                            colaboradorId={cid}
                            className="size-7"
                            fallbackClassName="text-xs"
                          />
                          <span className="text-sm">{nomeColaborador(cid)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {estimativaFaseAtual != null && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Estimativa para essa etapa: {estimativaFaseAtual}h
                    </p>
                  )}
                </div>
              )}

              <div>
                <ColunaLabel>Checklist</ColunaLabel>
                <div className="mt-2 flex flex-col gap-1.5">
                  {tarefa.checklist.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => alternarChecklistItem(tarefa.id, item.id)}
                      className="flex items-center gap-2 text-left text-sm"
                    >
                      {item.feito ? (
                        <CheckSquare className="size-4 shrink-0 text-primary" />
                      ) : (
                        <Square className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className={item.feito ? "text-muted-foreground line-through" : ""}>
                        {item.texto}
                      </span>
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    adicionarChecklistItem(tarefa.id, novoChecklistItem);
                    setNovoChecklistItem("");
                  }}
                  className="mt-2 flex items-center gap-1.5"
                >
                  <Input
                    value={novoChecklistItem}
                    onChange={(e) => setNovoChecklistItem(e.target.value)}
                    placeholder="Novo item do checklist"
                    className="h-8 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!novoChecklistItem.trim()}
                    className="shrink-0 text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Adicionar item"
                  >
                    <Plus className="size-4" />
                  </button>
                </form>
              </div>

              <div>
                <ColunaLabel>Anexos e links</ColunaLabel>
                <div className="mt-2 flex flex-col gap-1.5">
                  {(tarefa.anexos ?? []).map((nome, i) => (
                    <div key={`anexo-${i}`} className="flex items-center gap-2 text-sm">
                      <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{nome}</span>
                    </div>
                  ))}
                  {(tarefa.links ?? []).map((url, i) => (
                    <a
                      key={`link-${i}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Link2 className="size-3.5 shrink-0" />
                      <span className="truncate">{url}</span>
                    </a>
                  ))}
                  {(tarefa.anexos ?? []).length === 0 && (tarefa.links ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhum anexo ou link ainda.</p>
                  )}
                </div>
                <div className="mt-2 flex flex-col gap-1.5">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      adicionarLink(tarefa.id, novoLink);
                      setNovoLink("");
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Input
                      value={novoLink}
                      onChange={(e) => setNovoLink(e.target.value)}
                      placeholder="Colar um link"
                      className="h-8 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!novoLink.trim()}
                      className="shrink-0 text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Adicionar link"
                    >
                      <Plus className="size-4" />
                    </button>
                  </form>
                  <label className="flex w-fit cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    <Paperclip className="size-3.5" />
                    Anexar arquivo
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const arquivo = e.target.files?.[0];
                        if (arquivo) adicionarAnexo(tarefa.id, arquivo.name);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <ColunaLabel>Comentários</ColunaLabel>
                {tarefa.comentarios.length > 0 && (
                  <div className="mt-2 flex flex-col gap-3">
                    {tarefa.comentarios.map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <ColaboradorAvatar
                          colaboradorId={c.autorId}
                          className="size-6 shrink-0"
                          fallbackClassName="text-[0.65rem]"
                        />
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">{nomeColaborador(c.autorId)}</span>{" "}
                            <span className="text-muted-foreground">{c.texto}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    adicionarComentario(tarefa.id, novoComentario);
                    setNovoComentario("");
                  }}
                  className="mt-2 flex items-center gap-1.5"
                >
                  <Input
                    ref={comentarioInputRef}
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Adicionar comentário"
                    className="h-8 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!novoComentario.trim()}
                    className="shrink-0 text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Comentar"
                  >
                    <Plus className="size-4" />
                  </button>
                </form>
              </div>
              </div>

            </div>
          </ScrollArea>

          {/* Coluna 3 — mover etapa (planejamento aplicado) ou mover card para fase (antes disso) */}
          <ScrollArea
            className={cn(
              "min-h-0 min-w-0 md:h-full",
              emBacklog && "pointer-events-none opacity-40 select-none"
            )}
          >
            <div className="flex flex-col gap-3 p-5">
              {tarefa.planejamento ? (
                <>
                  <ColunaLabel>{proximaEtapaPlano ? "Mover etapa" : "Concluir tarefa"}</ColunaLabel>
                  {!fluxoEmAndamento ? (
                    <p className="text-sm text-muted-foreground">Todas as etapas concluídas.</p>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={!etapaAtualMarcada}
                        onClick={() => avancarEtapaPlanejamento(tarefa.id)}
                        title={
                          !etapaAtualMarcada
                            ? 'Dê o check em "Etapa atual" antes de avançar.'
                            : undefined
                        }
                        className={cn(
                          "group flex items-center justify-between gap-2 rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition-colors",
                          etapaAtualMarcada
                            ? "bg-primary text-primary-foreground"
                            : "cursor-not-allowed bg-secondary/50 text-muted-foreground/50"
                        )}
                      >
                        {rotuloProximaEtapa}
                        {proximaEtapaPlano ? (
                          <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        ) : (
                          <Check className="size-4 shrink-0" />
                        )}
                      </button>
                      {!etapaAtualMarcada && (
                        <p className="text-xs text-muted-foreground">
                          Dê o check em &quot;Etapa atual&quot; pra liberar o avanço.
                        </p>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <ColunaLabel>Mover card para fase</ColunaLabel>
                  {destinos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {etapasBloqueiamAvanco
                        ? "Conclua as etapas do fluxo de trabalho (barra de baixo) para avançar de fase."
                        : "Fase final do fluxo."}
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-col gap-2">
                        {destinos.map((destinoId) => {
                          // Sem os dados necessários, o destino natural é "Aguardando Informações"
                          // — destaca ele em verde e bloqueia ir direto pro Backlog nesse caso.
                          const faltamDados = tarefa.dadosCompletos === "nao";
                          const emDestaque = faltamDados && destinoId === "aguardando-info";
                          const bloqueado =
                            faltamRequisitosTriagem || (faltamDados && destinoId === "backlog");
                          return (
                            <button
                              key={destinoId}
                              type="button"
                              disabled={bloqueado}
                              onClick={() => moveTask(tarefa.id, destinoId)}
                              title={
                                faltamRequisitosTriagem
                                  ? "Responda as perguntas obrigatórias (*) antes de mover."
                                  : bloqueado
                                    ? 'Faltam dados — mova para "Aguardando Informações" primeiro.'
                                    : undefined
                              }
                              className={cn(
                                "group flex items-center justify-between gap-2 rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition-colors",
                                emDestaque
                                  ? "bg-primary text-primary-foreground"
                                  : bloqueado
                                    ? "cursor-not-allowed bg-secondary/50 text-muted-foreground/50"
                                    : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                              )}
                            >
                              {faseById(destinoId)?.nome}
                              <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          );
                        })}
                      </div>
                      {faltamRequisitosTriagem && (
                        <p className="text-xs text-muted-foreground">
                          Responda as perguntas obrigatórias (*) pra liberar o avanço.
                        </p>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {tarefa.planejamento && etapaVisualizada && (
          <div className="flex flex-shrink-0 flex-wrap items-center gap-4 border-t border-border/60 bg-card px-4 py-2.5">
            <button
              type="button"
              onClick={() => {
                comentarioInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                comentarioInputRef.current?.focus();
              }}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
              aria-label="Ir para comentários"
            >
              <MessageSquareText className="size-4" />
            </button>

            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setEtapaVisualizadaOrdem(etapasPlano[indexVisualizado - 1].ordem)}
                disabled={indexVisualizado <= 0}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Etapa anterior"
              >
                <ChevronLeft className="size-4" />
              </button>

              <Popover open={sequenciaAberta} onOpenChange={setSequenciaAberta}>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted"
                    />
                  }
                >
                  <ColaboradorAvatar
                    colaboradorId={etapaVisualizada.colaboradorId}
                    className="size-7 shrink-0"
                    fallbackClassName="text-xs"
                  />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {infoEtapaVisualizada?.nome ?? etapaVisualizada.etapaId}
                  </span>
                  {sequenciaAberta ? (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </PopoverTrigger>
                <PopoverContent side="top" align="center" className="w-72 p-1.5">
                  <p className="px-2 py-1 text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
                    Sequência da atividade
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {etapasPlano.map((etapa) => {
                      const info = etapaById(etapa.etapaId);
                      const concluida =
                        !fluxoEmAndamento || etapa.ordem < (tarefa.planejamento?.etapaAtualOrdem ?? 1);
                      const atual = fluxoEmAndamento && etapa.ordem === tarefa.planejamento?.etapaAtualOrdem;
                      return (
                        <div
                          key={etapa.ordem}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                            etapa.ordem === ordemVisualizada && "bg-muted"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setEtapaVisualizadaOrdem(etapa.ordem);
                              setSequenciaAberta(false);
                            }}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            {concluida ? (
                              <CheckSquare className="size-3.5 shrink-0 text-primary" />
                            ) : atual ? (
                              <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-primary text-[0.55rem] font-bold text-primary-foreground">
                                {etapa.ordem}
                              </span>
                            ) : (
                              <Square className="size-3.5 shrink-0 text-muted-foreground" />
                            )}
                            <span className={cn("min-w-0 flex-1", concluida && "text-muted-foreground line-through")}>
                              {info?.nome ?? etapa.etapaId}
                            </span>
                          </button>
                          <Popover>
                            <PopoverTrigger
                              render={
                                <button
                                  type="button"
                                  className="shrink-0 rounded-full outline-none hover:ring-2 hover:ring-primary/50"
                                  aria-label="Trocar executor da etapa"
                                  title="Trocar executor"
                                />
                              }
                            >
                              <ColaboradorAvatar
                                colaboradorId={etapa.colaboradorId}
                                className="size-5 shrink-0"
                                fallbackClassName="text-[0.55rem]"
                              />
                            </PopoverTrigger>
                            <PopoverContent side="right" align="start" className="w-56 p-1.5">
                              <p className="px-2 py-1 text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
                                Trocar executor
                              </p>
                              <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
                                {COLABORADORES.map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => reatribuirExecutorEtapa(tarefa.id, etapa.ordem, c.id)}
                                    className={cn(
                                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                                      c.id === etapa.colaboradorId && "bg-muted"
                                    )}
                                  >
                                    <ColaboradorAvatar
                                      colaboradorId={c.id}
                                      className="size-5 shrink-0"
                                      fallbackClassName="text-[0.55rem]"
                                    />
                                    <span className="min-w-0 flex-1 truncate">{c.nome}</span>
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatData(etapa.dataFim)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              <button
                type="button"
                onClick={() => setEtapaVisualizadaOrdem(etapasPlano[indexVisualizado + 1].ordem)}
                disabled={indexVisualizado >= etapasPlano.length - 1}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Próxima etapa"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {!editandoEtapaAtual ? (
              <button
                type="button"
                disabled={!podeEditarEtapaVisualizada}
                onClick={() => {
                  setDataEtapaInput(etapaVisualizada.dataFim);
                  setHorasEtapaInput(String(horasEtapaVisualizada));
                  setEditandoEtapaAtual(true);
                }}
                className="flex shrink-0 items-center gap-1.5 text-sm"
              >
                <span className="text-sm text-muted-foreground">Executar etapa até</span>
                <span
                  className={cn(
                    "flex items-center gap-1 font-medium",
                    podeEditarEtapaVisualizada && "underline decoration-dotted underline-offset-2",
                    diasEntre(isoHoje(), etapaVisualizada.dataFim) < 0
                      ? "text-destructive"
                      : "text-success"
                  )}
                >
                  <Calendar className="size-3.5 shrink-0" />
                  {formatData(etapaVisualizada.dataFim)}
                </span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm text-muted-foreground">Executar etapa até</span>
                <Input
                  type="date"
                  autoFocus
                  value={dataEtapaInput}
                  onChange={(e) => setDataEtapaInput(e.target.value)}
                  className="h-7 w-36 text-xs"
                />
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={horasEtapaInput}
                  onChange={(e) => setHorasEtapaInput(e.target.value)}
                  className="h-7 w-16 text-xs"
                />
                <span className="text-xs text-muted-foreground">h</span>
                <button
                  type="button"
                  disabled={!dataEtapaInput || !anoDoPrazoValido(dataEtapaInput)}
                  title={
                    dataEtapaInput && !anoDoPrazoValido(dataEtapaInput)
                      ? MENSAGEM_ANO_INVALIDO
                      : "Salvar"
                  }
                  onClick={() => {
                    ajustarEtapaEmExecucao(
                      tarefa.id,
                      etapaVisualizada.ordem,
                      dataEtapaInput,
                      Number(horasEtapaInput) || 0
                    );
                    setEditandoEtapaAtual(false);
                  }}
                  className="shrink-0 text-success disabled:cursor-not-allowed disabled:text-muted-foreground/40"
                  aria-label="Salvar"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoEtapaAtual(false)}
                  className="shrink-0 text-muted-foreground"
                  aria-label="Cancelar"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <span className="shrink-0 text-sm text-muted-foreground">
              Concluir tarefa até{" "}
              <span className="font-medium text-foreground">
                {formatData(tarefa.prazo || tarefa.planejamento.previsaoConclusao)}
              </span>
            </span>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Select
                items={Object.fromEntries(
                  projetosParaVincular("Projeto", tarefa.projetoId).map((p) => [p.id, p.nome])
                )}
                value={projeto?.tipo === "Projeto" ? (tarefa.projetoId ?? "") : ""}
                onValueChange={(v) => {
                  if (typeof v !== "string" || !v) return;
                  const p = PROJETOS.find((x) => x.id === v);
                  vincularProjeto(tarefa.id, v, p?.nome ?? "");
                }}
              >
                <SelectTrigger className="h-8 w-44 gap-1.5 text-xs">
                  <SelectValue placeholder="Projeto" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  {projetosParaVincular("Projeto", tarefa.projetoId).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                items={Object.fromEntries(
                  projetosParaVincular("Campanha", tarefa.projetoId).map((p) => [p.id, p.nome])
                )}
                value={projeto?.tipo === "Campanha" ? (tarefa.projetoId ?? "") : ""}
                onValueChange={(v) => {
                  if (typeof v !== "string" || !v) return;
                  const p = PROJETOS.find((x) => x.id === v);
                  vincularProjeto(tarefa.id, v, p?.nome ?? "");
                }}
              >
                <SelectTrigger className="h-8 w-44 gap-1.5 text-xs">
                  <SelectValue placeholder="Campanha" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  {projetosParaVincular("Campanha", tarefa.projetoId).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {emBacklog && (
                <button
                  type="button"
                  onClick={() => iniciarAtividade(tarefa.id)}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
                >
                  <Play className="size-4 shrink-0 fill-current" />
                  Iniciar atividade
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
