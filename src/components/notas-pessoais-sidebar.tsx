"use client";

import { useEffect, useRef, useState } from "react";
import { NotebookPen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { carregarNotaPessoal, salvarNotaPessoal, type CorNota } from "@/lib/notas-pessoais";

const ATRASO_AUTOSAVE_MS = 600;

/**
 * Bloco de notas pessoal no rodapé do menu — clicar expande/recolhe NO PRÓPRIO menu (nunca navega
 * pra uma página), pra anotar coisas soltas ao longo do dia. Privada por colaborador (ver RLS em
 * notas_pessoais, 0016) — ninguém além de quem escreveu enxerga o conteúdo.
 */
export function NotasPessoaisSidebar() {
  const [aberto, setAberto] = useState(false);
  const [carregado, setCarregado] = useState(false);
  const [conteudo, setConteudo] = useState("");
  const [cor, setCor] = useState<CorNota>("verde");
  const timeoutSalvar = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    carregarNotaPessoal().then((nota) => {
      setConteudo(nota.conteudo);
      setCor(nota.cor);
      setCarregado(true);
    });
    return () => {
      if (timeoutSalvar.current) clearTimeout(timeoutSalvar.current);
    };
  }, []);

  function aoDigitar(novoConteudo: string) {
    setConteudo(novoConteudo);
    if (timeoutSalvar.current) clearTimeout(timeoutSalvar.current);
    timeoutSalvar.current = setTimeout(() => {
      salvarNotaPessoal({ conteudo: novoConteudo, cor });
    }, ATRASO_AUTOSAVE_MS);
  }

  function aoEscolherCor(novaCor: CorNota) {
    setCor(novaCor);
    salvarNotaPessoal({ conteudo, cor: novaCor });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <NotebookPen className="size-4 shrink-0" />
        Minhas anotações
        <ChevronDown
          className={cn("ml-auto size-3.5 shrink-0 transition-transform", aberto && "rotate-180")}
        />
      </button>

      {aberto && (
        <div
          className={cn(
            "mx-1 flex flex-col gap-1.5 rounded-xl border p-2.5 shadow-sm transition-colors",
            cor === "verde" ? "border-primary/40 bg-primary/20" : "border-border bg-background"
          )}
        >
          <textarea
            value={conteudo}
            onChange={(e) => aoDigitar(e.target.value)}
            disabled={!carregado}
            placeholder="Escreva aqui..."
            rows={6}
            className="min-h-32 w-full resize-none bg-transparent text-sm leading-relaxed text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/40 disabled:opacity-60"
          />
          <div className="flex items-center gap-1.5 self-end">
            <button
              type="button"
              onClick={() => aoEscolherCor("verde")}
              aria-label="Fundo verde"
              aria-pressed={cor === "verde"}
              className={cn(
                "size-2.5 rounded-full bg-primary transition-shadow",
                cor === "verde" ? "ring-1 ring-sidebar-foreground/50" : "opacity-70 hover:opacity-100"
              )}
            />
            <button
              type="button"
              onClick={() => aoEscolherCor("branco")}
              aria-label="Fundo branco"
              aria-pressed={cor === "branco"}
              className={cn(
                "size-2.5 rounded-full border border-border bg-white transition-shadow",
                cor === "branco" ? "ring-1 ring-sidebar-foreground/50" : "opacity-70 hover:opacity-100"
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
