"use client";

import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { horarioParaDecimal } from "@/lib/time-format";
import { adicionarTempoEtapa } from "@/lib/task-store";
import type { EtapaAgendadaAplicada } from "@/lib/mock";

function formatHorasDecimal(horas: number): string {
  return Number.isInteger(horas) ? `${horas}h` : `${horas.toFixed(1)}h`;
}

/**
 * Registro manual de tempo gasto numa etapa (sem cronômetro ao vivo, por enquanto — ver pedido do
 * usuário): abre um popover com um input de horário, soma ao total já registrado dessa etapa e
 * grava em `planejamento_etapas.tempo_gasto_horas`.
 */
export function RegistroTempoEtapa({
  taskId,
  etapa,
  previstoHoras,
}: {
  taskId: string;
  etapa: EtapaAgendadaAplicada;
  previstoHoras: number;
}) {
  const [open, setOpen] = useState(false);
  const [horarioInput, setHorarioInput] = useState("00:30");

  function registrar() {
    const decimal = horarioParaDecimal(horarioInput);
    if (!decimal) return;
    adicionarTempoEtapa(taskId, etapa.id, decimal);
    setOpen(false);
    setHorarioInput("00:30");
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
      <Clock className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">
        Gasto {formatHorasDecimal(etapa.tempoGastoHoras)} · Previsto {formatHorasDecimal(previstoHoras)}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="size-3.5" />
          Registrar tempo
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56">
          <p className="text-xs font-semibold text-muted-foreground">Quanto tempo você gastou?</p>
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="time"
              value={horarioInput}
              onChange={(e) => setHorarioInput(e.target.value)}
              className="h-8"
              autoFocus
            />
            <span className="text-xs text-muted-foreground">h</span>
          </div>
          <Button onClick={registrar} className="mt-3 w-full" size="sm">
            Adicionar
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
