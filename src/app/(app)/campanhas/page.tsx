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

export default function CampanhasPage() {
  const todosProjetos = useProjetos();
  useColaboradores();
  const todasAsTarefas = useTasks();
  const campanhas = todosProjetos.filter((p) => p.tipo === "Campanha");

  function mudarStatus(projetoId: string, novoStatus: StatusProjeto) {
    const projeto = todosProjetos.find((p) => p.id === projetoId);
    if (projeto) editarProjeto({ ...projeto, status: novoStatus });
  }

  return (
    <div>
      <PageHeader
        title="Campanhas"
        description="Ações sazonais ou com data-gatilho (datas comemorativas, janelas regulatórias etc.)."
        action={<ProjetoSheet tipo="Campanha" onCriar={adicionarProjeto} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campanhas.map((campanha) => {
          const tarefasDoProjeto = todasAsTarefas.filter((t) => t.projetoId === campanha.id);
          const total = tarefasDoProjeto.length;
          const concluidas = tarefasDoProjeto.filter((t) => t.faseAtualId === "concluido").length;
          const progresso = total === 0 ? 0 : Math.round((concluidas / total) * 100);
          const responsavel = colaboradorById(campanha.responsavelId);
          return (
            <Link key={campanha.id} href={`/projetos/${campanha.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="flex h-full flex-col gap-3 py-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {campanha.sigla}
                      </p>
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <StatusProjetoEditor
                          status={campanha.status}
                          onChange={(s) => mudarStatus(campanha.id, s)}
                        />
                      </span>
                    </div>
                    <h3 className="mt-0.5 text-base font-semibold">{campanha.nome}</h3>
                  </div>
                  <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {campanha.descricao}
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
                      {formatData(campanha.dataInicio)} até {formatData(campanha.dataFim)}
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
