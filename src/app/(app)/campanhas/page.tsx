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

export default function CampanhasPage() {
  const campanhas = PROJETOS.filter((p) => p.tipo === "Campanha");

  return (
    <div>
      <PageHeader
        title="Campanhas"
        description="Ações sazonais ou com data-gatilho (datas comemorativas, janelas regulatórias etc.)."
        action={<Button disabled>Nova campanha</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campanhas.map((campanha) => {
          const progresso = progressoProjeto(campanha.id);
          const responsavel = colaboradorById(campanha.responsavelId);
          const total = tarefasDoProjeto(campanha.id).length;
          return (
            <Link key={campanha.id} href={`/projetos/${campanha.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="flex h-full flex-col gap-3 py-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      {campanha.sigla}
                    </p>
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
