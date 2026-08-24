"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { logout } from "@/lib/auth";
import { resetarCachesDeSessao } from "@/lib/session-cache";
import { useNotificacoes, marcarNotificacaoLida } from "@/lib/notificacao-store";
import { cn } from "@/lib/utils";
import type { Colaborador } from "@/lib/mock";

function tempoRelativo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

function NotificacoesBell() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const notificacoes = useNotificacoes();
  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  function abrirNotificacao(id: string, tarefaId?: string) {
    marcarNotificacaoLida(id);
    if (!tarefaId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tarefa", tarefaId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Popover>
      <PopoverTrigger
        className="relative text-muted-foreground hover:text-foreground"
        aria-label="Notificações"
        title="Notificações"
      >
        <Bell className="size-4" />
        {naoLidas > 0 && (
          <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-primary text-[0.6rem] font-semibold text-primary-foreground">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-1.5">
        {notificacoes.length === 0 ? (
          <p className="px-2 py-3 text-center text-sm text-muted-foreground">
            Nenhuma notificação por aqui.
          </p>
        ) : (
          <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
            {notificacoes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => abrirNotificacao(n.id, n.tarefaId)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-secondary/50",
                  !n.lida && "bg-primary/5"
                )}
              >
                <span className={cn(!n.lida && "font-medium")}>{n.mensagem}</span>
                <span className="text-xs text-muted-foreground">{tempoRelativo(n.criadoEm)}</span>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function AppTopbar({ usuarioAtual }: { usuarioAtual: Colaborador | null }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-6">
      <div />
      <div className="flex items-center gap-3">
        <NotificacoesBell />
        <ThemeToggle />
        {usuarioAtual && (
          <div className="flex items-center gap-2">
            <ColaboradorAvatar
              colaborador={usuarioAtual}
              className="size-7"
              fallbackClassName="text-xs"
            />
            <span className="text-sm font-medium">{usuarioAtual.nome}</span>
          </div>
        )}
        <form
          action={logout}
          onSubmit={() => {
            // Mesmo motivo do login (ver login-form.tsx): sem reload de página nessa navegação,
            // os caches client-side precisam ser descartados aqui pra não sobreviver pro próximo
            // login nessa mesma aba.
            resetarCachesDeSessao();
          }}
        >
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
