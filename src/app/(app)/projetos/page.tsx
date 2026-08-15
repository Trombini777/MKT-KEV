import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { PROJETOS, colaboradorById, progressoProjeto, tarefasDoProjeto } from "@/lib/mock";

function formatData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function ProjetosPage() {
  const projetos = PROJETOS.filter((p) => p.tipo === "Projeto");

  return (
    <div>
      <PageHeader
        title="Projetos"
        description="Agrupador opcional de tarefas com começo, meio e fim, sem urgência sazonal."
        action={<Button disabled>Novo projeto</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projetos.map((projeto) => {
          const progresso = progressoProjeto(projeto.id);
          const responsavel = colaboradorById(projeto.responsavelId);
          const total = tarefasDoProjeto(projeto.id).length;
          return (
            <Link key={projeto.id} href={`/projetos/${projeto.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="flex h-full flex-col gap-3 py-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      {projeto.sigla}
                    </p>
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
