import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TaskListRow } from "@/components/task-list-row";
import {
  PROJETOS,
  colaboradorById,
  progressoProjeto,
  tarefasDoProjeto,
} from "@/lib/mock";
import { ChevronLeft } from "lucide-react";

function formatData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default async function ProjetoDetalhePage(props: PageProps<"/projetos/[id]">) {
  const { id } = await props.params;
  const projeto = PROJETOS.find((p) => p.id === id);
  if (!projeto) notFound();

  const responsavel = colaboradorById(projeto.responsavelId);
  const tarefas = tarefasDoProjeto(projeto.id);
  const progresso = progressoProjeto(projeto.id);
  const atrasadas = tarefas.filter(
    (t) => t.faseAtualId !== "concluido" && t.prazo && new Date(t.prazo) < new Date()
  );

  return (
    <div>
      <Link
        href={projeto.tipo === "Campanha" ? "/campanhas" : "/projetos"}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {projeto.tipo === "Campanha" ? "Campanhas" : "Projetos"}
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {projeto.sigla}
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight">{projeto.nome}</h1>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">{projeto.descricao}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Responsável
            </p>
            <p className="mt-1 text-sm font-medium">{responsavel?.nome}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Período
            </p>
            <p className="mt-1 text-sm font-medium">
              {formatData(projeto.dataInicio)} até {formatData(projeto.dataFim)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Tarefas atrasadas
            </p>
            <p className="mt-1 text-sm font-medium">{atrasadas.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="py-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Progresso</p>
            <p className="text-sm text-muted-foreground">
              {progresso}% ({tarefas.filter((t) => t.faseAtualId === "concluido").length} de{" "}
              {tarefas.length} tarefas)
            </p>
          </div>
          <Progress value={progresso} />
        </CardContent>
      </Card>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Tarefas do projeto</h2>
        <Card>
          <CardContent className="divide-y divide-border/60 py-1">
            {tarefas.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">Nenhuma tarefa associada.</p>
            )}
            {tarefas.map((t) => (
              <TaskListRow key={t.id} tarefa={t} />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold">Notas de Encerramento</h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Preenchida ao concluir o projeto: o que funcionou, o que ajustar no template.
        </p>
        <Label htmlFor="notas-encerramento" className="sr-only">
          Notas de encerramento
        </Label>
        <Textarea
          id="notas-encerramento"
          defaultValue={projeto.notasEncerramento}
          placeholder="Ainda não preenchido."
          className="min-h-24"
        />
      </section>
    </div>
  );
}
