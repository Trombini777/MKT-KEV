import { getUsuarioAtual } from "@/lib/usuario-atual";
import { PainelDeTrabalho } from "@/components/painel-de-trabalho";

export default async function PainelDeTrabalhoPage() {
  const usuario = await getUsuarioAtual();

  if (!usuario) {
    return (
      <p className="text-sm text-muted-foreground">
        Sua conta de login ainda não está vinculada a um colaborador cadastrado.
      </p>
    );
  }

  return <PainelDeTrabalho usuario={usuario} />;
}
