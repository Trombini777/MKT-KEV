"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { StatusProjetoEditor } from "@/components/status-projeto-editor";
import { ProjetoSheet } from "@/components/projeto-sheet";
import { colaboradorById, type StatusProjeto } from "@/lib/mock";
import { useProjetos, adicionarProjeto, editarProjeto } from "@/lib/projeto-store";
import { useColaboradores } from "@/lib/colaborador-store";
import { useTasks } from "@/lib/task-store";

function formatData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function ProjetosPage() {
  const todosProjetos = useProjetos();
  useColaboradores();
  const todasAsTarefas = useTasks();
  const projetos = todosProjetos.filter((p) => p.tipo === "Projeto");

  function mudarStatus(projetoId: string, novoStatus: StatusProjeto) {
    const projeto = todosProjetos.find((p) => p.id === projetoId);
    if (projeto) editarProjeto({ ...projeto, status: novoStatus });
  }

  return (
    <div>
      <PageHeader
        title="Projetos"
        description="Agrupador opcional de tarefas com começo, meio e fim, sem urgência sazonal."
        action={<ProjetoSheet tipo="Projeto" onCriar={adicionarProjeto} />}
      />

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
    </div>
  );
}
