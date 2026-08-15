"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { encerrarSessao } from "@/lib/auth";
import { colaboradorById, USUARIO_ATUAL_ID } from "@/lib/mock";

const USUARIO_ATUAL = colaboradorById(USUARIO_ATUAL_ID)!;

export function AppTopbar() {
  const router = useRouter();

  function sair() {
    encerrarSessao();
    router.push("/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-6">
      <div />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <ColaboradorAvatar
            colaboradorId={USUARIO_ATUAL.id}
            className="size-7"
            fallbackClassName="text-xs"
          />
          <span className="text-sm font-medium">{USUARIO_ATUAL.nome}</span>
        </div>
        <button
          type="button"
          onClick={sair}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Sair"
          title="Sair"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
}
