"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonDayGrid } from "@/components/person-day-grid";
import {
  gerarDias,
  inicioDaSemana,
  tarefasPorFase,
  COLABORADORES,
} from "@/lib/mock";
import { CheckCircle2 } from "lucide-react";

export function PlanejamentoSemanal() {
  const dias = useMemo(() => gerarDias(inicioDaSemana(new Date()), 7), []);
  const backlog = tarefasPorFase("backlog");

  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [tarefaSelecionada, setTarefaSelecionada] = useState<string>("");
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<string>("");
  const [diaSelecionado, setDiaSelecionado] = useState<string>("");
  const [fechado, setFechado] = useState(false);

  function alocar() {
    if (!tarefaSelecionada || !diaSelecionado) return;
    setOverrides((prev) => ({ ...prev, [tarefaSelecionada]: diaSelecionado }));
    setTarefaSelecionada("");
    setColaboradorSelecionado("");
    setDiaSelecionado("");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="py-4">
          <p className="mb-3 text-sm font-medium">Alocar tarefa do backlog</p>
          <div className="flex flex-wrap items-end gap-2">
            <Select value={tarefaSelecionada} onValueChange={(v) => v && setTarefaSelecionada(v)}>
              <SelectTrigger className="h-9 w-64">
                <SelectValue placeholder="Escolha uma tarefa" />
              </SelectTrigger>
              <SelectContent>
                {backlog.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={colaboradorSelecionado}
              onValueChange={(v) => v && setColaboradorSelecionado(v)}
            >
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Colaborador" />
              </SelectTrigger>
              <SelectContent>
                {COLABORADORES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={diaSelecionado} onValueChange={(v) => v && setDiaSelecionado(v)}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue placeholder="Dia" />
              </SelectTrigger>
              <SelectContent>
                {dias.map((d) => (
                  <SelectItem key={d.iso} value={d.iso}>
                    {d.iso.slice(8, 10)}/{d.iso.slice(5, 7)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={alocar} disabled={!tarefaSelecionada || !diaSelecionado}>
              Alocar
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Aloca além da capacidade sem bloquear - só sinaliza em vermelho no dia.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Semana atual</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-success" /> normal
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-warning" /> no limite
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-destructive" /> excedeu
              </span>
            </div>
          </div>
          <PersonDayGrid dias={dias} overrides={overrides} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant={fechado ? "secondary" : "default"}
          className="gap-1.5"
          onClick={() => setFechado(true)}
          disabled={fechado}
        >
          <CheckCircle2 className="size-4" />
          {fechado ? "Planejamento fechado" : "Fechar planejamento da semana"}
        </Button>
      </div>
    </div>
  );
}
