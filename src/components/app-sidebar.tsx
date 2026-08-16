"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KevLogo } from "@/components/kev-logo";
import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useTasks } from "@/lib/task-store";

// Fases que ainda precisam de uma ação humana antes de virar trabalho de verdade — sinalizado
// como contador na navegação de "Gestão de Tarefas" pra não depender de ninguém lembrar de olhar.
const FASES_PENDENTES = new Set(["solicitacoes", "triagem"]);

export function AppSidebar() {
  const pathname = usePathname();
  const tasks = useTasks();
  const pendentes = tasks.filter((t) => FASES_PENDENTES.has(t.faseAtualId)).length;

  return (
    <aside className="flex h-screen w-64 flex-col gap-6 border-r border-border/60 bg-sidebar px-3 py-4">
      <Link href="/painel" className="flex w-fit flex-col items-center gap-1 px-2">
        <KevLogo className="h-5 w-auto text-sidebar-foreground" />
        <span className="text-xs text-muted-foreground">Gestão de Marketing</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <p className="px-2.5 text-[0.68rem] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              const badge = item.href === "/visualizacoes" ? pendentes : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                  {badge > 0 && (
                    <span
                      className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-sidebar-accent"
                      title={`${badge} atividade${badge === 1 ? "" : "s"} aguardando aprovação ou triagem`}
                    >
                      <span className="flex size-3.5 items-center justify-center rounded-full bg-primary text-[0.55rem] font-semibold text-primary-foreground">
                        {badge}
                      </span>
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
