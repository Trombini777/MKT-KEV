"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { TaskExecutionList } from "@/components/task-execution-list";
import { AtividadesEntrandoEmBreve } from "@/components/atividades-entrando-em-breve";
import { WorkloadView } from "@/components/workload-view";
import { NovaAtividadeDialog } from "@/components/nova-atividade-dialog";
import { useTasks, recarregarTarefas } from "@/lib/task-store";
import { useColaboradores } from "@/lib/colaborador-store";
import { useEtapas } from "@/lib/etapa-store";
import { formatDataCurta } from "@/lib/hoje";
import {
  ordenarPorPrioridadeEPrazo,
  tarefasParaExecutarAgora,
  atividadesEntrandoEmBreve,
  tarefasComAlocacaoNoDia,
  type Colaborador,
} from "@/lib/mock";

export function PainelDeTrabalho({ usuario }: { usuario: Colaborador }) {
  const tarefas = useTasks();
  const colaboradores = useColaboradores();
  // Garante que TaskExecutionList/AtividadesEntrandoEmBreve (que leem etapaById direto, sem
  // hook) re-renderizem assim que o catálogo de etapas hidratar — ver o comentário equivalente
  // em task-detail-sheet.tsx.
  useEtapas();

  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  function selecionarDia(iso: string) {
    setDiaSelecionado((atual) => (atual === iso ? null : iso));
  }

  const minhasExecucoesTodas = ordenarPorPrioridadeEPrazo(tarefasParaExecutarAgora(usuario.id, tarefas));
  const entrandoEmBreve = atividadesEntrandoEmBreve(usuario.id, tarefas);

  const minhasExecucoes = diaSelecionado
    ? tarefasComAlocacaoNoDia(minhasExecucoesTodas, diaSelecionado)
    : minhasExecucoesTodas;

  return (
    <div>
      <PageHeader
        title={`Olá, ${usuario.nome.split(" ")[0]}`}
        description="Seu painel de trabalho: o que fazer agora e o que está chegando."
      />

      <Card className="mt-4">
        <CardContent className="py-4">
          <WorkloadView
            title="Workload"
            pessoaId={usuario.id}
            diaSelecionado={diaSelecionado}
            onSelecionarDia={selecionarDia}
          />
        </CardContent>
      </Card>

      <div className="mt-6">
        <NovaAtividadeDialog onCriada={recarregarTarefas} />
      </div>

      {diaSelecionado && (
        <button
          type="button"
          onClick={() => setDiaSelecionado(null)}
          className="mt-6 flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
        >
          Filtrando: {formatDataCurta(diaSelecionado)}
          <X className="size-3.5" />
        </button>
      )}

      <section className="mt-4">
        <TaskExecutionList tarefas={minhasExecucoes} />
      </section>

      <section className="mt-8">
        <AtividadesEntrandoEmBreve itens={entrandoEmBreve} diaSelecionado={diaSelecionado} />
      </section>

      <p className="mt-6 text-xs text-muted-foreground">{colaboradores.length} pessoas no time.</p>
    </div>
  );
}
