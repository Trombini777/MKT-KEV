import { PageHeader } from "@/components/page-header";
import { EquipeBoard } from "@/components/equipe-board";

export default function PessoasPage() {
  return (
    <div>
      <PageHeader
        title="Equipe"
        description="Cadastro dos colaboradores do time de marketing."
      />

      <EquipeBoard />
    </div>
  );
}
