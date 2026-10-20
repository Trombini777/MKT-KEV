import { KevLogo } from "@/components/kev-logo";
import { cn } from "@/lib/utils";

/**
 * Lockup do KEV Studio: logo oficial da Kev (mesma do Sistema de Marketing) + selo "Studio" em
 * verde-limão, como nas telas conceituais do pitch. Não recriar a logo à mão.
 */
export function StudioLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <KevLogo className="h-5 w-auto text-foreground" />
      <span className="rounded-md bg-primary px-2 py-1 text-xs leading-none font-semibold tracking-tight text-primary-foreground">
        Studio
      </span>
    </span>
  );
}
