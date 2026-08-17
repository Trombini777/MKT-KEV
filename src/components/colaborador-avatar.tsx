import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { colaboradorById, iniciaisColaborador, type Colaborador } from "@/lib/mock";

export function ColaboradorAvatar({
  colaboradorId,
  colaborador,
  className,
  fallbackClassName,
}: {
  colaboradorId?: string;
  /**
   * Passe o colaborador já carregado (ex: vindo direto do servidor, como `usuarioAtual`) quando
   * disponível — evita depender do catálogo client-side (`colaboradorById`), que só hidrata com
   * dados reais depois do primeiro carregamento e não dispara novo render quando isso acontece.
   */
  colaborador?: Colaborador | null;
  className?: string;
  fallbackClassName?: string;
}) {
  const resolvido = colaborador ?? (colaboradorId ? colaboradorById(colaboradorId) : undefined);

  return (
    <Avatar className={className}>
      {resolvido?.avatarUrl && <AvatarImage src={resolvido.avatarUrl} alt="" />}
      <AvatarFallback className={fallbackClassName}>
        {resolvido?.avatarIniciais ?? iniciaisColaborador(colaboradorId)}
      </AvatarFallback>
    </Avatar>
  );
}
