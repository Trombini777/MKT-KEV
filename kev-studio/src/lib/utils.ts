import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Estilo do TabsTrigger ativo em cor de destaque (verde-limão da marca) — usado nos toggles
 * "7D/15D/30D" do Workload e "Lista/Calendário" de Atividades futuras. */
export const TABS_ATIVO_PRIMARY_CLASS =
  "data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground";
