"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriorityBadge } from "@/components/priority-badge";
import { TaskLink } from "@/components/task-link";
import { useTasks } from "@/lib/task-store";
import {
  TIPOS_TAREFA,
  FASES,
  faseById,
  nomeTipo,
  type PrioridadeFinal,
  type Tarefa,
} from "@/lib/mock";

const PRIORIDADES: PrioridadeFinal[] = ["Crítica", "Alta", "Normal", "Baixa"];

function formatData(iso: string) {
  if (!iso) return "-";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function ListaTarefas({ tarefas: tarefasProp }: { tarefas?: Tarefa[] } = {}) {
  const tasksHook = useTasks();
  const todasTarefas = tarefasProp ?? tasksHook;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [origemFiltro, setOrigemFiltro] = useState("todas");
  const [prioridadeFiltro, setPrioridadeFiltro] = useState("todas");
  const [faseFiltro, setFaseFiltro] = useState("todas");

  const tarefas = useMemo(() => {
    return todasTarefas.filter((t) => {
      if (busca && !t.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
      if (tipoFiltro !== "todos" && t.tipoId !== tipoFiltro) return false;
      if (origemFiltro !== "todas" && t.origem !== origemFiltro) return false;
      if (prioridadeFiltro !== "todas" && t.prioridadeFinal !== prioridadeFiltro) return false;
      if (faseFiltro !== "todas" && t.faseAtualId !== faseFiltro) return false;
      return true;
    });
  }, [todasTarefas, busca, tipoFiltro, origemFiltro, prioridadeFiltro, faseFiltro]);

  function abrirTarefa(taskId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tarefa", taskId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Buscar por título"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="h-9 w-56"
        />
        <Select value={tipoFiltro} onValueChange={(v) => v && setTipoFiltro(v)}>
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {TIPOS_TAREFA.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={origemFiltro} onValueChange={(v) => v && setOrigemFiltro(v)}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Toda origem</SelectItem>
            <SelectItem value="Projeto">Projeto</SelectItem>
            <SelectItem value="Solicitação">Solicitação</SelectItem>
          </SelectContent>
        </Select>
        <Select value={prioridadeFiltro} onValueChange={(v) => v && setPrioridadeFiltro(v)}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Toda prioridade</SelectItem>
            {PRIORIDADES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={faseFiltro} onValueChange={(v) => v && setFaseFiltro(v)}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="Situação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Toda situação</SelectItem>
            {FASES.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tarefas.map((t) => (
                <TableRow
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => abrirTarefa(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      abrirTarefa(t.id);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <TableCell className="max-w-64 truncate font-medium">
                    <TaskLink taskId={t.id} className="hover:underline">
                      {t.titulo}
                    </TaskLink>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{nomeTipo(t.tipoId)}</TableCell>
                  <TableCell className="text-muted-foreground">{t.origem}</TableCell>
                  <TableCell>
                    <PriorityBadge prioridade={t.prioridadeFinal} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {faseById(t.faseAtualId)?.nome}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatData(t.prazo)}</TableCell>
                </TableRow>
              ))}
              {tarefas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    Nenhuma tarefa com esses filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
