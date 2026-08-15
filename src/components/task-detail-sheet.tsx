"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { PlanejamentoRecomendado } from "@/components/planejamento-recomendado";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge } from "@/components/priority-badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
} from "@/lib/task-store";
import {
  faseById,
  nomeTipo,
  nomeTag,
  nomeColaborador,
  projetoById,
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
  ArrowRight,
  AlertTriangle,
  MessageSquareText,
  Hash,
  Calendar,
} from "lucide-react";
import { useState } from "react";

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
  const tarefa = tarefaId ? tasks.find((t) => t.id === tarefaId) : undefined;
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [historicoColapsado, setHistoricoColapsado] = useState<Record<string, boolean>>({});
  const [atribuindoResponsavel, setAtribuindoResponsavel] = useState(false);

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
  const projeto = tarefa.projetoId ? projetoById(tarefa.projetoId) : undefined;
  const emRisco = estaEmRisco(tarefa);
  const destinos = destinosPermitidos(tarefa.faseAtualId);
  const executoresFaseAtual = tarefa.executoresPorFase[tarefa.faseAtualId] ?? [];
  const estimativaFaseAtual = tarefa.estimativaPorFase[tarefa.faseAtualId];
  const historicoComFase = tarefa.historico.filter((h) => h.faseId);
  const historicoLegado = tarefa.historico.filter((h) => !h.faseId);
  const decisaoAprovacao = [...tarefa.historico].reverse().find((h) => h.acao)?.acao;

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <div className="border-b border-border/60 px-5 py-4 pr-12">
          <DialogTitle className="text-base font-semibold">{tarefa.titulo}</DialogTitle>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <PriorityBadge prioridade={tarefa.prioridadeFinal} />
            <span className="text-xs text-muted-foreground">{nomeTipo(tarefa.tipoId)}</span>
            <span className="text-xs text-muted-foreground">· {fase?.nome}</span>
            {emRisco && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                Em risco
              </span>
            )}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-border/60 md:grid-cols-[1.3fr_1.65fr_0.75fr] md:divide-x md:divide-y-0">
          {/* Coluna 1 — informações da solicitação/projeto */}
          <ScrollArea className="min-h-0 min-w-0 md:h-full">
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
                      <p className="text-sm">{projeto?.nome ?? "-"}</p>
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
              <div>
                <ColunaLabel>Fase atual</ColunaLabel>
                <span className="mt-2 inline-flex rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                  {fase?.nome}
                </span>
              </div>

              {tarefa.faseAtualId === "solicitacoes" ? (
                <div>
                  <ColunaLabel>Aprovação interna</ColunaLabel>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => registrarAprovacaoInterna(tarefa.id, true)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        decisaoAprovacao === "aprovada"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      )}
                    >
                      Aprovada
                    </button>
                    <button
                      type="button"
                      onClick={() => registrarAprovacaoInterna(tarefa.id, false)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        decisaoAprovacao === "recusada"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      )}
                    >
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
                        className="mt-2 text-sm font-medium text-primary hover:underline"
                      >
                        + Adicionar responsável
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
              ) : (
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

              {tarefa.checklist.length > 0 && (
                <div>
                  <ColunaLabel>Checklist</ColunaLabel>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {tarefa.checklist.map((item) => {
                      const feito = checklist[item.id] ?? item.feito;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setChecklist((prev) => ({ ...prev, [item.id]: !feito }))
                          }
                          className="flex items-center gap-2 text-left text-sm"
                        >
                          {feito ? (
                            <CheckSquare className="size-4 shrink-0 text-primary" />
                          ) : (
                            <Square className="size-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className={feito ? "text-muted-foreground line-through" : ""}>
                            {item.texto}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {tarefa.comentarios.length > 0 && (
                <div>
                  <ColunaLabel>Comentários</ColunaLabel>
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
                </div>
              )}

            </div>
          </ScrollArea>

          {/* Coluna 3 — mover card para fase */}
          <ScrollArea className="min-h-0 min-w-0 md:h-full">
            <div className="flex flex-col gap-3 p-5">
              <ColunaLabel>Mover card para fase</ColunaLabel>
              {destinos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Fase final do fluxo.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {destinos.map((destinoId) => (
                    <button
                      key={destinoId}
                      type="button"
                      onClick={() => moveTask(tarefa.id, destinoId)}
                      className="group flex items-center justify-between gap-2 rounded-full bg-secondary px-4 py-2 text-left text-sm font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {faseById(destinoId)?.nome}
                      <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
