"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TipoTarefaSheet } from "@/components/tipo-tarefa-sheet";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { cn } from "@/lib/utils";
import { etapaById, faseById, nomeColaborador, type TipoTarefa } from "@/lib/mock";
import { useTiposTarefa, adicionarTipoTarefa, editarTipoTarefa } from "@/lib/tipo-tarefa-store";
import {
  useUnidadesMedida,
  adicionarUnidadeMedida,
  editarUnidadeMedida,
  excluirUnidadeMedida,
} from "@/lib/unidade-medida-store";
import { useTasks } from "@/lib/task-store";

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function TiposDeTarefaBoard() {
  const tipos = useTiposTarefa();
  const unidadesMedida = useUnidadesMedida();
  const tarefas = useTasks();
  const [tipoEditando, setTipoEditando] = useState<TipoTarefa | null>(null);
  const [versaoEdicao, setVersaoEdicao] = useState(0);

  function abrirEdicao(tipo: TipoTarefa) {
    setTipoEditando(tipo);
    setVersaoEdicao((v) => v + 1);
  }

  return (
    <div>
      <div className="mb-4 flex justify-start">
        <TipoTarefaSheet
          tipos={tipos}
          unidadesMedida={unidadesMedida}
          onCriarUnidadeMedida={adicionarUnidadeMedida}
          onEditarUnidadeMedida={editarUnidadeMedida}
          onExcluirUnidadeMedida={excluirUnidadeMedida}
          onCriar={adicionarTipoTarefa}
        />
      </div>

      <TipoTarefaSheet
        key={versaoEdicao}
        tipos={tipos}
        unidadesMedida={unidadesMedida}
        onCriarUnidadeMedida={adicionarUnidadeMedida}
        onEditarUnidadeMedida={editarUnidadeMedida}
        onExcluirUnidadeMedida={excluirUnidadeMedida}
        onEditar={editarTipoTarefa}
        tipoParaEditar={tipoEditando ?? undefined}
        open={tipoEditando !== null}
        onOpenChange={(v) => {
          if (!v) setTipoEditando(null);
        }}
      />

      <div className="grid grid-cols-1 gap-2">
        {tipos.map((tipo) => {
          const tarefasDoTipo = tarefas.filter((t) => t.tipoId === tipo.id);
          const tarefasAtivas = tarefasDoTipo.filter(
            (t) => !faseById(t.faseAtualId)?.isFinal
          ).length;
          const totalTarefas = tarefasDoTipo.length;
          const totalHoras = tipo.etapas.reduce((acc, e) => acc + (e.estimativaHoras ?? 0), 0);
          return (
            <Card
              key={tipo.id}
              role="button"
              tabIndex={0}
              onClick={() => abrirEdicao(tipo)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  abrirEdicao(tipo);
                }
              }}
              className="cursor-pointer transition-all hover:shadow-sm hover:ring-primary dark:hover:ring-primary/50"
            >
              <CardContent className="flex flex-col gap-1 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate text-sm font-semibold">{tipo.nome}</h3>
                    <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                      {tipo.descricao}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {tipo.unidadeMedidaId && (
                      <Badge variant="outline">
                        {unidadesMedida.find((u) => u.id === tipo.unidadeMedidaId)?.nome}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {tarefasAtivas} ativas · {totalTarefas} no total
                    </Badge>
                    <Badge variant="outline">{totalHoras}h estimado</Badge>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="relative flex size-2 items-center justify-center">
                        {tipo.ativo && (
                          <span className="absolute size-2 rounded-full bg-primary shadow-[0_0_3px_1px_var(--primary)]" />
                        )}
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            tipo.ativo ? "bg-primary" : "bg-muted-foreground/40"
                          )}
                        />
                      </span>
                      {tipo.ativo ? "Ativo" : "Pausada"}
                    </span>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirEdicao(tipo);
                      }}
                      aria-label="Editar tipo de tarefa"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {tipo.etapas.length > 0 ? (
                  <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
                    {tipo.etapas.map((etapaDoTipo, i) => {
                      const etapa = etapaById(etapaDoTipo.etapaId);
                      const outros = etapaDoTipo.executoresPermitidosIds?.length ?? 0;
                      return (
                        <li
                          key={`${etapaDoTipo.etapaId}-${i}`}
                          className="flex items-center gap-1.5"
                        >
                          <span
                            className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground"
                            title={[
                              etapaDoTipo.executorPadraoId
                                ? `Executor padrão: ${nomeColaborador(etapaDoTipo.executorPadraoId)}`
                                : "Sem executor padrão definido",
                              outros > 0 ? `+${outros} outro${outros > 1 ? "s" : ""} podem executar` : null,
                              etapaDoTipo.estimativaHoras != null
                                ? `${etapaDoTipo.estimativaHoras}h estimadas`
                                : null,
                              etapaDoTipo.slaDias ? `SLA de ${etapaDoTipo.slaDias} dia(s)` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          >
                            {etapaDoTipo.executorPadraoId && (
                              <ColaboradorAvatar
                                colaboradorId={etapaDoTipo.executorPadraoId}
                                className="size-4 shrink-0"
                                fallbackClassName="text-[0.5rem]"
                              />
                            )}
                            {etapa?.nome ?? "—"}
                            {outros > 0 && (
                              <span className="text-secondary-foreground/60">+{outros}</span>
                            )}
                          </span>
                          {i < tipo.etapas.length - 1 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhuma etapa no fluxo ainda.</p>
                )}

                <p className="text-right text-[0.65rem] text-muted-foreground/60">
                  Atualizado em {formatarData(tipo.atualizadoEm)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
