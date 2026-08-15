"use client";

import { LogOut } from "lucide-react";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/lib/auth";
import type { Colaborador } from "@/lib/mock";

export function AppTopbar({ usuarioAtual }: { usuarioAtual: Colaborador | null }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-6">
      <div />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {usuarioAtual && (
          <div className="flex items-center gap-2">
            <ColaboradorAvatar
              colaboradorId={usuarioAtual.id}
              className="size-7"
              fallbackClassName="text-xs"
            />
            <span className="text-sm font-medium">{usuarioAtual.nome}</span>
          </div>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
