import { PageHeader } from "@/components/page-header";
import { TiposDeTarefaBoard } from "@/components/tipos-de-tarefa-board";
import { ResponsaveisPadraoFluxo } from "@/components/responsaveis-padrao-fluxo";

export default function TiposDeTarefaPage() {
  return (
    <div>
      <PageHeader
        title="Tipos de Tarefa"
        description="Categorias por canal/formato de marketing. Cada uma tem seu próprio fluxo de etapas, montado com etapas cadastradas na aba Etapas. Não podem ser deletadas enquanto houver tarefas usando o tipo."
      />

      <ResponsaveisPadraoFluxo />

      <TiposDeTarefaBoard />
    </div>
  );
}
