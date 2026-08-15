import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { UsuariosTable } from "@/components/usuarios-table";

const PERFIS_DESCRICAO = [
  { nome: "Admin", descricao: "Acesso total, inclusive gestão de usuários e configurações." },
  { nome: "Editor", descricao: "Executa o dia a dia: cria e move tarefas, sem gerenciar usuários." },
  { nome: "Viewer", descricao: "Leitura e comentários, sem editar tarefas ou configurações." },
];

export default function UsuariosPage() {
  return (
    <div>
      <PageHeader
        title="Usuários e Permissões"
        description="3 perfis simples, sem granularidade por campo. Login direto, sem fluxo de convite."
        action={<Button disabled>Convidar pessoa</Button>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {PERFIS_DESCRICAO.map((p) => (
          <Card key={p.nome}>
            <CardContent className="py-3">
              <p className="text-sm font-semibold">{p.nome}</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <UsuariosTable />
    </div>
  );
}
