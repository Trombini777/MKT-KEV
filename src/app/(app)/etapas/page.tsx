import { PageHeader } from "@/components/page-header";
import { EtapasBoard } from "@/components/etapas-board";

export default function EtapasPage() {
  return (
    <div>
      <PageHeader
        title="Etapas"
        description="Aqui ficam as etapas que compõem o passo a passo das suas tarefas, como Briefing, Design ou Aprovação. Clique em '+ Nova etapa' para criar uma nova, arraste os cartões entre as colunas para mudar a categoria, ou passe o mouse sobre um deles para editar o nome ou excluir. Depois, na tela de Tipos de Tarefa, você monta o fluxo de cada tipo escolhendo etapas dessa lista."
      />

      <EtapasBoard />
    </div>
  );
}
