"use client";

import { useState } from "react";
import Link from "next/link";
import { ListFilter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/page-header";
import { StatusProjetoEditor } from "@/components/status-projeto-editor";
import { ProjetoSheet } from "@/components/projeto-sheet";
import { colaboradorById, type StatusProjeto } from "@/lib/mock";
import { useProjetos, adicionarProjeto, editarProjeto } from "@/lib/projeto-store";
import { useColaboradores } from "@/lib/colaborador-store";
import { useTasks } from "@/lib/task-store";

const TODOS_STATUS: StatusProjeto[] = ["Planejado", "Ativo", "Concluído", "Cancelado"];

function formatData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function ProjetosPage() {
  const todosProjetos = useProjetos();
  useColaboradores();
  const todasAsTarefas = useTasks();
  // Só "Ativo" marcado por padrão — os outros status (Planejado, Concluído, Cancelado) ficam
  // escondidos até a pessoa marcar explicitamente que quer vê-los também.
  const [statusSelecionados, setStatusSelecionados] = useState<StatusProjeto[]>(["Ativo"]);
  const projetos = todosProjetos.filter(
    (p) => p.tipo === "Projeto" && statusSelecionados.includes(p.status)
  );

  function mudarStatus(projetoId: string, novoStatus: StatusProjeto) {
    const projeto = todosProjetos.find((p) => p.id === projetoId);
    if (projeto) editarProjeto({ ...projeto, status: novoStatus });
  }

  function alternarFiltro(status: StatusProjeto, marcado: boolean) {
    setStatusSelecionados((atuais) =>
      marcado ? [...atuais, status] : atuais.filter((s) => s !== status)
    );
  }

  return (
    <div>
      <PageHeader
        title="Projetos"
        description="Agrupador opcional de tarefas com começo, meio e fim, sem urgência sazonal."
      />

      <div className="mb-4 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
            <ListFilter className="size-3.5" />
            Status
            {statusSelecionados.length > 0 && statusSelecionados.length < TODOS_STATUS.length && (
              <span className="grid size-4 place-items-center rounded-full bg-primary text-[0.65rem] font-semibold text-primary-foreground">
                {statusSelecionados.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {TODOS_STATUS.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusSelecionados.includes(status)}
                onCheckedChange={(marcado) => alternarFiltro(status, marcado)}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <ProjetoSheet tipo="Projeto" onCriar={adicionarProjeto} />
      </div>

      {projetos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
          Nenhum projeto com o status selecionado.
        </p>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projetos.map((projeto) => {
          const tarefasDoProjeto = todasAsTarefas.filter((t) => t.projetoId === projeto.id);
          const total = tarefasDoProjeto.length;
          const concluidas = tarefasDoProjeto.filter((t) => t.faseAtualId === "concluido").length;
          const progresso = total === 0 ? 0 : Math.round((concluidas / total) * 100);
          const responsavel = colaboradorById(projeto.responsavelId);
          return (
            <Link key={projeto.id} href={`/projetos/${projeto.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="flex h-full flex-col gap-3 py-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {projeto.sigla}
                      </p>
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <StatusProjetoEditor
                          status={projeto.status}
                          onChange={(s) => mudarStatus(projeto.id, s)}
                        />
                      </span>
                    </div>
                    <h3 className="mt-0.5 text-base font-semibold">{projeto.nome}</h3>
                  </div>
                  <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {projeto.descricao}
                  </p>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{total} tarefas</span>
                      <span>{progresso}%</span>
                    </div>
                    <Progress value={progresso} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{responsavel?.nome}</span>
                    <span>
                      {formatData(projeto.dataInicio)} até {formatData(projeto.dataFim)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      )}
    </div>
  );
}
