import { PageHeader } from "@/components/page-header";
import { PlanejamentoSemanal } from "@/components/planejamento-semanal";

export default function PlanejamentoSemanalPage() {
  return (
    <div>
      <PageHeader
        title="Planejamento Semanal"
        description="Aloca tarefas do backlog nos dias da semana respeitando a capacidade de cada pessoa."
      />
      <PlanejamentoSemanal />
    </div>
  );
}
