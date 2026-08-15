import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { colaboradorById, iniciaisColaborador } from "@/lib/mock";

export function ColaboradorAvatar({
  colaboradorId,
  className,
  fallbackClassName,
}: {
  colaboradorId: string | undefined;
  className?: string;
  fallbackClassName?: string;
}) {
  const avatarUrl = colaboradorId ? colaboradorById(colaboradorId)?.avatarUrl : undefined;

  return (
    <Avatar className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback className={fallbackClassName}>
        {iniciaisColaborador(colaboradorId)}
      </AvatarFallback>
    </Avatar>
  );
}
