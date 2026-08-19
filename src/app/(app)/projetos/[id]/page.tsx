"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskListRow } from "@/components/task-list-row";
import { StatusProjetoEditor } from "@/components/status-projeto-editor";
import { NovaAtividadeDialog } from "@/components/nova-atividade-dialog";
import {
  colaboradorById,
  colaboradorEhOperacional,
  horasEstimadasTarefa,
  type StatusProjeto,
} from "@/lib/mock";
import { useProjetos, useProjetosCarregados, editarProjeto } from "@/lib/projeto-store";
import { useColaboradores } from "@/lib/colaborador-store";
import { useTasks, recarregarTarefas } from "@/lib/task-store";
import { isoHoje } from "@/lib/hoje";
import { decimalParaHorario } from "@/lib/time-format";
import { ChevronLeft } from "lucide-react";

function formatData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <div className="mt-1 text-sm font-medium">{children}</div>
      </CardContent>
    </Card>
  );
}

export default function ProjetoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const projetos = useProjetos();
  const carregado = useProjetosCarregados();
  const colaboradores = useColaboradores();
  // "Não operacional" não aparece como opção de responsável.
  const colaboradoresOperacionais = colaboradores.filter(colaboradorEhOperacional);
  const todasAsTarefas = useTasks();
  const projeto = projetos.find((p) => p.id === id);
  const [notas, setNotas] = useState<string | undefined>(undefined);

  if (!projeto) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {carregado ? "Projeto não encontrado." : "Carregando…"}
      </p>
    );
  }

  const responsavel = colaboradorById(projeto.responsavelId);
  const tarefas = todasAsTarefas.filter((t) => t.projetoId === projeto.id);
  const concluidas = tarefas.filter((t) => t.faseAtualId === "concluido");
  const progresso = tarefas.length === 0 ? 0 : Math.round((concluidas.length / tarefas.length) * 100);
  const atrasadas = tarefas.filter(
    (t) => t.faseAtualId !== "concluido" && t.prazo && new Date(t.prazo) < new Date()
  );
  const horasEstimadas = tarefas.reduce((soma, t) => soma + horasEstimadasTarefa(t), 0);
  const prazoVencido =
    (projeto.status === "Ativo" || projeto.status === "Planejado") && projeto.dataFim < isoHoje();

  function mudarStatus(novoStatus: StatusProjeto) {
    editarProjeto({ ...projeto!, status: novoStatus });
  }

  function mudarResponsavel(novoResponsavelId: string) {
    editarProjeto({ ...projeto!, responsavelId: novoResponsavelId });
  }

  function salvarNotas() {
    if (notas === undefined || notas === (projeto!.notasEncerramento ?? "")) return;
    editarProjeto({ ...projeto!, notasEncerramento: notas || undefined });
  }

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
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {projeto.sigla}
            </p>
            <StatusProjetoEditor status={projeto.status} onChange={mudarStatus} />
          </div>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight">{projeto.nome}</h1>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">{projeto.descricao}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Responsável">
          <Select value={projeto.responsavelId} onValueChange={(v) => v && mudarResponsavel(v)}>
            <SelectTrigger className="h-8 w-full gap-1.5 border-0 bg-transparent p-0 text-sm font-medium shadow-none hover:bg-transparent">
              <SelectValue placeholder="Selecione">
                {() => responsavel?.nome ?? "Ninguém definido"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {colaboradoresOperacionais.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </StatCard>
        <StatCard label="Data de início">{formatData(projeto.dataInicio)}</StatCard>
        <StatCard label="Prazo final">
          <span className={prazoVencido ? "text-destructive" : undefined}>
            {formatData(projeto.dataFim)}
          </span>
        </StatCard>
        <StatCard label="Total de tarefas">{tarefas.length}</StatCard>
        <StatCard label="Tarefas atrasadas">
          <span className={atrasadas.length > 0 ? "text-destructive" : undefined}>
            {atrasadas.length}
          </span>
        </StatCard>
        <StatCard label="Horas estimadas">{decimalParaHorario(horasEstimadas)}</StatCard>
      </div>

      <Card className="mt-4">
        <CardContent className="py-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Progresso</p>
            <p className="text-sm text-muted-foreground">
              {progresso}% ({concluidas.length} de {tarefas.length} tarefas)
            </p>
          </div>
          <Progress value={progresso} />
        </CardContent>
      </Card>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Tarefas do projeto</h2>
          <NovaAtividadeDialog
            projetoId={projeto.id}
            projetoNome={projeto.nome}
            onCriada={recarregarTarefas}
          />
        </div>
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
          value={notas ?? projeto.notasEncerramento ?? ""}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={salvarNotas}
          placeholder="Ainda não preenchido."
          className="min-h-24"
        />
      </section>
    </div>
  );
}
